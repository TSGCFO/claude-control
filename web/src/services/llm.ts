import { UserRequest, ModelResponse } from '../../../src/types';

export class LLMService {
  private readonly API_URL = 'http://localhost:3001/api/chat';

  async processRequest(request: UserRequest): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process request');
      }

      const data = await response.json();
      return {
        content: data.content,
        usage: {
          promptTokens: data.usage.promptTokens,
          completionTokens: data.usage.completionTokens
        },
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unknown error occurred');
  }
}

export const llmService = new LLMService();