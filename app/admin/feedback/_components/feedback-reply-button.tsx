"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { replyFeedbackAction } from "../_actions/reply-feedback.action";

type FeedbackReplyButtonProps = {
  feedbackId: string;
  recipientName: string;
};

export function FeedbackReplyButton({
  feedbackId,
  recipientName,
}: FeedbackReplyButtonProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      await resolveActionResult(
        replyFeedbackAction({
          feedbackId,
          message,
        }),
      );
      toast.success("Reply sent successfully");
      setOpen(false);
      setMessage("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send reply",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Mail className="size-4" />
          Reply by Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reply to Feedback</DialogTitle>
          <DialogDescription>
            Send an email response to {recipientName}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Write your response..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !message.trim()}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            Send Reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
