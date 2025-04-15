export enum ModelCategory {
  GENERAL = "General",
  SPECIALIZED = "Specialized",
  IMAGE_GENERATION = "Image Generation",
  TEXT_REPHRASING = "Text Rephrasing",
  SPEECH_TO_TEXT = "Speech to Text",
  PRESENTATION = "Presentation",
  LANGUAGE_SPECIFIC = "Language Specific",
}

export interface GuideLine {
  title: string;
  description: string;
}

export type AditionalModeInfo = {
  guidelines?: GuideLine[];
};

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
  isUpcoming?: boolean;
  streaming: boolean;
  apiCostInCents: number; // Cost per API call in cents
  messageCountCost: number; // Original message count cost (unchanged)
  imageCostInCents?: number; // Cost per image in cents
  toolCallCostInCents?: number; // Cost per image in cents
  isBot?: boolean;
  imageGenerate?: boolean;
  imageEnhance?: boolean;
  provider?: string;
  maintence?: boolean;
  limit?: boolean;
  attach?: boolean;
  imageInput?: boolean;
  fileInput?: boolean;
  inputCostPerToken?: number; //in dollar
  outputCostPerToken?: number; //in dollar
  inputCostPerTokenUpperRange?: number; //in dollar
  outputCostPerTokenUpperRange?: number; //in dollar
  showWarning?: boolean;
  warningMessage?: string;
  category?: ModelCategory;
  extendedToken?: number;
  additionalInfo?: AditionalModeInfo;
}

export const models: Array<Model> = [
  {
    id: "gpt-4o-mini",
    label: "GPT 4o Mini",
    apiIdentifier: "gpt-4o-mini",
    provider: "azure",
    description: "Small model for fast, lightweight tasks",
    streaming: true,
    apiCostInCents: 0.05, // Cost per API call
    messageCountCost: 1, // Original message count cost
    maintence: true,
    inputCostPerToken: 0.15 / 1000000,
    outputCostPerToken: 0.6 / 1000000,
    category: ModelCategory.GENERAL,
  },
  // {
  //   id: "gpt-4o",
  //   label: "GPT 4o+",
  //   apiIdentifier: "gpt-4o",
  //   description: "GPT 4o with extra features",
  //   streaming: true,
  //   apiCostInCents: 0.15,
  //   messageCountCost: 1,
  //   attach: true,
  //   provider: "azure",
  //   maintence: true,
  // },
  {
    id: "claude-sonnet",
    label: "Claude Sonnet",
    apiIdentifier: "claude-3-7-sonnet-latest",
    description: "Great for reasoning",
    streaming: false,
    apiCostInCents: 3,
    messageCountCost: 1,
    provider: "anthropic",
    // isUpcoming: true,
    fileInput: true,
    imageInput: true,
    inputCostPerToken: 3 / 1000000,
    outputCostPerToken: 15 / 1000000,
    category: ModelCategory.GENERAL,
  },
  {
    id: "claude-sonnet-extended",
    label: "Claude Sonnet Extended",
    apiIdentifier: "claude-3-7-sonnet-latest",
    description: "Sonnet with extended thinking",
    streaming: false,
    apiCostInCents: 3,
    messageCountCost: 1,
    provider: "anthropic",
    // isUpcoming: true,
    fileInput: true,
    imageInput: true,
    inputCostPerToken: 3 / 1000000,
    outputCostPerToken: 15 / 1000000,
    category: ModelCategory.GENERAL,
    extendedToken: 32000,
  },
  {
    id: "claude-haiku",
    label: "Claude Haiku",
    apiIdentifier: "claude-3-5-haiku-latest",
    description: "Good for everyday tasks",
    streaming: false,
    apiCostInCents: 0.08,
    messageCountCost: 1,
    provider: "anthropic",
    // isUpcoming: true,
    fileInput: true,
    imageInput: true,
    inputCostPerToken: 0.8 / 1000000,
    outputCostPerToken: 4 / 1000000,
    category: ModelCategory.GENERAL,
  },
  {
    // Supports image
    id: "gpt-4o-azure",
    label: "GPT 4o",
    apiIdentifier: "gpt-4o",
    description: "Great for most tasks",
    streaming: false,
    apiCostInCents: 0.1,
    messageCountCost: 1,
    provider: "azure",
    imageInput: true,
    inputCostPerToken: 2.5 / 1000000,
    outputCostPerToken: 10 / 1000000,
    category: ModelCategory.GENERAL,
  },
  {
    // Supports image
    id: "gpt-4o-bangla",
    label: "GPT 4o Bangla",
    apiIdentifier: "gpt-4o-bangla",
    description: "Bangla language model",
    streaming: false,
    apiCostInCents: 0.1,
    messageCountCost: 1,
    provider: "azure",
    imageInput: true,
    inputCostPerToken: 2.5 / 1000000,
    outputCostPerToken: 10 / 1000000,
    category: ModelCategory.LANGUAGE_SPECIFIC,
  },
  {
    // Not Support image
    id: "deepseek",
    label: "DeepSeek R1",
    apiIdentifier: "deepseek-chat",
    description: "Uses DeepThink(R1)",
    streaming: true,
    apiCostInCents: 0.1,
    messageCountCost: 1,
    provider: "deepseek",
    imageInput: false,
    inputCostPerToken: 0.55 / 1000000,
    outputCostPerToken: 2.19 / 1000000,
    category: ModelCategory.GENERAL,
  },

  {
    // Supports image
    id: "o1-mini",
    label: "o1-mini",
    apiIdentifier: "gpt-4o", // Change later TODO
    description: "Faster at reasoning",
    streaming: true,
    apiCostInCents: 1,
    messageCountCost: 1,
    provider: "azure",
    imageInput: true,
    inputCostPerToken: 1.1 / 1000000,
    outputCostPerToken: 4.4 / 1000000,
    category: ModelCategory.GENERAL,
  },

  {
    id: "Gemini-1.5",
    label: "Gemini 1.5",
    apiIdentifier: "gemini-1.5-flash",
    description: "Google's Gemini AI",
    streaming: false,
    apiCostInCents: 0.2,
    messageCountCost: 1,
    provider: "google",
    imageInput: true,
    fileInput: true,
    inputCostPerToken: 0.075 / 1000000,
    outputCostPerToken: 0.3 / 1000000,
    inputCostPerTokenUpperRange: 0.15 / 1000000,
    outputCostPerTokenUpperRange: 0.6 / 1000000,
    category: ModelCategory.GENERAL,
  },
  {
    id: "PDF",
    label: "PDF",
    apiIdentifier: "gemini-1.5-flash",
    description: "Upto 25 MB",
    streaming: false,
    apiCostInCents: 0.2,
    messageCountCost: 1,
    provider: "google",
    imageInput: true,
    fileInput: true,
    inputCostPerToken: 0.075 / 1000000,
    outputCostPerToken: 0.3 / 1000000,
    inputCostPerTokenUpperRange: 0.15 / 1000000,
    outputCostPerTokenUpperRange: 0.6 / 1000000,
    category: ModelCategory.GENERAL,
  },
  {
    id: "GPT-4.5",
    label: "GPT 4.5*",
    apiIdentifier: "gpt-4.5-preview-2025-02-27",
    // provider:"azure",
    description: "Latest GPT model",
    imageInput: true,
    streaming: false,
    apiCostInCents: 6,
    messageCountCost: 5,
    inputCostPerToken: 80 / 1000000,
    outputCostPerToken: 160 / 1000000,
    category: ModelCategory.GENERAL,
  },
  {
    id: "o1",
    label: "o1",
    apiIdentifier: "o1",
    provider: "azure",
    description: "Uses advanced reasoning",
    streaming: false,
    apiCostInCents: 6,
    messageCountCost: 5,
    inputCostPerToken: 15 / 1000000,
    outputCostPerToken: 60.0 / 1000000,
    imageInput: true,
    category: ModelCategory.GENERAL,
  },
  {
    id: "o3-mini",
    label: "o3-mini",
    apiIdentifier: "o3-mini",
    provider: "azure",
    description: "Fast at advanced reasoning",
    streaming: false,
    apiCostInCents: 6,
    messageCountCost: 5,
    inputCostPerToken: 1.1 / 1000000,
    outputCostPerToken: 4.4 / 1000000,
    category: ModelCategory.GENERAL,
  },
  {
    id: "midjourney",
    label: "MidJourney",
    apiIdentifier: "midjourney",
    // provider:"midjourney",
    description: "AI-powered image generation from textual prompts",
    streaming: false,
    apiCostInCents: 2.0,
    messageCountCost: 5,
    inputCostPerToken: 2.5 / 1000000,
    outputCostPerToken: 10.0 / 1000000,
    imageCostInCents: 20,
    isBot: true,
    imageGenerate: true,
    category: ModelCategory.IMAGE_GENERATION,
    // maintence:true,
  },
  {
    id: "dall-e",
    label: "DALL-E",
    apiIdentifier: "dall-e-3",
    // provider:"azure",
    description: "Generates images from textual descriptions",
    streaming: false,
    apiCostInCents: 2.0,
    messageCountCost: 5,
    inputCostPerToken: 2.5 / 1000000,
    outputCostPerToken: 10.0 / 1000000,
    imageCostInCents: 4,
    imageGenerate: true,
    category: ModelCategory.IMAGE_GENERATION,
  },
  {
    id: "animefy",
    label: "Animefy",
    apiIdentifier: "animefy",
    // provider:"azure",
    description: "Converts images to animes",
    streaming: false,
    apiCostInCents: 10,
    messageCountCost: 1,
    inputCostPerToken: 2.5 / 1000000,
    outputCostPerToken: 10.0 / 1000000,
    imageCostInCents: 10,
    isBot: true,
    imageInput: true,
    imageEnhance: true,
    category: ModelCategory.IMAGE_GENERATION,
  },
  {
    id: "clothify",
    label: "Try on Clothes",
    apiIdentifier: "clothify",
    // provider:"azure",
    description: "Changes Clothes if Images",
    streaming: false,
    apiCostInCents: 12, // for development. should be changed later
    messageCountCost: 1,
    inputCostPerToken: 2.5 / 1000000,
    outputCostPerToken: 10.0 / 1000000,
    imageCostInCents: 12,
    isBot: true,
    imageInput: true,
    imageEnhance: true,
    category: ModelCategory.IMAGE_GENERATION,
    showWarning: true,
    warningMessage: "View model guidelines for image requirements",
    additionalInfo: {
      guidelines: [
        {
          title: "Pose requirements",
          description:
            "full-body front view with hands fully visible. Arm positioning should avoid wide openings, crossing, or other exaggerated gestures.",
        },
        {
          title: "Clothing Category",
          description:
            "Minimal Patterns & Prints. Examples include jeans, polo shirts, yoga wear, dresses, suits, T-shirts, etc.",
        },
        {
          title: "Image requirements",
          description:
            "Upload a clear, well-aligned flat-lay image of the clothing.",
        },
        {
          title: "Single Item of Clothing",
          description:
            "Only a single item of clothing should be displayed in the image.",
        },
        {
          title: "Image Composition",
          description:
            "The clothing item should occupy as much of the image frame as possible",
        },
      ],
    },
  },
  {
    id: "slidemaker",
    label: "SlideMaker",
    apiIdentifier: "slide-speak",
    // provider:"azure",
    description: "Generates presentation from textual descriptions",
    streaming: false,
    apiCostInCents: 2.0,
    imageCostInCents: 5,
    messageCountCost: 5,
    inputCostPerToken: 2.5 / 1000000,
    outputCostPerToken: 10.0 / 1000000,
    isBot: true,
    showWarning: true,
    warningMessage: "Pricing: $0.05 per slide",
    category: ModelCategory.PRESENTATION,
    imageInput: true,
    fileInput: true,
  },
  {
    id: "rephrase",
    label: "Humanizer",
    apiIdentifier: "Rephrasy",
    // provider:"azure",
    description: "Rephrases Text",
    streaming: false,
    apiCostInCents: 1, // Flat cost;
    messageCountCost: 5,
    inputCostPerToken: 2.5 / 1000000,
    outputCostPerToken: 10.0 / 1000000,
    isBot: true,
    showWarning: true,
    warningMessage: "Pricing: $0.15 per 1000 words",
    category: ModelCategory.TEXT_REPHRASING,
  },
  {
    id: "tubeSummarizer",
    label: "You Tube Summarizer",
    apiIdentifier: "supadata",
    // provider:"azure",
    description: "Summarizes YouTube videos",
    streaming: false,
    apiCostInCents: 1, // Flat cost;
    messageCountCost: 5,
    inputCostPerToken: 2.5 / 1000000,
    outputCostPerToken: 10.0 / 1000000,
    toolCallCostInCents: 0.29, // Here it means per transcription cost.
    isBot: true,
    category: ModelCategory.TEXT_REPHRASING,
  },
  {
    id: "citation-gpt",
    label: "CitationGPT",
    apiIdentifier: "citation-gpt",
    // provider:"azure",
    description: "Provides citation for text",
    streaming: false,
    apiCostInCents: 1, // Flat cost;
    messageCountCost: 5,
    inputCostPerToken: 2.5 / 1000000,
    outputCostPerToken: 10.0 / 1000000,
    isBot: true,
    showWarning: true,
    // warningMessage: "Pricing: $0.15 per 1000 words",
    category: ModelCategory.TEXT_REPHRASING,
    additionalInfo: {
      guidelines: [
        {
          title: "Smaller is better",
          description: "Try to provide smaller text for better results",
        },
        {
          title: "English only",
          description:
            "The model may not work well with text that is not in English",
        },
        {
          title: "Pricing",
          description: "Pricing is variable based on the length of the text",
        },
      ],
    },
  },
  {
    id: "Llama",
    label: "Llama",
    apiIdentifier: "o3",
    description: "Enhanced model with improved capabilities",
    isUpcoming: true,
    streaming: true,
    apiCostInCents: 1,
    imageCostInCents: 4,
    messageCountCost: 3,
    inputCostPerToken: 0 / 1000000,
    outputCostPerToken: 0 / 1000000,
    category: ModelCategory.GENERAL,
  },
  {
    id: "whisper-stt",
    label: "Whisper (STT)",
    apiIdentifier: "whisper-stt",
    description: "Speech-to-text transcription model",
    isUpcoming: true,
    streaming: true,
    apiCostInCents: 1, // Fixed cost per transcription
    messageCountCost: 2,
    inputCostPerToken: 0 / 1000000,
    outputCostPerToken: 0 / 1000000,
    category: ModelCategory.SPEECH_TO_TEXT,
  },
] as const;

function isModelAvailable(model: Model): boolean {
  return !model.isUpcoming && !model.maintence && !model.limit;
}

export const DEFAULT_MODEL_NAME: string = "gpt-4o-azure";
