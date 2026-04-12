import { formatDate } from "@/lib/format/date";
import Image from "next/image";
import Link from "next/link";
import { calculateReadingTime } from "./calculate-reading-time";
import type { Post } from "./post-manager";

type PostCardProps = {
  post: Post;
};

export const PostCard = async ({ post }: PostCardProps) => {
  const readingTime = calculateReadingTime(post.content);

  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <article className="flex gap-4 py-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={post.attributes.coverUrl}
            alt={post.attributes.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <h3 className="group-hover:text-primary leading-snug font-medium transition-colors">
            {post.attributes.title}
          </h3>
          <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
            {post.attributes.description}
          </p>
          <div className="text-muted-foreground mt-auto flex items-center gap-3 text-xs">
            <time>{formatDate(post.attributes.date)}</time>
            <span>{readingTime} min</span>
          </div>
        </div>
      </article>
    </Link>
  );
};
