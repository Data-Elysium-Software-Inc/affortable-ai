import { Model } from "@/lib/ai/models";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import React from "react";

export const MobileOverview = ({ selectedModel }: { selectedModel: Model | undefined | null }) => {
  const { setTheme, theme } = useTheme();
  const headingSrc =
    theme === "light"
      ? "/images/logo/logo-light.png"
      : "/images/logo/logo-dark.png";

  return (
    <motion.div
      key="mobile-overview"
      className="max-w-sm md:max-w-3xl mx-auto md:mt-2"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <Image
        src={headingSrc}
        alt="AFFOR[T*]ABLE AI"
        width={120}
        height={64}
        className="mx-auto"
      />
      {selectedModel?.additionalInfo ?
        <>
          {selectedModel.additionalInfo?.guidelines &&
            <div className="rounded-xl p-4 flex flex-col gap-2 leading-relaxed max-w-3xl border bg-gray-100 overflow-y-auto max-h-[55vh] mt-4">
              <p className="flex flex-row justify-center gap-4 items-center text-black dark:text-white font-bold text-lg md:text-xl">
                {`Guidelines for ${selectedModel.label}`}
              </p>
              {/* Dynamic Grid with 2 Columns */}
              <div className="grid grid-cols-1 gap-4 w-full">
                {selectedModel.additionalInfo?.guidelines?.map((info, index) => (
                  <div
                    key={index}
                    className="rounded-xl p-4 border bg-white shadow-md text-black dark:text-white flex flex-col gap-2"
                  >
                    <p className="text-lg font-bold break-words">{info.title}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{info.description}</p>
                  </div>
                ))}
              </div>
            </div>
          }
          
        </>
        :
        <h1 className="mt-2 font-bold text-lg ">
          What can I help you with Today?
        </h1>
      }
    </motion.div>
  );
};
