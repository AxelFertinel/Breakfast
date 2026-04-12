"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, useForm } from "@/features/form/tanstack-form";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { savePhysicalProfileAction } from "@/src/features/onboarding/onboarding.action";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { OnboardingProgress } from "./_components/onboarding-progress";

const PhysicalProfileSchema = z.object({
  weightKg: z.coerce.number().min(20).max(300).optional(),
  heightCm: z.coerce.number().min(50).max(250).optional(),
  birthYear: z.coerce
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

type PhysicalProfileType = z.infer<typeof PhysicalProfileSchema>;

export default function OnboardingPhysicalPage() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: PhysicalProfileType) => {
      return resolveActionResult(savePhysicalProfileAction(values));
    },
    onSuccess: () => {
      router.push("/onboarding/activity");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm({
    schema: PhysicalProfileSchema,
    defaultValues: {
      weightKg: undefined,
      heightCm: undefined,
      birthYear: undefined,
      gender: undefined,
    },
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });

  return (
    <Form form={form}>
      <OnboardingProgress currentStep={1} totalSteps={4} />
      <Card>
        <CardHeader>
          <CardTitle>Votre profil physique</CardTitle>
          <p className="text-muted-foreground text-sm">
            Ces informations permettent à l'IA d'adapter les quantités et les
            apports nutritionnels à vos besoins.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="weightKg">
              {(field) => (
                <field.Field>
                  <field.Label>Poids (kg)</field.Label>
                  <field.Content>
                    <field.Input type="number" placeholder="70" />
                    <field.Message />
                  </field.Content>
                </field.Field>
              )}
            </form.AppField>

            <form.AppField name="heightCm">
              {(field) => (
                <field.Field>
                  <field.Label>Taille (cm)</field.Label>
                  <field.Content>
                    <field.Input type="number" placeholder="175" />
                    <field.Message />
                  </field.Content>
                </field.Field>
              )}
            </form.AppField>
          </div>

          <form.AppField name="birthYear">
            {(field) => (
              <field.Field>
                <field.Label>Année de naissance</field.Label>
                <field.Content>
                  <field.Input type="number" placeholder="1990" />
                  <field.Message />
                </field.Content>
              </field.Field>
            )}
          </form.AppField>

          <form.AppField name="gender">
            {(field) => (
              <field.Field>
                <field.Label>Genre</field.Label>
                <field.Content>
                  <div className="flex gap-3">
                    {(
                      [
                        { value: "male", label: "Homme" },
                        { value: "female", label: "Femme" },
                        { value: "other", label: "Autre" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.setValue(opt.value)}
                        className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
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
          <p className="text-muted-foreground text-xs">
            Tous les champs sont optionnels
          </p>
          <form.SubmitButton>Suivant →</form.SubmitButton>
        </CardFooter>
      </Card>
    </Form>
  );
}
