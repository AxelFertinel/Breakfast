"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, useForm } from "@/features/form/tanstack-form";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { addEmailAction } from "./email.action";
import type { EmailActionSchemaType } from "./email.schema";
import { EmailActionSchema } from "./email.schema";

type EmailFormProps = {
  submitButtonLabel?: string;
  successMessage?: string;
};

export const EmailForm = ({
  submitButtonLabel = "Subscribe",
  successMessage = "You have subscribed to our newsletter.",
}: EmailFormProps) => {
  const submit = useMutation({
    mutationFn: async ({ email }: EmailActionSchemaType) => {
      return resolveActionResult(addEmailAction({ email }));
    },
    onSuccess: () => {
      toast.success(successMessage);
    },
    onError: () => {
      toast.error("An error occurred");
    },
  });

  const form = useForm({
    schema: EmailActionSchema,
    defaultValues: {
      email: "",
    },
    onSubmit: async (values) => {
      submit.mutate(values);
    },
  });

  return (
    <AnimatePresence mode="wait">
      {submit.isSuccess ? (
        <motion.div
          key="success"
          initial={{
            height: 0,
            opacity: 0,
          }}
          animate={{
            height: "auto",
            opacity: 1,
          }}
        >
          <Alert variant="success">
            <CheckCircle size={20} />
            <AlertTitle>{successMessage}</AlertTitle>
          </Alert>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          animate={{
            height: "auto",
            opacity: 1,
          }}
          exit={{
            height: 0,
            opacity: 0,
          }}
        >
          <Form form={form} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <form.AppField name="email">
                {(field) => (
                  <field.Field className="relative w-full">
                    <field.Content>
                      <field.Input
                        type="email"
                        className="border-accent-foreground/20 bg-accent focus-visible:ring-foreground py-5 text-lg"
                        placeholder="Ton email"
                      />
                      <field.Message className="absolute -bottom-5" />
                    </field.Content>
                  </field.Field>
                )}
              </form.AppField>
              <form.SubmitButton size="lg" variant="invert">
                {submitButtonLabel}
              </form.SubmitButton>
            </div>
            {submit.isError && (
              <Alert variant="destructive">
                <AlertCircle size={20} />
                <AlertTitle>{submit.error.message}</AlertTitle>
                <AlertDescription>
                  Try another email address or contact us.
                </AlertDescription>
              </Alert>
            )}
          </Form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
