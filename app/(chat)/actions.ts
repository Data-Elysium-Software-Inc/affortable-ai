"use server";

import { type CoreUserMessage, generateText } from "ai";
import { cookies } from "next/headers";

import { customModel } from "@/lib/ai";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  logUserIpAddress,
  updateChatVisiblityById,
  updateUserIpAddress,
} from "@/lib/db/queries";
import type { VisibilityType } from "@/components/visibility-selector";
import { del, put } from "@vercel/blob"
import sharp from "sharp";

export async function saveModelId(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("model-id", model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: CoreUserMessage;
}) {
  const { text: title } = await generateText({
    // CHANGE LATER
    model: customModel("gpt-4o", "azure"),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}

export async function updateIpAddress(
  userId: string,
  ipAddress: string
) {
  await updateUserIpAddress(userId, ipAddress);
}

export async function deleteBlob(url:string){
  await del(url)
}

export async function logIpAddress(userId: string, ipAddress: string) {
  try {
    const result = await logUserIpAddress(userId, ipAddress);
    return result;
  } catch (error) {
    console.error("Error logging IP address", error);
    throw error;
  }
}

export async function resizeImage(url: string, width: number, height: number) {
  console.log("Resizing image from URL:", url);

  try {
    // Fetch image with headers to ensure we receive an image
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    // Ensure content-type is an image
    const contentType = response.headers.get("content-type");
    console.log(`Content-Type: ${contentType}`);
    if (!contentType || !contentType.startsWith("image/")) {
      throw new Error(`Invalid content-type: ${contentType}`);
    }

    // Convert response to buffer
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    // Get image metadata to determine format
    const metadata = await sharp(imageBuffer).metadata();
    const format = metadata.format || 'png'; // Default to PNG if format is missing

    console.log(`Detected format: ${format}`);

    // Resize the image and convert it to PNG (or another detected format)
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(width, height, {fit: "fill"})
      .toFormat(format) // Convert to detected format
      .toBuffer();

    console.log("Resize complete");

    // Upload to Vercel Blob Storage
    const blob = await put(`generated_images/${Date.now()}.${format}`, resizedImageBuffer, {
      access: 'public',
      contentType: `image/${format}`,
    });

    console.log("Image uploaded to Vercel Blob:", blob.url);
    return {
      baseUrl: blob.url,
      downloadUrl: blob.downloadUrl
    };
  } catch (error) {
    console.error("Error resizing image", error);
    throw error;
  }
}