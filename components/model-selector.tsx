// components/ModelSelector.tsx

"use client";

import React, {
  startTransition,
  useMemo,
  useOptimistic,
  useState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { saveModelId } from "@/app/(chat)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Model, ModelCategory, models } from "@/lib/ai/models";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  CheckCircleFillIcon,
  ChevronDownIcon,
  LogoOpenAI,
  LogoGoogle,
  LogoAnthropic,
  LogoDeepSeek,
  LogoPDF,
} from "./icons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Separator } from "./ui/separator";

export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  

  const selectedModel = useMemo(
    () => models.find((model) => model.id === optimisticModelId),
    [optimisticModelId]
  );

  

  const [categoryOpenState, setCategoryOpenState] = useState<Record<ModelCategory, boolean>>(
    Object.values(ModelCategory).reduce((acc, category) => {
      acc[category] = false;
      return acc;
    }, {} as Record<ModelCategory, boolean>)
  );

  const [balanceCents, setBalanceCents] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const aiModels = models.filter((model) => model.isBot !== true);
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
  }, []);

  // Group models by category
  const categorizedModels = useMemo(() => {
    const categories = Object.values(ModelCategory).reduce((acc, category) => {
      acc[category] = aiModels.filter((model) => model.category === category);
      return acc;
    }, {} as Record<ModelCategory, Model[]>);
    return categories;
  }, [aiModels]);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          fetchBalance(); // Call fetchBalance when the dropdown is opened
        }
      }}
    >
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button
          variant="outline"
          className="md:px-2 md:h-[34px] flex items-center"
        >
          <span className="mr-2">{selectedModel?.label}</span>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px] max-h-[80dvh] overflow-y-auto">
        {Object.entries(categorizedModels).map(([category, models]) =>
          models.length > 0 ? (
            <React.Fragment key={category}>
              <Collapsible >
                <CollapsibleTrigger className="w-full text-left px-2 py-1 text-lg font-[500] flex flex-row justify-between items-center"
                  onClick={() => {
                    setCategoryOpenState((prevState) => ({
                      ...prevState,
                      [category as ModelCategory]: !prevState[category as ModelCategory],
                    }));
                  }}
                >
                  <span>
                    {category}
                  </span>
                  <div
                    className={cn(
                      "transform transition-transform duration-300",
                      categoryOpenState[category as ModelCategory] && "rotate-180"
                    )}
                  >
                    <ChevronDownIcon />
                  </div>

                </CollapsibleTrigger>
                <motion.div
                  initial={{ height: 0, opacity: 0, scale: 0.95 }}
                  animate={{
                    height: categoryOpenState[category as ModelCategory] ? "auto" : 0,
                    opacity: categoryOpenState[category as ModelCategory] ? 1 : 0,
                    scale: categoryOpenState[category as ModelCategory] ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <CollapsibleContent>
                    {models.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        onSelect={async () => {
                          if (model.isUpcoming || model.maintence || model.limit) {
                            return; // Prevent selection
                          }
                        
                          // If switching from a model that has imageInput or fileInput, do a "new chat"
                          if (
                            (selectedModel?.imageInput || selectedModel?.fileInput) &&
                            model.id !== selectedModel.id
                          ) {
                            // Close the dropdown right away
                            setOpen(false);
                        
                            // Optimistically update the model in the UI
                            setOptimisticModelId(model.id);
                        
                            // Wait for the server to store the new model
                            await saveModelId(model.id);
                        
                            // Finally push the new URL and refresh
                            router.push("/?stay=true");
                            router.refresh();
                            return;
                          }
                        
                          // Otherwise, just switch model without forcing a new chat
                          setOpen(false);
                          setOptimisticModelId(model.id);
                          await saveModelId(model.id);
                        }}
                        
                        className={cn(
                          "gap-4 group/item flex flex-row justify-between items-center",
                          model.isUpcoming || model.maintence || model.limit
                            ? "text-gray-500 cursor-not-allowed"
                            : "cursor-pointer"
                        )}
                        data-active={model.id === optimisticModelId}
                        disabled={model.isUpcoming || model.maintence || model.limit}
                        tabIndex={model.isUpcoming || model.maintence || model.limit ? -1 : 0}
                      >
                        <div className="flex flex-row gap-2 justify-center items-center">
                          {model.provider === "anthropic" && <LogoAnthropic />}
                          {model.provider === "deepseek" && <LogoDeepSeek />}
                          {model.provider === "google" && model.id !== "PDF" && <LogoGoogle />}
                          {model.provider === "google" && model.id === "PDF" && <LogoPDF />}
                          {(!model.provider || model.provider === "azure") && <LogoOpenAI />}
                          <div className="flex flex-col gap-1 items-start">
                            <span className="flex items-center">
                              {model.label}
                              {model.isUpcoming && (
                                <span className="ml-2 text-xs text-gray-400 cursor-help">
                                  Upcoming
                                </span>
                              )}
                              {model.maintence && !model.limit && (
                                <span className="ml-2 text-xs text-gray-400 cursor-help">
                                  Maintenance
                                </span>
                              )}
                              {model.limit && (
                                <span className="ml-2 text-xs text-gray-600 cursor-help">
                                  Limited due to high usage
                                </span>
                              )}
                              {!model.isUpcoming && !model.limit && (
                                <span className="ml-4 text-xs text-teal-800 cursor-help">
                                  <b>
                                    &lt;{" "}
                                    {balanceCents != null
                                      ? (
                                        balanceCents /
                                        (((model.inputCostPerToken ?? 0) * 100 +
                                          (model.outputCostPerToken ?? 0) * 500) *
                                          100)
                                      ).toFixed(0)
                                      : 0}
                                  </b>{" "}
                                  Messages Remaining
                                </span>
                              )}
                            </span>
                            {model.description && (
                              <div className="text-xs text-muted-foreground">
                                {model.description}
                              </div>
                            )}
                          </div>
                        </div>
                        {!model.isUpcoming && (
                          <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                            <CheckCircleFillIcon />
                          </div>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </CollapsibleContent>
                </motion.div>
              </Collapsible>
              <Separator />
            </React.Fragment>
          ) : null
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}