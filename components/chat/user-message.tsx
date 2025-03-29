import { Message } from "@/interfaces/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <>
      <div className="flex gap-4 w-full">
        {" "}
        <Avatar className="h-8 w-8">
          <AvatarImage src="/user-avatar.png" alt="user" />
          <AvatarFallback>Y</AvatarFallback>
        </Avatar>{" "}
        <div className="prose prose-sm dark:prose-invert max-w-none w-fit space-y-2 px-3 py-1 bg-muted rounded-md">
          <p className="text-[15px] whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </>
  );
}
