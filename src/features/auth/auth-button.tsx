import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/lib/auth/auth-user";
import { Suspense } from "react";
import { LoggedInButton, SignInButton } from "./sign-in-button";

export const AuthButton = async () => {
  return (
    <Suspense fallback={<Skeleton className="h-9" />}>
      <AuthButtonSuspended />
    </Suspense>
  );
};

const AuthButtonSuspended = async () => {
  const user = await getUser();

  if (user) {
    return <LoggedInButton user={user} />;
  }

  return <SignInButton />;
};
