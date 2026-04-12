"use server";

import { prisma } from "@/lib/prisma";
import { authAction } from "@/lib/actions/safe-actions";
import { z } from "zod";

// ─── Étape 1 : Profil physique ────────────────────────────────────────────────

export const savePhysicalProfileAction = authAction
  .inputSchema(
    z.object({
      weightKg: z.coerce.number().min(20).max(300).optional(),
      heightCm: z.coerce.number().min(50).max(250).optional(),
      birthYear: z.coerce
        .number()
        .min(1900)
        .max(new Date().getFullYear())
        .optional(),
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

// ─── Étape 2 : Activité sportive ──────────────────────────────────────────────

export const saveActivityProfileAction = authAction
  .inputSchema(
    z.object({
      sportHoursPerWeek: z.coerce.number().min(0).max(40).optional(),
      sportTypes: z.array(z.string()).default([]),
      activityLevel: z
        .enum(["sedentary", "light", "moderate", "active", "very_active"])
        .optional(),
      breakfastGoal: z
        .enum(["perte_poids", "prise_masse", "maintien", "endurance"])
        .optional(),
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

// ─── Étape 3 : Membres de la famille ─────────────────────────────────────────

const FamilyMemberInputSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["adult", "child"]),
  birthYear: z.coerce
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  weightKg: z.coerce.number().min(5).max(300).optional(),
  heightCm: z.coerce.number().min(50).max(250).optional(),
  sportTypes: z.array(z.string()).default([]),
  activityLevel: z
    .enum(["sedentary", "light", "moderate", "active", "very_active"])
    .optional(),
  dietaryPrefs: z.array(z.string()).default([]),
});

export const saveFamilyMembersAction = authAction
  .inputSchema(z.object({ members: z.array(FamilyMemberInputSchema) }))
  .action(async ({ parsedInput: { members }, ctx: { user } }) => {
    await prisma.familyMember.deleteMany({ where: { userId: user.id } });
    if (members.length > 0) {
      await prisma.familyMember.createMany({
        data: members.map((m) => ({ ...m, userId: user.id })),
      });
    }
    return { success: true };
  });

// ─── Étape 4 : Préférences alimentaires ──────────────────────────────────────

export const saveMemberDietaryPrefsAction = authAction
  .inputSchema(
    z.object({ memberId: z.string(), dietaryPrefs: z.array(z.string()) }),
  )
  .action(
    async ({ parsedInput: { memberId, dietaryPrefs }, ctx: { user } }) => {
      const member = await prisma.familyMember.findFirst({
        where: { id: memberId, userId: user.id },
      });
      if (!member) throw new Error("Membre introuvable");
      await prisma.familyMember.update({
        where: { id: memberId },
        data: { dietaryPrefs },
      });
      return { success: true };
    },
  );

// ─── Finalisation de l'onboarding ─────────────────────────────────────────────

export const completeOnboardingAction = authAction
  .inputSchema(z.object({}))
  .action(async ({ ctx: { user } }) => {
    await prisma.physicalProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, onboardingCompleted: true },
      update: { onboardingCompleted: true },
    });
    return { success: true };
  });
