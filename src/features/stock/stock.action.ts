"use server";

import { prisma } from "@/lib/prisma";
import { authAction } from "@/lib/actions/safe-actions";
import { ActionError } from "@/lib/errors/action-error";
import { z } from "zod";

const PantryItemSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  category: z
    .enum(["céréales", "laitier", "fruit", "protéine", "matière_grasse", "autre"])
    .optional(),
  quantity: z.coerce.number().min(0).optional(),
  unit: z.enum(["g", "ml", "unités", "kg", "L"]).optional(),
  expiresAt: z.string().optional(), // ISO date string
});

export const addPantryItemAction = authAction
  .inputSchema(PantryItemSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const item = await prisma.pantryItem.create({
      data: {
        userId: user.id,
        ...parsedInput,
        expiresAt: parsedInput.expiresAt
          ? new Date(parsedInput.expiresAt)
          : undefined,
      },
    });
    return { item };
  });

export const updatePantryItemAction = authAction
  .inputSchema(
    PantryItemSchema.partial().extend({
      id: z.string(),
    }),
  )
  .action(async ({ parsedInput: { id, ...data }, ctx: { user } }) => {
    const existing = await prisma.pantryItem.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new ActionError("Ingrédient introuvable");

    const item = await prisma.pantryItem.update({
      where: { id },
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
    return { item };
  });

export const deletePantryItemAction = authAction
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id }, ctx: { user } }) => {
    const existing = await prisma.pantryItem.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new ActionError("Ingrédient introuvable");

    await prisma.pantryItem.delete({ where: { id } });
    return { success: true };
  });
