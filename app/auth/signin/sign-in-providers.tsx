"use client";

import { Divider } from "@/components/nowts/divider";
import { Typography } from "@/components/nowts/typography";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProviderButton } from "./provider-button";
import { SignInCredentialsAndEmailOTP } from "./sign-in-credentials-and-email-otp";

export const SignInProviders = ({
  providers,
  callbackUrl,
}: {
  providers: string[];
  callbackUrl?: string;
}) => {
  const searchParams = useSearchParams();
  const callbackUrlParams = searchParams.get("callbackUrl");

  callbackUrl ??= callbackUrlParams as string;

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <SignInCredentialsAndEmailOTP callbackUrl={callbackUrl} />
      {providers.length > 0 && <Divider>or</Divider>}

      <div
        className={cn("grid gap-2 lg:gap-4", {
          "grid-cols-1": providers.length === 1,
          "grid-cols-1 lg:grid-cols-2": providers.length > 1,
        })}
      >
        {providers.includes("github") && (
          <ProviderButton providerId="github" callbackUrl={callbackUrl} />
        )}
        {providers.includes("google") && (
          <ProviderButton providerId="google" callbackUrl={callbackUrl} />
        )}
      </div>

      <Typography variant="muted" className="text-xs">
        You don't have an account?{" "}
        <Typography
          variant="link"
          as={Link}
          href={`/auth/signup?callbackUrl=${callbackUrl}`}
        >
          Sign up
        </Typography>
      </Typography>
    </div>
  );
};
