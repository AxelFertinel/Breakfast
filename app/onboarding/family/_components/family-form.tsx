"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dialogManager } from "@/features/dialog-manager/dialog-manager";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { saveFamilyMembersAction } from "@/features/onboarding/onboarding.action";
import { useMutation } from "@tanstack/react-query";
import { PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { OnboardingProgress } from "../../_components/onboarding-progress";

type FamilyMember = {
  name: string;
  type: "child";
  birthYear?: number;
  weightKg?: number;
  heightCm?: number;
};

type FamilyFormProps = {
  childrenLimit: number;
};

function showAdultUpsell() {
  dialogManager.confirm({
    title: "Fonctionnalité Premium",
    description:
      "Vous êtes automatiquement l'adulte principal de votre foyer. Pour ajouter d'autres adultes, passez au plan Famille ou Premium.",
    variant: "default",
    action: {
      label: "Voir les plans",
      onClick: async () => {
        window.location.href = "/onboarding/dietary";
      },
    },
  });
}

function showChildLimitUpsell(childrenLimit: number) {
  dialogManager.confirm({
    title: "Limite atteinte",
    description:
      childrenLimit === 1
        ? "Le plan gratuit inclut 1 enfant. Passez au plan Famille pour ajouter jusqu'à 4 enfants, ou au plan Premium pour des membres illimités."
        : `Votre plan inclut ${childrenLimit} enfants. Passez au plan supérieur pour en ajouter davantage.`,
    variant: "default",
    action: {
      label: "Voir les plans",
      onClick: async () => {
        window.location.href = "/onboarding/dietary";
      },
    },
  });
}

export function FamilyForm({ childrenLimit }: FamilyFormProps) {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);

  const addChild = () => {
    const isUnlimited = childrenLimit === -1;
    if (!isUnlimited && members.length >= childrenLimit) {
      showChildLimitUpsell(childrenLimit);
      return;
    }
    setMembers((prev) => [
      ...prev,
      { name: "", type: "child", birthYear: undefined, weightKg: undefined, heightCm: undefined },
    ]);
  };

  const updateMember = (
    index: number,
    field: keyof FamilyMember,
    value: string | number | undefined,
  ) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  };

  const removeMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      return resolveActionResult(
        saveFamilyMembersAction({
          members: members.map((m) => ({
            ...m,
            sportTypes: [],
            dietaryPrefs: [],
          })),
        }),
      );
    },
    onSuccess: () => {
      router.push("/onboarding/dietary");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <OnboardingProgress currentStep={3} totalSteps={4} />
      <Card>
        <CardHeader>
          <CardTitle>Votre famille</CardTitle>
          <p className="text-muted-foreground text-sm">
            Ajoutez les membres de votre foyer pour que l'IA adapte les
            quantités à chaque personne.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {members.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Vous cuisinez seul(e) pour l'instant. Vous pouvez ajouter des
              membres maintenant ou plus tard dans vos paramètres.
            </p>
          )}

          {members.map((member, index) => (
            <div
              key={index}
              className="border-input flex items-start gap-3 rounded-lg border p-3"
            >
              <div className="flex flex-1 flex-col gap-3">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 self-start">
                  Enfant
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Prénom</Label>
                    <Input
                      placeholder="Prénom"
                      value={member.name}
                      onChange={(e) => updateMember(index, "name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Année de naissance</Label>
                    <Input
                      type="number"
                      placeholder="2015"
                      value={member.birthYear ?? ""}
                      onChange={(e) =>
                        updateMember(
                          index,
                          "birthYear",
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Poids (kg)</Label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={member.weightKg ?? ""}
                      onChange={(e) =>
                        updateMember(
                          index,
                          "weightKg",
                          e.target.value ? parseFloat(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Taille (cm)</Label>
                    <Input
                      type="number"
                      placeholder="120"
                      value={member.heightCm ?? ""}
                      onChange={(e) =>
                        updateMember(
                          index,
                          "heightCm",
                          e.target.value ? parseFloat(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive mt-1"
                onClick={() => removeMember(index)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={showAdultUpsell}
            >
              <PlusCircle size={16} className="mr-2" />
              Adulte
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={addChild}
            >
              <PlusCircle size={16} className="mr-2" />
              Enfant
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/onboarding/activity")}
          >
            ← Retour
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Enregistrement…" : "Suivant →"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
