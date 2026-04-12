import { ChangelogDialog } from "@/features/changelog/changelog-dialog";
import {
  type ChangelogParams,
  getCurrentChangelog,
} from "@/features/changelog/changelog-manager";
import { logger } from "@/lib/logger";
import { notFound } from "next/navigation";

export default async function ChangelogModalPage(props: ChangelogParams) {
  const params = await props.params;
  const changelog = await getCurrentChangelog(params.slug);

  if (!changelog) {
    notFound();
  }

  logger.debug(`Open Changelog for id ${params.slug}`);

  return <ChangelogDialog changelog={changelog} />;
}
