"use client";

import { useSession } from "@/lib/auth-client";
import { LoggedInButton, SignInButton } from "./sign-in-button";

export const AuthButtonClient = ({
  variant = "compact",
}: {
  variant?: "compact" | "full";
}) => {
  const session = useSession();

  if (session.data?.user) {
    const user = session.data.user;
    return <LoggedInButton user={user} variant={variant} />;
  }

  return <SignInButton />;
};
