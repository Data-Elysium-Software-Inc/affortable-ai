import type {
  CoreAssistantMessage,
  CoreMessage,
  CoreToolMessage,
  Message,
  ToolInvocation,
} from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Message as DBMessage, Document } from '@/lib/db/schema';
import { put } from '@vercel/blob';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

interface ImageUploadResult {
  downloadUrl: string | null;
  baseUrl: string | null;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      'An error occurred while fetching the data.',
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult = toolMessage.content.find(
            (tool) => tool.toolCallId === toolInvocation.toolCallId,
          );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: 'result',
              result: toolResult.result,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
}

export function convertToUIMessages(
  messages: Array<DBMessage>,
): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    if (message.role === 'tool') {
      return addToolMessageToChat({
        toolMessage: message as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = '';
    const toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === 'string') {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === 'text') {
          textContent += content.text;
        } else if (content.type === 'tool-call') {
          toolInvocations.push({
            state: 'call',
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        }
      }
    }

    chatMessages.push({
      id: message.id,
      role: message.role as Message['role'],
      content: textContent,
      toolInvocations,
    });

    return chatMessages;
  }, []);
}

export function sanitizeResponseMessages(
  messages: Array<CoreToolMessage | CoreAssistantMessage>,
): Array<CoreToolMessage | CoreAssistantMessage> {
  const toolResultIds: Array<string> = [];

  for (const message of messages) {
    if (message.role === 'tool') {
      for (const content of message.content) {
        if (content.type === 'tool-result') {
          toolResultIds.push(content.toolCallId);
        }
      }
    }
  }

  const messagesBySanitizedContent = messages.map((message) => {
    if (message.role !== 'assistant') return message;

    if (typeof message.content === 'string') return message;

    const sanitizedContent = message.content.filter((content) =>
      content.type === 'tool-call'
        ? toolResultIds.includes(content.toolCallId)
        : content.type === 'text'
          ? content.text.length > 0
          : true,
    );

    return {
      ...message,
      content: sanitizedContent,
    };
  });

  return messagesBySanitizedContent.filter(
    (message) => message.content.length > 0,
  );
}

export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
  const messagesBySanitizedToolInvocations = messages.map((message) => {
    if (message.role !== 'assistant') return message;

    if (!message.toolInvocations) return message;

    const toolResultIds: Array<string> = [];

    for (const toolInvocation of message.toolInvocations) {
      if (toolInvocation.state === 'result') {
        toolResultIds.push(toolInvocation.toolCallId);
      }
    }

    const sanitizedToolInvocations = message.toolInvocations.filter(
      (toolInvocation) =>
        toolInvocation.state === 'result' ||
        toolResultIds.includes(toolInvocation.toolCallId),
    );

    return {
      ...message,
      toolInvocations: sanitizedToolInvocations,
    };
  });

  return messagesBySanitizedToolInvocations.filter(
    (message) =>
      message.content.length > 0 ||
      (message.toolInvocations && message.toolInvocations.length > 0),
  );
}

export function getMostRecentUserMessage(messages: Array<CoreMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number,
) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}

export function getMessageIdFromAnnotations(message: Message) {
  if (!message.annotations) return message.id;

  const [annotation] = message.annotations;
  if (!annotation) return message.id;

  // @ts-expect-error messageIdFromServer is not defined in MessageAnnotation
  return annotation.messageIdFromServer;
}


export async function getAnimeImageFromAPI(
  imageUrl: string,
  apiUrl: string,
  apiKey: string,
  queryUrl: string, // Async task result query URL
  styleIndex: number = 0 // Default anime style
): Promise<string | null> {
  try {
    // Fetch image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();

    // Create form data
    const formData = new FormData();
    formData.append("task_type", "async");
    formData.append("image", imageBlob, "input.png");
    formData.append("index", styleIndex.toString()); // anime effect style

    // Send image to API
    const taskAddedResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "ailabapi-api-key": apiKey, // API key for authentication
      },
      body: formData,
    });

    const taskResponseJson = await taskAddedResponse.json();
    if (taskResponseJson?.error_detail?.status_code !== 200) {
      throw new Error(`API Error: ${taskResponseJson?.error_detail?.code_message}`);
    }

    const taskId = taskResponseJson?.task_id;
    if (!taskId) {
      throw new Error(`API Error: Task ID not found`);
    }

    console.log(`Task submitted successfully. Task ID: ${taskId}`);

    // Polling for task completion
    const result = await pollTaskResult(taskId, queryUrl, apiKey);
    if (result) {
      return result?.data?.result_url;
    }
    return null;
  } catch (error) {
    console.error("Error in getAnimeImageFromAPI:");
    console.error(error);
    return null;
  }
}

export async function getClothifyImageFromAPI(
  imageUrl: string,
  clothUrl: string,
  apiUrl: string,
  apiKey: string,
  queryUrl: string, // Async task result query URL
  clothesType: string = "upper_body" // Default clothes type
): Promise<string | null | undefined> {
  try {
    const personImage = await fetch(imageUrl);
    if (!personImage?.ok) {
      throw new Error(`Failed to fetch person image: ${personImage?.statusText}`);
    }
    const personImageBlob = await personImage.blob();

    const clothesImage = await fetch(clothUrl);
    if (!clothesImage?.ok) {
      throw new Error(`Failed to fetch clothes image: ${clothesImage?.statusText}`);
    }
    const clothesImageBlob = await clothesImage.blob();

    // Create form data
    const formData = new FormData();
    formData.append("task_type", "async");
    formData.append("person_image", personImageBlob, "person.png");
    formData.append("clothes_image", clothesImageBlob, "clothes.png");
    formData.append("clothes_type", clothesType);

    // Send images to API
    const taskAddedResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "ailabapi-api-key": apiKey
      },
      body: formData
    });

    const taskResponseJson = await taskAddedResponse.json();
    if (taskResponseJson?.error_detail?.status_code !== 200) {
      console.error(taskResponseJson);
      throw new Error(`API Error: ${taskResponseJson?.error_detail?.code_message}`);
    }

    const taskId = taskResponseJson?.task_id;
    if (!taskId) {
      throw new Error(`API Error: Task ID not found`);
    }

    console.log(`Task submitted successfully for Clothing. Task ID: ${taskId}`);

    // Polling for task completion
    const result = await pollTaskResult(taskId, queryUrl, apiKey);
    if (result) {
      return result?.data?.image;
    }
    return null;
  } catch (error) {
    console.error("Error in getClothifyImageFromAPI:");
    console.error(error);
    return null;
  }
}

// Function to query the task result
async function pollTaskResult(taskId: string, queryUrl: string, apiKey: string) {
  try {
    let attempt = 0;
    while (attempt < 15) { // Max retries (15 times = 60 seconds)
      console.log(`Checking task status (attempt ${attempt + 1})...`);

      const response = await fetch(`${queryUrl}?task_id=${taskId}`, {
        method: "GET",
        headers: {
          "ailabapi-api-key": apiKey
        }
      });

      const resultJson = await response.json();
      if (resultJson?.error_code !== 0) {
        throw new Error(`Error fetching task result: ${resultJson?.error_detail?.code_message}`);
      }

      if (resultJson?.task_status === 2) {
        return resultJson;
      }

      // Wait for 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 4000));
      attempt++;
    }

    console.error("Task polling timed out.");
    return null;
  } catch (error) {
    console.error("Error in pollTaskResult:", error);
    return null;
  }
}

export async function imageUploadToVercelFromUrl(imageUrl: string): Promise<ImageUploadResult> {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer)
    const blob = await put(`generated_images/${Date.now()}.png`, imageBuffer, {
      access: 'public',
      contentType: 'image/png',
    });
    return {
      downloadUrl: blob.url,
      baseUrl: blob.url,
    }
  } catch (error) {
    console.error("Error in imageUploadToVercelFromUrl:");
    console.error(error);
    return {
      downloadUrl: null,
      baseUrl: null,
    }
  }
}
