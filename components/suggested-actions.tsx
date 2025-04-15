"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import type { ChatRequestOptions, CreateMessage, Message } from "ai";
import { memo } from "react";

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: "Weather and Temp",
      label: "-> Dhaka, BD?",
      action: "What is the weather in Dhaka, Bangladesh?",
    },
    {
      title: "Generate startup ideas",
      label: "-> AI-powered.",
      action: "Provide innovative AI-powered startup ideas.",
    },
    {
      title: "Fun AI Challenge",
      label: "-> Create a interactive story using AI.",
      action: "Create a unique, interactive story.",
    },
    {
      title: "AI for Healthcare",
      label: "-> role of AI in healthcare services in Bangladesh.",
      action:
        "Explain the role of AI in enhancing healthcare services in Bangladesh.",
    },
  ];

  return (
    <div className="grid sm:grid-cols-4 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? "hidden sm:block" : "block"}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, "", `/chat/${chatId}`);

              append({
                role: "user",
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-full justify-start items-start"
          >
            <span className="font-medium whitespace-normal break-words">{suggestedAction.title}</span>
            <span className="text-muted-foreground w-full whitespace-normal break-words">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
