import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface ImageModalProps {
    src?: string;
    alt?: string;
    className?: string;
}
/**
 * This is image modal component that allows you to create 
 * an image that will pop up to show larger view on click.
 */
const ImageModal = ({ src, alt, className } : ImageModalProps) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <img 
          src={src} 
          alt={alt} 
          className={`cursor-pointer hover:opacity-90 transition-opacity ${className}`}
        />
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-screen-lg w-full p-6">
          <div className="relative">
            <img 
              src={src} 
              alt={alt} 
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            
            <Dialog.Close className="absolute -top-4 -right-4 bg-white rounded-full p-1 hover:bg-gray-100">
              <X className="w-6 h-6" />
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ImageModal;