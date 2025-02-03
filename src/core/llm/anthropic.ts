/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import Anthropic from '@anthropic-ai/sdk';
import {
  UserRequest,
  ModelResponse,
  LLMProvider,
  LLMError
} from '../../types';

interface ValidatedResponse {
  readonly content: string;
  readonly usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicResponse {
  content: Array<{
    type: string;
    text?: string;
    [key: string]: unknown;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicProvider implements LLMProvider {
  private readonly client: Anthropic;
  private readonly defaultSystemPrompt =
    'You are a computer control interface assistant. Your role is to help users ' +
    'control their computer through natural language commands. You can perform ' +
    'operations like file management, application control, web navigation, and ' +
    'system settings management. Always prioritize safety and confirm potentially ' +
    'dangerous operations.';

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({ apiKey: key });
  }

  async processRequest(request: UserRequest): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      const rawResponse = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: this.calculateMaxTokens(request),
        system: this.defaultSystemPrompt,
        messages: [{
          role: 'user',
          content: request.content
        }]
      });

      // Cast the response to our expected format
      const response: AnthropicResponse = {
        content: rawResponse.content.map(block => ({
          type: block.type,
          ...(block.type === 'text' && 'text' in block ? { text: block.text } : {})
        })),
        usage: rawResponse.usage
      };

      const validated = this.validateResponse(response);
      return {
        content: validated.content,
        usage: {
          promptTokens: validated.usage.input_tokens,
          completionTokens: validated.usage.output_tokens
        },
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private validateResponse(response: AnthropicResponse): ValidatedResponse {
    const content = response.content
      .filter(block => block.type === 'text' && typeof block.text === 'string')
      .map(block => block.text as string)
      .join('\n');

    if (!content) {
      throw new Error('Invalid response format from Anthropic API');
    }

    return {
      content,
      usage: response.usage
    };
  }

  private calculateMaxTokens(request: UserRequest): number {
    switch (request.type) {
      case 'SYSTEM_OPERATION':
        return 8192;  // Updated to match Claude 3.5 Sonnet's max output
      case 'REASONING':
        return 4096;
      default:
        return request.complexity === 'LOW' ? 2048 : 4096;
    }
  }

  private handleError(error: unknown): LLMError {
    const llmError = new Error() as LLMError;
    llmError.name = 'AnthropicError';
    llmError.provider = 'anthropic';

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
