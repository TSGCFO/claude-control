/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import OpenAI from 'openai';
import {
  UserRequest,
  ModelResponse,
  LLMProvider,
  LLMError
} from '../../types';

interface ValidatedResponse {
  readonly content: string;
  readonly usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export class OpenAIProvider implements LLMProvider {
  private readonly client: OpenAI;
  private readonly defaultSystemPrompt =
    'You are a computer control interface assistant. Your role is to help users ' +
    'control their computer through natural language commands. You can perform ' +
    'operations like file management, application control, web navigation, and ' +
    'system settings management. Always prioritize safety and confirm potentially ' +
    'dangerous operations.';

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({ apiKey: key });
  }

  async processRequest(request: UserRequest): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      const completion = await this.client.chat.completions.create({
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
        max_completion_tokens: this.calculateMaxTokens(request)
      });

      const validated = this.validateResponse(completion);
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

  private selectModel(request: UserRequest): string {
    switch (request.type) {
      case 'SYSTEM_OPERATION':
        // Use GPT-4o for complex system operations
        return 'gpt-4o-2024-08-06';
      case 'REASONING':
        if (request.complexity === 'HIGH') {
          // Use o1 for complex reasoning tasks
          return 'o1-2024-12-17';
        }
        // Use o3-mini for standard reasoning tasks
        return 'o3-mini-2025-01-31';
      default:
        if (request.complexity === 'HIGH') {
          // Use GPT-4o for complex general tasks
          return 'gpt-4o-2024-08-06';
        }
        // Use o3-mini for standard tasks
        return 'o3-mini-2025-01-31';
    }
  }

  private validateResponse(completion: any): ValidatedResponse {
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return {
      content,
      usage: {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens
      }
    };
  }

  private calculateMaxTokens(request: UserRequest): number {
    const model = this.selectModel(request);
    switch (model) {
      case 'gpt-4o-2024-08-06':
        return 16384; // GPT-4o max output tokens
      case 'o1-2024-12-17':
        return 100000; // o1 max output tokens
      case 'o3-mini-2025-01-31':
        return 100000; // o3-mini max output tokens
      default:
        return 16384; // Default to GPT-4o limit
    }
  }

  private handleError(error: unknown): LLMError {
    const llmError = new Error() as LLMError;
    llmError.name = 'OpenAIError';
    llmError.provider = 'openai';

    if (error instanceof Error) {
      llmError.message = error.message;
      if ('status' in error) {
        llmError.status = (error as { status: number }).status;
      }
      if ('code' in error) {
        llmError.code = (error as { code: string }).code;
      }
    } else {
      llmError.message = String(error);
    }

    return llmError;
  }
}
