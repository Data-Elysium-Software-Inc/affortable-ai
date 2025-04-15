import type {
  CoreAssistantMessage,
  CoreToolMessage,
} from 'ai';

// Request options interface
interface SlideSpeakOptions {
    plain_text: string;
    length: number;
    template: 'default' | 'modern' | 'minimal' | 'corporate' | 'creative' | string;
    language: 'ORIGINAL' | 'EN' | 'ES' | 'FR' | 'DE' | 'IT' | 'PT' | 'RU' | string;
    fetch_images: boolean;
    tone: 'default' | 'formal' | 'casual' | 'enthusiastic' | 'professional' | string;
    verbosity: 'concise' | 'standard' | 'detailed' | string;
    custom_user_instructions?: string;
  }
  
  // Response interfaces
  interface GenerateResponse {
    task_id: string;
    message?: string;
  }
  
  interface TaskResultSuccess {
    url: string;
    slides_count?: number;
    [key: string]: any; // For any additional fields
  }
  
  interface TaskStatusResponse {
    task_id: string;
    task_status?: 'PENDING' | 'SUCCESS' | 'FAILED';
    task_result?: TaskResultSuccess | { error?: string; [key: string]: any };
    message?: string;
  }
  
  /**
   * Generates a presentation using SlideSpeak API and retrieves the result
   * @param options - The presentation generation options
   * @param apiKey - Your SlideSpeak API key
   * @param maxRetries - Maximum number of status check retries
   * @param pollingInterval - Time between status checks in ms
   * @returns Promise with the URL to the generated presentation
   */
  export async function generateSlideSpeakPresentation(
    options: SlideSpeakOptions, 
    apiKey?: string | undefined, 
    maxRetries: number = 30, 
    pollingInterval: number = 1000
  ): Promise<string> {
    if (!apiKey) {
      throw new Error('API key is required');
    }
  
    // Step 1: Make the initial request to generate slides
    console.log('Initiating presentation generation...');
    
    try {
      const generateResponse = await fetch('https://api.slidespeak.co/api/v1/presentation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(options)
      });
      
      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(`Failed to initiate presentation: ${generateResponse.status} ${JSON.stringify(errorData)}`);
      }
      
      const generateData = await generateResponse.json() as GenerateResponse;
      const taskId = generateData.task_id;
      
      if (!taskId) {
        throw new Error('No task ID returned from API');
      }
      
      console.log(`Presentation generation initiated. Task ID: ${taskId}`);
      
      // Step 2: Poll for task completion
      let retries = 0;
      let presentationUrl: string | null = null;
      
      while (retries < maxRetries) {
        console.log(`Checking status (attempt ${retries + 1}/${maxRetries})...`);
        
        const statusResponse = await fetch(`https://api.slidespeak.co/api/v1/task_status/${taskId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          }
        });
        
        if (!statusResponse.ok) {
          const errorData = await statusResponse.json();
          throw new Error(`Failed to check task status: ${statusResponse.status} ${JSON.stringify(errorData)}`);
        }
        
        const statusData = await statusResponse.json() as TaskStatusResponse;
        
        // Check if task is completed
        if (statusData.task_status === 'SUCCESS' && statusData.task_result) {
          console.log('Presentation generated successfully!');
          const result = statusData.task_result as TaskResultSuccess;
          presentationUrl = result.url;
          break;
        } else if (!statusData.task_status || statusData.task_status === 'FAILED') {
          throw new Error(`Task failed: ${JSON.stringify(statusData.task_result || {})}`);
        }
        
        // If still pending, wait before trying again
        console.log('Task still processing. Waiting before next check... status:' + statusData.task_status);
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
        retries++;
      }
      
      if (!presentationUrl) {
        throw new Error(`Presentation generation timed out after ${maxRetries} attempts`);
      }
      
      // Step 3: Return the URL
      return presentationUrl;
    } catch (error) {
      console.error('Error generating presentation:', error);
      throw error;
    }
  }

  /**
 * 
 * @param messages 
 * @returns The slide count from the messages. This function is specific to SlideSpeak tool.
 */
export function getSlideLengthFromSanitizedMessages(messages: Array<CoreToolMessage | CoreAssistantMessage>)
: number{
  const slideLength = messages.reduce((acc, message) => {
    if (message.role === 'tool') {
      for (const content of message.content) {
        if (content.type === 'tool-result') {
          const result = content.result as { slideCount?: number };
          if (result?.slideCount) {
            return result?.slideCount;
          }
        }
      }
    }
    return acc;
  }, 0);
  return slideLength == 0 ? slideLength : slideLength + 2; // 0 means no slide is generated, but not zero means there was a slide generated we need to add 2 for coverpage and table of content
}
