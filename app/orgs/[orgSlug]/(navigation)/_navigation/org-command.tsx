"use client";

import { CmdOrOption } from "@/components/nowts/keyboard-shortcut";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Skeleton } from "@/components/ui/skeleton";
import { upfetch } from "@/lib/up-fetch";
import { cn } from "@/lib/utils";
import type { CommandSearchResult } from "@/types/command";
import { useQuery } from "@tanstack/react-query";
import { CornerDownLeft, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { COMMAND_ICONS } from "./command-icons";
import { ORGANIZATION_LINKS } from "./org-navigation.links";

function OrgCommandItem({
  children,
  className,
  ...props
}: ComponentProps<typeof CommandItem>) {
  return (
    <CommandItem
      className={cn(
        "data-[selected=true]:border-input data-[selected=true]:bg-input/50 h-9 rounded-md border border-transparent !px-3 font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </CommandItem>
  );
}

export function OrgCommand() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const params = useParams();
  const router = useRouter();
  const orgSlug = typeof params.orgSlug === "string" ? params.orgSlug : "";

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["command-search", debouncedSearch, orgSlug],
    queryFn: async () => {
      if (!debouncedSearch) return [];
      return upfetch<CommandSearchResult[]>(
        `/api/orgs/${orgSlug}/command?q=${encodeURIComponent(debouncedSearch)}`,
      );
    },
    enabled: Boolean(debouncedSearch),
  });

  const down = () => {
    setOpen((open) => !open);
  };

  useHotkeys("mod+k", down);

  return (
    <>
      <InputGroup className="w-full">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Search..."
          onClick={() => {
            setOpen(true);
          }}
        />
        <InputGroupAddon align="inline-end">
          <KbdGroup>
            <Kbd>
              <CmdOrOption />
            </Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </InputGroupAddon>
      </InputGroup>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Search documentation...</DialogTitle>
            <DialogDescription>
              Search for a command to run...
            </DialogDescription>
          </DialogHeader>
          <Command
            shouldFilter={false}
            className="**:data-[slot=command-input-wrapper]:bg-input/50 **:data-[slot=command-input-wrapper]:border-input rounded-none bg-transparent **:data-[slot=command-input]:!h-9 **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:!h-9 **:data-[slot=command-input-wrapper]:rounded-md **:data-[slot=command-input-wrapper]:border"
          >
            <CommandInput
              placeholder="Search for anything..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5">
              {isLoading ? (
                <CommandGroup className="!p-0 [&_[cmdk-group-heading]]:scroll-mt-16 [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1">
                  {[40, 32, 36, 44, 28].map((width, index) => (
                    <div
                      key={index}
                      className="flex h-9 items-center gap-2 rounded-md border border-transparent px-3"
                    >
                      <Skeleton className="size-4 rounded" />
                      <Skeleton
                        className="h-4"
                        style={{ width: `${width * 4}px` }}
                      />
                    </div>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty className="text-muted-foreground py-12 text-center text-sm">
                  No results found.
                </CommandEmpty>
              )}

              {!isLoading && !debouncedSearch && (
                <>
                  {ORGANIZATION_LINKS.map((link, index) => (
                    <CommandGroup
                      heading={link.title}
                      key={index}
                      className="!p-0 [&_[cmdk-group-heading]]:scroll-mt-16 [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1"
                    >
                      {link.links.map((link) => (
                        <OrgCommandItem
                          key={link.href}
                          onSelect={() => {
                            router.push(
                              link.href.replace(":organizationSlug", orgSlug),
                            );
                            setOpen(false);
                          }}
                        >
                          <link.Icon className="size-4" />
                          <span>{link.label}</span>
                        </OrgCommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </>
              )}

              {!isLoading && searchResults && searchResults.length > 0 && (
                <CommandGroup
                  heading="Search Results"
                  className="!p-0 [&_[cmdk-group-heading]]:scroll-mt-16 [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1"
                >
                  {searchResults.map((result) => {
                    const Icon = COMMAND_ICONS[result.icon];
                    return (
                      <OrgCommandItem
                        key={result.url}
                        onSelect={() => {
                          router.push(result.url);
                          setOpen(false);
                          setSearch("");
                        }}
                      >
                        <Icon className="size-4" />
                        <span>{result.label}</span>
                      </OrgCommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
          <div className="text-muted-foreground absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t border-t-neutral-100 bg-neutral-50 px-4 text-xs font-medium dark:border-t-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center gap-2">
              <Kbd>
                <CornerDownLeft className="size-3" />
              </Kbd>
              Go to Page
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
