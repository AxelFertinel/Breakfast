"use client";

import { Button } from "@/components/ui/button";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { reuseMealPlanAction } from "@/src/features/meal-plans/meal-plans.action";
import { useMutation } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ReusePlanButton({ mealPlanId }: { mealPlanId: string }) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      return resolveActionResult(reuseMealPlanAction({ sourceMealPlanId: mealPlanId }));
    },
    onSuccess: () => {
      toast.success("Semaine réutilisée pour cette semaine !");
      router.push("../dashboard");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      <Copy size={14} className="mr-1.5" />
      Réutiliser
    </Button>
  );
}
