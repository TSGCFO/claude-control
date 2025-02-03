declare module 'openai' {
  export interface ChatCompletionMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  export interface ChatCompletion {
    id: string;
    choices: Array<{
      index: number;
      message: ChatCompletionMessage;
      finish_reason: string;
    }>;
    created: number;
    model: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }

  export interface ClientOptions {
    apiKey?: string;
  }

  export interface ChatCompletionCreateParams {
    model: string;
    messages: ChatCompletionMessage[];
    max_completion_tokens?: number;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  }

  export interface Chat {
    completions: {
      create(params: ChatCompletionCreateParams): Promise<ChatCompletion>;
    };
  }

  export default class OpenAI {
    constructor(options?: ClientOptions);
    chat: Chat;
  }
}