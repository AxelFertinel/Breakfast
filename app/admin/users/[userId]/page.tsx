import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import {
  Layout,
  LayoutActions,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredAdmin } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, Suspense } from "react";
import { UserDetailsCard } from "../../_components/user-details-card";
import { UserActions } from "./_components/user-actions";
import { UserProviders } from "./_components/user-providers";
import { UserSessions } from "./_components/user-sessions";

export default async function Page(props: PageProps<"/admin/users/[userId]">) {
  return (
    <Suspense fallback={null}>
      <RoutePage {...props} />
    </Suspense>
  );
}

async function RoutePage(props: PageProps<"/admin/users/[userId]">) {
  const params = await props.params;
  await getRequiredAdmin();

  const userData = await prisma.user.findUnique({
    where: {
      id: params.userId,
    },
    include: {
      members: {
        include: {
          organization: {
            include: {
              subscription: true,
            },
          },
        },
      },
      accounts: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!userData) {
    notFound();
  }

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>User Details</LayoutTitle>
        <LayoutDescription>
          View and manage user information and organization memberships
        </LayoutDescription>
      </LayoutHeader>
      <LayoutActions>
        <UserActions user={userData} />
      </LayoutActions>

      <LayoutContent className="flex flex-col gap-4">
        <UserDetailsCard user={userData} />
        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            {userData.members.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center">
                No organizations found
              </div>
            ) : (
              <ItemGroup className="rounded-md border">
                {userData.members.map((memberRole, index) => (
                  <Fragment key={memberRole.id}>
                    <Item asChild>
                      <Link
                        href={`/admin/organizations/${memberRole.organization.id}`}
                      >
                        <ItemMedia>
                          <Avatar className="size-10">
                            <AvatarImage
                              src={memberRole.organization.logo ?? undefined}
                              alt={memberRole.organization.name}
                            />
                            <AvatarFallback className="text-sm">
                              {memberRole.organization.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle className="gap-2">
                            {memberRole.organization.name}
                            <Badge variant="outline" className="text-xs">
                              {memberRole.role}
                            </Badge>
                            {memberRole.organization.subscription && (
                              <Badge
                                variant={
                                  memberRole.organization.subscription
                                    .status === "active"
                                    ? "default"
                                    : memberRole.organization.subscription
                                          .status === "canceled"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className="text-xs"
                              >
                                {memberRole.organization.subscription.plan}
                              </Badge>
                            )}
                          </ItemTitle>
                          <ItemDescription>
                            {memberRole.organization.email}
                          </ItemDescription>
                        </ItemContent>
                      </Link>
                    </Item>
                    {index !== userData.members.length - 1 && <ItemSeparator />}
                  </Fragment>
                ))}
              </ItemGroup>
            )}
          </CardContent>
        </Card>

        <UserSessions userId={userData.id} />
        <UserProviders accounts={userData.accounts} />
      </LayoutContent>
    </Layout>
  );
}
