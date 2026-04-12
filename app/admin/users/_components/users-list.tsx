"use client";

import { AutomaticPagination } from "@/components/nowts/automatic-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { dayjs } from "@/lib/dayjs";
import { unwrapSafePromise } from "@/lib/promises";
import { useMutation } from "@tanstack/react-query";
import {
  Ban,
  CheckCircle2,
  Crown,
  MoreHorizontal,
  Search,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";
import type { UserWithStats } from "../_actions/admin-users";

type UsersListProps = {
  users: UserWithStats[];
  total: number;
  limit: number;
  currentPage: number;
};

export function UsersList({
  users,
  total,
  limit,
  currentPage,
}: UsersListProps) {
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: false, throttleMs: 1000 }),
  );

  const totalPages = Math.ceil(total / limit);

  const banUserMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      return unwrapSafePromise(
        authClient.admin.banUser({
          userId,
          banReason: "Admin initiated ban",
        }),
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("User has been banned");
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      return unwrapSafePromise(
        authClient.admin.unbanUser({
          userId,
        }),
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("User has been unbanned");
    },
  });

  const setRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "admin" | "user";
    }) => {
      return unwrapSafePromise(
        authClient.admin.setRole({
          userId,
          role,
        }),
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("User role has been updated");
    },
  });

  const impersonateUserMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      return unwrapSafePromise(
        authClient.admin.impersonateUser({
          userId,
        }),
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Now impersonating user");
      window.location.href = "/orgs";
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <InputGroup className="w-full">
            <InputGroupInput
              placeholder="Search users by email..."
              value={query}
              onChange={(e) => void setQuery(e.target.value)}
            />
            <InputGroupAddon align="inline-start">
              <Search
                aria-hidden="true"
                className="text-muted-foreground h-4 w-4"
              />
            </InputGroupAddon>
          </InputGroup>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar>
                        {user.image ? <AvatarImage src={user.image} /> : null}
                        <AvatarFallback>
                          {user.name.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {user.email}
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role ?? "user"}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="outline" className="gap-1.5">
                        <span
                          className="size-1.5 rounded-full bg-red-500"
                          aria-hidden="true"
                        />
                        Banned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1.5">
                        <span
                          className="size-1.5 rounded-full bg-emerald-500"
                          aria-hidden="true"
                        />
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{dayjs(user.createdAt).fromNow()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          aria-label="Open actions menu"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!user.banned && (
                          <DropdownMenuItem
                            onClick={async () => {
                              await impersonateUserMutation.mutateAsync({
                                userId: user.id,
                              });
                            }}
                          >
                            <UserCog className="mr-2 h-4 w-4" />
                            Impersonate
                          </DropdownMenuItem>
                        )}
                        {user.role !== "admin" && (
                          <DropdownMenuItem
                            onClick={async () => {
                              await setRoleMutation.mutateAsync({
                                userId: user.id,
                                role: "admin",
                              });
                            }}
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        {user.role === "admin" && (
                          <DropdownMenuItem
                            onClick={async () => {
                              await setRoleMutation.mutateAsync({
                                userId: user.id,
                                role: "user",
                              });
                            }}
                          >
                            <UserCog className="mr-2 h-4 w-4" />
                            Make Regular User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {user.banned ? (
                          <DropdownMenuItem
                            onClick={async () => {
                              await unbanUserMutation.mutateAsync({
                                userId: user.id,
                              });
                            }}
                            className="text-green-600"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Unban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={async () => {
                              await banUserMutation.mutateAsync({
                                userId: user.id,
                              });
                            }}
                            className="text-destructive"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Ban User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <AutomaticPagination
          currentPage={currentPage}
          totalPages={totalPages}
          searchParam={query}
          paramName="page"
        />
      )}
    </div>
  );
}
