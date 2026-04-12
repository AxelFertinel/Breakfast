import { getRequiredUser } from "@/lib/auth/auth-user";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountNavigation } from "./account-navigation";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your account settings.",
};

export default function Layout(props: LayoutProps<"/">) {
  return (
    <Suspense fallback={null}>
      <RouteLayout {...props} />
    </Suspense>
  );
}

async function RouteLayout(props: LayoutProps<"/">) {
  await getRequiredUser();

  return <AccountNavigation>{props.children}</AccountNavigation>;
}
