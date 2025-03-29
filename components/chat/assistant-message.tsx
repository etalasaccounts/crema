import { Message } from "@/interfaces/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { xonokai } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";
import { Copy } from "lucide-react";
import { getModelById, getProviderById } from "@/lib/constants/llm-providers";

interface AssistantMessageProps {
  message: Message;
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  console.log("Message:", message);
  console.log("ModelId:", message.modelId);

  const model = message.modelId ? getModelById(message.modelId) : null;
  console.log("Model:", model);

  const provider = model ? getProviderById(model.providerId) : null;
  console.log("Provider:", provider);

  return (
    <div className="flex w-full gap-4 ">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={provider?.avatarUrl || "/bot-avatar.png"}
          alt={provider?.name || "AI Assistant"}
        />
        <AvatarFallback>{provider?.name?.[0] || "AI"}</AvatarFallback>
      </Avatar>
      <div id="assistant-message-block" className="flex-1 space-y-2">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <div className="w-full flex flex-col">
                    <div className="flex justify-between items-center bg-neutral-800 px-3 py-2 rounded-t-md">
                      <p className="text-xs text-neutral-300 font-light">
                        {match[1]}
                      </p>
                      <button className="flex items-center">
                        <Copy className="h-3 w-3 mr-1.5" color="#d4d4d4" />
                        <p className="text-xs text-neutral-300 font-mono">
                          Copy
                        </p>
                      </button>
                    </div>
                    <div
                      className="flex overflow-x-auto pb-3"
                      style={{ maxWidth: "100%" }}
                    >
                      <SyntaxHighlighter
                        {...props}
                        style={xonokai}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          backgroundColor: "#171717",
                          border: "none",
                          borderRadius: "0 0 0.375rem 0.375rem",
                          overflowX: "auto",
                        }}
                        codeTagProps={{
                          style: { fontSize: "13px" },
                        }}
                        className="w-full mb-4"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                ) : (
                  <code
                    {...props}
                    className="px-1 py-0.5 bg-neutral-100 rounded font-mono text-[13px]"
                  >
                    {children}
                  </code>
                );
              },
              // Enhanced styling for other markdown elements
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mb-4 text-[15px]">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold mb-3 text-[15px]">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-bold mb-2 text-[15px]">
                  {children}
                </h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 text-[15px]">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 text-[15px]">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="mb-1 text-[15px]">{children}</li>
              ),
              p: ({ children }) => (
                <p className="mb-4 last:mb-0 text-[15px]">{children}</p>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/50 pl-4 italic my-4">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full divide-y divide-border">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="px-4 py-2 bg-muted font-medium">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2 border-t border-border">{children}</td>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
