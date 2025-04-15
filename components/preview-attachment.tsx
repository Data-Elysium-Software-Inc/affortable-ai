import type { Attachment } from 'ai';
import { LoaderIcon } from './icons';
import { X } from 'lucide-react'; // Import the close (X) icon

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  onRemove, // Function to remove attachment
  showRemoveButton = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove: (attachment: Attachment) => void;
  showRemoveButton?: boolean;
}) => {
  const { name, url, contentType } = attachment;

  return (
    <div className="flex flex-col gap-2 relative">
      {/* Attachment Preview */}
      <div className="w-20 h-16 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center">
        {contentType?.startsWith('image') ? (
          // NOTE: it is recommended to use next/image for images
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={url}
            alt={name ?? 'An image attachment'}
            className="rounded-md size-full object-cover"
          />
        ) : (
          <div className="" />
        )}

        {isUploading && (
          <div className="animate-spin absolute text-zinc-500">
            <LoaderIcon />
          </div>
        )}

        {/* Close (X) Button */}
        {showRemoveButton && (
          <button
          onClick={() => onRemove(attachment)}
          className="absolute top-0 right-0 p-1 bg-white rounded-full shadow-sm hover:bg-gray-200 transition-all"
          aria-label="Remove attachment"
          >
            <X size={12} className="text-zinc-500" />
          </button>
        )}
      </div>

      {/* File Name */}
      <div className="text-xs text-zinc-500 max-w-16 truncate">{name}</div>
    </div>
  );
};
