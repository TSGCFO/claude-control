import { UserRequest, ModelResponse } from '../../../src/types';

class MockLLMService {
  async processRequest(request: UserRequest): Promise<ModelResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock response based on request type
    let content = '';
    switch (request.type) {
      case 'SYSTEM_OPERATION':
        content = `I'll help you with that system operation. You asked: "${request.content}"`;
        break;
      case 'REASONING':
        content = `Here's my explanation for: "${request.content}"`;
        break;
      default:
        content = `I received your message: "${request.content}"`;
    }

    return {
      content,
      usage: {
        promptTokens: Math.floor(request.content.length / 4),
        completionTokens: Math.floor(content.length / 4)
      },
      executionTime: 1000
    };
  }
}

export const mockLLM = new MockLLMService();