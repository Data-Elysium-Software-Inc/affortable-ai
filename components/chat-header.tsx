"use client";

import { useRouter } from "next/navigation";
import { useWindowSize } from "usehooks-ts";
import { memo, useEffect, useState } from "react";
import type { User } from "next-auth";
import { ModelSelector } from "@/components/model-selector";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { type VisibilityType, VisibilitySelector } from "./visibility-selector";
import { FiRefreshCcw } from "react-icons/fi";
import { SymbolIcon } from "@radix-ui/react-icons";
import { PayButton } from "./pay-button";
import BkashPayment from '@/components/bkash-payment';
import { models } from "@/lib/ai/models";
import { AiOutlineHome } from "react-icons/ai";
import { number } from "zod";


function approximateRemainingMessages(
  balanceCents: number | null,
  modelId: string
) {
  if (!balanceCents) return 0;

  // Convert user balance from cents -> dollars
  const balanceDollars = balanceCents / 100;

  // Find the desired model (e.g., GPT-4o or o1)
  const model = models.find((m) => m.apiIdentifier === modelId);
  if (!model) return 0;

  // Pull out inputCostPerToken / outputCostPerToken (in dollars)
  const inputCost = model.inputCostPerToken ?? 0;
  const outputCost = model.outputCostPerToken ?? 0;

  // Use the same "100 tokens for input" + "500 tokens for output" approximation
  const totalCost = inputCost * 100 + outputCost * 500;
  if (totalCost <= 0) return 0;

  // Floor it to get an integer number of messages
  return Math.floor(balanceDollars / totalCost);
}

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  user,
  openPopUp,
  openAboutUsPopUp,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  user: User | undefined;
  openPopUp: () => void;
  openAboutUsPopUp: () => void;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  const [balanceCents, setBalanceCents] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const gpt4oRemaining = approximateRemainingMessages(balanceCents, "gpt-4o");
  const o1Remaining = approximateRemainingMessages(balanceCents, "o1");

  const apiCosts = {
    "gpt-4o": 0.1,
    o1: 2,
  };

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/balance");
      const data = await res.json();

      if (res.ok) {
        setBalanceCents(data.balance);
      } else {
        console.error("Failed to fetch balance:", data.error);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance(); // Initial fetch
    // const interval = setInterval(fetchBalance, 10000); // Fetch every 30 seconds
    // return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const balanceDollars =
    balanceCents !== null ? (balanceCents / 100).toFixed(2) : "0.00";

  const calculateRemainingCalls = (cost: number) => {
    if (balanceCents === null) return 0;
    return Math.floor(balanceCents / cost);
  };

  

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />
      {/* Home button */}
      <Button
        variant="outline"
        className="md:px-2 md:h-fit"
        onClick={() => router.push("/dashboard")}
      >
        <AiOutlineHome />
      
      </Button>
      <PayButton
        paymentLink={`https://buy.stripe.com/${process.env.STRIPE_ID}?prefilled_email=${user?.email}`}
        openPopUp={openPopUp}
      />

      {/* {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2  md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push("/");
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent> New </TooltipContent>
        </Tooltip>
      )} */}

      {windowWidth < 768 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2  md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0 border-teal-800"
              onClick={() => {
                fetchBalance();
              }}
            >
              <FiRefreshCcw />
              <span className="md:sr-only font-bold">
                {loading ? `$${balanceDollars}` : `$${balanceDollars}`}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="p-2 text-sm">
              <div>Approximate Remaining Messages:</div>
              <ul className="list-disc ml-4">
                <li>
                  GPT-4o: ~{calculateRemainingCalls(apiCosts["gpt-4o"])}{" "}
                  Messages
                </li>
                <li>o1: ~{calculateRemainingCalls(apiCosts.o1)} Messages</li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {!isReadonly && (
        <ModelSelector
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )}


        <Tooltip>
          <TooltipTrigger asChild>
            <div role="button"
              className="border border-foreground rounded-md  text-foreground  hidden md:flex py-1.5 px-2 mt-5 mr-5 h-fit md:h-[34px] order-4 md:ml-auto items-center gap-2 cursor-pointer"
              onClick={fetchBalance}
            >
              {loading || balanceCents == null || balanceCents <= 0 ? <div className="size-4 bg-red-600 rounded-full" /> : <div className="size-4 bg-green-600 rounded-full" />}
              {loading ? "Loading..." : `Credits: $${balanceDollars}`}
              <SymbolIcon />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="p-2 text-sm">
              <div>Approximate Remaining Messages:</div>
              <ul className="list-disc ml-4">
                <li>GPT-4o: ~{gpt4oRemaining} messages</li>
                <li>o1: ~{o1Remaining} messages</li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
 




      
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
