"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dialogManager } from "@/features/dialog-manager/dialog-manager";
import type { Subscription } from "@/generated/prisma";
import type { OverrideLimits, PlanLimit } from "@/lib/auth/stripe/auth-plans";
import { getPlanLimits } from "@/lib/auth/stripe/auth-plans";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOverrideLimitsAction } from "../_actions/subscription-admin.actions";

export function OrganizationOverrideLimits({
  subscription,
  organizationId,
}: {
  subscription: Subscription | null;
  organizationId: string;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const currentOverrideLimits =
    subscription?.overrideLimits as OverrideLimits | null;
  const planLimits = getPlanLimits(subscription?.plan ?? "free");

  const [limits, setLimits] = useState<OverrideLimits>(
    currentOverrideLimits ?? {},
  );

  const [showForm, setShowForm] = useState(!!currentOverrideLimits);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const hasAnyLimit = Object.keys(limits).length > 0;

      await updateOverrideLimitsAction({
        organizationId,
        overrideLimits: hasAnyLimit ? limits : undefined,
      });

      router.refresh();
    } catch {
      // Error is handled by the action
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    dialogManager.confirm({
      title: "Reset Override Limits",
      description:
        "Are you sure you want to reset all override limits? The organization will use the default plan limits.",
      action: {
        label: "Reset Limits",
        onClick: async () => {
          setIsUpdating(true);
          try {
            await updateOverrideLimitsAction({
              organizationId,
              overrideLimits: undefined,
            });
            router.refresh();
          } finally {
            setIsUpdating(false);
          }
        },
      },
    });
  };

  if (!showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Override Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowForm(true)} size="sm" variant="outline">
            Add Override Limits
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Override Limits</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {(Object.keys(planLimits) as (keyof PlanLimit)[]).map((key) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="capitalize">
                  {key}
                </Label>
                <Input
                  id={key}
                  type="number"
                  min={0}
                  placeholder={String(planLimits[key])}
                  value={limits[key] ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLimits((prev) => ({
                      ...prev,
                      [key]: value === "" ? undefined : parseInt(value, 10),
                    }));
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isUpdating} size="sm">
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            {currentOverrideLimits && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isUpdating}
                size="sm"
              >
                Reset
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
              disabled={isUpdating}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
