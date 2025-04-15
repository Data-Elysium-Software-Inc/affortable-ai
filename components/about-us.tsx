'use client';

import { useEffect,useState } from 'react';
import { motion } from "framer-motion";

interface AboutUsProps {
  onClose: () => void;
}

export default function AboutUsPopup({ onClose }: AboutUsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black dark:bg-white bg-opacity-50 dark:bg-opacity-20">
                <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ delay: 0}}
        >
      <div className="bg-white dark:bg-neutral-950 p-6 border border-input rounded-lg shadow-lg w-96 ">
      <div className="text-xl text-black dark:text-white flex justify-center">About Us</div>
        < div className="overflow-auto h-64">
            <div className="mb-2">
                <div className="text-md ">Project Manager</div>
                <div className="text-sm text-teal-800 dark:text-teal-400 flex items-center">Mehedi Hasan</div>
            </div>
            <div className="mb-2">
                <div className="text-md ">Developers</div>
                <div className="text-sm text-teal-800 dark:text-teal-400 flex items-center">Tasnimul Hossain Tomal</div>
                <div className="text-sm text-teal-800 dark:text-teal-400 flex items-center">Kabid Hasan</div>
                <div className="text-sm text-teal-800 dark:text-teal-400 flex items-center">Sk. Saifullah Hafiz</div>
                <div className="text-sm text-teal-800 dark:text-teal-400 flex items-center">Sadatul Islam Sadi</div>
                <div className="text-sm text-teal-800 dark:text-teal-400 flex items-center">Sifat Hossain</div>
                <div className="text-sm text-teal-800 dark:text-teal-400 flex items-center">Intesar Tahmid</div>
            </div>
            <div className="mb-2">
                <div className="text-md ">Public Relations</div>
                <div className="text-sm text-teal-800 dark:text-teal-400 flex items-center">Mubashshira Tasneem</div>
                <div className="text-sm text-teal-800 dark:text-teal-400 flex items-center">Ashikul Islam Tahin</div>
            </div>

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
