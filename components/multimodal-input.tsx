"use client";

import type {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from "ai";
import cx from "classnames";
import type React from "react";
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
  useOptimistic,
  useMemo,
} from "react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { toast as soonerToast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import { sanitizeUIMessages } from "@/lib/utils";

import { ArrowUpIcon, PaperclipIcon, StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea-dragdrop-paste";
import { SuggestedActions } from "./suggested-actions";
import equal from "fast-deep-equal";
import { Model, models } from "@/lib/ai/models";
import { ImageIcon, AudioLines, Plus } from "lucide-react";

import { upload } from "@vercel/blob/client";
import { deleteBlob } from "@/app/(chat)/actions";
import { z } from "zod";

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  selectedModelId,
  className,
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  selectedModelId: string;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const toastShown = useRef(false);

  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const selectedModel = useMemo(
    () => models.find((model) => model.id === optimisticModelId),
    [optimisticModelId]
  );

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
    if (
      !toastShown.current &&
      selectedModel?.showWarning &&
      selectedModel?.warningMessage
    ) {
      soonerToast.info(selectedModel.warningMessage);
      toastShown.current = true;
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${
        textareaRef.current.scrollHeight + 2
      }px`;
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    ""
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || "";
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const submitForm = useCallback(async () => {
    // Check if the selected model is 'rephrase' and input exceeds 1000 words
    if (optimisticModelId === "rephrase" && input.split(/\s+/).length > 1000) {
      soonerToast.error("Please provide a maximum of 1000 words!");
      return; // Prevent form submission
    }

    if (messages.length / 2 === 9) {
      toast.warning("Please avoid longer chats to reduce cost!", {
        position: "top-center",
        autoClose: 10000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    }
    window.history.replaceState({}, "", `/chat/${chatId}`);

    // --- Log the IP address on message submit ---
    try {
      // Fetch the public IP address
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();

      // Call the API endpoint to log the IP address.
      // The API will use session auth to get the user id.
      await fetch("/api/log-ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ipData.ip }),
      });
    } catch (error) {
      console.error("Error logging IP address", error);
    }

    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);
    setLocalStorageInput("");

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  const uploadFile = async (file: File) => {
    // const formData = new FormData();
    // formData.append("file", file);

    // try {
    //   const response = await fetch("/api/files/upload", {
    //     method: "POST",
    //     body: formData,
    //   });

    //   if (response.ok) {
    //     const data = await response.json();
    //     const { url, pathname, contentType } = data;

    //     return {
    //       url,
    //       name: pathname,
    //       contentType: contentType,
    //     };
    //   }
    //   const { error } = await response.json();
    //   toast.error(error);
    // } catch (error) {
    //   toast.error("Failed to upload file, please try again!");
    // }

    const getImageDimensions = (
      file: File
    ): Promise<{ width: number; height: number }> => {
      return new Promise((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(file);

        image.onload = () => {
          resolve({ width: image.width, height: image.height });
          URL.revokeObjectURL(url);
        };

        image.onerror = () => {
          reject(new Error("Failed to load image"));
          URL.revokeObjectURL(url);
        };

        image.src = url;
      });
    };

    const FileSchema = (selectedModel: Model) =>
      z
        .instanceof(File)
        .refine((file) => file.size <= 25 * 1024 * 1024, {
          message: "File size should be less than 25MB",
        })
        .refine(
          (file) => {
            if (file.type === "application/pdf") {
              return selectedModel.fileInput;
            } else if (["image/jpeg", "image/png"].includes(file.type)) {
              return selectedModel.imageInput;
            }
            return false;
          },
          {
            message: getValidationMessageForModels(selectedModel),
          }
        )
        .superRefine(async (file, ctx) => {
          if (
            selectedModel.id === "animefy" &&
            ["image/jpeg", "image/png"].includes(file.type)
          ) {
            const { width, height } = await getImageDimensions(file);

            if (width < 256 || height < 256 || width > 5760 || height > 3240) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Image dimensions not supported",
              });
            }
          }
        });

    const validationResult = await FileSchema(
      selectedModel as Model
    ).safeParseAsync(file);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map((error) => error.message)
        .join(", ");

      if (errorMessage.includes("Image dimensions not supported")) {
        soonerToast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }

      return;
    }

    try {
      const newBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/files/upload",
      });

      return {
        url: newBlob.url,
        name: newBlob.pathname,
        contentType: newBlob.contentType,
      };
    } catch (error) {
      const errorMessage =
        (error as Error).message || "Failed to upload file, please try again!";
      toast.error(errorMessage);
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments]
  );

  const onRemove = useCallback(
    (attachment: Attachment) => {
      if (attachment.url) {
        deleteBlob(attachment.url);
        setAttachments((attachments) =>
          attachments.filter((a) => a.url !== attachment.url)
        );
      }
    },
    [attachments, setAttachments]
  );

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default browser behavior
    setIsDragging(false);

    Array.from(event.dataTransfer.files).forEach((file) => {
      addFileToInput(file);
    });
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const addFileToInput = (file: File) => {
    if (file && fileInputRef?.current) {
      const dataTransfer = new DataTransfer();

      // Add the new pasted file
      dataTransfer.items.add(file);

      // Update input files while preserving previous ones
      fileInputRef.current.files = dataTransfer.files;

      // Trigger change event so the input handles it
      fileInputRef.current.dispatchEvent(
        new Event("change", { bubbles: true })
      );
    }
  };

const menuRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false);
    }
  }

  if (showMenu) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [showMenu]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      {!selectedModel?.additionalInfo &&
        messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions append={append} chatId={chatId} />
        )}

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        accept=".pdf"
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={imageInputRef}
        accept="image/jpeg, image/png"
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-scroll items-end">
          {attachments.map((attachment) => (
            <PreviewAttachment
              key={attachment.url}
              attachment={attachment}
              onRemove={onRemove}
              showRemoveButton={true}
            />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: "",
                name: filename,
                contentType: "",
              }}
              onRemove={onRemove}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <div className="relative w-full flex flex-col gap-4">
        {/* Hidden Inputs for File Uploads */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          multiple
        />
        <input
          type="file"
          ref={imageInputRef}
          accept="image/jpeg, image/png"
          className="hidden"
          onChange={handleFileChange}
          multiple
        />

        {/* Input Box with Icons */}
        <div
          className="flex items-center border rounded-3xl px-4 py-3 w-full bg-white dark:bg-zinc-800 shadow-md relative"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
        {/* Left container for Plus button and its menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowMenu(!showMenu);
            }}
            className="text-gray-500 hover:text-black hover:dark:text-white focus:outline-none rounded-full p-1.5 h-fit border border-gray-500 hover:border-black hover:dark:border-white dark:border-zinc-600"
          >
            <Plus size={20} />
          </button>

          {/* Attachment Menu */}
          {showMenu && (
            <div ref={menuRef} className="absolute left-0 bottom-full mb-2 bg-white dark:bg-zinc-900 border rounded-lg shadow-md p-2 flex flex-col gap-2 items-start border-black z-10">
              <AttachmentsButton
                fileInputRef={fileInputRef}
                isLoading={isLoading || !selectedModel?.fileInput || false}
                setShowMenu={setShowMenu}
              />
              <ImagesButton
                fileInputRef={imageInputRef}
                isLoading={isLoading || !selectedModel?.imageInput || false}
                setShowMenu={setShowMenu}
              />
            </div>
          )}
        </div>

        {/* Container for Text Input */}
        <div className="flex-grow">
          <Textarea
            ref={textareaRef}
            placeholder={isDragging ? "" : "Hi, how may I help you? Please enter..."}
            value={input}
            onChange={handleInput}
            fileInputRef={fileInputRef}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (isLoading) {
                  toast.error("Please wait for the model to finish its response!");
                } else {
                  submitForm();
                }
              }
            }}
          />
        </div>

          {/* Container for action buttons */}
          <div className="flex flex-row gap-1">
            <button
              className="text-gray-500 focus:outline-none mr-2"
              disabled={true}
            >
              <AudioLines size={18} />
            </button>
            {isLoading ? (
              <StopButton stop={stop} setMessages={setMessages} />
            ) : (
              <SendButton
                input={input}
                submitForm={submitForm}
                uploadQueue={uploadQueue}
              />
            )}
          </div>

        {/* Drag & Drop Overlay */}
        {isDragging && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-300 bg-opacity-50 backdrop-blur-md rounded-xl text-black text-lg font-semibold transition-opacity duration-300 ease-in-out pointer-events-none">
            <div className="animate-bounce">⬇️</div>
            <p className="text-xs">Maximum upload file-size: 25MB</p>
          </div>
        )}
      </div>

      </div>
      <ToastContainer
        position="top-center"
        autoClose={10000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.selectedModelId !== nextProps.selectedModelId) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;

    return true;
  }
);

function PureAttachmentsButton({
  fileInputRef,
  isLoading,
  setShowMenu,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  isLoading: boolean;
  setShowMenu: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Button
      className="rounded-md rounded-bl-lg p-[7px] h-fit w-full dark:border-zinc-700 hover:dark:bg-zinc-800 hover:bg-zinc-200 flex justify-start"
      onClick={(event) => {
        event.preventDefault();
        setShowMenu(false);
        fileInputRef.current?.click();
      }}
      disabled={isLoading}
      variant="ghost"
    >
      <PaperclipIcon size={14} />
      <span className="text-sm font-bold">Attach File</span>
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureImagesButton({
  fileInputRef,
  isLoading,
  setShowMenu,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  isLoading: boolean;
  setShowMenu: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Button
      className="rounded-md rounded-bl-lg p-[7px] h-fit w-full dark:border-zinc-700 hover:dark:bg-zinc-800 hover:bg-zinc-200"
      onClick={(event) => {
        event.preventDefault();
        setShowMenu(false);
        fileInputRef.current?.click();
      }}
      disabled={isLoading}
      variant="ghost"
    >
      <ImageIcon size={14} />
      <span className="text-sm font-bold">Attach Image</span>
    </Button>
  );
}

const ImagesButton = memo(PureImagesButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => sanitizeUIMessages(messages));
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});

function getValidationMessageForModels(model: Model) {
  if (model.fileInput && model.imageInput) {
    return `Only PDF files or JPEG/PNG images are allowed for ${model.label}`;
  }
  if (model.fileInput) {
    return `Only PDF files are allowed for ${model.label}`;
  }
  if (model.imageInput) {
    return `Only JPEG/PNG images are allowed for ${model.label}`;
  }
  return "Doesn't support any kind of file input";
}
