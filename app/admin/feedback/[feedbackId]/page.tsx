import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { InlineTooltip } from "@/components/ui/tooltip";
import {
  Layout,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredAdmin } from "@/lib/auth/auth-user";
import { getInitials } from "@/lib/utils/initials";
import { getFeedbackById } from "@/query/feedback/get-feedback";
import { Angry, ChevronRight, Frown, Meh, SmilePlus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FeedbackReplyButton } from "../_components/feedback-reply-button";

const ReviewIcons = [
  {
    value: 1,
    icon: Angry,
    tooltip: "Extremely Dissatisfied",
  },
  {
    value: 2,
    icon: Frown,
    tooltip: "Somewhat Dissatisfied",
  },
  {
    value: 3,
    icon: Meh,
    tooltip: "Neutral",
  },
  {
    value: 4,
    icon: SmilePlus,
    tooltip: "Satisfied",
  },
];

export default function Page(props: {
  params: Promise<{ feedbackId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <FeedbackDetailPage {...props} />
    </Suspense>
  );
}

async function FeedbackDetailPage(props: {
  params: Promise<{ feedbackId: string }>;
}) {
  const params = await props.params;
  await getRequiredAdmin();

  const feedback = await getFeedbackById(params.feedbackId);

  if (!feedback) {
    notFound();
  }

  const reviewIcon = ReviewIcons.find((icon) => icon.value === feedback.review);
  const displayName = feedback.user?.name ?? "Anonymous";
  const displayEmail = feedback.user?.email ?? feedback.email ?? "No email";

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Feedback</LayoutTitle>
        <LayoutDescription>
          Submitted {new Date(feedback.createdAt).toLocaleDateString()}
        </LayoutDescription>
      </LayoutHeader>

      <LayoutContent className="space-y-6">
        {feedback.user ? (
          <Item variant="outline" asChild>
            <Link
              href={`/admin/users/${feedback.user.id}`}
              className="cursor-pointer"
            >
              <ItemMedia>
                <Avatar className="size-10">
                  <AvatarImage
                    src={feedback.user.image ?? undefined}
                    alt={displayName}
                  />
                  <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {displayName}
                  <Badge variant="outline" className="text-xs">
                    {feedback.user.role ?? "user"}
                  </Badge>
                </ItemTitle>
                <ItemDescription>{displayEmail}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="text-muted-foreground size-5" />
              </ItemActions>
            </Link>
          </Item>
        ) : (
          <Item variant="outline">
            <ItemMedia>
              <Avatar className="size-10">
                <AvatarFallback>{displayEmail[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Anonymous</ItemTitle>
              <ItemDescription>{displayEmail}</ItemDescription>
            </ItemContent>
          </Item>
        )}

        <Item variant="outline">
          <ItemMedia>
            {reviewIcon && (
              <InlineTooltip title={reviewIcon.tooltip}>
                <reviewIcon.icon size={24} className="text-primary" />
              </InlineTooltip>
            )}
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{reviewIcon?.tooltip ?? "No rating"}</ItemTitle>
            <ItemDescription className="whitespace-pre-wrap">
              {feedback.message}
            </ItemDescription>
          </ItemContent>
        </Item>

        <FeedbackReplyButton
          feedbackId={feedback.id}
          recipientName={displayName}
        />
      </LayoutContent>
    </Layout>
  );
}
