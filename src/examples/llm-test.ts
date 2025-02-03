import { ModelSelector, ProviderType } from '../core/llm/selector';
import { UserRequest } from '../types';

async function testLLMProviders() {
  try {
    // Initialize model selector with both providers
    const selector = new ModelSelector([
      { type: 'anthropic' },
      { type: 'openai' }
    ]);

    // Test cases for different scenarios
    const testCases: UserRequest[] = [
      {
        type: 'SYSTEM_OPERATION',
        content: 'List all running processes on the system',
        complexity: 'HIGH'
      },
      {
        type: 'REASONING',
        content: 'What is the best way to optimize this code?',
        complexity: 'HIGH'
      },
      {
        type: 'GENERAL',
        content: 'What is the weather like today?',
        complexity: 'LOW'
      }
    ];

    // Process each test case
    for (const request of testCases) {
      console.log('\nProcessing request:', {
        type: request.type,
        complexity: request.complexity
      });

      const startTime = Date.now();
      const response = await selector.processRequest(request);
      const duration = Date.now() - startTime;

      console.log('Response:', {
        content: `${response.content.slice(0, 100)}...`,
        tokens: {
          prompt: response.usage.promptTokens,
          completion: response.usage.completionTokens
        },
        duration: `${duration}ms`
      });
    }

    // Test provider-specific capabilities
    const providers: ProviderType[] = ['anthropic', 'openai'];
    for (const type of providers) {
      const capabilities = selector.getCapabilities(type);
      console.log(`\n${type} capabilities:`, capabilities);
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testLLMProviders().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { testLLMProviders };
