import type { ChatRequestOptions, Message } from "ai";
import { PreviewMessage, ThinkingMessage } from "./message";
import { useScrollToBottom } from "./use-scroll-to-bottom"; // Auto-scroll hook disabled
import { Overview } from "./overview";
import { MobileOverview } from "./mobile-overview";
import { memo } from "react";
import type { Vote } from "@/lib/db/schema";
import equal from "fast-deep-equal";
import { useWindowSize } from "usehooks-ts";
import { CustomSlider } from "@/components/CustomSlider";
import { DEFAULT_MODEL_NAME, models } from "@/lib/ai/models";

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  isBlockVisible: boolean;
  selectedModelId: string;
}

function PureMessages({
  chatId,
  isLoading,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  selectedModelId,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>(isLoading);

  const { width: windowWidth } = useWindowSize();
  const selectedModel = models.find((model) => model.id === selectedModelId) || models.find((model) => model.id === DEFAULT_MODEL_NAME);

  return (
    <CustomSlider>
      <div
        // Remove ref since we're not using auto-scroll anymore
        ref={messagesContainerRef}
        className="flex flex-col min-w-0 gap-6 flex-1 pt-4 max-w-[100vw] sm:max-w-full sm:pr-10"
      >
        {messages.length === 0 &&
          (windowWidth > 768 ? <div className="w-full pl-10"><Overview selectedModel={selectedModel} /></div>: <MobileOverview selectedModel={selectedModel} />)}

        {messages.map((message, index) => {
          return <PreviewMessage
            key={message.id}
            chatId={chatId}
            message={message}
            isLoading={isLoading && messages.length - 1 === index}
            vote={
              votes
                ? votes.find((vote) => vote.messageId === message.id)
                : undefined
            }
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
            selectedModelId={selectedModelId}
          />
        })}

        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && <ThinkingMessage />}

        {/* Remove the auto-scroll end marker */}
        <div

          ref={messagesEndRef}

          className="shrink-0 min-w-[24px] min-h-[24px]"

        />
      </div>
    </CustomSlider>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isBlockVisible && nextProps.isBlockVisible) return true;

  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.isLoading && nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});
