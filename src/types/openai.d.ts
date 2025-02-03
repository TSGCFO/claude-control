declare module 'openai' {
  export interface OpenAIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }

  export interface ChatCompletionMessage {
    role: 'assistant';
    content: string;
  }

  export interface ChatCompletionUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }

  export interface ChatCompletion {
    id: string;
    object: 'chat.completion';
    created: number;
    model: string;
    choices: Array<{
      index: number;
      message: ChatCompletionMessage;
      finish_reason: string;
    }>;
    usage: ChatCompletionUsage;
  }

  export interface ChatCompletionCreateParams {
    model: string;
    messages: OpenAIMessage[];
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    stop?: string | string[];
  }

  export interface ChatCompletionsAPI {
    create(params: ChatCompletionCreateParams): Promise<ChatCompletion>;
  }

  export interface OpenAIClient {
    chat: {
      completions: ChatCompletionsAPI;
    };
  }

  export interface ClientOptions {
    apiKey: string;
    organization?: string;
  }

  export default class OpenAI implements OpenAIClient {
    constructor(options: ClientOptions);
    chat: {
      completions: ChatCompletionsAPI;
    };
  }

  // Type guards
  export function isOpenAIMessage(value: unknown): value is OpenAIMessage;
  export function isChatCompletion(value: unknown): value is ChatCompletion;
  export function isOpenAIClient(value: unknown): value is OpenAIClient;
  export function isChatCompletionUsage(value: unknown): value is ChatCompletionUsage;
}