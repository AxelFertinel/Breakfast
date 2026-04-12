"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { saveActivityProfileAction } from "@/features/onboarding/onboarding.action";
import { useMutation } from "@tanstack/react-query";
import { PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { OnboardingProgress } from "../_components/onboarding-progress";

const SPORT_OPTIONS = [
  { value: "marche", label: "Marche" },
  { value: "course", label: "Course à pied" },
  { value: "velo", label: "Vélo" },
  { value: "natation", label: "Natation" },
  { value: "musculation", label: "Musculation" },
  { value: "yoga", label: "Yoga" },
  { value: "danse", label: "Danse" },
  { value: "football", label: "Football" },
  { value: "tennis", label: "Tennis" },
  { value: "arts_martiaux", label: "Arts martiaux" },
  { value: "autre", label: "Autre" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sédentaire", description: "Bureau, peu de marche" },
  { value: "light", label: "Légèrement actif", description: "Marche quotidienne" },
  { value: "moderate", label: "Modérément actif", description: "Sport 3x/semaine" },
  { value: "active", label: "Actif", description: "Sport 5x/semaine" },
  { value: "very_active", label: "Très actif", description: "Sport intense quotidien" },
] as const;

const BREAKFAST_GOALS = [
  { value: "maintien", label: "Maintien du poids" },
  { value: "perte_poids", label: "Perte de poids" },
  { value: "prise_masse", label: "Prise de masse" },
  { value: "endurance", label: "Endurance / Sport" },
] as const;

type ActivityEntry = { sport: string; hoursPerWeek: number };
type ActivityLevel = (typeof ACTIVITY_LEVELS)[number]["value"];
type BreakfastGoal = (typeof BREAKFAST_GOALS)[number]["value"];

export default function OnboardingActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | undefined>();
  const [breakfastGoal, setBreakfastGoal] = useState<BreakfastGoal | undefined>();

  const addActivity = () => {
    setActivities((prev) => [...prev, { sport: "marche", hoursPerWeek: 1 }]);
  };

  const updateActivity = (
    index: number,
    field: keyof ActivityEntry,
    value: string | number,
  ) => {
    setActivities((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  };

  const removeActivity = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const sportTypes = activities.map((a) => a.sport);
      const sportHoursPerWeek = activities.reduce((sum, a) => sum + a.hoursPerWeek, 0);
      return resolveActionResult(
        saveActivityProfileAction({
          sportTypes,
          sportHoursPerWeek: sportHoursPerWeek > 0 ? sportHoursPerWeek : undefined,
          activityLevel,
          breakfastGoal,
        }),
      );
    },
    onSuccess: () => {
      router.push("/onboarding/family");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <OnboardingProgress currentStep={2} totalSteps={4} />
      <Card>
        <CardHeader>
          <CardTitle>Votre activité sportive</CardTitle>
          <p className="text-muted-foreground text-sm">
            L'IA adapte les apports en glucides et protéines selon votre niveau
            d'activité.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Activités pratiquées</p>

            {activities.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Aucune activité — vous pouvez passer cette étape.
              </p>
            )}

            {activities.map((activity, index) => (
              <div
                key={index}
                className="border-input flex items-center gap-3 rounded-lg border p-3"
              >
                <select
                  value={activity.sport}
                  onChange={(e) => updateActivity(index, "sport", e.target.value)}
                  className="border-input bg-background flex-1 rounded-md border px-3 py-2 text-sm"
                >
                  {SPORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0.5}
                    max={40}
                    step={0.5}
                    value={activity.hoursPerWeek}
                    onChange={(e) =>
                      updateActivity(index, "hoursPerWeek", parseFloat(e.target.value) || 1)
                    }
                    className="w-20"
                  />
                  <span className="text-muted-foreground whitespace-nowrap text-sm">h/sem</span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeActivity(index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={addActivity}
            >
              <PlusCircle size={16} className="mr-2" />
              Ajouter une activité
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Niveau d'activité général</p>
            <div className="flex flex-col gap-2">
              {ACTIVITY_LEVELS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActivityLevel(opt.value)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${ 
                    activityLevel === opt.value
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "border-input hover:bg-accent"}`}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-muted-foreground ml-2">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Objectif principal</p>
            <div className="grid grid-cols-2 gap-2">
              {BREAKFAST_GOALS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBreakfastGoal(opt.value)}
                  className={`rounded-md border px-3 py-2 text-sm transition-colors ${ 
                    breakfastGoal === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="ghost" onClick={() => router.push("/onboarding")}>
            ← Retour
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Enregistrement…" : "Suivant →"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
