"use server";

import { prisma } from "@/lib/prisma";
import { authAction } from "@/lib/actions/safe-actions";
import { ActionError } from "@/lib/errors/action-error";
import { z } from "zod";

export const toggleFavoriteAction = authAction
  .inputSchema(z.object({ recipeId: z.string() }))
  .action(async ({ parsedInput: { recipeId }, ctx: { user } }) => {
    const existing = await prisma.favoriteRecipe.findUnique({
      where: { userId_recipeId: { userId: user.id, recipeId } },
    });

    if (existing) {
      await prisma.favoriteRecipe.delete({
        where: { userId_recipeId: { userId: user.id, recipeId } },
      });
      return { favorited: false };
    }

    await prisma.favoriteRecipe.create({
      data: { userId: user.id, recipeId },
    });
    return { favorited: true };
  });

export const replaceBreakfastAction = authAction
  .inputSchema(
    z.object({
      mealPlanId: z.string(),
      dayOfWeek: z.number().min(0).max(6),
      recipeId: z.string(),
    }),
  )
  .action(
    async ({
      parsedInput: { mealPlanId, dayOfWeek, recipeId },
      ctx: { user },
    }) => {
      // Vérifie que le plan appartient à l'utilisateur
      const plan = await prisma.mealPlan.findFirst({
        where: { id: mealPlanId, userId: user.id },
      });
      if (!plan) throw new ActionError("Plan introuvable");

      await prisma.mealSlot.upsert({
        where: { mealPlanId_dayOfWeek: { mealPlanId, dayOfWeek } },
        create: { mealPlanId, dayOfWeek, recipeId },
        update: { recipeId },
      });

      return { success: true };
    },
  );

export const logBreakfastAction = authAction
  .inputSchema(
    z.object({
      date: z.string(), // ISO date string YYYY-MM-DD
      recipeId: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput: { date, recipeId }, ctx: { user } }) => {
    await prisma.breakfastLog.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: new Date(date),
        },
      },
      create: {
        userId: user.id,
        date: new Date(date),
        recipeId,
      },
      update: { recipeId },
    });
    return { success: true };
  });

export const reuseMealPlanAction = authAction
  .inputSchema(z.object({ sourceMealPlanId: z.string() }))
  .action(async ({ parsedInput: { sourceMealPlanId }, ctx: { user } }) => {
    const source = await prisma.mealPlan.findFirst({
      where: { id: sourceMealPlanId, userId: user.id },
      include: { slots: true },
    });
    if (!source) throw new ActionError("Plan introuvable");

    // Calcul du lundi de la semaine en cours
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const newPlan = await prisma.mealPlan.create({
      data: {
        userId: user.id,
        weekStart: monday,
        slots: {
          create: source.slots.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            recipeId: s.recipeId,
          })),
        },
      },
    });

    return { mealPlanId: newPlan.id };
  });
