"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dialogManager } from "@/features/dialog-manager/dialog-manager";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import { Pencil, PlusCircle, Trash2, User, User2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FamilyMemberForm } from "./family-member-form";
import { deleteFamilyMemberAction } from "../famille.action";

type PhysicalProfile = {
  weightKg: number | null;
  heightCm: number | null;
  birthYear: number | null;
  gender: string | null;
  sportTypes: string[];
  activityLevel: string | null;
  dietaryPrefs: string[];
} | null;

type FamilyMember = {
  id: string;
  name: string;
  type: string;
  birthYear: number | null;
  weightKg: number | null;
  heightCm: number | null;
  sportTypes: string[];
  activityLevel: string | null;
  dietaryPrefs: string[];
};

type FamilyListProps = {
  physicalProfile: PhysicalProfile;
  familyMembers: FamilyMember[];
  adultLimit: number; // 0 = free (upsell), -1 = illimité, n = max
  childrenLimit: number; // 1 free, 4 famille, -1 illimité
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sédentaire",
  light: "Léger",
  moderate: "Modéré",
  active: "Actif",
  very_active: "Très actif",
};

const DIETARY_LABELS: Record<string, string> = {
  gluten: "Sans gluten",
  lactose: "Sans lactose",
  oeufs: "Sans œufs",
  noix: "Sans noix",
  arachides: "Sans arachides",
  soja: "Sans soja",
  poisson: "Sans poisson",
  crustaces: "Sans crustacés",
  vegan: "Vegan",
  vegetarien: "Végétarien",
  halal: "Halal",
  kosher: "Kosher",
};

export function FamilyList({ physicalProfile, familyMembers, adultLimit, childrenLimit }: FamilyListProps) {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;

  const adults = familyMembers.filter((m) => m.type === "adult");
  const children = familyMembers.filter((m) => m.type === "child");

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await resolveActionResult(deleteFamilyMemberAction({ id }));
    },
    onSuccess: () => {
      toast.success("Membre supprimé");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const openEditSelf = () => {
    dialogManager.custom({
      title: "Modifier mon profil",
      size: "lg",
      children: (
        <FamilyMemberForm
          type="adult"
          defaultValues={{
            weightKg: physicalProfile?.weightKg ?? undefined,
            heightCm: physicalProfile?.heightCm ?? undefined,
            birthYear: physicalProfile?.birthYear ?? undefined,
            gender: (physicalProfile?.gender as "male" | "female" | "other" | undefined) ?? undefined,
            sportTypes: physicalProfile?.sportTypes ?? [],
            activityLevel: physicalProfile?.activityLevel ?? undefined,
            dietaryPrefs: physicalProfile?.dietaryPrefs ?? [],
          }}
          onSuccess={() => { dialogManager.closeAll(); router.refresh(); }}
          onCancel={() => dialogManager.closeAll()}
        />
      ),
    });
  };

  const openAddAdult = () => {
    if (adultLimit === 0) {
      dialogManager.confirm({
        title: "Fonctionnalité Famille",
        description:
          "Ajoutez jusqu'à 2 adultes supplémentaires avec le plan Famille, ou des membres illimités avec Premium.",
        variant: "default",
        action: {
          label: "Voir les plans",
          onClick: async () => {
            window.location.href = `/orgs/${orgSlug}/settings/billing`;
          },
        },
      });
      return;
    }
    const isUnlimited = adultLimit === -1;
    if (!isUnlimited && adults.length >= adultLimit) {
      dialogManager.confirm({
        title: "Limite atteinte",
        description: `Votre plan inclut ${adultLimit} adulte(s) supplémentaire(s). Passez au plan supérieur pour en ajouter davantage.`,
        variant: "default",
        action: {
          label: "Voir les plans",
          onClick: async () => { window.location.href = `/orgs/${orgSlug}/settings/billing`; },
        },
      });
      return;
    }
    dialogManager.custom({
      title: "Ajouter un adulte",
      size: "lg",
      children: (
        <FamilyMemberForm
          type="adult-member"
          onSuccess={() => { dialogManager.closeAll(); router.refresh(); }}
          onCancel={() => dialogManager.closeAll()}
        />
      ),
    });
  };

  const openAddChild = () => {
    const isUnlimited = childrenLimit === -1;
    if (!isUnlimited && children.length >= childrenLimit) {
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
            window.location.href = `/orgs/${orgSlug}/settings/billing`;
          },
        },
      });
      return;
    }
    dialogManager.custom({
      title: "Ajouter un enfant",
      size: "lg",
      children: (
        <FamilyMemberForm
          type="child"
          onSuccess={() => { dialogManager.closeAll(); router.refresh(); }}
          onCancel={() => dialogManager.closeAll()}
        />
      ),
    });
  };

  const openEditMember = (member: FamilyMember) => {
    dialogManager.custom({
      title: `Modifier — ${member.name}`,
      size: "lg",
      children: (
        <FamilyMemberForm
          type={member.type === "adult" ? "adult-member" : "child"}
          memberId={member.id}
          defaultValues={{
            name: member.name,
            birthYear: member.birthYear ?? undefined,
            weightKg: member.weightKg ?? undefined,
            heightCm: member.heightCm ?? undefined,
            sportTypes: member.sportTypes,
            activityLevel: member.activityLevel ?? undefined,
            dietaryPrefs: member.dietaryPrefs,
          }}
          onSuccess={() => { dialogManager.closeAll(); router.refresh(); }}
          onCancel={() => dialogManager.closeAll()}
        />
      ),
    });
  };

  const confirmDelete = (member: FamilyMember) => {
    dialogManager.confirm({
      title: `Supprimer ${member.name} ?`,
      description: "Cette action est irréversible.",
      variant: "destructive",
      action: {
        label: "Supprimer",
        onClick: async () => deleteMutation.mutateAsync(member.id),
      },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ─── Profil principal ────────────────────────── */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-sm font-medium uppercase tracking-wide">
          Mon profil
        </h2>
        <MemberCard
          name="Moi"
          icon={<User className="text-primary size-5" />}
          iconBg="bg-primary/10"
          profile={physicalProfile}
          onEdit={openEditSelf}
        />
      </section>

      {/* ─── Adultes supplémentaires ─────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
            Adultes supplémentaires ({adults.length}
            {adultLimit !== -1 && adultLimit > 0 ? `/${adultLimit}` : ""})
          </h2>
          <Button variant="outline" size="sm" onClick={openAddAdult}>
            <PlusCircle className="size-4" />
            Ajouter un adulte
          </Button>
        </div>
        {adults.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-muted-foreground text-sm">
                {adultLimit === 0
                  ? "Disponible avec le plan Famille ou Premium."
                  : "Aucun adulte supplémentaire ajouté."}
              </p>
              {adultLimit === 0 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/orgs/${orgSlug}/settings/billing`}>
                    Voir les plans
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {adults.map((m) => (
              <MemberCard
                key={m.id}
                name={m.name}
                icon={<User2 className="size-5 text-violet-600" />}
                iconBg="bg-violet-100"
                profile={m}
                onEdit={() => openEditMember(m)}
                onDelete={() => confirmDelete(m)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── Enfants ─────────────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
            Enfants ({children.length})
          </h2>
          <Button variant="outline" size="sm" onClick={openAddChild}>
            <PlusCircle className="size-4" />
            Ajouter un enfant
          </Button>
        </div>
        {children.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-muted-foreground text-sm">Aucun enfant ajouté.</p>
              <Button variant="outline" size="sm" onClick={openAddChild}>
                <PlusCircle className="size-4" />
                Ajouter un enfant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {children.map((m) => (
              <MemberCard
                key={m.id}
                name={m.name}
                subtitle={m.birthYear ? `${new Date().getFullYear() - m.birthYear} ans` : undefined}
                icon={<User className="size-5 text-blue-600" />}
                iconBg="bg-blue-100"
                profile={m}
                onEdit={() => openEditMember(m)}
                onDelete={() => confirmDelete(m)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Composant carte membre ───────────────────────────────────────────────────

type MemberProfile = {
  weightKg?: number | null;
  heightCm?: number | null;
  birthYear?: number | null;
  activityLevel?: string | null;
  sportTypes?: string[];
  dietaryPrefs?: string[];
} | null;

function MemberCard({
  name,
  subtitle,
  icon,
  iconBg,
  profile,
  onEdit,
  onDelete,
}: {
  name: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  profile: MemberProfile;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-full ${iconBg}`}>
            {icon}
          </div>
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="size-4" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!profile ||
        (!profile.weightKg &&
          !profile.heightCm &&
          !profile.activityLevel &&
          (!profile.sportTypes || profile.sportTypes.length === 0) &&
          (!profile.dietaryPrefs || profile.dietaryPrefs.length === 0)) ? (
          <p className="text-muted-foreground text-sm">
            Aucune information renseignée.{" "}
            <button onClick={onEdit} className="text-primary underline-offset-2 hover:underline">
              Compléter le profil
            </button>
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Stats physiques */}
            <div className="flex flex-wrap gap-2">
              {profile.weightKg && (
                <Tag label="Poids" value={`${profile.weightKg} kg`} />
              )}
              {profile.heightCm && (
                <Tag label="Taille" value={`${profile.heightCm} cm`} />
              )}
              {profile.activityLevel && (
                <Tag
                  label="Activité"
                  value={ACTIVITY_LABELS[profile.activityLevel] ?? profile.activityLevel}
                />
              )}
            </div>
            {/* Sports */}
            {profile.sportTypes && profile.sportTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.sportTypes.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            {/* Allergènes */}
            {profile.dietaryPrefs && profile.dietaryPrefs.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.dietaryPrefs.map((d) => (
                  <span
                    key={d}
                    className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700"
                  >
                    {DIETARY_LABELS[d] ?? d}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Tag({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-md px-3 py-1.5">
      <span className="text-muted-foreground text-xs">{label} : </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
