import { cacheLife } from "next/cache";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ServerMdx } from "@/features/markdown/server-mdx";
import { calculateReadingTime } from "@/features/posts/calculate-reading-time";
import type { PostParams } from "@/features/posts/post-manager";
import { getCurrentPost, getPosts } from "@/features/posts/post-manager";
import { formatDate } from "@/lib/format/date";
import { logger } from "@/lib/logger";
import { SiteConfig } from "@/site-config";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata(props: PostParams): Promise<Metadata> {
  "use cache";
  cacheLife("max");
  const params = await props.params;
  const post = await getCurrentPost(params.slug);

  if (!post) {
    notFound();
  }

  return {
    title: post.attributes.title,
    description: post.attributes.description,
    keywords: post.attributes.keywords,
    authors: {
      name: SiteConfig.team.name,
      url: SiteConfig.team.website,
    },
    openGraph: {
      title: post.attributes.title,
      description: post.attributes.description,
      url: `https://codeline.app/posts/${params.slug}`,
      type: "article",
    },
  };
}

export async function generateStaticParams() {
  const posts = await getPosts();

  if (posts.length === 0) {
    return [{ slug: "_placeholder" }];
  }

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function RoutePage(props: PostParams) {
  "use cache";
  cacheLife("max");
  const params = await props.params;
  const post = await getCurrentPost(params.slug);

  if (!post) {
    notFound();
  }

  if (
    post.attributes.status === "draft" &&
    process.env.VERCEL_ENV === "production"
  ) {
    logger.warn(`Post "${post.attributes.title}" is a draft`);
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);

  return (
    <article className="mx-auto max-w-2xl px-4 py-8">
      <Link
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "mb-6",
        })}
        href="/posts"
      >
        <ArrowLeft size={16} /> Back to Blog
      </Link>

      <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
        <Image
          src={post.attributes.coverUrl}
          alt={post.attributes.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <header className="mb-8 border-b pb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {post.attributes.status === "draft" && (
            <Badge variant="secondary">Draft</Badge>
          )}
          <Badge variant="outline" className="gap-1">
            <Calendar size={12} />
            {formatDate(post.attributes.date)}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock size={12} />
            {readingTime} min read
          </Badge>
        </div>

        <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {post.attributes.title}
        </h1>

        {post.attributes.description && (
          <p className="text-muted-foreground mt-4 text-lg">
            {post.attributes.description}
          </p>
        )}

        {post.attributes.tags && post.attributes.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.attributes.tags.map((tag) => (
              <Link key={tag} href={`/posts/categories/${tag}`}>
                <Badge variant="secondary" className="hover:bg-accent">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ServerMdx source={post.content} />
      </div>
    </article>
  );
}
