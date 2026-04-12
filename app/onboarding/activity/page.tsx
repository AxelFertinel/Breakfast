"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, useForm } from "@/features/form/tanstack-form";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { saveActivityProfileAction } from "@/src/features/onboarding/onboarding.action";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { OnboardingProgress } from "../_components/onboarding-progress";

const SPORT_TYPES = [
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

const ActivitySchema = z.object({
  sportHoursPerWeek: z.coerce.number().min(0).max(40).optional(),
  sportTypes: z.array(z.string()).default([]),
  activityLevel: z
    .enum(["sedentary", "light", "moderate", "active", "very_active"])
    .optional(),
  breakfastGoal: z
    .enum(["perte_poids", "prise_masse", "maintien", "endurance"])
    .optional(),
});

type ActivityType = z.infer<typeof ActivitySchema>;

export default function OnboardingActivityPage() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: ActivityType) => {
      return resolveActionResult(saveActivityProfileAction(values));
    },
    onSuccess: () => {
      router.push("/onboarding/family");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm({
    schema: ActivitySchema,
    defaultValues: {
      sportHoursPerWeek: undefined,
      sportTypes: [],
      activityLevel: undefined,
      breakfastGoal: undefined,
    },
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });

  return (
    <Form form={form}>
      <OnboardingProgress currentStep={2} totalSteps={4} />
      <Card>
        <CardHeader>
          <CardTitle>Votre activité sportive</CardTitle>
          <p className="text-muted-foreground text-sm">
            L'IA adapte les apports en glucides et protéines selon votre niveau
            d'activité.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <form.AppField name="sportHoursPerWeek">
            {(field) => (
              <field.Field>
                <field.Label>Heures de sport par semaine</field.Label>
                <field.Content>
                  <field.Input type="number" placeholder="3" />
                  <field.Message />
                </field.Content>
              </field.Field>
            )}
          </form.AppField>

          <form.AppField name="sportTypes">
            {(field) => (
              <field.Field>
                <field.Label>Types de sport pratiqués</field.Label>
                <field.Content>
                  <div className="flex flex-wrap gap-2">
                    {SPORT_TYPES.map((sport) => {
                      const selected = (
                        field.state.value as string[]
                      ).includes(sport.value);
                      return (
                        <button
                          key={sport.value}
                          type="button"
                          onClick={() => {
                            const current = field.state.value as string[];
                            field.setValue(
                              selected
                                ? current.filter((v) => v !== sport.value)
                                : [...current, sport.value],
                            );
                          }}
                          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input hover:bg-accent"
                          }`}
                        >
                          {sport.label}
                        </button>
                      );
                    })}
                  </div>
                  <field.Message />
                </field.Content>
              </field.Field>
            )}
          </form.AppField>

          <form.AppField name="activityLevel">
            {(field) => (
              <field.Field>
                <field.Label>Niveau d'activité général</field.Label>
                <field.Content>
                  <div className="flex flex-col gap-2">
                    {(
                      [
                        { value: "sedentary", label: "Sédentaire (bureau, peu de marche)" },
                        { value: "light", label: "Légèrement actif (marche quotidienne)" },
                        { value: "moderate", label: "Modérément actif (sport 3x/semaine)" },
                        { value: "active", label: "Actif (sport 5x/semaine)" },
                        { value: "very_active", label: "Très actif (sport intense quotidien)" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.setValue(opt.value)}
                        className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                          field.state.value === opt.value
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-input hover:bg-accent"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <field.Message />
                </field.Content>
              </field.Field>
            )}
          </form.AppField>

          <form.AppField name="breakfastGoal">
            {(field) => (
              <field.Field>
                <field.Label>Objectif principal</field.Label>
                <field.Content>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { value: "maintien", label: "Maintien du poids" },
                        { value: "perte_poids", label: "Perte de poids" },
                        { value: "prise_masse", label: "Prise de masse" },
                        { value: "endurance", label: "Endurance / Sport" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.setValue(opt.value)}
                        className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                          field.state.value === opt.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input hover:bg-accent"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <field.Message />
                </field.Content>
              </field.Field>
            )}
          </form.AppField>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/onboarding")}
          >
            ← Retour
          </Button>
          <form.SubmitButton>Suivant →</form.SubmitButton>
        </CardFooter>
      </Card>
    </Form>
  );
}
