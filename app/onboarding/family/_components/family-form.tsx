"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type MemberType = "adult" | "child";

type FamilyMember = {
  name: string;
  type: MemberType;
  birthYear: number;
  weightKg: number;
  heightCm: number;
};

type PendingMember = {
  name: string;
  type: MemberType;
  birthYear: string;
  weightKg: string;
  heightCm: string;
};

type FamilyFormProps = {
  childrenLimit: number;
};

const emptyPending = (type: MemberType): PendingMember => ({
  name: "",
  type,
  birthYear: "",
  weightKg: "",
  heightCm: "",
});

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
    cancel: { label: "Annuler" },
  });
}

function showAdultUpsell() {
  dialogManager.confirm({
    title: "Fonctionnalité Premium",
    description:
      "Vous êtes automatiquement l'adulte principal de votre foyer. Pour ajouter d'autres adultes, passez au plan Premium.",
    variant: "default",
    action: {
      label: "Voir les plans",
      onClick: async () => {
        window.location.href = "/onboarding/dietary";
      },
    },
    cancel: { label: "Annuler" },
  });
}

export function FamilyForm({ childrenLimit }: FamilyFormProps) {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingMember, setPendingMember] = useState<PendingMember>(
    emptyPending("child"),
  );

  const canAddAdult = childrenLimit === -1;
  const childCount = members.filter((m) => m.type === "child").length;

  const openChildModal = () => {
    const isUnlimited = childrenLimit === -1;
    if (!isUnlimited && childCount >= childrenLimit) {
      showChildLimitUpsell(childrenLimit);
      return;
    }
    setPendingMember(emptyPending("child"));
    setModalOpen(true);
  };

  const openAdultModal = () => {
    if (!canAddAdult) {
      showAdultUpsell();
      return;
    }
    setPendingMember(emptyPending("adult"));
    setModalOpen(true);
  };

  const handleModalConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const member: FamilyMember = {
      name: pendingMember.name,
      type: pendingMember.type,
      birthYear: parseInt(pendingMember.birthYear),
      weightKg: parseFloat(pendingMember.weightKg),
      heightCm: parseFloat(pendingMember.heightCm),
    };
    setMembers((prev) => [...prev, member]);
    setModalOpen(false);
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
    <>
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
                className="border-input flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        member.type === "adult"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {member.type === "adult" ? "Adulte" : "Enfant"}
                    </span>
                    <span className="font-medium">{member.name}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {member.birthYear} · {member.weightKg} kg ·{" "}
                    {member.heightCm} cm
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
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
                onClick={openAdultModal}
              >
                <PlusCircle size={16} className="mr-2" />
                Adulte
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={openChildModal}
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingMember.type === "adult"
                ? "Ajouter un adulte"
                : "Ajouter un enfant"}
            </DialogTitle>
          </DialogHeader>
          <form
            id="member-form"
            onSubmit={handleModalConfirm}
            className="flex flex-col gap-4"
          >
            <div>
              <Label>Prénom</Label>
              <Input
                placeholder="Prénom"
                value={pendingMember.name}
                onChange={(e) =>
                  setPendingMember((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>
                  Année de naissance <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder={
                    pendingMember.type === "adult" ? "1990" : "2015"
                  }
                  value={pendingMember.birthYear}
                  onChange={(e) =>
                    setPendingMember((p) => ({
                      ...p,
                      birthYear: e.target.value,
                    }))
                  }
                  required
                  min={1900}
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <Label>
                  Poids (kg) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder={pendingMember.type === "adult" ? "70" : "30"}
                  value={pendingMember.weightKg}
                  onChange={(e) =>
                    setPendingMember((p) => ({
                      ...p,
                      weightKg: e.target.value,
                    }))
                  }
                  required
                  min={5}
                  max={300}
                  step="0.1"
                />
              </div>
              <div>
                <Label>
                  Taille (cm) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder={pendingMember.type === "adult" ? "170" : "120"}
                  value={pendingMember.heightCm}
                  onChange={(e) =>
                    setPendingMember((p) => ({
                      ...p,
                      heightCm: e.target.value,
                    }))
                  }
                  required
                  min={50}
                  max={250}
                />
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" form="member-form">
              {pendingMember.type === "adult"
                ? "Ajouter l'adulte"
                : "Ajouter l'enfant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
