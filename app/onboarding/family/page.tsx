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
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { saveFamilyMembersAction } from "@/src/features/onboarding/onboarding.action";
import { useMutation } from "@tanstack/react-query";
import { PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { OnboardingProgress } from "../_components/onboarding-progress";

type FamilyMember = {
  name: string;
  type: "adult" | "child";
  birthYear?: number;
};

export default function OnboardingFamilyPage() {
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);

  const addMember = (type: "adult" | "child") => {
    setMembers((prev) => [
      ...prev,
      { name: "", type, birthYear: undefined },
    ]);
  };

  const updateMember = (
    index: number,
    field: keyof FamilyMember,
    value: string | number,
  ) => {
    setMembers((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, [field]: value } : m,
      ),
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
            Ajoutez les membres de votre foyer pour que l'IA prépare les bonnes
            quantités pour tout le monde.
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
              className="border-input flex items-end gap-3 rounded-lg border p-3"
            >
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      member.type === "child"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {member.type === "child" ? "Enfant" : "Adulte"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Prénom</Label>
                    <Input
                      placeholder="Prénom"
                      value={member.name}
                      onChange={(e) =>
                        updateMember(index, "name", e.target.value)
                      }
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
                          parseInt(e.target.value),
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
              onClick={() => addMember("adult")}
            >
              <PlusCircle size={16} className="mr-2" />
              Adulte
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => addMember("child")}
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
