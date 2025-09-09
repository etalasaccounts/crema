"use client";

import { useState } from "react";
import { useCreateComment, useReplyToComment } from "@/hooks/use-comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Reply } from "lucide-react";
import { VideoComment } from "@/interfaces/videos";
import { formatDistanceToNow } from "date-fns";

interface CommentSectionProps {
  videoId: string;
  comments?: VideoComment[];
  isLoading?: boolean;
}

interface CommentItemProps {
  comment: VideoComment;
  videoId: string;
  onReply?: (commentId: string) => void;
}

function CommentItem({ comment, videoId, onReply }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const replyMutation = useReplyToComment(videoId);

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      await replyMutation.mutateAsync({
        commentId: comment.id,
        content: replyContent,
      });
      setReplyContent("");
      setShowReplyForm(false);
    } catch (error) {
      console.error("Failed to reply:", error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatarUrl || ""} />
          <AvatarFallback>
            {comment.user.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-sm">{comment.content}</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="ml-11 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleReply}
              disabled={!replyContent.trim() || replyMutation.isPending}
            >
              {replyMutation.isPending ? "Replying..." : "Reply"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={reply.user.avatarUrl || ""} />
                <AvatarFallback className="text-xs">
                  {reply.user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs">{reply.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(reply.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-xs">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  videoId,
  comments = [],
  isLoading = false,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const createCommentMutation = useCreateComment(videoId);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        content: newComment,
      });
      setNewComment("");
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="font-semibold">{comments?.length || 0} Comments</h3>
      </div>

      {/* New Comment Form */}
      <div className="space-y-3">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || createCommentMutation.isPending}
          >
            {createCommentMutation.isPending ? "Posting..." : "Comment"}
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Comments List */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  videoId={videoId}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
