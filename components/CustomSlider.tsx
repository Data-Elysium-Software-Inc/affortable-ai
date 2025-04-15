"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

export const CustomSlider = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleScroll = useCallback(() => {
    setIsVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(false), 1500);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [handleScroll]);

  return (
    <div role="slider"
      className={`
        flex-1 overflow-y-auto max-h-screen w-full
        px-2 sm:px-4 md:px-6
        overflow-x-hidden
        [&::-webkit-scrollbar]:w-1
        sm:[&::-webkit-scrollbar]:w-1.5
        md:[&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar]:transition-opacity duration-300
        [&::-webkit-scrollbar-thumb]:bg-gray-400
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-track]:bg-transparent
        ${
          isVisible
            ? "[&::-webkit-scrollbar]:opacity-100"
            : "[&::-webkit-scrollbar]:opacity-0"
        }
      `}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={() => setIsVisible(true)}
      onTouchEnd={() => setTimeout(() => setIsVisible(false), 1500)}
    >
      {children}
    </div>
  );
};
