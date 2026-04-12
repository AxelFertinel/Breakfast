"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { LoadingButton } from "@/features/form/submit-button";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import type { CurrentOrgPayload } from "@/lib/organizations/get-org";
import { useMutation } from "@tanstack/react-query";
import { ArrowUpCircle, CreditCard, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { openStripePortalAction } from "../billing.action";

type BillingActionsProps = {
  subscription: CurrentOrgPayload["subscription"];
  orgSlug: string;
};

export function BillingActions({ subscription, orgSlug }: BillingActionsProps) {
  const router = useRouter();

  const manageSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const stripeCustomerId = subscription?.stripeCustomerId;

      if (!stripeCustomerId) {
        throw new Error("No stripe customer id found");
      }

      const stripeBilling = await resolveActionResult(openStripePortalAction());

      router.push(stripeBilling.url);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!subscription) {
    return null;
  }

  const showManageButton =
    subscription.status === "active" || subscription.status === "trialing";
  const showCancelButton =
    subscription.status === "active" && !subscription.cancelAtPeriodEnd;
  const showReactivateButton =
    (subscription.cancelAtPeriodEnd ?? false) ||
    (subscription.status !== "trialing" && subscription.status !== "active");

  return (
    <ButtonGroup>
      {showManageButton && (
        <LoadingButton
          variant="outline"
          onClick={() => manageSubscriptionMutation.mutate()}
          loading={manageSubscriptionMutation.isPending}
        >
          <ArrowUpCircle className="mr-2 size-4" />
          Manage Subscription
        </LoadingButton>
      )}

      {showCancelButton && (
        <Button
          variant="outline"
          onClick={() =>
            router.push(`/orgs/${orgSlug}/settings/billing/cancel`)
          }
        >
          <XCircle className="mr-2 size-4" />
          Cancel Subscription
        </Button>
      )}

      {showReactivateButton && (
        <LoadingButton
          onClick={() => manageSubscriptionMutation.mutate()}
          loading={manageSubscriptionMutation.isPending}
        >
          <CreditCard className="mr-2 size-4" />
          Reactivate Subscription
        </LoadingButton>
      )}
    </ButtonGroup>
  );
}
