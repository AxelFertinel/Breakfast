import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { SiteConfig } from "@/site-config";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: `Bienvenue | ${SiteConfig.title}`,
  description:
    "Bienvenue ! Configurez votre profil pour personnaliser vos petits-déjeuners.",
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

  const member = await prisma.member.findFirst({
    where: { userId: user.id },
    select: { organization: { select: { slug: true } } },
  });

  if (!member?.organization.slug) {
    redirect("/orgs/new");
    return null;
  }

  redirect(callbackUrl ?? `/orgs/${member.organization.slug}`);
  return null;
}
