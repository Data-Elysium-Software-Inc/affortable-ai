'use client';

import { useEffect,useState } from 'react';
import { models } from "@/lib/ai/models";
import { Model } from "@/lib/ai/models"; 
import { motion } from "framer-motion";

import {
    LogoOpenAI,
    LogoGoogle,
    LogoAnthropic,
    LogoPDF,
    LogoDeepSeek,
  } from "./icons";

import { AiFillFile } from "react-icons/ai";
import { MdOutlineSailing } from "react-icons/md";
import { Bot } from 'lucide-react';

interface PriceCalculatorPopupProps {
  onClose: () => void;
}

export default function PriceCalculatorPopup({ onClose }: PriceCalculatorPopupProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [creditValue, setCreditValue] = useState<number>(0); // Default to 0
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCreditValue(value === '' ? 0 : Number(value)); // If empty, set to 0
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black dark:bg-white bg-opacity-50 dark:bg-opacity-20">
                <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ delay: 0}}
        >
      <div className="bg-white dark:bg-neutral-950 p-6 border border-input rounded-lg shadow-lg w-96 ">
      <div className="text-xl text-black dark:text-white">Price Calculator</div>
        <div className="mt-1 mb-2">
          <input
            type="number"
            onChange={handleInputChange} // Update state
            className="my-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-gray-500 focus:outline-none"
            placeholder="Enter Credit Value in Dollar"
          />
        </div>
        <div className="overflow-auto h-64">
            {models && models.length > 0 ? (
            <div className="space-y-2">
                {models
                //.filter((model) => model.streaming === false) // Filter models where streaming is false
                .filter((model) => !model.isUpcoming)
                .map((model) => (
                    <div
                    key={model.id}
                    className="flex items-center justify-start gap-2 text-sm font-medium text-black dark:text-white"
                    >
                        <div className="flex">
                          {(() => {
                            if (model.provider === "anthropic") {
                              return <LogoAnthropic />;
                            } else if (model.provider === "deepseek") {
                              return <LogoDeepSeek />;
                            } else if (model.provider === "google" && model.id !== "PDF") {
                              return <LogoGoogle />;
                            } else if (model.provider === "google" && model.id === "PDF") {
                              return <LogoPDF />;
                            } else if (model.provider === "azure") {
                              return <LogoOpenAI />;
                            } else if (model.apiIdentifier === "midjourney") {
                              return <MdOutlineSailing />;
                            } else if (model.apiIdentifier === "slide-speak" || model.apiIdentifier === "animefy" || model.apiIdentifier === "Rephrasy") {
                              return <Bot />;
                            } 
                            else if (model.provider === undefined) {
                              return <LogoOpenAI />;
                            }
                          })()}
                        </div>

                        <div className="">
                            <div className="flex gap-3">
                                <div className="text-md font-semibold">{model.label}</div>
                                <div className="text-md text-teal-800 dark:text-gray-400 flex items-center gap-1">&lt;
                                {getCreditDisplay(model, creditValue)}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">{model.description}</div>
                        </div>
                    </div>
                ))}
            </div>
            ) : (
            <span className="text-sm text-gray-500">No models available.</span>
            )}
        </div>

        <button type="button"
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-white dark:bg-neutral-950 hover:bg-gray-300 hover:dark:bg-gray-800
            border border-input text-black dark:text-white rounded"
        >
          Close
        </button>
      </div>
      </motion.div>
    </div>
  );
}

const getCreditDisplay = (model: Model, creditValue: number) => {
  const length = 5;
  if (model.id==='rephrase'){
    return `${(creditValue / 0.00015).toFixed(0)} words`;
  }  if (model.id==='slidemaker'){
    return `${(creditValue / ((model.inputCostPerToken ?? 0) * 100 + (model.outputCostPerToken ?? 0) * 500 +((model?.imageCostInCents ?? 5) * (length + 2))/100)).toFixed(0)} Slides`;
  }else if (model.imageGenerate) {
    return `${(creditValue / ((model.inputCostPerToken ?? 0) * 100 + (model.outputCostPerToken ?? 0) * 500 +(model.imageCostInCents ? model.imageCostInCents : 4)/100)).toFixed(0)} Images`;
  } else if (model.imageEnhance) {
    return `${(creditValue / ((model.imageCostInCents ?? 0)/100)).toFixed(0)} Images`;
  } else{
    return `${(creditValue/ ((model.inputCostPerToken ?? 0) * 100 + (model.outputCostPerToken ?? 0) * 500)).toFixed(0)} Messages`;
  }
};

