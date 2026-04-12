"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { logBreakfastAction } from "@/src/features/meal-plans/meal-plans.action";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, ChefHat, Flame, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const DAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const BADGE_CONFIG = {
  express: { label: "Express", color: "bg-green-100 text-green-700" },
  veille: { label: "Préparer la veille", color: "bg-amber-100 text-amber-700" },
  weekend: { label: "Week-end", color: "bg-purple-100 text-purple-700" },
} as const;

type Recipe = {
  id: string;
  title: string;
  badgeType: string | null;
  prepTime: number | null;
};

type MealSlot = {
  dayOfWeek: number;
  recipe: Recipe;
};

type MealPlan = {
  id: string;
  slots: MealSlot[];
} | null;

type MealPlanGridProps = {
  mealPlan: MealPlan;
  weekStart: string;
  streak: number;
};

export function MealPlanGrid({ mealPlan, weekStart, streak }: MealPlanGridProps) {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const [loggedDays, setLoggedDays] = useState<Set<number>>(new Set());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStartDate = new Date(weekStart);

  const logMutation = useMutation({
    mutationFn: async ({ dayOfWeek, recipeId }: { dayOfWeek: number; recipeId?: string }) => {
      const date = new Date(weekStartDate);
      date.setDate(weekStartDate.getDate() + dayOfWeek);
      return resolveActionResult(
        logBreakfastAction({
          date: date.toISOString().split("T")[0],
          recipeId,
        }),
      );
    },
    onSuccess: (_, { dayOfWeek }) => {
      setLoggedDays((prev) => new Set([...prev, dayOfWeek]));
      toast.success("Petit-déjeuner noté !");
    },
    onError: (error) => toast.error(error.message),
  });

  if (!mealPlan) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <ChefHat size={48} className="text-muted-foreground" />
        <div>
          <p className="font-medium">Aucun plan pour cette semaine</p>
          <p className="text-muted-foreground text-sm">
            Générez votre plan de petits-déjeuners avec l'IA.
          </p>
        </div>
        <Button>
          <Sparkles size={16} className="mr-2" />
          Générer ma semaine
        </Button>
      </div>
    );
  }

  const slotsByDay = Object.fromEntries(
    mealPlan.slots.map((s) => [s.dayOfWeek, s]),
  );

  return (
    <div className="flex flex-col gap-4">
      {streak > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
          <Flame size={20} className="text-orange-500" />
          <span className="text-sm font-medium text-orange-700">
            {streak} jour{streak > 1 ? "s" : ""} de suite — continuez comme ça !
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DAY_LABELS.map((dayLabel, dayIndex) => {
          const slot = slotsByDay[dayIndex];
          const dayDate = new Date(weekStartDate);
          dayDate.setDate(weekStartDate.getDate() + dayIndex);
          const isToday = dayDate.getTime() === today.getTime();
          const isPast = dayDate < today;
          const isLogged = loggedDays.has(dayIndex);

          return (
            <Card
              key={dayIndex}
              className={`transition-shadow ${isToday ? "ring-primary ring-2" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {dayLabel}
                    {isToday && (
                      <span className="text-primary ml-1 text-xs">• Aujourd'hui</span>
                    )}
                  </CardTitle>
                  {slot && (isToday || isPast) && (
                    <button
                      onClick={() =>
                        logMutation.mutate({
                          dayOfWeek: dayIndex,
                          recipeId: slot.recipe.id,
                        })
                      }
                      className={`rounded-full p-1 transition-colors ${
                        isLogged
                          ? "text-green-600"
                          : "text-muted-foreground hover:text-green-600"
                      }`}
                      title="Marquer comme mangé"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {slot ? (
                  <Link
                    href={`/orgs/${orgSlug}/dashboard/recipes/${slot.recipe.id}`}
                    className="block"
                  >
                    <div className="hover:bg-muted -mx-1 rounded-md px-1 py-1 transition-colors">
                      <p className="text-sm font-medium leading-tight">
                        {slot.recipe.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {slot.recipe.badgeType && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              BADGE_CONFIG[
                                slot.recipe.badgeType as keyof typeof BADGE_CONFIG
                              ]?.color ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {BADGE_CONFIG[
                              slot.recipe.badgeType as keyof typeof BADGE_CONFIG
                            ]?.label ?? slot.recipe.badgeType}
                          </span>
                        )}
                        {slot.recipe.prepTime && (
                          <span className="text-muted-foreground text-xs">
                            {slot.recipe.prepTime} min
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Aucune recette
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
