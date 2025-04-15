"use client";

import type { ChatRequestOptions, Message } from "ai";
import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useState } from "react";

import type { Vote } from "@/lib/db/schema";

import { DocumentToolCall, DocumentToolResult } from "./document";
import { PencilEditIcon, SparklesIcon } from "./icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import equal from "fast-deep-equal";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { MessageEditor } from "./message-editor";
import { DocumentPreview } from "./document-preview";
import ImageModal from "./ui/image-modal";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

import ImageSlider from "./image-slider";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface Citation {
  domain: string;
  link: string;
}


const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
  selectedModelId,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  selectedModelId?: string;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl pr-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-1 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            }
          )}
        >
          {message.role === "assistant" && (
            <div className="flex space-x-2">
              <div className="size-8 flex items-center justify-center rounded-full ring-1 ring-border bg-background">
                <div className="translate-y-[2px]">
                  {/* <SparklesIcon size={14} /> */}
                  <Image src={"/images/logo/favicon.png"} width={20} height={20} alt="Logo" />
                </div>
              </div>
            </div>
          )
          }

          <div className="flex flex-col gap-2 flex-1 max-w-full">
            {message.role === "assistant" && isLoading && selectedModelId && (
              getLoadingComponent(selectedModelId)
            )}
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                    onRemove={() => { }}
                  />
                ))}
              </div>
            )}

            {message.content && mode === "view" && (
              <div className="flex flex-row gap-2 items-start">
                {message.role === "user" && !isReadonly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                        onClick={() => {
                          setMode("edit");
                        }}
                      >
                        <PencilEditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                )}
                {message.role === "user" ? (
                  <div
                    className={cn("flex flex-col gap-4", {
                      "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                        message.role === "user",
                    })}
                  >
                    {message.content as string}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex flex-col gap-4 w-full break-words whitespace-normal",
                      {
                        "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                          message.role !== "assistant",
                      }
                    )}
                  >
                    <Markdown>{message.content as string}</Markdown>
                  </div>
                )}
              </div>
            )}

            {message.content && mode === "edit" && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4">
                {message.toolInvocations.map((toolInvocation) => {
                  const { toolName, toolCallId, state, args } = toolInvocation;

                  // // No matter what the state, generateImage's result will not be show to user.
                  if (toolName === "getYoutubeTranscript") {
                    return null;
                  }
                  // } else if (toolName === "generateAnimeImage") {
                  //   // No matter what the state, generateAnimeImage's result will not be show to user.
                  //   return null;
                  // }

                  if (state === "result") {
                    const { result } = toolInvocation;

                    return (
                      <div key={toolCallId}>
                        {toolName === "getWeather" ? (
                          <Weather weatherAtLocation={result} />
                        ) : (toolName === "generateImage" || toolName === "generateAnimeImage" || toolName === "generateClothedImage" || toolName === "resizeImage") ? (
                          <div className="flex flex-col gap-4">
                            {result.baseUrl ? (
                              <>
                                <ImageModal className="max-w-48" src={result.baseUrl} alt="AI generated Image" />
                                <a className="text-blue-500 hover:underline" href={result.downloadUrl} target="_blank">Download Image</a>
                              </>
                            ) : (
                              <p className="text-red-500">Error: Image could not be generated.</p>
                            )}
                          </div>
                        ) : (toolName === "generateMidjourneyImage") ? (
                          <div className="flex flex-col gap-4">
                            {/* 🔹 State to Track Current Slide */}
                            {result.baseUrl && (
                              <>
                                {/* ✅ Declare `currentIndex` before using `setCurrentIndex` */}
                                {(() => {
                                  //const [currentIndex, setCurrentIndex] = useState(0);

                                  return (
                                    <>
                                      <ImageSlider
                                        images={Array.isArray(result.baseUrl) ? result.baseUrl : [result.baseUrl as string]}
                                      //onSlideChange={setCurrentIndex} // ✅ Update `currentIndex` when the slide changes
                                      />

                                    </>
                                  );
                                })()}
                              </>
                            )}
                          </div>

                        ) : toolName === "generateSlide" ? (
                          <div className="flex flex-col gap-4">
                            {result.status === "success" ?
                              <DocViewer style={{ height: 500 }} documents={[{ uri: result.url, fileType: "pptx" }]} pluginRenderers={DocViewerRenderers} />
                              : <strong>{result.message}</strong>
                            }
                          </div>
                        ) : toolName === "rephraseText" ? (
                          <div className="flex flex-col gap-4">
                            {result.status === "success" ? (
                              <p className="text-lg font-medium">{result.rephrasedText}</p>
                            ) : result.status === "error" ? (
                              <p className="text-lg font-medium">{result.message}</p> // ✅ Shows error message in red
                            ) : (
                              <strong>Processing...</strong> // ✅ Optional: Show while waiting for a response
                            )}
                          </div>
                        ) 
                        : toolName === "citationFinder" ? (
                          <div className="flex flex-col gap-4">
                            {result.status === "success" ? (
                              <div>
                                {/* If citations are found, render both domain and full links */}
                                {result.citations.length > 0 ? (
                                  <>
                                    <p className="text-lg font-medium">Citations for your text:</p>
                                    <ul>
                                      {result.citations.map((citation: Citation, index: number) => (
                                        <li key={index} className="py-1">
                                          <a
                                            href={citation.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                          >
                                            {citation.domain} {/* Display the domain */}
                                          </a>
                                          <p className="text-sm text-gray-500">{citation.link}</p> {/* Display the full link below the domain */}
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                ) : (
                                  <p className="text-lg font-medium">Hooray! Your text is plagiarism-free!</p> // No links, plain message
                                )}
                              </div>
                            ) : result.status === "error" ? (
                              <p className="text-lg font-medium">{result.message}</p> // Error message in red
                            ) : result.status === "no_citations" ? (
                              <p className="text-lg font-medium">Hooray! Your text is plagiarism-free!</p> // Updated message for "no_citations"
                            ) : (
                              <strong>Processing...</strong> // Optional: Show while waiting for a response
                            )}
                          </div>
                        )
                        
                        : toolName === "createDocument" ? (
                          <DocumentPreview
                            isReadonly={isReadonly}
                            result={result}
                          />
                        ) : toolName === "updateDocument" ? (
                          <DocumentToolResult
                            type="update"
                            result={result}
                            isReadonly={isReadonly}
                          />
                        ) : toolName === "requestSuggestions" ? (
                          <DocumentToolResult
                            type="request-suggestions"
                            result={result}
                            isReadonly={isReadonly}
                          />
                        ) : (
                          <pre>{JSON.stringify(result, null, 2)}</pre>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ["getWeather"].includes(toolName),
                      })}
                    >
                      {toolName === "getWeather" ? (
                        <Weather />
                      ) : toolName === "createDocument" ? (
                        <DocumentPreview isReadonly={isReadonly} args={args} />
                      ) : toolName === "updateDocument" ? (
                        <DocumentToolCall
                          type="update"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === "requestSuggestions" ? (
                        <DocumentToolCall
                          type="request-suggestions"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl pr-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-1 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <Image src={"/images/logo/favicon.png"} width={20} height={20} alt="Logo" />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const getLoadingComponent = (selectedModelId: string): React.ReactNode => {
  switch (selectedModelId) {
    case "slidemaker":
    case "animefy":
    case "rephrase":
    case "midjourney":
    case "clothify":
    case "citation-gpt":
      return (
        <div className="flex items-center ml-4">
          <Loader2 className="animate-spin text-foreground" size={25} />
        </div>
      )
    default:
      return "";
  }
};