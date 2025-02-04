import { CommandParserChain } from '../core/chain/parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testParser() {
  try {
    const parser = new CommandParserChain();

    console.log('Testing command parser...\n');

    const command = 'open notepad';
    console.log(`Parsing command: "${command}"`);

    const result = await parser.parse(command);
    console.log('\nParsed result:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
void testParser();
