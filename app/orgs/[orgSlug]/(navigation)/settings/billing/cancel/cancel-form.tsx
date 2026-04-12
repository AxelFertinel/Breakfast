"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, useForm } from "@/features/form/tanstack-form";
import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { cancelOrgSubscriptionAction } from "../billing.action";

const CANCEL_REASONS = {
  too_expensive: "Too expensive",
  not_using: "Not using the product enough",
  missing_features: "Missing features",
  bugs: "Too many bugs/issues",
  competitor: "Switching to a competitor",
  other: "Other",
} as const;

const CancelSchema = z.object({
  reasonType: z.enum([
    "too_expensive",
    "not_using",
    "missing_features",
    "bugs",
    "competitor",
    "other",
  ] as const),
  details: z
    .string()
    .min(10, "Please provide more details (minimum 10 characters)"),
});

export function CancelSubscriptionForm({
  orgSlug,
}: {
  orgId: string;
  orgSlug: string;
}) {
  const router = useRouter();

  const { execute: cancelSubscription, isPending } = useAction(
    cancelOrgSubscriptionAction,
    {
      onSuccess: (result) => {
        if (result.data.url) {
          toast.success(
            "Redirecting to billing portal where you can cancel your subscription.",
          );
          window.location.href = result.data.url;
        }
      },
      onError: (error) => {
        toast.error(error.error.serverError ?? "Failed to open billing portal");
      },
    },
  );

  const form = useForm({
    schema: CancelSchema,
    defaultValues: {
      reasonType: "other" as const,
      details: "",
    },
    onSubmit: async () => {
      cancelSubscription({
        returnUrl: `/orgs/${orgSlug}/settings/billing`,
      });
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cancel Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <Form form={form}>
          <div className="flex flex-col gap-6">
            <form.AppField name="reasonType">
              {(field) => (
                <field.Field>
                  <field.Label>
                    What's your main reason for cancelling?
                  </field.Label>
                  <field.Content>
                    <RadioGroup
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as
                            | "too_expensive"
                            | "not_using"
                            | "missing_features"
                            | "bugs"
                            | "competitor"
                            | "other",
                        )
                      }
                      className="gap-2"
                    >
                      {Object.entries(CANCEL_REASONS).map(([value, label]) => (
                        <div key={value} className="flex items-center gap-3">
                          <RadioGroupItem value={value} />
                          <label className="cursor-pointer text-sm font-normal">
                            {label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                    <field.Message />
                  </field.Content>
                </field.Field>
              )}
            </form.AppField>

            <form.AppField name="details">
              {(field) => (
                <field.Field>
                  <field.Label>Additional details</field.Label>
                  <field.Content>
                    <field.Textarea
                      placeholder="Please provide more details to help us improve..."
                      className="min-h-[100px]"
                    />
                    <field.Message />
                  </field.Content>
                </field.Field>
              )}
            </form.AppField>

            <div className="flex gap-4">
              <form.SubmitButton variant="destructive" disabled={isPending}>
                Confirm Cancellation
              </form.SubmitButton>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/orgs/${orgSlug}/settings/billing`)}
              >
                Go Back
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
