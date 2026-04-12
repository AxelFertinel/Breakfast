import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { SiteConfig } from "@/site-config";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: `Bienvenue | ${SiteConfig.title}`,
  description: "Bienvenue ! Configurez votre profil pour personnaliser vos petits-déjeuners.",
};

/**
 * Page affichée après la première connexion.
 * Redirige vers l'onboarding si le profil physique n'est pas complété,
 * sinon redirige vers le dashboard.
 */
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
      : "/orgs";

  const user = await getRequiredUser();

  const physicalProfile = await prisma.physicalProfile.findUnique({
    where: { userId: user.id },
    select: { onboardingCompleted: true },
  });

  if (!physicalProfile || !physicalProfile.onboardingCompleted) {
    // Première connexion : rediriger vers l'onboarding
    const onboardingUrl = `/onboarding?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    redirect(onboardingUrl);
  }

  // Onboarding déjà complété : aller directement au dashboard
  redirect(callbackUrl);
}
