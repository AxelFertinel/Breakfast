"use server";

import { authAction } from "@/lib/actions/safe-actions";
import { ActionError } from "@/lib/errors/action-error";
import { geminiFlash } from "@/lib/ai/gemini";
import {
  getRemainingAiQuota,
  logAiUsage,
} from "@/lib/ai-quota/get-remaining-quota";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const GeneratedRecipeSchema = z.object({
  title: z.string(),
  badgeType: z.enum(["express", "veille", "weekend"]).nullable(),
  prepTime: z.number().int().positive(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z.string(),
    }),
  ),
  steps: z.array(z.string()),
  nutritionData: z
    .object({
      calories: z.number(),
      proteins: z.number(),
      carbs: z.number(),
      fibers: z.number(),
    })
    .nullable(),
});

const GeneratedPlanSchema = z.object({
  recipes: z.array(GeneratedRecipeSchema).length(7),
});

function buildPrompt(ctx: {
  profile: {
    weightKg?: number | null;
    heightCm?: number | null;
    birthYear?: number | null;
    gender?: string | null;
    activityLevel?: string | null;
    dietaryPrefs: string[];
    breakfastGoal?: string | null;
  } | null;
  familyMembers: {
    name: string;
    type: string;
    dietaryPrefs: string[];
    activityLevel?: string | null;
  }[];
  pantryItems: { name: string; category?: string | null }[];
}): string {
  const lines: string[] = [];

  lines.push("Tu es un nutritionniste spécialisé en petits-déjeuners.");
  lines.push(
    "Génère un plan de 7 petits-déjeuners variés et équilibrés (un par jour de la semaine, du lundi au dimanche).",
  );
  lines.push("");

  if (ctx.profile) {
    lines.push("## Profil utilisateur principal");
    if (ctx.profile.breakfastGoal)
      lines.push(`- Objectif : ${ctx.profile.breakfastGoal}`);
    if (ctx.profile.activityLevel)
      lines.push(`- Niveau d'activité : ${ctx.profile.activityLevel}`);
    if (ctx.profile.dietaryPrefs.length > 0)
      lines.push(
        `- Régime / allergies : ${ctx.profile.dietaryPrefs.join(", ")}`,
      );
  }

  if (ctx.familyMembers.length > 0) {
    lines.push("");
    lines.push("## Membres de la famille");
    for (const m of ctx.familyMembers) {
      const prefs =
        m.dietaryPrefs.length > 0
          ? ` (allergies/régime : ${m.dietaryPrefs.join(", ")})`
          : "";
      lines.push(`- ${m.name} (${m.type})${prefs}`);
    }
  }

  if (ctx.pantryItems.length > 0) {
    lines.push("");
    lines.push("## Stock disponible (privilégie ces ingrédients si possible)");
    lines.push(ctx.pantryItems.map((p) => p.name).join(", "));
  }

  lines.push("");
  lines.push("## Règles");
  lines.push(
    "- Assure-toi que les 7 recettes sont variées (ne répète pas la même recette).",
  );
  lines.push(
    "- badgeType : 'express' si ≤ 10 min, 'veille' si nécessite préparation la veille, 'weekend' si convient mieux au week-end (samedi = index 5, dimanche = index 6), null sinon.",
  );
  lines.push("- Les recettes doivent être adaptées au petit-déjeuner.");
  lines.push("- Les quantités doivent être réalistes pour une personne adulte.");
  lines.push(
    "- Respecte les allergies et régimes alimentaires de TOUS les membres.",
  );

  lines.push("");
  lines.push(
    "Réponds UNIQUEMENT en JSON valide avec cette structure exacte (pas de markdown) :",
  );
  lines.push(
    JSON.stringify({
      recipes: [
        {
          title: "Nom de la recette",
          badgeType: "express | veille | weekend | null",
          prepTime: 10,
          ingredients: [{ name: "ingrédient", quantity: 1, unit: "unité" }],
          steps: ["Étape 1", "Étape 2"],
          nutritionData: { calories: 350, proteins: 12, carbs: 45, fibers: 5 },
        },
      ],
    }),
  );

  return lines.join("\n");
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 50) +
    "-" +
    nanoid(6)
  );
}

export const generateMealPlanAction = authAction
  .inputSchema(z.object({ orgSlug: z.string() }))
  .action(async ({ parsedInput: { orgSlug }, ctx: { user } }) => {
    // 1. Vérifier le quota IA
    const quota = await getRemainingAiQuota(user.id, "free");
    if (quota.remaining === 0) {
      throw new ActionError(
        "Quota IA atteint. Passez à un plan supérieur pour générer plus de plans.",
      );
    }

    // 2. Récupérer le contexte utilisateur
    const [profile, familyMembers, pantryItems] = await Promise.all([
      prisma.physicalProfile.findUnique({ where: { userId: user.id } }),
      prisma.familyMember.findMany({ where: { userId: user.id } }),
      prisma.pantryItem.findMany({ where: { userId: user.id }, take: 20 }),
    ]);

    // 3. Construire le prompt et appeler Gemini
    const prompt = buildPrompt({ profile, familyMembers, pantryItems });

    let parsedPlan: z.infer<typeof GeneratedPlanSchema>;
    try {
      const result = await geminiFlash.generateContent(prompt);
      const text = result.response.text();
      const raw = JSON.parse(text);
      parsedPlan = GeneratedPlanSchema.parse(raw);
    } catch {
      throw new ActionError(
        "L'IA n'a pas pu générer un plan valide. Réessaie dans quelques instants.",
      );
    }

    // 4. Sauvegarder les recettes en base
    const createdRecipes = await Promise.all(
      parsedPlan.recipes.map((r) =>
        prisma.recipe.create({
          data: {
            userId: user.id,
            title: r.title,
            slug: slugify(r.title),
            badgeType: r.badgeType,
            prepTime: r.prepTime,
            ingredients: r.ingredients,
            steps: r.steps,
            nutritionData: r.nutritionData ?? undefined,
            isPublic: false,
          },
        }),
      ),
    );

    // 5. Calculer le lundi de la semaine en cours
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);

    // 6. Créer ou remplacer le plan de la semaine
    const existing = await prisma.mealPlan.findFirst({
      where: { userId: user.id, weekStart: { gte: monday, lt: nextMonday } },
    });

    if (existing) {
      await prisma.mealSlot.deleteMany({ where: { mealPlanId: existing.id } });
      await prisma.mealSlot.createMany({
        data: createdRecipes.map((r, i) => ({
          mealPlanId: existing.id,
          dayOfWeek: i,
          recipeId: r.id,
        })),
      });
    } else {
      await prisma.mealPlan.create({
        data: {
          userId: user.id,
          weekStart: monday,
          slots: {
            create: createdRecipes.map((r, i) => ({
              dayOfWeek: i,
              recipeId: r.id,
            })),
          },
        },
      });
    }

    // 7. Logger l'utilisation IA
    await logAiUsage(user.id, "generate-plan", 1);

    // 8. Invalider le cache de la page
    revalidatePath(`/orgs/${orgSlug}/dashboard`);

    return { success: true };
  });
