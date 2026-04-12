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
import { dayjs } from "@/lib/dayjs";
import { getInitials } from "@/lib/utils/initials";
import { Eye, MoreHorizontal, Search, Users } from "lucide-react";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import type { OrganizationWithStats } from "../_actions/admin-organizations";

type OrganizationsListClientProps = {
  organizations: OrganizationWithStats[];
  total: number;
  limit: number;
  currentPage: number;
};

export function OrganizationsListClient({
  organizations,
  total,
  limit,
  currentPage,
}: OrganizationsListClientProps) {
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: false, throttleMs: 1000 }),
  );

  const totalPages = Math.ceil(total / limit);

  const getPlanBadgeVariant = (plan?: string | null) => {
    if (plan === null || plan === undefined || plan === "free")
      return "outline";
    return "default";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <InputGroup className="w-full">
            <InputGroupInput
              placeholder="Search organizations by name, slug, or email..."
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
                <TableHead>Organization</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <Link
                      href={`/admin/organizations/${org.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar>
                        {org.logo ? <AvatarImage src={org.logo} /> : null}
                        <AvatarFallback>
                          {getInitials(org.name || "O")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {org.email ?? org.slug}
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getPlanBadgeVariant(org.subscription?.plan)}
                    >
                      {org.subscription?.plan ?? "free"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Users className="text-muted-foreground h-4 w-4" />
                      <span className="text-sm">{org._count.members}</span>
                    </div>
                  </TableCell>
                  <TableCell>{dayjs(org.createdAt).fromNow()}</TableCell>
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
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/organizations/${org.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {organizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No organizations found.
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
