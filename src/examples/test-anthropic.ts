import 'dotenv/config';
import { AnthropicProvider } from '../core/llm/anthropic';
import type { UserRequest } from '../types';

interface AnthropicError extends Error {
  status?: number;
  code?: string;
}

async function testAnthropicProvider() {
  try {
    // Initialize provider using environment variable
    const provider = new AnthropicProvider();

    // Test request with proper typing
    const request: UserRequest = {
      type: 'GENERAL',
      content: 'Hello! Please introduce yourself and explain what you can help me with.',
      complexity: 'LOW'
    };

    console.log('Sending test request to Anthropic...');
    const response = await provider.processRequest(request);

    console.log('\nResponse:');
    console.log('Content:', response.content);
    console.log('Usage:', {
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      totalTokens: response.usage.promptTokens + response.usage.completionTokens
    });
    console.log('Execution Time:', `${response.executionTime}ms`);

  } catch (error) {
    const anthropicError = error as AnthropicError;
    console.error('Error:', {
      name: anthropicError.name,
      message: anthropicError.message,
      ...(anthropicError.status !== undefined && { status: anthropicError.status }),
      ...(anthropicError.code !== undefined && { code: anthropicError.code })
    });
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testAnthropicProvider().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
