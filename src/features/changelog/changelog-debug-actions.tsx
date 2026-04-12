"use client";

import { useDebugPanelAction } from "@/features/debug";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { resetDismissedChangelogsAction } from "./changelog.action";

export function ChangelogDebugActions() {
  const router = useRouter();

  const handleResetChangelog = useCallback(async () => {
    await resetDismissedChangelogsAction();
    router.refresh();
  }, [router]);

  useDebugPanelAction({
    id: "reset-changelog",
    label: "Reset Changelog",
    onClick: handleResetChangelog,
  });

  return null;
}
