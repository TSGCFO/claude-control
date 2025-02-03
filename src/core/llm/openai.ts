/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import OpenAI, {
  ChatCompletion,
  ChatCompletionCreateParams,
  ChatCompletionUsage,
  OpenAIClient,
  ClientOptions
} from 'openai';
import {
  UserRequest,
  ModelResponse,
  LLMProvider,
  LLMError
} from '../../types';

interface ValidatedResponse {
  readonly content: string;
  readonly usage: ChatCompletionUsage;
}

interface CompletionCandidate {
  readonly choices?: Array<{
    readonly message?: {
      readonly content?: string;
    };
  }>;
  readonly usage?: {
    readonly prompt_tokens?: number;
    readonly completion_tokens?: number;
  };
}

const isValidCompletion = (response: unknown): response is ChatCompletion => {
  try {
    const candidate = response as CompletionCandidate;
    return (
      Array.isArray(candidate?.choices) &&
      candidate.choices.length > 0 &&
      typeof candidate.choices[0]?.message?.content === 'string' &&
      typeof candidate.usage?.prompt_tokens === 'number' &&
      typeof candidate.usage?.completion_tokens === 'number'
    );
  } catch {
    return false;
  }
};

export class OpenAIProvider implements LLMProvider {
  private readonly client: OpenAIClient;
  private readonly defaultSystemPrompt =
    'You are a computer control interface assistant. Your role is to help users ' +
    'control their computer through natural language commands. You can perform ' +
    'operations like file management, application control, web navigation, and ' +
    'system settings management. Always prioritize safety and confirm potentially ' +
    'dangerous operations.';

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key is required');
    }

    const options: ClientOptions = { apiKey: key };
    const client = new OpenAI(options);
    if (!this.isValidClient(client)) {
      throw new Error('Invalid OpenAI client initialization');
    }

    this.client = client;
  }

  private isValidClient(value: unknown): value is OpenAIClient {
    try {
      const client = value as OpenAIClient;
      return (
        typeof client?.chat?.completions?.create === 'function'
      );
    } catch {
      return false;
    }
  }

  async processRequest(request: UserRequest): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      const params: ChatCompletionCreateParams = {
        model: this.selectModel(request),
        messages: [
          {
            role: 'system',
            content: this.defaultSystemPrompt
          },
          {
            role: 'user',
            content: request.content
          }
        ],
        max_tokens: this.calculateMaxTokens(request)
      };

      const response = await this.client.chat.completions.create(params);
      if (!isValidCompletion(response)) {
        throw new Error('Invalid response format from OpenAI API');
      }

      const validated = this.validateResponse(response);
      return {
        content: validated.content,
        usage: {
          promptTokens: validated.usage.prompt_tokens,
          completionTokens: validated.usage.completion_tokens
        },
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private validateResponse(response: ChatCompletion): ValidatedResponse {
    const content = response.choices[0]?.message?.content;
    const usage = response.usage;

    if (!content || !usage) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return { content, usage };
  }

  private selectModel(request: UserRequest): string {
    switch (request.type) {
      case 'SYSTEM_OPERATION':
        return 'gpt-4o-2024-08-06';
      case 'REASONING':
        return 'o3-mini-2025-01-31';
      default:
        return request.complexity === 'LOW'
          ? 'gpt-4o-mini-2024-07-18'
          : 'gpt-4o-2024-08-06';
    }
  }

  private calculateMaxTokens(request: UserRequest): number {
    switch (request.type) {
      case 'SYSTEM_OPERATION':
        return 4096;
      case 'REASONING':
        return 2048;
      default:
        return request.complexity === 'LOW' ? 1024 : 2048;
    }
  }

  private handleError(error: unknown): LLMError {
    const llmError = new Error() as LLMError;
    llmError.name = 'OpenAIError';
    llmError.provider = 'openai';

    if (error instanceof Error) {
      llmError.message = error.message;
      if ('status' in error) {
        llmError.status = error.status as number;
      }
      if ('code' in error) {
        llmError.code = error.code as string;
      }
    } else {
      llmError.message = String(error);
    }

    return llmError;
  }
}
