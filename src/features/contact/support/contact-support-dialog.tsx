"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useSession } from "@/lib/auth-client";
import { env } from "@/lib/env";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Form, useForm } from "@/features/form/tanstack-form";
import { contactSupportAction } from "./contact-support.action";
import type { ContactSupportSchemaType } from "./contact-support.schema";
import { ContactSupportSchema } from "./contact-support.schema";

type ContactSupportDialogProps = PropsWithChildren;

export const ContactSupportDialog = (props: ContactSupportDialogProps) => {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const email = session.data?.user ? session.data.user.email : "";

  const mutation = useMutation({
    mutationFn: async (values: ContactSupportSchemaType) => {
      return resolveActionResult(contactSupportAction(values));
    },
    onSuccess: () => {
      toast.success("Your message has been sent.");
      form.reset();
      setOpen(false);
    },
    onError: () => {
      toast.error("An error occurred");
    },
  });

  const form = useForm({
    schema: ContactSupportSchema,
    defaultValues: {
      email: email,
      subject: "",
      message: "",
    },
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        {props.children ?? <Button variant="outline">Contact support</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription>
            Fill the form bellow or send an email to{" "}
            <Link
              className="text-primary"
              href={`mailto:${env.NEXT_PUBLIC_EMAIL_CONTACT}`}
            >
              {env.NEXT_PUBLIC_EMAIL_CONTACT}
            </Link>
            .
          </DialogDescription>
        </DialogHeader>
        <Form form={form}>
          <div className="flex flex-col gap-4">
            {email ? null : (
              <form.AppField name="email">
                {(field) => (
                  <field.Field>
                    <field.Label>Email</field.Label>
                    <field.Content>
                      <field.Input type="email" placeholder="Email" />
                      <field.Message />
                    </field.Content>
                  </field.Field>
                )}
              </form.AppField>
            )}
            <form.AppField name="subject">
              {(field) => (
                <field.Field>
                  <field.Label>Subject</field.Label>
                  <field.Content>
                    <field.Input placeholder="Subject" />
                    <field.Message />
                  </field.Content>
                </field.Field>
              )}
            </form.AppField>
            <form.AppField name="message">
              {(field) => (
                <field.Field>
                  <field.Label>Message</field.Label>
                  <field.Content>
                    <field.Textarea placeholder="Message" />
                    <field.Message />
                  </field.Content>
                </field.Field>
              )}
            </form.AppField>
            <form.SubmitButton>Send</form.SubmitButton>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
