import { cacheLife } from "next/cache";
import { Typography } from "@/components/nowts/typography";
import { getChangelogs } from "@/features/changelog/changelog-manager";
import { ChangelogTimeline } from "@/features/changelog/changelog-timeline";
import { SiteConfig } from "@/site-config";
import { FileQuestion } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Changelog - ${SiteConfig.title}`,
  description:
    "Stay up to date with the latest features, improvements, and bug fixes.",
  openGraph: {
    title: `Changelog - ${SiteConfig.title}`,
    description:
      "Stay up to date with the latest features, improvements, and bug fixes.",
    url: `${SiteConfig.prodUrl}/changelog`,
    type: "website",
  },
};

export default async function ChangelogPage() {
  "use cache";
  cacheLife("max");
  const changelogs = await getChangelogs();

  if (changelogs.length === 0) {
    return (
      <div className="px-6 py-16">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Changelog
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Stay up to date with the latest features and improvements.
          </p>
        </header>

        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-xl border-2 border-dashed p-12">
          <FileQuestion className="text-muted-foreground mb-4 size-16" />
          <Typography variant="h3">No changelog entries yet</Typography>
          <Typography variant="muted" className="mt-2">
            Check back soon for updates.
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-16">
      <header className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Changelog
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Stay up to date with the latest features, improvements, and bug fixes.
        </p>
      </header>

      <ChangelogTimeline
        changelogs={changelogs}
        className="mx-auto max-w-2xl"
      />
    </div>
  );
}
