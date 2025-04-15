'use client';

import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { SubmitButton } from './submit-button';
import { toast } from "sonner";


interface CustomerSupportPopupProps {
  onClose: () => void;
}

export default function CustomerSupportPopup({ onClose }: CustomerSupportPopupProps) {
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle form submission (placeholder)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/support-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issue, description }),
      });
      
      if (!response.ok) {
        console.error('Failed to submit ticket', await response.json());
        toast.error('Failed to submit ticket');
      } else {
        console.log('Ticket submitted successfully');
        toast.success('Ticket submitted successfully');
      }
    } catch (error) {
      console.error('Error submitting support ticket:', error);
        toast.error('Error submitting support ticket');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black dark:bg-white bg-opacity-50 dark:bg-opacity-20 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ delay: 0 }}
      >
        <div className="bg-white dark:bg-neutral-950 p-6 border border-input rounded-lg shadow-lg w-96">
          {/* Facebook Link */}
          <div className="text-center mb-4">
            <p className="text-sm text-black dark:text-white">
              Contact us on {' '}
              <a
                href="https://www.facebook.com/profile.php?id=61559562616655"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Facebook
              </a>
            </p>
          </div>

          {/* Divider with "or, submit a ticket" */}
          <div className="flex items-center mb-4">
            <hr className="flex-grow border-gray-300 dark:border-gray-700" />
            <span className="px-2 text-sm text-black dark:text-white">or, submit a ticket</span>
            <hr className="flex-grow border-gray-300 dark:border-gray-700" />
          </div>

          {/* Support Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="issue"
                className="block text-sm font-medium text-black dark:text-white"
              >
                Issue
              </label>
              <input
                type="text"
                id="issue"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                required
                className="my-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-gray-500 focus:outline-none"
                placeholder="Summarize your issue"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-black dark:text-white"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="my-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-gray-500 focus:outline-none"
                placeholder="Describe the issue in detail"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white dark:bg-neutral-950 hover:bg-gray-300 hover:dark:bg-gray-800 border border-input text-black dark:text-white rounded transition-colors"
              >
                Close
              </button>
              <SubmitButton isSuccessful={false} disabled={loading}>
                Submit
              </SubmitButton>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
