import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth, SocialProviders } from "@/lib/auth";
import { getUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignInProviders } from "../../../auth/signin/sign-in-providers";

export default async function RoutePage(
  props: PageProps<"/orgs/accept-invitation/[id]">,
) {
  const params = await props.params;
  const user = await getUser();

  const invitation = await prisma.invitation.findUnique({
    where: {
      id: params.id,
    },
    include: {
      organization: {
        select: {
          name: true,
          slug: true,
          logo: true,
        },
      },
    },
  });

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="mx-auto w-full max-w-md lg:max-w-lg lg:p-6">
          <CardHeader className="text-center">
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>
              This invitation may have expired or been revoked.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-md lg:max-w-lg lg:p-6">
        <CardHeader>
          <div className="flex justify-center">
            <Avatar className="size-16">
              {invitation.organization.logo ? (
                <AvatarImage
                  src={invitation.organization.logo}
                  alt={invitation.organization.name}
                />
              ) : null}
              <AvatarFallback className="text-xl font-medium">
                {invitation.organization.name.substring(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-center">
            Join {invitation.organization.name}
          </CardTitle>
          <CardDescription className="text-center">
            You&apos;ve been invited to collaborate in this organization
          </CardDescription>
        </CardHeader>
        {user ? (
          <CardFooter className="flex flex-col gap-4 border-t pt-6">
            <p className="text-muted-foreground text-center text-sm">
              Signed in as <span className="font-medium">{user.email}</span>
            </p>
            <form className="w-full">
              <Button
                className="w-full"
                formAction={async () => {
                  "use server";

                  await auth.api.acceptInvitation({
                    body: {
                      invitationId: params.id,
                    },
                    headers: await headers(),
                  });

                  redirect(`/orgs/${invitation.organization.slug}`);
                }}
              >
                Accept Invitation
              </Button>
            </form>
          </CardFooter>
        ) : (
          <CardContent className="border-t pt-6">
            <p className="text-muted-foreground mb-4 text-center text-sm">
              Sign in to accept this invitation
            </p>
            <SignInProviders
              callbackUrl={`/orgs/accept-invitation/${params.id}`}
              providers={Object.keys(SocialProviders ?? {})}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
