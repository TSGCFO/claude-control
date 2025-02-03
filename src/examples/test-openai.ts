import 'dotenv/config';
import { OpenAIProvider } from '../core/llm/openai';
import type { UserRequest } from '../types';

interface OpenAIError extends Error {
  status?: number;
  code?: string;
}

async function testOpenAIProvider() {
  try {
    // Initialize provider using environment variable
    const provider = new OpenAIProvider();

    // Test different request types to verify model selection
    const requests: UserRequest[] = [
      {
        type: 'GENERAL',
        content: 'Hello! Please introduce yourself and explain what you can help me with.',
        complexity: 'LOW'
      },
      {
        type: 'SYSTEM_OPERATION',
        content: 'Create a new directory called "test" and move all .txt files into it.',
        complexity: 'HIGH'
      },
      {
        type: 'REASONING',
        content: 'Analyze the best approach to organize files by type and usage patterns.',
        complexity: 'HIGH'
      }
    ];

    for (const request of requests) {
      console.log(`\nTesting ${request.type} request (complexity: ${request.complexity})...`);
      console.log('Content:', request.content);
      const response = await provider.processRequest(request);

      console.log('\nResponse:');
      console.log('Content:', response.content);
      console.log('Usage:', {
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.promptTokens + response.usage.completionTokens
      });
      console.log('Execution Time:', `${response.executionTime}ms`);
      console.log('-'.repeat(80));
    }

  } catch (error) {
    const openAIError = error as OpenAIError;
    console.error('Error:', {
      name: openAIError.name,
      message: openAIError.message,
      ...(openAIError.status !== undefined && { status: openAIError.status }),
      ...(openAIError.code !== undefined && { code: openAIError.code })
    });
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testOpenAIProvider().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
