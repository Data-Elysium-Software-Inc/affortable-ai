import { openai } from "@ai-sdk/openai";
import {
  wrapLanguageModel,
  extractReasoningMiddleware,
} from "ai";
import { createAzure } from "@ai-sdk/azure";
import { customMiddleware } from "./custom-middleware";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
// import { createAnthropic } from "@ai-sdk/anthropic";

import { createDeepSeek } from '@ai-sdk/deepseek';

const deepseek = createDeepSeek({
  apiKey: process.env.AZURE_DEEPSEEK_API_KEY,
  baseURL: process.env.AZURE_DEEPSEEK_BASE_URL,
});

// Validate environment variables
const AZURE_RESOURCE_NAME = process.env.AZURE_RESOURCE_NAME;
const AZURE_API_KEY = process.env.AZURE_API_KEY;
const AZURE_DEPLOYMENT_NAME = process.env.AZURE_DEPLOYMENT_NAME;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!AZURE_RESOURCE_NAME || !AZURE_API_KEY || !AZURE_DEPLOYMENT_NAME ) {
  throw new Error(
    "Missing required Azure environment variables. Please ensure variables are set."
  );
}

// const rapid = createOpenAICompatible({
//   name: "Rapid API",
//   // MUST CHANGE LATER
//   headers: {
//     "X-RapidAPI-Key": "",
//   },
//   baseURL: "https://swift-ai.p.rapidapi.com",
// });

// Create Azure provider instance
const azure = createAzure({
  resourceName: AZURE_RESOURCE_NAME, // Azure resource name
  apiKey: AZURE_API_KEY, // Azure API key
  apiVersion: process.env.AZURE_API_VERSION, // Default API version
});

export const azureO = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME_O,
  apiKey: process.env.AZURE_API_KEY_O,
  apiVersion: process.env.AZURE_API_VERSION_O,
})
// const anthropic = createAnthropic({
//   apiKey: ANTHROPIC_API_KEY,
// });

// Export custom model wrapper
export const customModel = (apiIdentifier: string, provider?: string) => {
  // if (provider === "rapid") {
  //   console.log("Using Rapid provider ");
  //   return wrapLanguageModel({
  //     model: rapid(apiIdentifier),
  //     middleware: customMiddleware,
  //   });
  // }
  if (provider === "anthropic") {
    console.log("Using Anthropic Provider");
    return wrapLanguageModel({
      model: anthropic(apiIdentifier),
      middleware: customMiddleware,
    });
  }
  if (provider === "google") {
    console.log("Using Google Provider");
    return wrapLanguageModel({
      model: google(apiIdentifier),
      middleware: customMiddleware,
    });
  }

  if (provider === "azure") {
    console.log("Using Azure provider ");
    if(apiIdentifier === "o1" || apiIdentifier === "o3-mini"){
      console.log("Azure resource name: ", process.env.AZURE_RESOURCE_NAME_O);
      return wrapLanguageModel({
        model: azureO(apiIdentifier),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      });
    }

    console.log("Azure resource name: ", AZURE_RESOURCE_NAME);
    return wrapLanguageModel({
      model: azure(apiIdentifier),
      middleware: customMiddleware,
    });
  }

  if (provider === "deepseek") {
    console.log("Using Deepseek-Azure provider ");
    return wrapLanguageModel({
      model: deepseek(apiIdentifier),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    });
  }

  console.log("Using OpenAI provider");
  return wrapLanguageModel({
    model: openai(apiIdentifier),
    middleware: customMiddleware,
  });
};


//this line has no meaning in life
