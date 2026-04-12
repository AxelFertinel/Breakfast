"use server";

import { authAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
export const savePhysicalProfileAction = authAction
  .inputSchema(
    z.object({
      weightKg: z.coerce.number().min(20).max(300).optional(),
      heightCm: z.coerce.number().min(50).max(250).optional(),
      birthYear: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      sportHoursPerWeek: z.coerce.number().min(0).max(40).optional(),
      sportTypes: z.array(z.string()).optional(),
      activityLevel: z
        .enum(["sedentary", "light", "moderate", "active", "very_active"])
        .optional(),
      dietaryPrefs: z.array(z.string()).optional(),
    }),
  )
  .action(async ({ parsedInput, ctx: { user } }) => {
    await prisma.physicalProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...parsedInput },
      update: parsedInput,
    });
    return { success: true };
  });

const MemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  type: z.enum(["adult", "child"]).default("child"),
  birthYear: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
  weightKg: z.coerce.number().min(1).max(300).optional(),
  heightCm: z.coerce.number().min(30).max(250).optional(),
  sportTypes: z.array(z.string()).default([]),
  activityLevel: z
    .enum(["sedentary", "light", "moderate", "active", "very_active"])
    .optional(),
  dietaryPrefs: z.array(z.string()).default([]),
});

export const saveFamilyMemberAction = authAction
  .inputSchema(MemberSchema)
  .action(async ({ parsedInput: { id, ...data }, ctx: { user } }) => {
    if (id) {
      const existing = await prisma.familyMember.findFirst({
        where: { id, userId: user.id },
      });
      if (!existing) throw new Error("Membre introuvable");
      await prisma.familyMember.update({ where: { id }, data });
    } else {
      await prisma.familyMember.create({
        data: { ...data, userId: user.id },
      });
    }
    return { success: true };
  });

export const deleteFamilyMemberAction = authAction
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id }, ctx: { user } }) => {
    const existing = await prisma.familyMember.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new Error("Membre introuvable");
    await prisma.familyMember.delete({ where: { id } });
    return { success: true };
  });
