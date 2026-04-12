"use client";

import { LoadingButton } from "@/features/form/submit-button";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { openStripePortalAction } from "../../billing.action";

export function EditBillingButton() {
  const router = useRouter();

  const editBillingMutation = useMutation({
    mutationFn: async () => {
      const result = await resolveActionResult(openStripePortalAction());
      router.push(result.url);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <LoadingButton
      size="sm"
      variant="outline"
      onClick={() => editBillingMutation.mutate()}
      loading={editBillingMutation.isPending}
    >
      Edit
    </LoadingButton>
  );
}
