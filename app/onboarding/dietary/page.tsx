"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import {
  completeOnboardingAction,
  saveMemberDietaryPrefsAction,
} from "@/src/features/onboarding/onboarding.action";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { OnboardingProgress } from "../_components/onboarding-progress";

const ALLERGIES = [
  { value: "gluten", label: "Gluten" },
  { value: "lactose", label: "Lactose" },
  { value: "arachides", label: "Arachides" },
  { value: "oeufs", label: "Œufs" },
  { value: "fruits_coque", label: "Fruits à coque" },
  { value: "soja", label: "Soja" },
];

const DIETS = [
  { value: "vegan", label: "Vegan" },
  { value: "vegetarien", label: "Végétarien" },
  { value: "sans_sucre", label: "Sans sucre ajouté" },
  { value: "halal", label: "Halal" },
  { value: "kasher", label: "Kasher" },
  { value: "paleo", label: "Paléo" },
];

type FamilyMemberWithId = {
  id: string;
  name: string;
  type: "adult" | "child";
  dietaryPrefs: string[];
};

export default function OnboardingDietaryPage() {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMemberWithId[]>([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);

  // Récupère les membres depuis le serveur
  useEffect(() => {
    fetch("/api/onboarding/family-members")
      .then((r) => r.json())
      .then((data: FamilyMemberWithId[]) => setMembers(data))
      .catch(() => {
        // Si pas de membres, on saute cette étape
      });
  }, []);

  const togglePref = (pref: string) => {
    setMembers((prev) =>
      prev.map((m, i) =>
        i === currentMemberIndex
          ? {
              ...m,
              dietaryPrefs: m.dietaryPrefs.includes(pref)
                ? m.dietaryPrefs.filter((p) => p !== pref)
                : [...m.dietaryPrefs, pref],
            }
          : m,
      ),
    );
  };

  const saveMutation = useMutation({
    mutationFn: async (member: FamilyMemberWithId) => {
      return resolveActionResult(
        saveMemberDietaryPrefsAction({
          memberId: member.id,
          dietaryPrefs: member.dietaryPrefs,
        }),
      );
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      return resolveActionResult(completeOnboardingAction({}));
    },
    onSuccess: () => {
      router.push("/orgs");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleNext = async () => {
    const current = members[currentMemberIndex];
    if (current) {
      await saveMutation.mutateAsync(current);
    }

    if (currentMemberIndex < members.length - 1) {
      setCurrentMemberIndex((prev) => prev + 1);
    } else {
      completeMutation.mutate();
    }
  };

  const handleSkip = () => {
    completeMutation.mutate();
  };

  const currentMember = members[currentMemberIndex];

  return (
    <div>
      <OnboardingProgress currentStep={4} totalSteps={4} />
      <Card>
        <CardHeader>
          <CardTitle>Préférences alimentaires</CardTitle>
          <p className="text-muted-foreground text-sm">
            {members.length === 0
              ? "Indiquez vos propres restrictions alimentaires."
              : `Indiquez les restrictions pour ${currentMember?.name ?? "ce membre"} (${currentMemberIndex + 1}/${members.length}).`}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {currentMember && (
            <div className="bg-muted rounded-md px-3 py-2 text-sm font-medium">
              {currentMember.name} •{" "}
              {currentMember.type === "child" ? "Enfant" : "Adulte"}
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium">Allergies / intolérances</p>
            <div className="flex flex-wrap gap-2">
              {ALLERGIES.map((a) => {
                const selected =
                  currentMember?.dietaryPrefs.includes(a.value) ?? false;
                return (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => togglePref(a.value)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      selected
                        ? "border-destructive bg-destructive text-destructive-foreground"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Régime alimentaire</p>
            <div className="flex flex-wrap gap-2">
              {DIETS.map((d) => {
                const selected =
                  currentMember?.dietaryPrefs.includes(d.value) ?? false;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => togglePref(d.value)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/onboarding/family")}
            >
              ← Retour
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={completeMutation.isPending}
            >
              Passer
            </Button>
          </div>
          <Button
            type="button"
            onClick={handleNext}
            disabled={saveMutation.isPending || completeMutation.isPending}
          >
            {completeMutation.isPending
              ? "Finalisation…"
              : currentMemberIndex < members.length - 1
                ? "Suivant →"
                : "Terminer ✓"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
