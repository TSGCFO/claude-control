import { ChatAnthropic } from '@langchain/anthropic';
import dotenv from 'dotenv';

dotenv.config();

async function testPromptingTechniques() {
  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    modelName: 'claude-3-opus-20240229'
  });

  // Different prompting techniques to test
  const prompts = [
    // Technique 1: Chain of Thought
    `You are an AI agent that helps users control their computer.
Available commands: FILE (read/write/list), APP (launch/close/sendKeys), WEB (search/navigate)

Think through each step needed and explain your reasoning.
What commands would you use for: "open notepad and type hello world"?`,

    // Technique 2: Few-Shot Learning
    `You are an AI agent that helps users control their computer.
Available commands: FILE (read/write/list), APP (launch/close/sendKeys), WEB (search/navigate)

Example 1:
User: "create a file named test.txt with content hello"
Response: Let me break this down:
1. Need to create a new file - use FILE write
Commands:
FILE write path="test.txt" content="hello"

Example 2:
User: "search google for weather"
Response: Let me break this down:
1. Need to search the web - use WEB search
Commands:
WEB search query="weather"

Now, what would you do for: "open notepad and type hello world"?`,

    // Technique 3: Task Decomposition
    `You are an AI agent that helps users control their computer.
Available commands: FILE (read/write/list), APP (launch/close/sendKeys), WEB (search/navigate)

For the following request:
1. Break it down into individual steps
2. For each step, specify the exact command needed
3. Make sure to complete the ENTIRE task

Request: "open notepad and type hello world"`,

    // Technique 4: Role Playing
    `You are an experienced system administrator who knows exactly how to control computers.
Available commands: FILE (read/write/list), APP (launch/close/sendKeys), WEB (search/navigate)

A user asks you to: "open notepad and type hello world"
How would you accomplish this task? Be specific about each command needed.`
  ];

  console.log('Testing different prompting techniques...\n');

  for (let i = 0; i < prompts.length; i++) {
    console.log(`\nTechnique ${i + 1}:`);
    console.log('='.repeat(50));

    const response = await model.invoke(prompts[i]);
    console.log(response.content);
    console.log('='.repeat(50));

    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

void testPromptingTechniques();
