import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Textarea component that supports pasting images and drag-and-drop file uploads.
 * But you need to pass a input reference to handle the file upload.
 */

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & {
    fileInputRef?: React.RefObject<HTMLInputElement>;
  }
>(({ className, fileInputRef, ...props }, ref) => {

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardItems = event.clipboardData.items;

    for (let item of clipboardItems) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file && fileInputRef?.current) {
          addFileToInput(file);
        }

        event.preventDefault(); // Prevent pasting image as base64 text
      }
    }
  };


  const addFileToInput = (file: File) => {
    if (file && fileInputRef?.current) {
      const dataTransfer = new DataTransfer();

      // Add the new pasted file
      dataTransfer.items.add(file);

      // Update input files while preserving previous ones
      fileInputRef.current.files = dataTransfer.files;

      // Trigger change event so the input handles it
      fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  return (
    <div
      className="relative w-full"
    >

      <textarea
        className={cn(
          "min-h-[24px] max-h-[calc(25dvh)] overflow-y-auto w-full resize-none bg-transparent border-none focus:outline-none placeholder-gray-400 text-gray-700 dark:text-white rounded-3xl px-4 py-2 text-base",
          className
        )}
        ref={ref}
        rows={1} // Initially 1 row
        onPaste={handlePaste}
        {...props}
      />
    </div>
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
