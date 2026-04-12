import { getRequiredUser } from "@/lib/auth/auth-user";
import { getServerUrl } from "@/lib/server-url";
import { prisma } from "@/lib/prisma";
import { SiteConfig } from "@/site-config";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: `Bienvenue | ${SiteConfig.title}`,
  description: "Bienvenue ! Configurez votre profil pour personnaliser vos petits-déjeuners.",
};

export default function Page(props: PageProps<"/auth/new-user">) {
  return (
    <Suspense fallback={null}>
      <NewUserPage {...props} />
    </Suspense>
  );
}

async function NewUserPage(props: PageProps<"/auth/new-user">) {
  const searchParams = await props.searchParams;
  const callbackUrl =
    typeof searchParams.callbackUrl === "string"
      ? searchParams.callbackUrl
      : null;

  const user = await getRequiredUser();

  // Chercher l'org de l'utilisateur
  const member = await prisma.member.findFirst({
    where: { userId: user.id },
    select: { organization: { select: { slug: true } } },
  });

  // Si pas encore d'org, rediriger vers la création
  if (!member?.organization.slug) {
    redirect("/orgs/new");
    return null;
  }

  const orgSlug = member.organization.slug;

  // Vérifier si le profil a déjà été rempli
  const profile = await prisma.physicalProfile.findUnique({
    where: { userId: user.id },
    select: { weightKg: true, onboardingCompleted: true },
  });

  // Si profil incomplet → rediriger vers la page Famille pour compléter
  if (!profile?.onboardingCompleted && !profile?.weightKg) {
    redirect(`/orgs/${orgSlug}/famille`);
    return null;
  }

  // Profil existant → aller au callbackUrl ou au dashboard
  redirect(callbackUrl ?? `/orgs/${orgSlug}`);
  return null;
}
