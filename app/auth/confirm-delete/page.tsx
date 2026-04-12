import { SiteConfig } from "@/site-config";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmDeletePage } from "./confirm-delete-page";

export const metadata: Metadata = {
  title: `Confirm Account Deletion | ${SiteConfig.title}`,
  description:
    "Confirm that you want to permanently delete your account and all associated data.",
};

export default function Page(props: PageProps<"/auth/confirm-delete">) {
  return (
    <Suspense fallback={null}>
      <ConfirmDelete {...props} />
    </Suspense>
  );
}

async function ConfirmDelete(props: PageProps<"/auth/confirm-delete">) {
  const searchParams = await props.searchParams;
  const token = searchParams.token as string | undefined;
  const callbackUrl = searchParams.callbackUrl as string | undefined;

  return <ConfirmDeletePage token={token} callbackUrl={callbackUrl} />;
}
