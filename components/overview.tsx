
import { Model } from "@/lib/ai/models";
import { useTheme } from "next-themes";
import Image from "next/image";

export const Overview = ({ selectedModel }: { selectedModel: Model | undefined | null }) => {
  const { theme } = useTheme();
  const headingSrc =
    theme === "light"
      ? "/images/logo/logo-text-light.png"
      : "/images/logo/logo-text-dark.png";

  return (
    <div
      key="overview"
      className="max-w-sm md:max-w-3xl mx-auto md:mt-2 overflow-hidden"
    >
      {selectedModel?.additionalInfo ?
        <>
          {selectedModel.additionalInfo?.guidelines &&
            <div className="rounded-xl p-8 flex flex-col gap-2 leading-relaxed max-w-3xl border bg-gray-100 dark:bg-gray-900 overflow-y-auto max-h-[500px]">
              <Image
                src={headingSrc}
                alt="AFFOR[T*]ABLE AI"
                width={200}
                height={64}
              />
              <p className="flex flex-row gap-4 items-center text-black dark:text-white font-bold text-lg mt-4">
                {`Guidelines for ${selectedModel.label}`}
              </p>
              {/* Dynamic Grid with 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {selectedModel.additionalInfo?.guidelines?.map((info, index) => (
                  <div
                    key={index}
                    className="rounded-xl p-4 border bg-background shadow-md text-black dark:text-white flex flex-col gap-2"
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
        <>
          <div className="rounded-xl p-8 flex flex-col gap-2 leading-relaxed max-w-3xl border bg-gray-100 dark:bg-gray-900 overflow-y-auto max-h-[430px]">
            <Image
              src={headingSrc}
              alt="AFFOR[T*]ABLE AI"
              width={200}
              height={32}
            />
            <p className="flex flex-row gap-4 items-center text-black dark:text-white font-bold text-lg mt-4">
              Pay As You Go Access to the Latest AI Models
            </p>
            <p>
              Access the world&#39;s most powerful AI models like <b>GPT 4o</b> and{" "}
              <b>o1 </b>
              by simply topping up your account when you want with as little as{" "}
              <b>$1</b>. No expensive subscriptions and no credit expiry.
              <br /> <b>Pay only for what you use.</b>
            </p>
            <div className="flex flex-row max-w-2xl gap-4">
              <div className="rounded-xl w-1/2 p-4 flex flex-col gap-2 leading-relaxed text-center max-w-xl border bg-background">
                <p className="flex flex-row justify-center gap-4 items-center text-black dark:text-white font-bold text-md">
                  💰 Cost-Effective AI Access
                </p>
                <p className="text-sm">
                  Start with just $1, compared to $20+ monthly subscriptions per
                  provider. Why pay $40-$80 monthly for multiple AI services when you
                  can access them all through one flexible platform?
                </p>
              </div>

              <div className="rounded-xl w-1/2 p-4 flex flex-col gap-2 leading-relaxed text-center max-w-xl border bg-background">
                <p className="flex flex-row justify-center gap-4 items-center text-black dark:text-white font-bold text-md">
                  🤖 All in One AI Platform
                </p>
                <p className="text-sm">
                  Access the best AI models for your specific needs. Use GPT o1 for
                  code generation and image analysis, DALL-E 3 for image creation, and
                  more - all from one platform.
                </p>
              </div>
            </div>
          </div>
        </>
      }
    </div>
  );
};






