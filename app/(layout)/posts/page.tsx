import { cacheLife } from "next/cache";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Layout, LayoutContent } from "@/features/page/layout";
import { PostCard } from "@/features/posts/post-card";
import { calculateReadingTime } from "@/features/posts/calculate-reading-time";
import { getPosts, getPostsTags } from "@/features/posts/post-manager";
import { formatDate } from "@/lib/format/date";
import { SiteConfig } from "@/site-config";
import { ArrowRight, Calendar, Clock, FileQuestion } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: `${SiteConfig.title}'s Blog`,
  description: SiteConfig.description,
  keywords: ["posts"],
  openGraph: {
    title: `${SiteConfig.title}'s Blog`,
    description: SiteConfig.description,
    url: SiteConfig.prodUrl,
    type: "website",
  },
};

export default async function RoutePage() {
  "use cache";
  cacheLife("max");
  const tags = await getPostsTags();
  const posts = await getPosts();

  if (posts.length === 0) {
    return (
      <Layout>
        <LayoutContent className="flex flex-col items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-8">
            <FileQuestion className="text-muted-foreground size-12" />
            <h2 className="text-xl font-semibold">No posts found</h2>
            <Link className={buttonVariants({ variant: "link" })} href="/posts">
              View all posts
            </Link>
          </div>
        </LayoutContent>
      </Layout>
    );
  }

  const [featuredPost, ...otherPosts] = posts;
  const featuredReadingTime = calculateReadingTime(featuredPost.content);

  return (
    <Layout>
      {/* Hero Header */}
      <LayoutContent className="py-12 text-center lg:py-16">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Blog
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
          Insights, tutorials, and updates from our team. Learn about web
          development, best practices, and the latest tech trends.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {tags.map((tag) => (
            <Link key={tag} href={{ pathname: `/posts/categories/${tag}` }}>
              <Badge
                variant="outline"
                className="hover:bg-accent cursor-pointer"
              >
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      </LayoutContent>

      {/* Featured Post */}
      <LayoutContent>
        <Link href={`/posts/${featuredPost.slug}`} className="group block">
          <article className="bg-card overflow-hidden rounded-2xl border">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:min-h-[400px]">
                <Image
                  src={featuredPost.attributes.coverUrl}
                  alt={featuredPost.attributes.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r" />
                <div className="absolute bottom-4 left-4 lg:hidden">
                  <Badge className="bg-primary">Latest</Badge>
                </div>
              </div>
              <div className="flex flex-col justify-center p-6 lg:p-10">
                <div className="mb-4 hidden lg:block">
                  <Badge className="bg-primary">Latest Post</Badge>
                </div>
                <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    {formatDate(featuredPost.attributes.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {featuredReadingTime} min read
                  </span>
                </div>
                <h2 className="group-hover:text-primary mb-3 text-2xl font-bold tracking-tight transition-colors lg:text-3xl">
                  {featuredPost.attributes.title}
                </h2>
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  {featuredPost.attributes.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {featuredPost.attributes.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-primary flex items-center gap-2 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                    Read article <ArrowRight className="size-4" />
                  </span>
                </div>
              </div>
            </div>
          </article>
        </Link>
      </LayoutContent>

      {/* Other Posts */}
      {otherPosts.length > 0 && (
        <LayoutContent className="mt-16 pb-16">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">
            More Articles
          </h2>
          <div className="flex flex-col divide-y">
            {otherPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </LayoutContent>
      )}
    </Layout>
  );
}
