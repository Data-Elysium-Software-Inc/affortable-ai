// src/components/CodeBlock.tsx
"use client";

import { useState, useEffect } from "react";
import { CopyIcon } from "./icons";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { getLanguageDisplay } from '@/lib/code-lang/languages';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const match = /language-(\w+)/.exec(className || "");
  const codeContent = String(children).replace(/\n$/, "");
  const isInline = !className?.startsWith("language-");
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const language = match ? match[1] : "plaintext";

  useEffect(() => {
    if (!isInline) {
      try {
        const highlighted = hljs.highlight(codeContent, {
          language,
          ignoreIllegals: true
        }).value;
        setHighlightedCode(highlighted);
      } catch (error) {
        setHighlightedCode(hljs.highlight(codeContent, {
          language: 'plaintext',
          ignoreIllegals: true
        }).value);
      }
    }
  }, [codeContent, language, isInline]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      toast.success("Code copied successfully!");
    } catch {
      toast.error("Failed to copy code.");
    }
  };

  if (isInline) {
    return /\n/.test(codeContent) ? (
      <pre className="whitespace-pre-wrap text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md">
        <code {...props}>{codeContent}</code>
      </pre>
    ) : (
      <code className="text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md" {...props}>
        {codeContent}
      </code>
    );
  }

  return (
    <div className="relative group w-full max-w-full overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
        {getLanguageDisplay(language)}
      </div>

      <pre
        className={cn(
          "text-sm w-full max-w-full overflow-x-auto dark:bg-zinc-900 p-4 pt-12 border border-zinc-200",
          "dark:border-zinc-800 rounded-xl hljs",
          `language-${language} whitespace-pre-wrap break-words break-all`
        )}
      >
        <code
          className={`language-${language} block`}
          dangerouslySetInnerHTML={{ __html: highlightedCode || codeContent }}
        />
      </pre>

      <Button
        className="absolute top-2 right-2 py-1 px-1 h-fit text-muted-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-xs transition-colors duration-200 opacity-0 group-hover:opacity-100"
        variant="outline"
        title="Copy Code"
        onClick={handleCopy}
      >
        <CopyIcon />
      </Button>
    </div>
  );
}