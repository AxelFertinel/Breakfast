import { cacheLife } from "next/cache";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  type ChangelogParams,
  getChangelogs,
  getCurrentChangelog,
} from "@/features/changelog/changelog-manager";
import { ServerMdx } from "@/features/markdown/server-mdx";
import { formatDate } from "@/lib/format/date";
import { SiteConfig } from "@/site-config";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata(
  props: ChangelogParams,
): Promise<Metadata> {
  "use cache";
  cacheLife("max");
  const params = await props.params;
  const changelog = await getCurrentChangelog(params.slug);

  if (!changelog) {
    notFound();
  }

  const title =
    changelog.attributes.title ?? formatDate(changelog.attributes.date);

  return {
    title: `${title} - Changelog - ${SiteConfig.title}`,
    description: `Release notes for ${title}`,
    openGraph: {
      title: `${title} - Changelog`,
      description: `Release notes for ${title}`,
      url: `${SiteConfig.prodUrl}/changelog/${params.slug}`,
      type: "article",
      images: changelog.attributes.image
        ? [{ url: changelog.attributes.image }]
        : undefined,
    },
  };
}

export async function generateStaticParams() {
  const changelogs = await getChangelogs();

  if (changelogs.length === 0) {
    return [{ slug: "_placeholder" }];
  }

  return changelogs.map((changelog) => ({
    slug: changelog.slug,
  }));
}

export default async function ChangelogDetailPage(props: ChangelogParams) {
  "use cache";
  cacheLife("max");
  const params = await props.params;
  const changelog = await getCurrentChangelog(params.slug);

  if (!changelog) {
    notFound();
  }

  const { attributes, content } = changelog;
  const title = attributes.title ?? formatDate(attributes.date);

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <Link
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "mb-6",
        })}
        href="/changelog"
      >
        <ArrowLeft size={16} /> Back to Changelog
      </Link>

      {attributes.image && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={attributes.image}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <header className="mb-8 border-b pb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {attributes.version && (
            <Badge variant="default" className="gap-1">
              <Tag size={12} />v{attributes.version}
            </Badge>
          )}
          <Badge variant="outline" className="gap-1">
            <Calendar size={12} />
            {formatDate(attributes.date)}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {title}
        </h1>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ServerMdx source={content} />
      </div>
    </article>
  );
}
