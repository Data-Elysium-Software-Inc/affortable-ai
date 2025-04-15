"use client";

import { models } from "@/lib/ai/models";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
  useSidebar
} from "@/components/ui/sidebar";
import { Bot } from "lucide-react";
import { useOptimistic, useMemo, startTransition } from "react";
import { saveModelId } from "@/app/(chat)/actions";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function BotMenu({ selectedModelId }: { selectedModelId: string }) {
  // Filter models that have isBot property set to true
  const botModels = models.filter(model => model.isBot === true && (model.maintence !== true));
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  const selectedModel = useMemo(
    () => models.find((model) => model.id === optimisticModelId),
    [optimisticModelId]
  );
  // If no bot models are available, don't render anything
  if (botModels.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        Assistant Bots
      </SidebarGroupLabel>
      <SidebarMenu>
        {botModels.map((bot) => (
          <SidebarMenuItem key={bot.id}>
            <SidebarMenuButton
              tooltip={bot.description}
              onClick={() => {
                setOpenMobile(false);
                router.push("/");
                startTransition(() => {
                  setOptimisticModelId(bot.id);
                  saveModelId(bot.id);
                });
                router.refresh();
              }}
            >
              <Bot className="h-4 w-4" />
              <span>{bot.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        {/* Add new assistant bots separately */}
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Practice speaking with an AI assistant"
            onClick={() => {
              setOpenMobile(false);
              router.push("/realtime-voice");
              // startTransition(() => {
              //   setOptimisticModelId("speaking-bot");
              //   saveModelId("speaking-bot");
              // });
              router.refresh();
            }}
          >
            <Bot className="h-4 w-4" />
            <span>Speaking Bot</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Convert speech to text in real time"
            onClick={() => {
              setOpenMobile(false);
              router.push("/realtime-transcription");
              // startTransition(() => {
              //   setOptimisticModelId("realtime-transcription");
              //   saveModelId("realtime-transcription");
              // });
              router.refresh();
            }}
          >
            <Bot className="h-4 w-4" />
            <span>Realtime Audio Transcription</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Convert text to speech"
            onClick={() => {
              setOpenMobile(false);
              router.push("/tts");
              // startTransition(() => {
              //   setOptimisticModelId("realtime-transcription");
              //   saveModelId("realtime-transcription");
              // });
              router.refresh();
            }}
          >
            <Bot className="h-4 w-4" />
            <span>Text to Speech</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>

  );
}