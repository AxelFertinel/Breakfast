"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, useForm } from "@/features/form/tanstack-form";
import { authClient, useSession } from "@/lib/auth-client";
import { unwrapSafePromise } from "@/lib/promises";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

const ChangeEmailFormSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address"),
});

type ChangeEmailFormType = z.infer<typeof ChangeEmailFormSchema>;

export default function ChangeEmailPage() {
  const router = useRouter();
  const session = useSession();

  const changeEmailMutation = useMutation({
    mutationFn: async (values: ChangeEmailFormType) => {
      return unwrapSafePromise(
        authClient.changeEmail({
          newEmail: values.newEmail,
        }),
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Verification email sent. Please check your inbox.");
      router.push("/account");
    },
  });

  const form = useForm({
    schema: ChangeEmailFormSchema,
    defaultValues: {
      newEmail: session.data?.user.email ?? "",
    },
    onSubmit: async (values) => {
      await changeEmailMutation.mutateAsync(values);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Email</CardTitle>
        <CardDescription>
          Enter your new email address. We'll send a verification link to
          confirm the change.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form form={form} className="space-y-4">
          <form.AppField name="newEmail">
            {(field) => (
              <field.Field>
                <field.Label>New Email</field.Label>
                <field.Content>
                  <field.Input
                    type="email"
                    placeholder="new-email@example.com"
                  />
                  <field.Message />
                </field.Content>
              </field.Field>
            )}
          </form.AppField>
          <form.SubmitButton className="w-full">Change Email</form.SubmitButton>
        </Form>
      </CardContent>
    </Card>
  );
}
