import { ClaudeControlChain } from '../core/chain/base';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testPromptFormat() {
  try {
    const chain = new ClaudeControlChain();

    console.log('Testing improved prompt format...\n');

    const testCases = [
      'create a file named example.txt with content "Testing 123"',
      'open notepad and type "Hello from Claude"',
      'search the web for "Claude API documentation"',
      'show me files in the current folder'
    ];

    for (const input of testCases) {
      console.log(`User: ${input}`);
      console.log('---');

      const result = await chain._call({
        input,
        chat_history: []
      });

      if (result.thought) {
        console.log('Thought:', result.thought);
        console.log('---');
      }

      if (result.action) {
        console.log('Command:', {
          type: result.action.type,
          name: result.action.name,
          args: result.action.args
        });
        console.log('---');
      }

      console.log('Response:', result.output);
      console.log(`\n${'='.repeat(50)}\n`);

      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
void testPromptFormat();