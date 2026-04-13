"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  savePhysicalProfileAction,
  saveFamilyMemberAction,
} from "../famille.action";

const DIETARY_OPTIONS = [
  { value: "gluten", label: "Sans gluten" },
  { value: "lactose", label: "Sans lactose" },
  { value: "oeufs", label: "Sans œufs" },
  { value: "noix", label: "Sans noix" },
  { value: "arachides", label: "Sans arachides" },
  { value: "soja", label: "Sans soja" },
  { value: "poisson", label: "Sans poisson" },
  { value: "crustaces", label: "Sans crustacés" },
  { value: "vegan", label: "Vegan" },
  { value: "vegetarien", label: "Végétarien" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sédentaire" },
  { value: "light", label: "Léger (1-2j/sem)" },
  { value: "moderate", label: "Modéré (3-4j/sem)" },
  { value: "active", label: "Actif (5j/sem)" },
  { value: "very_active", label: "Très actif (quotidien)" },
];

type AdultValues = {
  weightKg?: number;
  heightCm?: number;
  birthYear?: number;
  gender?: "male" | "female" | "other";
  sportHoursPerWeek?: number;
  sportTypes?: string[];
  activityLevel?: string;
  dietaryPrefs?: string[];
};

type ChildValues = {
  name?: string;
  birthYear?: number;
  weightKg?: number;
  heightCm?: number;
  sportTypes?: string[];
  activityLevel?: string;
  dietaryPrefs?: string[];
};

type Props =
  | {
      type: "adult";
      defaultValues?: AdultValues;
      onSuccess: () => void;
      onCancel?: () => void;
      memberId?: never;
    }
  | {
      type: "child" | "adult-member";
      defaultValues?: ChildValues;
      onSuccess: () => void;
      onCancel?: () => void;
      memberId?: string;
    };

export function FamilyMemberForm({
  type,
  defaultValues,
  onSuccess,
  onCancel,
  memberId,
}: Props) {
  const isMainAdult = type === "adult";

  const [sportTypes, setSportTypes] = useState<string[]>(
    defaultValues?.sportTypes ?? [],
  );
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(
    defaultValues?.dietaryPrefs ?? [],
  );
  const [activityLevel, setActivityLevel] = useState<string>(
    defaultValues?.activityLevel ?? "",
  );
  const [customAllergen, setCustomAllergen] = useState("");
  const [customSport, setCustomSport] = useState("");
  const [customSportHours, setCustomSportHours] = useState("");
  const [sportHoursError, setSportHoursError] = useState(false);

  const addCustomSport = () => {
    const val = customSport.trim().toLowerCase();
    if (!val) return;
    if (!customSportHours) {
      setSportHoursError(true);
      return;
    }
    setSportHoursError(false);
    const label = `${val} (${customSportHours}h/sem)`;
    if (!sportTypes.some((s) => s.startsWith(val))) {
      setSportTypes([...sportTypes, label]);
    }
    setCustomSport("");
    setCustomSportHours("");
  };

  const addCustomAllergen = () => {
    const val = customAllergen.trim().toLowerCase();
    if (val && !dietaryPrefs.includes(val)) {
      setDietaryPrefs([...dietaryPrefs, val]);
    }
    setCustomAllergen("");
  };

  const toggleTag = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isMainAdult) {
        const weightKg = data.get("weightKg")
          ? parseFloat(data.get("weightKg") as string)
          : undefined;
        const heightCm = data.get("heightCm")
          ? parseFloat(data.get("heightCm") as string)
          : undefined;
        const birthYear = data.get("birthYear")
          ? parseInt(data.get("birthYear") as string)
          : undefined;
        const payload = {
          weightKg,
          heightCm,
          birthYear,
          sportHoursPerWeek: data.get("sportHoursPerWeek")
            ? parseFloat(data.get("sportHoursPerWeek") as string)
            : undefined,
          sportTypes,
          activityLevel:
            (activityLevel as
              | "sedentary"
              | "light"
              | "moderate"
              | "active"
              | "very_active"
              | undefined) || undefined,
          dietaryPrefs,
        };
        console.log("[FamilyMemberForm] savePhysicalProfile payload:", payload);
        const result = await resolveActionResult(
          savePhysicalProfileAction(payload),
        );
        console.log("[FamilyMemberForm] savePhysicalProfile result:", result);
        return result;
      } else {
        const name = data.get("name") as string;
        const birthYear = data.get("birthYear")
          ? parseInt(data.get("birthYear") as string)
          : undefined;
        const weightKg = data.get("weightKg")
          ? parseFloat(data.get("weightKg") as string)
          : undefined;
        const heightCm = data.get("heightCm")
          ? parseFloat(data.get("heightCm") as string)
          : undefined;
        const payload = {
          id: memberId,
          name,
          type: (type === "adult-member" ? "adult" : "child") as
            | "adult"
            | "child",
          birthYear,
          weightKg,
          heightCm,
          sportTypes,
          activityLevel:
            (activityLevel as
              | "sedentary"
              | "light"
              | "moderate"
              | "active"
              | "very_active"
              | undefined) || undefined,
          dietaryPrefs,
        };
        console.log("[FamilyMemberForm] saveFamilyMember payload:", payload);
        const result = await resolveActionResult(
          saveFamilyMemberAction(payload),
        );
        console.log("[FamilyMemberForm] saveFamilyMember result:", result);
        return result;
      }
    },
    onSuccess: () => {
      toast.success("Profil mis à jour");
      onSuccess();
    },
    onError: (error) => {
      console.error("[FamilyMemberForm] mutation error:", error);
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(new FormData(e.currentTarget));
  };

  const dv = defaultValues as (AdultValues & ChildValues) | undefined;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-1">
      {/* Prénom (membres famille seulement) */}
      {!isMainAdult && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Prénom</Label>
          <Input
            id="name"
            name="name"
            placeholder="Prénom"
            defaultValue={dv?.name ?? ""}
            required
          />
        </div>
      )}

      {/* Données physiques */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          Données physiques
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="birthYear">Naissance *</Label>
            <Input
              id="birthYear"
              name="birthYear"
              type="number"
              placeholder="2000"
              defaultValue={dv?.birthYear ?? ""}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="weightKg">Poids (kg) *</Label>
            <Input
              id="weightKg"
              name="weightKg"
              type="number"
              step="0.1"
              placeholder="60"
              defaultValue={dv?.weightKg ?? ""}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="heightCm">Taille (cm) *</Label>
            <Input
              id="heightCm"
              name="heightCm"
              type="number"
              placeholder="170"
              defaultValue={dv?.heightCm ?? ""}
              required
            />
          </div>
        </div>
      </div>

      {/* Activité */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          Activité physique
        </p>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Niveau d'activité</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isMainAdult && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sportHoursPerWeek">Heures / semaine</Label>
                <Input
                  id="sportHoursPerWeek"
                  name="sportHoursPerWeek"
                  type="number"
                  min={0}
                  max={40}
                  step={0.5}
                  placeholder="3"
                  defaultValue={
                    (defaultValues as AdultValues | undefined)
                      ?.sportHoursPerWeek ?? ""
                  }
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Sports pratiqués</Label>
            {/* Tags sports ajoutés */}
            {sportTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {sportTypes.map((sport) => (
                  <span
                    key={sport}
                    className="border-primary bg-primary/10 text-primary flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                  >
                    {sport}
                    <button
                      type="button"
                      onClick={() =>
                        setSportTypes(sportTypes.filter((s) => s !== sport))
                      }
                      className="hover:text-destructive ml-0.5 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Saisie libre */}
            <div className="flex gap-2">
              <Input
                placeholder="Ex : yoga, natation, vélo…"
                value={customSport}
                onChange={(e) => setCustomSport(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSport();
                  }
                }}
                className="text-sm"
              />
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="h/sem *"
                  type="number"
                  min={0}
                  max={40}
                  step={0.5}
                  value={customSportHours}
                  onChange={(e) => {
                    setCustomSportHours(e.target.value);
                    if (e.target.value) setSportHoursError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSport();
                    }
                  }}
                  className={`w-24 shrink-0 text-sm${sportHoursError ? "border-destructive" : ""}`}
                />
                {sportHoursError && (
                  <p className="text-destructive w-24 text-xs">Requis</p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomSport}
              >
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Allergènes & préférences */}
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Allergènes & préférences alimentaires
        </p>
        {/* Tags prédéfinis */}
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map(({ value, label }) => {
            const active = dietaryPrefs.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleTag(value, dietaryPrefs, setDietaryPrefs)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-input text-muted-foreground hover:border-primary/50"
                }`}
              >
                {active && <Check className="size-3" />}
                {label}
              </button>
            );
          })}
        </div>
        {/* Tags personnalisés (allergènes non listés) */}
        {dietaryPrefs.filter((d) => !DIETARY_OPTIONS.some((o) => o.value === d))
          .length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {dietaryPrefs
              .filter((d) => !DIETARY_OPTIONS.some((o) => o.value === d))
              .map((custom) => (
                <span
                  key={custom}
                  className="border-primary bg-primary/10 text-primary flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                >
                  {custom}
                  <button
                    type="button"
                    onClick={() =>
                      setDietaryPrefs(dietaryPrefs.filter((d) => d !== custom))
                    }
                    className="hover:text-destructive ml-0.5 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        )}
        {/* Saisie libre */}
        <div className="flex gap-2">
          <Input
            placeholder="Autre allergène (ex: céleri, moutarde…)"
            value={customAllergen}
            onChange={(e) => setCustomAllergen(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomAllergen();
              }
            }}
            className="text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomAllergen}
          >
            Ajouter
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
