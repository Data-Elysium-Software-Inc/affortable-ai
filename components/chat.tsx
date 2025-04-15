// components/chat.tsx

"use client";

import type { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import type { User } from "next-auth";
import { ChatHeader } from "@/components/chat-header";
import type { Vote } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";

import { Block } from "./block";
import { MultimodalInput } from "./multimodal-input";
import { Messages } from "./messages";
import type { VisibilityType } from "./visibility-selector";
import { useBlockSelector } from "@/hooks/use-block";
import BkashPayment from '@/components/bkash-payment';
import AboutUsPopup from '@/components/about-us';

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  user,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  user: User | undefined;
}) {
  const { mutate } = useSWRConfig();
  

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: { id, modelId: selectedModelId },
    initialMessages,
    experimental_throttle: 100,
    onFinish: () => {
      mutate("/api/history");
    },
    onError: (err: unknown) => {
      // Debugging: Log the entire error object
      console.log("onError callback triggered. Error object:", err);

      if (err instanceof Error) {
        // Check if the error message includes 'limit_exceeded' or '403'
        if (
          err.message.includes("limit_exceeded") ||
          err.message.includes("403")
        ) {
          // Add a new 'assistant' message indicating the limit has been exceeded
          setMessages((prev) => [
            ...prev,
            {
              id: "limit-exceeded",
              role: "assistant",
              content:
                "Your balance is too over.\n Please recharge to continue using the service.",
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: "other problem",
              role: "assistant",
              content:
                "The servers are busy now, due to too many requests. Please try again later or choose another Model",
            },
          ]);
        }
      } else {
      }
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  const [isPopUpOpen,setIsPopUpOpen] = useState(false);

  const openPopUp = () =>{
    setIsPopUpOpen(true);
  }

  const [isInfoPopUpOpen,setIsInfoPopUpOpen] = useState(false);
  const openAboutUsPopUp = () =>{
    setIsInfoPopUpOpen(true);
  }


  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedModelId}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
          user={user}
          openPopUp={openPopUp}
          openAboutUsPopUp={openAboutUsPopUp}
        />

        <Messages
          chatId={id}
          isLoading={isLoading}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isBlockVisible={isBlockVisible}
          selectedModelId={selectedModelId}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
              selectedModelId={selectedModelId}
            />
          )}
        </form>
      </div>

      <Block
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
        selectedModelId={selectedModelId}
      />
          {
          isPopUpOpen && <BkashPayment onClose={() => setIsPopUpOpen(false)} />}
                {
            isInfoPopUpOpen && <AboutUsPopup onClose={() => setIsInfoPopUpOpen(false)} />
          }
    </>
  );
}
