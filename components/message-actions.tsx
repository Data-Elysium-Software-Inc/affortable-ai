import type { Message } from 'ai';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { useCopyToClipboard } from 'usehooks-ts';

import type { Vote } from '@/lib/db/schema';
import { getMessageIdFromAnnotations } from '@/lib/utils';

import { CopyIcon, LoaderIcon } from './icons';
import { FaCentSign } from "react-icons/fa6";
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { memo, useState, } from 'react';
import equal from 'fast-deep-equal';

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();
  const [mes, setMes] = useState("empty");

  const fetchMessage = async () => {
    setMes("loading");
    const messageId = getMessageIdFromAnnotations(message);
    try {
      const response = await fetch(`/api/cost?messageId=${messageId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json(); // Parse JSON response

      if (!response.ok) {
        // If the response status is not OK (e.g., 404, 500), show the error message
        setMes("loading");
        return;
      }
      //Handle case where message array is empty or undefined
      if (!data.message || data.message.length === 0) {
        setMes("loading");
        return;
      }
      // Set the cost value, ensuring it's a string
      setMes(` ${data.message[0]?.cost?.toString()}` || "0");
    } catch (error) {
      console.error("Error:", error);
      //setMes("Failed to fetch message");
    }
  };



  if (isLoading) return null;
  if (message.role === 'user') return null;
  // if (message.toolInvocations && message.toolInvocations.length > 0)
  //   return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 text-muted-foreground h-full"
              variant="outline"
              onClick={async () => {
                if(message.toolInvocations && message.toolInvocations.length > 0){
                  const results = [];
                  for (const toolInvocation of message.toolInvocations) {
                    if(toolInvocation.state === "result"){
                      results.push(toolInvocation.result);
                    }
                  }
                  await copyToClipboard(JSON.stringify(results));
                  toast.success('Copied to clipboard!');
                  return;
                }
                await copyToClipboard(message.content as string);
                toast.success('Copied to clipboard!');
              }}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
        { /*
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
              disabled={vote?.isUpvoted}
              variant="outline"
              onClick={async () => {
                const messageId = getMessageIdFromAnnotations(message);

                const upvote = fetch('/api/vote', {
                  method: 'PATCH',
                  body: JSON.stringify({
                    chatId,
                    messageId,
                    type: 'up',
                  }),
                });

                toast.promise(upvote, {
                  loading: 'Upvoting Response...',
                  success: () => {
                    mutate<Array<Vote>>(
                      `/api/vote?chatId=${chatId}`,
                      (currentVotes) => {
                        if (!currentVotes) return [];

                        const votesWithoutCurrent = currentVotes.filter(
                          (vote) => vote.messageId !== message.id,
                        );

                        return [
                          ...votesWithoutCurrent,
                          {
                            chatId,
                            messageId: message.id,
                            isUpvoted: true,
                          },
                        ];
                      },
                      { revalidate: false },
                    );

                    return 'Upvoted Response!';
                  },
                  error: 'Failed to upvote response.',
                });
              }}
            >
              <ThumbUpIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upvote Response</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
              variant="outline"
              disabled={vote && !vote.isUpvoted}
              onClick={async () => {
                const messageId = getMessageIdFromAnnotations(message);

                const downvote = fetch('/api/vote', {
                  method: 'PATCH',
                  body: JSON.stringify({
                    chatId,
                    messageId,
                    type: 'down',
                  }),
                });

                toast.promise(downvote, {
                  loading: 'Downvoting Response...',
                  success: () => {
                    mutate<Array<Vote>>(
                      `/api/vote?chatId=${chatId}`,
                      (currentVotes) => {
                        if (!currentVotes) return [];

                        const votesWithoutCurrent = currentVotes.filter(
                          (vote) => vote.messageId !== message.id,
                        );

                        return [
                          ...votesWithoutCurrent,
                          {
                            chatId,
                            messageId: message.id,
                            isUpvoted: false,
                          },
                        ];
                      },
                      { revalidate: false },
                    );

                    return 'Downvoted Response!';
                  },
                  error: 'Failed to downvote response.',
                });
              }}
            >
              <ThumbDownIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Downvote Response</TooltipContent>
        </Tooltip>
*/
        }       <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground"
              variant="outline"
              onClick={fetchMessage}
            >
              {
                mes === "empty" ? (
                  <>
                    <FaCentSign />
                    {"Cost"}
                  </>
                ) : mes === "loading" ? (
                  <LoaderIcon />
                ) : (
                  <div className="flex items-center">
                    <FaCentSign />
                    {mes}
                  </div>
                )
              }
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cost (cents)</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);
