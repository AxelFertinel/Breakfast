"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { cn } from "@/lib/utils";
import { Check, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useState } from "react";
import { toast } from "sonner";
import { updateOrganizationNameAction } from "../_actions/organization-admin.actions";

type OrganizationTitleFormProps = {
  organizationId: string;
  name: string;
  logo: string | null;
};

export const OrganizationTitleForm = ({
  organizationId,
  name: initialName,
  logo,
}: OrganizationTitleFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(initialName);

  const [optimisticName, updateOptimisticName] = useOptimistic(
    initialName,
    (_state, newName: string) => newName,
  );

  const handleSave = async () => {
    if (editedName.trim() === "") {
      return;
    }

    updateOptimisticName(editedName);
    setIsEditing(false);

    try {
      await resolveActionResult(
        updateOrganizationNameAction({
          organizationId,
          name: editedName,
        }),
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
      setEditedName(initialName);
    }
  };

  const handleCancel = () => {
    setEditedName(optimisticName);
    setIsEditing(false);
  };

  const titleStyles = "text-3xl font-bold rounded-md px-2 py-1";

  if (isEditing) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarImage src={logo ?? undefined} alt={optimisticName} />
          <AvatarFallback>
            {optimisticName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          style={
            {
              fieldSizing: "content",
            } as React.CSSProperties
          }
          className={cn(titleStyles, "rounded-md bg-transparent outline")}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void handleSave();
            }
            if (e.key === "Escape") {
              handleCancel();
            }
          }}
        />
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => void handleSave()}>
            <Check className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleCancel}>
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-3">
      <Avatar className="size-12">
        <AvatarImage src={logo ?? undefined} alt={optimisticName} />
        <AvatarFallback>
          {optimisticName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <h1
        className={cn(titleStyles, "cursor-pointer")}
        onDoubleClick={() => setIsEditing(true)}
      >
        {optimisticName}
      </h1>
      <Button
        size="icon"
        variant="ghost"
        className="opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="size-4" />
      </Button>
    </div>
  );
};
