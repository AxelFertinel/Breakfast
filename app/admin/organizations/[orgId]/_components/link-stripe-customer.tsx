"use client";

import { Button } from "@/components/ui/button";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createStripeCustomerAction } from "../_actions/subscription-admin.actions";

export function LinkStripeCustomer({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await resolveActionResult(createStripeCustomerAction({ organizationId }));
      toast.success("Stripe customer created");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button size="sm" onClick={handleCreate} disabled={isLoading}>
      <Plus className="mr-1.5 size-3" />
      {isLoading ? "Creating..." : "Create customer"}
    </Button>
  );
}
