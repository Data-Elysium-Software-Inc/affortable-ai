import {
  JSONValue,
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  experimental_generateImage,
  streamObject,
  streamText,
  tool,
} from "ai";
import { string, z } from "zod";
import { google } from "@ai-sdk/google";

import { auth } from "@/app/(auth)/auth";
import { customModel } from "@/lib/ai";
import { models } from "@/lib/ai/models";
import {
  animefyPrompt,
  codePrompt,
  imagePrompt,
  regularPrompt,
  slidePrompt,
  rephrasePrompt,
  systemPrompt,
  updateDocumentPrompt,
  banglaPrompt,
  clothifyPrompt,
  citationPrompt,
  imageResizePrompt,
  midjourneyImagePrompt,
} from "@/lib/ai/prompts";
import {
  deleteChatById,
  getChatById,
  getDocumentById,
  saveChat,
  saveDocument,
  saveMessages,
  saveSuggestions,
  getUserById,
  incrementUserMessageCount,
  updateUserApiBalance,
  updateChatCost,
  updateChatTitle
} from "@/lib/db/queries";
import type { Suggestion } from "@/lib/db/schema";
import {
  generateUUID,
  getAnimeImageFromAPI,
  getClothifyImageFromAPI,
  getMostRecentUserMessage,
  imageUploadToVercelFromUrl,
  sanitizeResponseMessages,
} from "@/lib/utils";

import { generateTitleFromUserMessage, resizeImage } from "../../actions";
import { openai } from "@ai-sdk/openai";
import { put } from "@vercel/blob";
import { generateSlideSpeakPresentation, getSlideLengthFromSanitizedMessages } from "@/lib/ai/slide-speak";
import { TokensIcon } from "@radix-ui/react-icons";
import { anthropic } from "@ai-sdk/anthropic";
import { Supadata, Transcript, TranscriptChunk } from "@supadata/js";

export const maxDuration = 180;

type AllowedTools =
  | "createDocument"
  | "updateDocument"
  | "requestSuggestions"
  | "getWeather";

const blocksTools: AllowedTools[] = [
  "createDocument",
  "updateDocument",
  "requestSuggestions",
];

const supadata = new Supadata(
  {
      apiKey: process.env.SUPADATA_API_KEY!
  }
)

// Define available cartoon styles
enum AnimeStyle {
  VINTAGE_COMIC = 0, // Vintage Comic
  THREE_D_FAIRY_TALE = 1, // 3D Fairy Tale
  TWO_DIMENSIONAL = 2, // Two-dimensional (2D)
  REFRESHING_ELEGANT = 3, // Refreshing and Elegant
  FUTURE_TECHNOLOGY = 4, // Future Technology
  CHINESE_PAINTING = 5, // Traditional Chinese Painting Style
  GENERAL_BATTLES = 6, // General in a Hundred Battles
  COLORFUL_CARTOON = 7, // Colorful Cartoon
  GRACEFUL_CHINESE = 8 // Graceful Chinese Style
}

enum ClothesType {
  UPPER_BODY = "upper_body",
  LOWER_BODY = "lower_body",
  FULL_BODY = "full_body"
}

interface Citation {
  domain: string;
  link: string;
}

var GlobalVarFuncCallCount = 0

const latexFormattingPrompt = `
You are a friendly assistant from Data Elysium Software Inc! Keep your responses concise and helpful. If this is a coding task, please make sure to use SINGLE line code word USE BACKTICKS.
YOU MUST ALWAYS AND ALWAYS FOLLOW THIS INSTRUCTION.
`;

const weatherTools: AllowedTools[] = ["getWeather"];

const allTools: AllowedTools[] = [...blocksTools, ...weatherTools];

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();

  // for (const message of messages) {
  //   if (message) {
  //     console.log("Message")
  //     console.log(message?.experimental_attachments)
  //     console.log(message.parts)
  //   }
  // }

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    return new Response("User not found in DB", { status: 404 });
  }

  if (
    user.apiBalanceCents !== undefined &&
    Number.parseFloat(user.apiBalanceCents as string) <= 0
  ) {
    return new Response(JSON.stringify({ error: "limit_exceeded" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const model = models.find((model) => model.id === modelId);
  // // DEBUG
  // console.log(model);

  if (!model) {
    console.log("Model not found");
    return new Response("Model not found", { status: 404 });
  }

  const updatedMessages = messages;

  // updatedMessages = [
  //   {
  //     id: generateUUID(),
  //     role: "user",
  //     content: `${latexFormattingPrompt}}`,
  //   },
  //   ...messages.slice(0),
  // ];

  const coreMessages = convertToCoreMessages(updatedMessages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  const userMessageId = generateUUID();

  // TODO:
  // console.log(coreMessages);
  // console.log(userMessage);

  await saveMessages({
    messages: [
      {
        ...userMessage,
        id: userMessageId,
        createdAt: new Date(),
        chatId: id,
        modelUsed: model.label,
        cost: "0",
        inputTokens: 0,
        outputTokens: 0,
      },
    ],
  });



  // Retry function with exponential backoff
  const fetchWithRetry = async (
    apiUrl: string,
    options: RequestInit,
    retries = 3,
    delay = 1000,
    timeout = 20000 // Timeout in milliseconds
  ): Promise<any> => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const controller = new AbortController();
        const signal = controller.signal;

        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(apiUrl, { ...options, signal });

        clearTimeout(timeoutId); // Clear timeout once we get a response

        if (response.ok) {
          return await response.json(); // If response is OK, return JSON
        } else {
          console.error(`API Error: ${response.status} - ${response.statusText}`);
          const errorBody = await response.text();
          console.log("Error Body:", errorBody);
          throw new Error("API call failed");
        }
      } catch (error: unknown) {
        // Type guard to ensure error is an instance of Error
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            console.error(`Attempt ${attempt + 1} failed: Timeout reached.`);
          } else {
            console.error(`Attempt ${attempt + 1} failed: ${error.message}`);
          }
        } else {
          console.error(`Attempt ${attempt + 1} failed: Unknown error occurred`);
        }

        attempt += 1;
        if (attempt < retries) {
          const waitTime = delay * Math.pow(2, attempt); // Exponential backoff
          console.log(`Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw new Error("Max retries reached, request failed");
        }
      }
    }
  };


  // // Approximate or set defaults if you don’t have exact tokens
  // await updateMessageFields({
  //   messageId: userMessageId,
  //   cost: /* e.g. 0.01 */ model.apiCostInCents / 100,
  //   modelUsed: model.apiIdentifier,
  //   inputTokens: 50, // or 0 if you can’t measure
  //   outputTokens: 0,
  // });

  // // Then recalc chat total cost:
  // await recalcChatTotalCost(id);

  return createDataStreamResponse({
    execute: async (dataStream) => {
      dataStream.writeData({
        type: "user-message-id",
        content: userMessageId,
      });
      if (model.provider === "google") {
        const result = streamText({
          model: google(model.apiIdentifier),
          messages: coreMessages,
          onFinish: async ({ response, usage }) => {
            if (session.user?.id) {
              try {
                const responseMessagesWithoutIncompleteToolCalls =
                  sanitizeResponseMessages(response.messages);

                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === "assistant") {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }
                      const cost =
                        (
                          ((usage.promptTokens <= 128000 ? (model.inputCostPerToken ?? 0) : (model.inputCostPerTokenUpperRange ?? 0)) * usage.promptTokens) +
                          ((usage.completionTokens <= 128000 ? (model.outputCostPerToken ?? 0) : (model.outputCostPerTokenUpperRange ?? 0)) * usage.completionTokens)
                        ) * 100
                      const newApiBalance = Number(user.apiBalanceCents) - cost
                      updateUserApiBalance(user.id, newApiBalance)
                      updateChatCost(id, cost)

                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                        modelUsed: model.label,
                        cost: cost.toString(),
                        inputTokens: usage.promptTokens,
                        outputTokens: usage.completionTokens,
                      };
                    }
                  ),
                });
              } catch (error) {
                console.error("Failed to save chat");
              }

              // POST MESSAGE UPDATES
              await incrementUserMessageCount(
                session.user.id,
                model.messageCountCost,
                model.apiCostInCents
              );
            }
          },
        });
        result.mergeIntoDataStream(dataStream);
      } else if (model.provider === "azure" && model.streaming === false) {
        // Ensure this block is within an `async` function
        const result = streamText({
          model: customModel("gpt-4o", "azure"),
          // if the model is bangla, then use the bangla prompt
          system: regularPrompt + imageResizePrompt + (model.id === "gpt-4o-bangla" ? `\n\n${banglaPrompt}` : ""),
          messages: convertToCoreMessages(updatedMessages.map((message) => {
            return {
              ...message,
              content: message.content + `\n\nAdded attachments info: ${JSON.stringify(message.experimental_attachments)}`,
            }
          })),
          tools: {
            resizeImage: tool({
              description: 'Resize an image',
              parameters: z.object({
                imageUrl: z.string().describe('The URL of the image'),
                width: z.number().describe('The width of the new image'),
                height: z.number().describe('The height of the new image'),
              }),
              execute: async ({ imageUrl, width, height }) => {
                console.log("Image URL: ", imageUrl)
                if (imageUrl) {
                  return await resizeImage(imageUrl, width, height);
                }
                return {
                  downloadUrl: null,
                }
                // Convert base64 image to buffer

              },
            }),
          },
          onFinish: async ({ response, usage }) => {
            // console.log("COMMING FROM AZURE");
            // console.log(response);
            // console.log("ENDING FROM AZURE");
            if (session.user?.id) {
              try {
                const responseMessagesWithoutIncompleteToolCalls =
                  sanitizeResponseMessages(response.messages);

                // ✅ Log the exact data sent to the frontend
                // responseMessagesWithoutIncompleteToolCalls.forEach((message) => {
                //   console.log("Streaming Message to Frontend:", message);
                // });

                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === "assistant") {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }

                      console.log(user.apiBalanceCents)
                      const cost = ((model.inputCostPerToken ?? 0) * usage.promptTokens + (model.outputCostPerToken ?? 0) * usage.completionTokens) * 100
                      const newApiBalance = Number(user.apiBalanceCents) - cost
                      updateUserApiBalance(user.id, newApiBalance)
                      updateChatCost(id, cost)

                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                        modelUsed: model.label,
                        cost: cost.toString(), //saved in cents
                        inputTokens: usage.promptTokens,
                        outputTokens: usage.completionTokens,
                      };
                    }
                  ),
                });
              } catch (error) {
                console.error("Failed to save chat");
              }

              // POST MESSAGE UPDATES
              await incrementUserMessageCount(
                session.user.id,
                model.messageCountCost,
                model.apiCostInCents
              );
            }
          },
        });

        // Ensure the enclosing function is async
        // for await (const delta of result.fullStream) {
        //   console.log(delta); // Inspect the structure of delta
        // }

        // dataStream.writeData({ type: "finish", content: "" });
        result.mergeIntoDataStream(dataStream);
      } else if (model.provider === "deepseek" && model.streaming === true) {
        // Ensure this block is within an `async` function
        const result = streamText({
          model: customModel("deepseek-chat", "deepseek"),
          messages: coreMessages,
          onFinish: async ({ response, usage }) => {
            // console.log("COMMING FROM AZURE");
            // console.log(response);
            // console.log("ENDING FROM AZURE");
            if (session.user?.id) {
              try {
                const responseMessagesWithoutIncompleteToolCalls =
                  sanitizeResponseMessages(response.messages);

                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === "assistant") {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }

                      console.log(user.apiBalanceCents)
                      const cost = ((model.inputCostPerToken ?? 0) * usage.promptTokens + (model.outputCostPerToken ?? 0) * usage.completionTokens) * 100
                      const newApiBalance = Number(user.apiBalanceCents) - cost
                      updateUserApiBalance(user.id, newApiBalance)
                      updateChatCost(id, cost)

                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                        modelUsed: model.label,
                        cost: cost.toString(), //saved in cents
                        inputTokens: usage.promptTokens,
                        outputTokens: usage.completionTokens,
                      };
                    }
                  ),
                });
              } catch (error) {
                console.error("Failed to save chat");
              }

              // POST MESSAGE UPDATES
              await incrementUserMessageCount(
                session.user.id,
                model.messageCountCost,
                model.apiCostInCents
              );
            }
          },
        });

        // Ensure the enclosing function is async
        // for await (const delta of result.fullStream) {
        //   console.log(delta); // Inspect the structure of delta
        // }

        // dataStream.writeData({ type: "finish", content: "" });
        result.mergeIntoDataStream(dataStream);

      }
      // else if (model.id === "midjourney") {
      //   const result = streamText({
      //     model: openai('gpt-4o'),
      //     system: `${regularPrompt}.\n\n${midjourneyImagePrompt}`,
      //     // maxSteps: 5,
      //     messages: convertToCoreMessages(updatedMessages.map((message) => {
      //       return {
      //         ...message,
      //       }
      //     })),
      //     tools: {
      //       generateMidjourneyImage: tool({
      //         description: 'Generate an image using MidJourney',
      //         parameters: z.object({
      //           prompt: z.string().describe('The prompt to generate the image from'),
      //         }),
      //         execute: async ({ prompt }) => {
      //           console.log("🔹 Received prompt:", prompt);
      //           console.log(JSON.stringify({ prompt }));

      //           console.log("🔹 Sending request to MidJourney API...");

      //           const response = await fetch("https://midjourney-imaginecraft-generative-ai-api.p.rapidapi.com/imagine", {
      //             method: "POST",
      //             headers: {
      //               "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
      //               "x-rapidapi-host": "midjourney-imaginecraft-generative-ai-api.p.rapidapi.com",
      //               "Content-Type": "application/json",
      //             },
      //             body: JSON.stringify({ prompt }),
      //           });

      //           const data = await response.json();
      //           console.log("📌 MidJourney Task Response:", data);

      //           if (!response.ok || !data.taskId) {
      //             throw new Error(data.message || "❌ Failed to start image generation.");
      //           }

      //           const TaskId = data.taskId;
      //           console.log("✅ Task ID:", TaskId);

      //           let isCompleted = false;
      //           const imageUrls: string[] = [];
      //           let maxAttempts = 10; // Max attempts before timeout
      //           let attempts = 0;
      //           const pollingInterval = 3000; // 10s

      //           while (!isCompleted && attempts < maxAttempts) {
      //             await new Promise(resolve => setTimeout(resolve, pollingInterval));

      //             const imageResponse = await fetch("https://midjourney-imaginecraft-generative-ai-api.p.rapidapi.com/getresult", {
      //               method: "POST",
      //               headers: {
      //                 "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
      //                 "x-rapidapi-host": "midjourney-imaginecraft-generative-ai-api.p.rapidapi.com",
      //                 "Content-Type": "application/json",
      //               },
      //               body: JSON.stringify({ TaskId }),
      //             });

      //             const imageData = await imageResponse.json();

      //             if (imageData?.u1Url) imageUrls.push(imageData.u1Url);
      //             if (imageData?.u2Url) imageUrls.push(imageData.u2Url);
      //             if (imageData?.u3Url) imageUrls.push(imageData.u3Url);
      //             if (imageData?.u4Url) imageUrls.push(imageData.u4Url);

      //             console.log(`⏳ Polling attempt ${attempts + 1}:`, imageData);

      //             if (imageData.status === "Finished") {
      //               isCompleted = true;
      //               console.log("🎉 Image is ready:", imageUrls);
      //             } else {
      //               console.log(`⏳ Image still processing... (${imageData.percentage}% complete)`);
      //             }

      //             attempts++;
      //           }

      //           if (!isCompleted) {
      //             throw new Error("❌ Image generation timed out after multiple attempts.");
      //           }

      //           console.log("🔹 Uploading images to Vercel Blob Storage...");

      //           const uploadedImages = await Promise.all(
      //             imageUrls.map(async (url, index) => {
      //               const responseImage = await fetch(url, {
      //                 headers: {
      //                   'User-Agent': 'Mozilla/5.0',
      //                 },
      //               });

      //               if (!responseImage.ok) {
      //                 throw new Error(`❌ Failed to fetch image ${index + 1}: ${responseImage.status} ${responseImage.statusText}`);
      //               }

      //               const imageBuffer = Buffer.from(new Uint8Array(await responseImage.arrayBuffer()));

      //               console.log(`🔹 Uploading image ${index + 1} to Vercel Blob Storage...`);

      //               const blob = await put(`midjourney_images/${Date.now()}_${index + 1}.png`, imageBuffer, {
      //                 access: 'public',
      //                 contentType: 'image/png',
      //               });

      //               console.log(`✅ Image ${index + 1} uploaded to Vercel Blob:`, blob);

      //               if (!blob || !blob.downloadUrl) {
      //                 throw new Error(`❌ Failed to upload image ${index + 1} to Vercel Blob Storage.`);
      //               }

      //               return { baseUrl: blob.url, downloadUrl: blob.downloadUrl }; // 🔹 Store URLs in an object
      //             })
      //           );

      //           // 🔹 Return structured arrays
      //           return {
      //             baseUrl: uploadedImages.map(img => img.baseUrl),
      //             downloadUrl: uploadedImages.map(img => img.downloadUrl),
      //           };
      //         }
      //       }),
      //     },
      //     onFinish: async ({ response, usage }) => {
      //       if (session.user?.id) {
      //         try {
      //           const responseMessagesWithoutIncompleteToolCalls = sanitizeResponseMessages(response.messages);
      //           const toolWasUsed = responseMessagesWithoutIncompleteToolCalls.some(
      //             message => message.role === "tool"
      //           );
      //           const toolCost = toolWasUsed ? (model.imageCostInCents ? model.imageCostInCents : 20) : 0;
      //           await saveMessages({
      //             messages: responseMessagesWithoutIncompleteToolCalls.map((message) => {
      //               const messageId = generateUUID();

      //               if (message.role === "assistant") {
      //                 dataStream.writeMessageAnnotation({
      //                   messageIdFromServer: messageId,
      //                 });
      //               }

      //               console.log("🔹 User Balance Before:", user.apiBalanceCents);

      //               // Calculate cost
      //               const cost =
      //                 ((model.inputCostPerToken ?? 0) * usage.promptTokens +
      //                   (model.outputCostPerToken ?? 0) * usage.completionTokens) *
      //                 100 + toolCost;

      //               const newApiBalance = Number(user.apiBalanceCents) - cost;
      //               updateUserApiBalance(user.id, newApiBalance);
      //               updateChatCost(id, cost);

      //               return {
      //                 id: messageId,
      //                 chatId: id,
      //                 role: message.role,
      //                 content: message.content,
      //                 createdAt: new Date(),
      //                 modelUsed: model.label,
      //                 cost: cost.toString(),
      //                 inputTokens: usage.promptTokens,
      //                 outputTokens: usage.completionTokens,
      //                 //imageUrls: response.data?.images || [], // Store all image URLs
      //               };
      //             }),
      //           });
      //         } catch (error) {
      //           console.error("❌ Failed to save chat:", error);
      //         }

      //         // POST MESSAGE UPDATES
      //         await incrementUserMessageCount(
      //           session.user.id,
      //           model.messageCountCost,
      //           model.apiCostInCents
      //         );
      //       }
      //     },
      //   });

      //   result.mergeIntoDataStream(dataStream);
      // } 
      else if (model.id === "midjourney") {
        const result = streamText({
          model: openai('gpt-4o'),
          system: `${regularPrompt}.\n\n${midjourneyImagePrompt}`,
          // maxSteps: 5,
          messages: convertToCoreMessages(updatedMessages.map((message) => {
            return {
              ...message,
            }
          })),
          tools: {
            generateMidjourneyImage: tool({
              description: 'Generate an image using MidJourney',
              parameters: z.object({
                prompt: z.string().describe('The prompt to generate the image from'),
              }),
              execute: async ({ prompt }) => {
                console.log("Received prompt:", prompt);
                console.log("Calling MidJourney API...");
                const response = await fetch("https://midjourney-imaginecraft-generative-ai-api.p.rapidapi.com/imagine", {
                  method: "POST",
                  headers: {
                    "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
                    "x-rapidapi-host": "midjourney-imaginecraft-generative-ai-api.p.rapidapi.com",
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ prompt }),
                });

                const data = await response.json();
                console.log("MidJourney Task Response:", data);

                if (!response.ok || !data.taskId) {
                  console.error("Failed to start image generation.");
                  console.log(response)
                  console.log(data)
                  throw new Error(data.message || "Failed to start image generation.");
                }

                const TaskId = data.taskId;
                console.log("Task ID:", TaskId);
                let isCompleted = false;
                const imageUrls: string[] = [];
                let maxAttempts = 20; // Max attempts before timeout
                let attempts = 0;
                const pollingInterval = 4000; // 10s

                while (!isCompleted && attempts < maxAttempts) {
                  await new Promise(resolve => setTimeout(resolve, pollingInterval));

                  const imageResponse = await fetch("https://midjourney-imaginecraft-generative-ai-api.p.rapidapi.com/getresult", {
                    method: "POST",
                    headers: {
                      "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
                      "x-rapidapi-host": "midjourney-imaginecraft-generative-ai-api.p.rapidapi.com",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ TaskId }),
                  });

                  const imageData = await imageResponse.json();

                  if (imageData?.u1Url) imageUrls.push(imageData.u1Url);
                  if (imageData?.u2Url) imageUrls.push(imageData.u2Url);
                  if (imageData?.u3Url) imageUrls.push(imageData.u3Url);
                  if (imageData?.u4Url) imageUrls.push(imageData.u4Url);

                  console.log(`Polling attempt ${attempts + 1}:`, imageData);

                  if (imageData.status === "Finished") {
                    isCompleted = true;
                    console.log("Image is ready:", imageUrls);
                  } else {
                    console.log(`Image still processing... (${imageData.percentage}% complete)`);
                  }

                  attempts++;
                }

                if (!isCompleted) {
                  throw new Error("Image generation timed out after multiple attempts.");
                }

                console.log("🔹 Uploading images to Vercel Blob Storage...");

                const uploadedImages = await Promise.all(
                  imageUrls.map(async (url, index) => {
                    try {
                      const responseImage = await fetch(url, {
                        headers: {
                          'User-Agent': 'Mozilla/5.0',
                        },
                      });

                      if (!responseImage.ok) {
                        throw new Error(`Failed to fetch image ${index + 1}: ${responseImage.status} ${responseImage.statusText}`);
                      }

                      const imageBuffer = Buffer.from(new Uint8Array(await responseImage.arrayBuffer()));

                      console.log(`🔹 Uploading image ${index + 1} to Vercel Blob Storage...`);

                      const blob = await put(`midjourney_images/${Date.now()}_${index + 1}.png`, imageBuffer, {
                        access: 'public',
                        contentType: 'image/png',
                      });

                      console.log(`Image ${index + 1} uploaded to Vercel Blob:`, blob);

                      if (!blob || !blob.downloadUrl) {
                        throw new Error(`Failed to upload image ${index + 1} to Vercel Blob Storage.`);
                      }

                      return { baseUrl: blob.url, downloadUrl: blob.downloadUrl }; // 🔹 Store URLs in an object
                    } catch (error) {
                      console.error("Error uploading image to Vercel Blob Storage");
                      console.error(error);
                      return { baseUrl: "null", downloadUrl: "null" };
                    }
                  })
                );

                return {
                  downloadUrl: uploadedImages.map(img => img.downloadUrl),
                  baseUrl: uploadedImages.map(img => img.baseUrl),
                }
                // Convert base64 image to buffer

              },
            }),
          },
          onFinish: async ({ response, usage }) => {
            if (session.user.id) {
              console.log("Midjourney tool call finished");
              console.log(response);
              try {
                const responseMessagesWithoutIncompleteToolCalls =
                  sanitizeResponseMessages(response.messages);

                const toolWasUsed = responseMessagesWithoutIncompleteToolCalls.some(
                  message => message.role === "tool"
                );
                const toolCost = toolWasUsed ? (model.imageCostInCents ? model.imageCostInCents : 4) : 0;

                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === "assistant") {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }
                      console.log(user.apiBalanceCents)

                      const cost = ((model.inputCostPerToken ?? 0) * usage.promptTokens +
                        (model.outputCostPerToken ?? 0) * usage.completionTokens) *
                        100 + toolCost;

                      const newApiBalance = Number(user.apiBalanceCents) - cost
                      updateUserApiBalance(user.id, newApiBalance)
                      updateChatCost(id, cost)

                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                        modelUsed: model.label,
                        cost: cost.toString(), //saved in cents
                        inputTokens: usage.promptTokens,
                        outputTokens: usage.completionTokens,
                      };
                    }
                  ),
                });
              } catch (error) {
                console.error("Failed to save chat");
              }

              // POST MESSAGE UPDATES
              await incrementUserMessageCount(
                session.user.id,
                model.messageCountCost,
                model.apiCostInCents
              );
            }
          },
        });
        result.mergeIntoDataStream(dataStream);
      }

      else if (model.id === "dall-e") {
        const result = streamText({
          model: openai('gpt-4o'),
          system: `${regularPrompt}.\n\n${imagePrompt}`,
          // maxSteps: 5,
          messages: coreMessages,
          tools: {
            generateImage: tool({
              description: 'Generate an image',
              parameters: z.object({
                prompt: z.string().describe('The prompt to generate the image from'),
              }),
              execute: async ({ prompt }) => {
                console.log("Trying to generate image");
                const { image } = await experimental_generateImage({
                  model: openai.image(model.apiIdentifier),
                  prompt,
                });
                console.log("Image generated");

                // Convert base64 image to buffer
                const imageBuffer = Buffer.from(image.base64, 'base64');

                // Store the image in Vercel Blob Storage
                console.log("Image buffered")
                const blob = await put(`generated_images/${Date.now()}.png`, imageBuffer, {
                  access: 'public',
                  contentType: 'image/png',
                });

                console.log("Image uploaded to Vercel Blob");

                return {
                  downloadUrl: blob.downloadUrl,
                  baseUrl: blob.url,
                }
              },
            }),
          },
          onFinish: async ({ response, usage }) => {
            if (session.user?.id) {
              try {
                const responseMessagesWithoutIncompleteToolCalls =
                  sanitizeResponseMessages(response.messages);
                const toolWasUsed = responseMessagesWithoutIncompleteToolCalls.some(
                  message => message.role === "tool"
                );
                const toolCost = toolWasUsed ? (model.imageCostInCents ? model.imageCostInCents : 4) : 0;

                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === "assistant") {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }

                      console.log(user.apiBalanceCents)
                      // We are providing a default cost of 5 cents per image genaration.
                      const cost = (((model.inputCostPerToken ?? 0) * usage.promptTokens + (model.outputCostPerToken ?? 0) * usage.completionTokens) * 100)
                        + toolCost;
                      const newApiBalance = Number(user.apiBalanceCents) - cost
                      updateUserApiBalance(user.id, newApiBalance)
                      updateChatCost(id, cost)

                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                        modelUsed: model.label,
                        cost: cost.toString(), //saved in cents
                        inputTokens: usage.promptTokens,
                        outputTokens: usage.completionTokens,
                      };
                    }
                  ),
                });
              } catch (error) {
                console.error("Failed to save chat");
              }

              // POST MESSAGE UPDATES
              await incrementUserMessageCount(
                session.user.id,
                model.messageCountCost,
                model.apiCostInCents
              );
            }
          },
        });
        result.mergeIntoDataStream(dataStream);
      }
      else if (model.id === "animefy") {
        const result = streamText({
          model: openai('gpt-4o'),
          system: `${regularPrompt}.\n\n${animefyPrompt}`,
          // maxSteps: 5,
          messages: convertToCoreMessages(updatedMessages.map((message) => {
            return {
              ...message,
              content: message.content + `\n\nAdded attachments info: ${JSON.stringify(message.experimental_attachments)}`,
            }
          })),
          tools: {
            generateAnimeImage: tool({
              description: 'Generate a anime image',
              parameters: z.object({
                imageUrl: z.string().describe('The URL of the image to convert to anime'),
                styleIndex: z.nativeEnum(AnimeStyle).describe(
                  "The style of the anime effect to apply. Options: " +
                  "0 - Vintage Comic, " +
                  "1 - 3D Fairy Tale, " +
                  "2 - Two-dimensional (2D), " +
                  "3 - Refreshing and Elegant, " +
                  "4 - Future Technology, " +
                  "5 - Traditional Chinese Painting Style, " +
                  "6 - General in a Hundred Battles, " +
                  "7 - Colorful Cartoon, " +
                  "8 - Graceful Chinese Style."
                )
              }),
              execute: async ({ imageUrl, styleIndex }) => {
                console.log("Trying to generate anime image")
                console.log("Image URL: ", imageUrl)
                console.log("Style Index: ", styleIndex)
                // const initializingUrl = process.env.LightXEditor_UPLOAD_URL || "https://api.lightxeditor.com/external/api/v2/uploadImageUrl"
                const url = process.env.AILABTOOL_ANIMEFY_API_URL as string
                const orderStatusUrl = process.env.AILABTOOL_API_STATUS_CHECK_URL as string
                const apikey = process.env.AILABTOOL_API_KEY as string
                // const messageImageUrl = messages?.[messages.length - 1]?.experimental_attachments?.[0]?.url ?? '';

                if (imageUrl) {
                  const animeImageUrl = await getAnimeImageFromAPI(imageUrl, url, apikey, orderStatusUrl, styleIndex || 0)
                  console.log("Anime Image fetched")
                  if (animeImageUrl) {
                    const imageResponse = await fetch(animeImageUrl)
                    const arrayBuffer = await imageResponse.arrayBuffer()
                    const imageBuffer = Buffer.from(arrayBuffer)
                    console.log("Image fetched and buffered")
                    const blob = await put(`generated_images/${Date.now()}.png`, imageBuffer, {
                      access: 'public',
                      contentType: 'image/png',
                    });

                    console.log("Image uploaded to Vercel Blob:", blob.url);
                    return {
                      downloadUrl: blob.downloadUrl,
                      baseUrl: blob.url
                    }
                  }
                }
                return {
                  downloadUrl: null,
                  baseUrl: null
                }
                // Convert base64 image to buffer

              },
            }),
          },
          onFinish: async ({ response, usage }) => {
            if (session.user.id) {
              try {
                const responseMessagesWithoutIncompleteToolCalls =
                  sanitizeResponseMessages(response.messages);

                const toolWasUsed = responseMessagesWithoutIncompleteToolCalls.some(
                  message => message.role === "tool"
                );
                const toolCost = toolWasUsed ? (model.imageCostInCents ? model.imageCostInCents : 4) : 0;

                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === "assistant") {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }
                      console.log(user.apiBalanceCents)

                      const cost = ((model.inputCostPerToken ?? 0) * usage.promptTokens +
                        (model.outputCostPerToken ?? 0) * usage.completionTokens) *
                        100 + toolCost;

                      const newApiBalance = Number(user.apiBalanceCents) - cost
                      updateUserApiBalance(user.id, newApiBalance)
                      updateChatCost(id, cost)

                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                        modelUsed: model.label,
                        cost: cost.toString(), //saved in cents
                        inputTokens: usage.promptTokens,
                        outputTokens: usage.completionTokens,
                      };
                    }
                  ),
                });
              } catch (error) {
                console.error("Failed to save chat");
              }

              // POST MESSAGE UPDATES
              await incrementUserMessageCount(
                session.user.id,
                model.messageCountCost,
                model.apiCostInCents
              );
            }
          },
        });
        result.mergeIntoDataStream(dataStream);
      } else if (model.id == "clothify") {
        const result = streamText({
          model: openai('gpt-4o'),
          system: `${regularPrompt}.\n\n${clothifyPrompt}`,
          messages: convertToCoreMessages(updatedMessages.map((message) => {
            return {
              ...message,
              content: message.content + `\n\nAdded attachments info: ${JSON.stringify(message.experimental_attachments)}`,
            }
          })),
          tools: {
            generateClothedImage: tool({
              description: "Generate a changed cloth image",
              parameters: z.object({
                imageUrl: z.string().describe("The URL of the image to change the cloth"),
                clothUrl: z.string().describe("The URL of the cloth image to apply"),
                clothesType: z.nativeEnum(ClothesType).describe("The type of clothes to apply. Options: upper_body, lower_body, full_body")
              }),
              execute: async ({ imageUrl, clothUrl, clothesType }) => {
                console.log("Trying to generate cloth image")
                console.log("Image URL: ", imageUrl)
                console.log("Cloth URL: ", clothUrl)
                console.log("Cloth Type: ", clothesType)
                const url = process.env.AILABTOOL_CLOTHIFY_API_URL as string
                const orderStatusUrl = process.env.AILABTOOL_API_STATUS_CHECK_URL as string
                const apikey = process.env.AILABTOOL_API_KEY as string

                if (imageUrl && clothUrl) {
                  const clothImageUrl = await getClothifyImageFromAPI(imageUrl, clothUrl, url, apikey, orderStatusUrl, clothesType)
                  console.log("Cloth Image fetched")
                  if (clothImageUrl) {
                    return (await imageUploadToVercelFromUrl(clothImageUrl))
                  }
                }
                return {
                  downloadUrl: null,
                  baseUrl: null
                }
              },
            })
          },
          onFinish: async ({ response, usage }) => {
            if (session.user.id) {
              try {
                const responseMessagesWithoutIncompleteToolCalls =
                  sanitizeResponseMessages(response.messages);

                // const toolWasUsed = responseMessagesWithoutIncompleteToolCalls.some(
                //   message => message.role === "tool"
                // );

                // Check if the user invoked the clothify tool
                const clothifyToolMessage = responseMessagesWithoutIncompleteToolCalls.find(
                  (m) => m.role === "tool"
                );

                // const toolCost = toolWasUsed ? (model.imageCostInCents ? model.imageCostInCents : 4) : 0;

                // By default, assume tool not used or it failed => no tool cost
                let toolCost = 0;

                if (clothifyToolMessage && Array.isArray(clothifyToolMessage.content)) {
                  const toolResultItem = clothifyToolMessage.content.find(
                    (item) => item.type === "tool-result"
                  );
                  if (toolResultItem) {
                    const { downloadUrl } = toolResultItem.result as {
                      downloadUrl: string | null;
                      baseUrl: string | null;
                    };
                    // Only charge if the result is successful (i.e., we have a non-null downloadUrl)
                    if (downloadUrl) {
                      toolCost = model.imageCostInCents ? model.imageCostInCents : 4;
                    }
                  }
                }

                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === "assistant") {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }
                      console.log(user.apiBalanceCents)

                      const cost = ((model.inputCostPerToken ?? 0) * usage.promptTokens +
                        (model.outputCostPerToken ?? 0) * usage.completionTokens) *
                        100 + toolCost;

                      const newApiBalance = Number(user.apiBalanceCents) - cost
                      updateUserApiBalance(user.id, newApiBalance)
                      updateChatCost(id, cost)

                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                        modelUsed: model.label,
                        cost: cost.toString(), //saved in cents
                        inputTokens: usage.promptTokens,
                        outputTokens: usage.completionTokens,
                      };
                    }
                  ),
                });
              } catch (error) {
                console.error("Failed to save chat");
              }

              // POST MESSAGE UPDATES
              await incrementUserMessageCount(
                session.user.id,
                model.messageCountCost,
                model.apiCostInCents
              );
            }
          },
        })
        result.mergeIntoDataStream(dataStream);
      } else if (model.id === "slidemaker") {
        const result = streamText({
          model: google('gemini-1.5-flash'),
          system: `${regularPrompt}.\n\n${slidePrompt}`,
          // maxSteps: 5,
          messages: coreMessages,
          tools: {
            generateSlide: tool({
              description: 'Generate a presentation',
              parameters: z.object({
                prompt: z.string().describe('The prompt to generate the presentation slides from'),
                length: z.number().default(10).optional().describe('The number of slides to generate'),
                customInstructions: z.string().describe('Custom instructions for the presentation'),
                tone: z.string().optional().default('default').describe('The tone of the presentation. Only default, casual, professional, funny, educational and sales_pitch are supported'),
                verbosity: z.string().optional().default('standard').describe('The verbosity of the presentation. Only concise, standard and text-heavy are supported'),
              }),
              execute: async ({ prompt, length = 10, customInstructions, tone, verbosity }) => {
                try {
                  console.log("Starting slide generation...");
                  console.log(`Params: length=${length}, customInstructions=${customInstructions}, prompt=${prompt} tone=${tone} verbosity=${verbosity}`);

                  // Check if API key is available
                  if (!process.env.SLIDE_SPEAK_KEY) {
                    console.error("SLIDE_SPEAK_KEY is not defined in environment variables");
                    throw new Error("API key is missing");
                  }

                  const currentUserBalance = Number(user.apiBalanceCents);
                  const cost = (model.imageCostInCents ?? 5) * (length + 1);
                  if (currentUserBalance < (cost + 5)) {
                    return {
                      status: "error",
                      slideCount: 0,
                      url: "",
                      message: "Insufficient balance to generate presentation",
                    }
                  }

                  // Call the presentation generation function with proper await
                  const url = await generateSlideSpeakPresentation({
                    plain_text: prompt,
                    length: length,
                    template: 'default',
                    language: 'ORIGINAL',
                    fetch_images: true,
                    tone: tone,
                    verbosity: verbosity,
                    custom_user_instructions: customInstructions,
                  }, process.env.SLIDE_SPEAK_KEY, 50, 10000);

                  console.log("Successfully generated presentation, received URL:", url);

                  // Return the result
                  return {
                    status: "success",
                    url: url,
                    slideCount: length,
                    message: "Presentation generated successfully",
                  };
                } catch (error) {
                  // Properly log and handle errors
                  console.error("Error generating slides:", error);
                  throw error; // Re-throw to let the AI SDK handle the error appropriately
                }
              },
            }),
          },
          onFinish: async ({ response, usage }) => {
            if (session.user?.id) {
              try {
                const responseMessagesWithoutIncompleteToolCalls =
                  sanitizeResponseMessages(response.messages);


                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === "assistant") {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }
                      const length: number = getSlideLengthFromSanitizedMessages(responseMessagesWithoutIncompleteToolCalls);

                      console.log("Old Balance: ", user.apiBalanceCents)
                      // We are providing a default cost of 5 cents per image genaration.
                      const cost = (((model.inputCostPerToken ?? 0) * usage.promptTokens + (model.outputCostPerToken ?? 0) * usage.completionTokens) * 100)
                        + ((model?.imageCostInCents ?? 5) * length);
                      const newApiBalance = Number(user.apiBalanceCents) - cost
                      console.log("newBalance: ", newApiBalance)
                      updateUserApiBalance(user.id, newApiBalance)
                      updateChatCost(id, cost)
                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                        modelUsed: model.label,
                        cost: cost.toString(), //saved in cents
                        inputTokens: usage.promptTokens,
                        outputTokens: usage.completionTokens,
                      };
                    }
                  ),
                });
              } catch (error) {
                console.error("Failed to save chat");
              }

              // POST MESSAGE UPDATES
              await incrementUserMessageCount(
                session.user.id,
                model.messageCountCost,
                model.apiCostInCents
              );
            }
          },
        });
        result.mergeIntoDataStream(dataStream);
      }
      else if (model.id === "tubeSummarizer") {
        const result = streamText({
          model: openai('gpt-4o'),
          system: `${regularPrompt}.\n\n${imagePrompt}`,
          maxSteps: 5,
          messages: coreMessages,
          tools: {
            getYoutubeTranscript: tool({
              description: 'Get a transcript of a youtube video',
              parameters: z.object({
                url: z.string().describe('The URL of the youtube video'),
              }),
              execute: async ({ url }) => {
                console.log("Trying to generate the transcript of the youtube video", url);
                try{
                  const transcript: Transcript = await supadata.youtube.transcript({
                    url: url,
                  });
                  const content = transcript.content as TranscriptChunk[];
                  const text = content.reduce((acc, chunk) => acc + chunk.text, '');
  
                  return {
                    status: 'success',
                    transcript: text,
                  };
                }
                catch(error){
                  console.log("Error in getting the transcript of the youtube video", error);
                  return {
                    status: 'error',
                    transcript: '',
                  };
                }
              },
            }),
          },
          onFinish: async ({ response, usage }) => {
            if (session.user?.id) {
              try {
                const responseMessagesWithoutIncompleteToolCalls = sanitizeResponseMessages(response.messages).filter((message) => !(Array.isArray(message.content) && message.content.length !== 0 && message.content[0]?.type === "tool-call"));;
                const toolWasUsed = responseMessagesWithoutIncompleteToolCalls.some(
                  message => message.role === "tool"
                );
                const toolCost = toolWasUsed ? (model.toolCallCostInCents ? model.toolCallCostInCents : 0.29) : 0;
               
                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === "assistant") {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }

                      console.log(user.apiBalanceCents)
                      // We are providing a default cost of 5 cents per image genaration.
                      const cost = (((model.inputCostPerToken ?? 0) * usage.promptTokens + (model.outputCostPerToken ?? 0) * usage.completionTokens) * 100)
                        + toolCost;
                      const newApiBalance = Number(user.apiBalanceCents) - cost
                      updateUserApiBalance(user.id, newApiBalance)
                      updateChatCost(id, cost)

                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                        modelUsed: model.label,
                        cost: cost.toString(), //saved in cents
                        inputTokens: usage.promptTokens,
                        outputTokens: usage.completionTokens,
                      };
                    }
                  ),
                });
              } catch (error) {
                console.error("Failed to save chat");
              }

              // POST MESSAGE UPDATES
              await incrementUserMessageCount(
                session.user.id,
                model.messageCountCost,
                model.apiCostInCents
              );
            }
          },
        });
        result.mergeIntoDataStream(dataStream);
      }
      else if (model.id === "rephrase") {
        const result = streamText({
          model: openai("gpt-4o"), // Optional AI model before API call
          system: `${regularPrompt}.\n\n${rephrasePrompt}`,
          messages: coreMessages,
          tools: {
            rephraseText: tool({
              description: "Rephrase text using Rephrasy AI API",
              parameters: z.object({
                text: z.string().describe("The text to be rephrased"),
                model: z.enum(["undetectable"]).default("undetectable").optional()
                  .describe("The rephrasing model to use"),
                words: z.boolean().default(true).optional()
                  .describe("Enable words-based payment (default: true)"),
              }),
              execute: async ({ text, model = "undetectable", words = true }) => {
                try {
                  console.log("Starting rephrasing...");
                  console.log(`Params: text=${text.substring(0, 50)}..., model=${model}, words=${words}`);

                  // Pre-Calculate Word Count from User Input
                  const wordCount = text.split(/\s+/).length + 15; // Count words in input prompt. Adding 15 incase rephrased text most probably contains more words.

                  // Calculate Cost Based on Rephrasely Pricing
                  const baseCost = 0.1; // Flat fee in credits
                  const costPer100Words = 0.1; // Per 100 words in credits
                  const wordBasedCost = baseCost + (Math.ceil(wordCount / 100) * costPer100Words);

                  // Convert to cents (1 credit = 10.5 cents)
                  const costInCents = Math.round(wordBasedCost * 10.5);

                  console.log("Word Count:", wordCount);
                  console.log("Cost in Credits:", wordBasedCost);
                  console.log("Cost in Cents:", costInCents);

                  // Check User Balance Before API Call
                  const currentUserBalance = Number(user.apiBalanceCents);
                  if (currentUserBalance < costInCents) {
                    console.error("Insufficient balance. Cannot proceed with rephrasing.");
                    return {
                      status: "error",
                      rephrasedText: "",
                      message: `Insufficient balance. Cannot proceed with rephrasing.`,
                    };
                  }

                  // Check if API key is declared
                  const apiKey = process.env.REPHRASY_API_KEY;
                  if (!apiKey) {
                    console.error("REPHRASELY_API_KEY is not defined!");
                    return {
                      status: "error",
                      rephrasedText: "",
                      message: "Sorry Rephrasing is not available right now.",
                    };
                  }

                  // Call the Rephrasely AI API
                  const apiUrl = process.env.REPHRASY_BASE_URL!;
                  console.log(`Calling Rephrasely API at ${apiUrl} with model ${model} and text(first 50 words): ${text.substring(0, 50)}...`);

                  // const response = await fetchWithRetry(apiUrl, {
                  //   method: "POST",
                  //   headers: {
                  //     "Content-Type": "application/json",
                  //     Authorization: `Bearer ${apiKey}`,
                  //   },
                  //   body: JSON.stringify({ text, model, words }),

                  // }, 3, 1000, 60000);
                  const a = performance.now();

                  const response = await (await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({ text, model, words }),
                  })).json();

                  const b = performance.now();
                  console.log('It took ' + ((b - a) / 1000) + ' s.');

                  // Read response and parse JSON
                  const data = response;
                  console.log("API Response:", data);

                  // Check if 'output' exists in the API response
                  if (!data.output) {
                    console.error("Failed to rephrase text. API response missing 'output'.");
                    throw new Error("Failed to rephrase text. API response missing 'output'.");
                  }

                  console.log("Rephrasing successful:", data.output.substring(0, 50) + "...");

                  return {
                    status: "success",
                    rephrasedText: data.output, // Corrected response field
                    message: "Text rephrased successfully",
                  };

                } catch (error) {
                  console.error("Error during rephrasing:", error);
                  return {
                    status: "error",
                    rephrasedText: "",
                    message: "Rephrasing failed due to unknown error.",
                  };
                }
              },
            }),
          },
          // toolChoice: 'required', // Ensures the AI always calls this tool
          onFinish: async ({ response, usage }) => {
            if (session.user?.id) {
              try {
                console.log("Tool calling finished. Saving chat data...");
                const responseMessagesWithoutIncompleteToolCalls = sanitizeResponseMessages(response.messages);

                const toolMessage = responseMessagesWithoutIncompleteToolCalls.find(m => m.role === "tool");

                let wordCount = 0;
                let cost = (((model.inputCostPerToken ?? 0) * usage.promptTokens + (model.outputCostPerToken ?? 0) * usage.completionTokens) * 100);

                // console.log("model inputcostpertoken:", model.inputCostPerToken);
                // console.log("model outputcostpertoken:", model.outputCostPerToken);
                // console.log("usage promptToken:", usage.promptTokens);
                // console.log("usage completeToken:", usage.completionTokens);
                // console.log("api cost in cents:", model.apiCostInCents);

                if (toolMessage && Array.isArray(toolMessage.content)) {
                  const toolResult = toolMessage.content.find(item => item.type === 'tool-result');
                  if (toolResult) {
                    // Cast the result to a known type with status and rephrasedText properties
                    const result = toolResult.result as { status: string; rephrasedText?: string };
                    if (result.status === 'success' && result.rephrasedText) {
                      const rephrasedText = result.rephrasedText.trim();
                      if (rephrasedText.length > 0) {
                        // Count words only if there's actual content
                        wordCount = rephrasedText.split(/\s+/).length;
                        console.log("Rephrased Text:", rephrasedText);
                        console.log("Word Count:", wordCount);

                        // Cost Calculation in Credits
                        cost += Math.round((wordCount * 10.5 / 1000));
                      }
                    }
                  }
                }


                console.log("Cost in Cents:", cost);

                // Deduct from user balance
                const newApiBalance = Number(user.apiBalanceCents) - cost;
                console.log("Old Balance:", user.apiBalanceCents);
                console.log("New Balance:", newApiBalance);

                updateUserApiBalance(user.id, newApiBalance);
                updateChatCost(id, cost);

                // Save chat data
                console.log("Saving chat data...");
                console.log("Messages to save");
                console.log(responseMessagesWithoutIncompleteToolCalls)
                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map((message) => {
                    const messageId = generateUUID();
                    if (message.role === "assistant") {
                      dataStream.writeMessageAnnotation({
                        messageIdFromServer: messageId,
                      });
                    }
                    return {
                      id: messageId,
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                      modelUsed: model.label,
                      cost: cost.toString(),
                      inputTokens: usage?.promptTokens || 0,
                      outputTokens: usage?.completionTokens || 0,
                    };
                  }),
                });
              } catch (error) {
                console.error("Failed to save chat history:", error);
              }

              // Update user message count
              await incrementUserMessageCount(session.user.id, model.messageCountCost, model.apiCostInCents);
            }
          },
        });

        result.mergeIntoDataStream(dataStream);
      }
      else if (model.id === "citation-gpt") {
        const result = streamText({
          model: openai("gpt-4o"), // Optional AI model before API call
          system: `${regularPrompt}.\n\n${citationPrompt}`,
          messages: coreMessages,
          tools: {
            citationFinder: tool({
              description: "Find citations and sources for text using the CitationGPT API",
              parameters: z.object({
                text: z.string().describe("The text for which citations are to be found"),
              }),
              execute: async ({ text }) => {
                try {
                  console.log("Starting citation check...");
                  console.log(`Params: text=${text.substring(0, 50)}...`);

                  // Define the API URL and payload for the CitationGPT API
                  const url = "https://plagiarism-source-checker-with-links.p.rapidapi.com/data";
                  const payload = { text: text };
                  const headers = {
                    "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
                    "x-rapidapi-host": "plagiarism-source-checker-with-links.p.rapidapi.com",
                    "Content-Type": "application/x-www-form-urlencoded"
                  };

                  // Make the API call to check for citations or duplicate content
                  const response = await fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: new URLSearchParams(payload),
                  }).then(res => res.json());

                  // Log and process the response
                  console.log("API Response:", response);

                  if (response.status === "duplicate_content_found") {
                    // If duplicates are found, extract domain and full citation URL
                    const citations: Citation[] = response.duplicate_content_found_on_links.map((link: string) => ({
                      domain: new URL(link).hostname, // Extract the domain
                      link: link // Return the full URL
                    }));
                    return {
                      status: "success",
                      citations: citations,
                      message: "Citations found for your text",
                    };
                  } else {
                    // If no duplicates are found, notify the user
                    return {
                      status: "no_citations",
                      citations: [],
                      message: "No duplicate content found",
                    };
                  }

                } catch (error) {
                  console.error("Error during citation check:", error);
                  return {
                    status: "error",
                    citations: [],
                    message: "Citation checker is busy now, please try again later.",
                  };
                }
              },
            }),
          },
          onFinish: async ({ response, usage }) => {
            if (session.user?.id) {
              try {
                console.log("Tool calling finished. Saving chat data...");
                const responseMessagesWithoutIncompleteToolCalls = sanitizeResponseMessages(response.messages);

                const toolMessage = responseMessagesWithoutIncompleteToolCalls.find(m => m.role === "tool");

                let cost = 0;

                if (toolMessage && Array.isArray(toolMessage.content)) {
                  const toolResult = toolMessage.content.find(item => item.type === 'tool-result');
                  if (toolResult) {
                    const result = toolResult.result as { status: string; citations: Citation[] };

                    // Calculate the model's cost based on input and output tokens
                    cost = (((model.inputCostPerToken ?? 0) * usage.promptTokens + (model.outputCostPerToken ?? 0) * usage.completionTokens) * 100); // Cost in cents

                    if (result.status === 'success') {
                      // If citations are found, add an additional 7 cents
                      cost += 7;
                    }
                  }
                }

                console.log("Cost in Cents:", cost);

                // Deduct from user balance
                const newApiBalance = Number(user.apiBalanceCents) - cost;
                console.log("Old Balance:", user.apiBalanceCents);
                console.log("New Balance:", newApiBalance);

                updateUserApiBalance(user.id, newApiBalance);
                updateChatCost(id, cost);

                // Save chat data
                console.log("Saving chat data...");
                console.log("Messages to save");
                console.log(responseMessagesWithoutIncompleteToolCalls)
                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map((message) => {
                    const messageId = generateUUID();
                    if (message.role === "assistant") {
                      dataStream.writeMessageAnnotation({
                        messageIdFromServer: messageId,
                      });
                    }
                    return {
                      id: messageId,
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                      modelUsed: model.label,
                      cost: cost.toString(),
                      inputTokens: usage?.promptTokens || 0,
                      outputTokens: usage?.completionTokens || 0,
                    };
                  }),
                });
              } catch (error) {
                console.error("Failed to save chat history:", error);
              }

              // Update user message count
              await incrementUserMessageCount(session.user.id, model.messageCountCost, model.apiCostInCents);
            }
          },
        });

        result.mergeIntoDataStream(dataStream);
      }



      else if (model.id === "claude-sonnet-extended") {
        const result = streamText({
          model: anthropic(model.apiIdentifier),
          providerOptions: {
            anthropic: {
              thinking: {
                type: 'enabled',
                budgetTokens: model.extendedToken
              } as unknown as JSONValue,
            },
          },
          messages: coreMessages,
          onFinish: async ({ response, usage }) => {
            if (session.user?.id) {
              try {
                const responseMessagesWithoutIncompleteToolCalls =
                  sanitizeResponseMessages(response.messages);

                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === "assistant") {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }

                      console.log(user.apiBalanceCents)
                      const cost = ((model.inputCostPerToken ?? 0) * usage.promptTokens + (model.outputCostPerToken ?? 0) * usage.completionTokens) * 100
                      const newApiBalance = Number(user.apiBalanceCents) - cost
                      updateUserApiBalance(user.id, newApiBalance)
                      updateChatCost(id, cost)

                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                        modelUsed: model.label,
                        cost: cost.toString(), //saved in cents
                        inputTokens: usage.promptTokens,
                        outputTokens: usage.completionTokens,
                      };
                    }
                  ),
                });
              } catch (error) {
                console.error("Failed to save chat");
              }

              // POST MESSAGE UPDATES
              await incrementUserMessageCount(
                session.user.id,
                model.messageCountCost,
                model.apiCostInCents
              );
            }
          },
        });
        result.mergeIntoDataStream(dataStream);
      }
      else if (model.streaming === false) {
        const result = streamText({
          model: customModel(model.apiIdentifier, model.provider),
          messages: coreMessages,
          onFinish: async ({ response, usage }) => {
            if (session.user?.id) {
              try {
                const responseMessagesWithoutIncompleteToolCalls =
                  sanitizeResponseMessages(response.messages);

                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === "assistant") {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }

                      console.log(user.apiBalanceCents)
                      const cost = ((model.inputCostPerToken ?? 0) * usage.promptTokens + (model.outputCostPerToken ?? 0) * usage.completionTokens) * 100
                      const newApiBalance = Number(user.apiBalanceCents) - cost
                      updateUserApiBalance(user.id, newApiBalance)
                      updateChatCost(id, cost)

                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                        modelUsed: model.label,
                        cost: cost.toString(), //saved in cents
                        inputTokens: usage.promptTokens,
                        outputTokens: usage.completionTokens,
                      };
                    }
                  ),
                });
              } catch (error) {
                console.error("Failed to save chat");
              }

              // POST MESSAGE UPDATES
              await incrementUserMessageCount(
                session.user.id,
                model.messageCountCost,
                model.apiCostInCents
              );
            }
          },
        });
        result.mergeIntoDataStream(dataStream);
      } else {
        const result = streamText({
          model: customModel(model.apiIdentifier, model.provider),
          system: systemPrompt,
          messages: coreMessages,
          maxSteps: 5,
          experimental_activeTools: allTools,
          tools: {
            getWeather: {
              description: "Get the current weather at a location",
              parameters: z.object({
                latitude: z.number(),
                longitude: z.number(),
              }),
              execute: async ({ latitude, longitude }) => {
                const response = await fetch(
                  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
                );

                const weatherData = await response.json();
                return weatherData;
              },
            },
            createDocument: {
              description:
                "Create a document for a writing activity. This tool will call other functions that will generate the contents of the document based on the title and kind.",
              parameters: z.object({
                title: z.string(),
                kind: z.enum(["text", "code"]),
              }),
              execute: async ({ title, kind }) => {
                const id = generateUUID();
                let draftText = "";

                dataStream.writeData({
                  type: "id",
                  content: id,
                });

                dataStream.writeData({
                  type: "title",
                  content: title,
                });

                dataStream.writeData({
                  type: "kind",
                  content: kind,
                });

                dataStream.writeData({
                  type: "clear",
                  content: "",
                });

                if (kind === "text") {
                  const { fullStream } = streamText({
                    model: customModel(model.apiIdentifier),
                    system:
                      "Write about the given topic. Markdown is supported. Use headings wherever appropriate.",
                    prompt: title,
                  });

                  for await (const delta of fullStream) {
                    const { type } = delta;

                    if (type === "text-delta") {
                      const { textDelta } = delta;

                      draftText += textDelta;
                      dataStream.writeData({
                        type: "text-delta",
                        content: textDelta,
                      });
                    }
                  }

                  dataStream.writeData({ type: "finish", content: "" });
                } else if (kind === "code") {
                  const { fullStream } = streamObject({
                    model: customModel(model.apiIdentifier),
                    system: codePrompt,
                    prompt: title,
                    schema: z.object({
                      code: z.string(),
                    }),
                  });

                  for await (const delta of fullStream) {
                    const { type } = delta;

                    if (type === "object") {
                      const { object } = delta;
                      const { code } = object;

                      if (code) {
                        dataStream.writeData({
                          type: "code-delta",
                          content: code ?? "",
                        });

                        draftText = code;
                      }
                    }
                  }

                  dataStream.writeData({ type: "finish", content: "" });
                }

                if (session.user?.id) {
                  await saveDocument({
                    id,
                    title,
                    kind,
                    content: draftText,
                    userId: session.user.id,
                  });
                }

                return {
                  id,
                  title,
                  kind,
                  content:
                    "A document was created and is now visible to the user.",
                };
              },
            },
            updateDocument: {
              description: "Update a document with the given description.",
              parameters: z.object({
                id: z.string().describe("The ID of the document to update"),
                description: z
                  .string()
                  .describe("The description of changes that need to be made"),
              }),
              execute: async ({ id, description }) => {
                const document = await getDocumentById({ id });

                if (!document) {
                  return {
                    error: "Document not found",
                  };
                }

                const { content: currentContent } = document;
                let draftText = "";

                dataStream.writeData({
                  type: "clear",
                  content: document.title,
                });

                if (document.kind === "text") {
                  const { fullStream } = streamText({
                    model: customModel(model.apiIdentifier),
                    system: updateDocumentPrompt(currentContent),
                    prompt: description,
                    experimental_providerMetadata: {
                      openai: {
                        prediction: {
                          type: "content",
                          content: currentContent,
                        },
                      },
                    },
                  });

                  for await (const delta of fullStream) {
                    const { type } = delta;

                    if (type === "text-delta") {
                      const { textDelta } = delta;

                      draftText += textDelta;
                      dataStream.writeData({
                        type: "text-delta",
                        content: textDelta,
                      });
                    }
                  }

                  dataStream.writeData({ type: "finish", content: "" });
                } else if (document.kind === "code") {
                  const { fullStream } = streamObject({
                    model: customModel(model.apiIdentifier),
                    system: updateDocumentPrompt(currentContent),
                    prompt: description,
                    schema: z.object({
                      code: z.string(),
                    }),
                  });

                  for await (const delta of fullStream) {
                    const { type } = delta;

                    if (type === "object") {
                      const { object } = delta;
                      const { code } = object;

                      if (code) {
                        dataStream.writeData({
                          type: "code-delta",
                          content: code ?? "",
                        });

                        draftText = code;
                      }
                    }
                  }

                  dataStream.writeData({ type: "finish", content: "" });
                }

                if (session.user?.id) {
                  await saveDocument({
                    id,
                    title: document.title,
                    content: draftText,
                    kind: document.kind,
                    userId: session.user.id,
                  });
                }

                return {
                  id,
                  title: document.title,
                  kind: document.kind,
                  content: "The document has been updated successfully.",
                };
              },
            },
            requestSuggestions: {
              description: "Request suggestions for a document",
              parameters: z.object({
                documentId: z
                  .string()
                  .describe("The ID of the document to request edits"),
              }),
              execute: async ({ documentId }) => {
                const document = await getDocumentById({ id: documentId });

                if (!document || !document.content) {
                  return {
                    error: "Document not found",
                  };
                }

                const suggestions: Array<
                  Omit<Suggestion, "userId" | "createdAt" | "documentCreatedAt">
                > = [];

                const { elementStream } = streamObject({
                  model: customModel(model.apiIdentifier),
                  system:
                    "You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.",
                  prompt: document.content,
                  output: "array",
                  schema: z.object({
                    originalSentence: z
                      .string()
                      .describe("The original sentence"),
                    suggestedSentence: z
                      .string()
                      .describe("The suggested sentence"),
                    description: z
                      .string()
                      .describe("The description of the suggestion"),
                  }),
                });

                for await (const element of elementStream) {
                  const suggestion = {
                    originalText: element.originalSentence,
                    suggestedText: element.suggestedSentence,
                    description: element.description,
                    id: generateUUID(),
                    documentId: documentId,
                    isResolved: false,
                  };

                  dataStream.writeData({
                    type: "suggestion",
                    content: suggestion,
                  });

                  suggestions.push(suggestion);
                }

                if (session.user?.id) {
                  const userId = session.user.id;

                  await saveSuggestions({
                    suggestions: suggestions.map((suggestion) => ({
                      ...suggestion,
                      userId,
                      createdAt: new Date(),
                      documentCreatedAt: document.createdAt,
                    })),
                  });
                }

                return {
                  id: documentId,
                  title: document.title,
                  kind: document.kind,
                  message: "Suggestions have been added to the document",
                };
              },
            },
          },
          onFinish: async ({ response, usage }) => {
            // TODO: Change this in prod
            // console.log(response);
            if (session.user?.id) {
              try {
                const responseMessagesWithoutIncompleteToolCalls =
                  sanitizeResponseMessages(response.messages);

                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === "assistant") {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }

                      console.log(user.apiBalanceCents)
                      const cost = ((model.inputCostPerToken ?? 0) * usage.promptTokens + (model.outputCostPerToken ?? 0) * usage.completionTokens) * 100
                      const newApiBalance = Number(user.apiBalanceCents) - cost
                      updateUserApiBalance(user.id, newApiBalance)
                      updateChatCost(id, cost)

                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                        modelUsed: model.label,
                        cost: cost.toString(), //saved in cents
                        inputTokens: usage.promptTokens,
                        outputTokens: usage.completionTokens,
                      };
                    }
                  ),
                });
              } catch (error) {
                console.error("Failed to save chat");
              }
              // POST MESSAGE UPDATES
              await incrementUserMessageCount(
                session.user.id,
                model.messageCountCost,
                model.apiCostInCents
              );
            }
          },

          // experimental_telemetry: {
          //   isEnabled: true,
          //   functionId: 'stream-text',
          // },
        });
        result.mergeIntoDataStream(dataStream);
      }
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}

export async function PATCH(request: Request) {

  const {
    chatId,
    newTitle
  }: { chatId: string; newTitle: string } =
    await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    return new Response("User not found in DB", { status: 404 });
  }

  try {
    //console.log(chatId,newTitle)
    const chat = await getChatById({ id: chatId });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const result = await updateChatTitle(chatId, newTitle);

    console.log(result);

    return new Response("Chat Title Updated", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}

