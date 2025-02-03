import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

interface AnthropicError extends Error {
  status?: number;
  code?: string;
}

async function testAnthropicDirect() {
  try {
    // Initialize the client using environment variable
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    console.log('Sending test request to Anthropic...');

    // Create a message following the SDK example
    const completion = await anthropic.messages.create({
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: 'Hello! Please introduce yourself and explain what you can help me with.'
      }],
      model: 'claude-3-5-sonnet-20241022'
    });

    console.log('\nResponse:');
    // Handle different content block types
    const content = completion.content
      .filter(block => block.type === 'text' && 'text' in block)
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('\n');

    console.log('Content:', content);
    console.log('Usage:', {
      input_tokens: completion.usage.input_tokens,
      output_tokens: completion.usage.output_tokens,
      total_tokens: completion.usage.input_tokens + completion.usage.output_tokens
    });

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
  testAnthropicDirect().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
