import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Anthropic } from '@anthropic-ai/sdk';

interface UserRequest {
  type: 'SYSTEM_OPERATION' | 'REASONING' | 'GENERAL';
  content: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface ModelResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  executionTime: number;
}

const app = express();
const port = process.env.PORT || 3002; // Changed port to 3002

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// System prompt for computer control
const systemPrompt = 
  'You are a computer control interface assistant. Your role is to help users ' +
  'control their computer through natural language commands. You can perform ' +
  'operations like file management, application control, web navigation, and ' +
  'system settings management. Always prioritize safety and confirm potentially ' +
  'dangerous operations.';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.post('/api/chat', async (req: express.Request<{}, {}, UserRequest>, res: express.Response) => {
  const startTime = Date.now();

  try {
    const request = req.body;

    // Send request to Anthropic
    const completion = await anthropic.messages.create({
      model: selectModel(request),
      max_tokens: calculateMaxTokens(request),
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: request.content
      }]
    });

    // Process response
    const content = completion.content
      .filter(block => block.type === 'text' && 'text' in block)
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('\n');

    if (!content) {
      throw new Error('Invalid response format from Anthropic API');
    }

    const response: ModelResponse = {
      content,
      usage: {
        promptTokens: completion.usage.input_tokens,
        completionTokens: completion.usage.output_tokens
      },
      executionTime: Date.now() - startTime
    };

    res.json(response);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

function selectModel(request: UserRequest): string {
  // For complex system operations, use Claude 3 Opus
  if (request.type === 'SYSTEM_OPERATION') {
    return 'claude-3-opus-20240229';
  }

  // For fast, routine tasks use Claude 3.5 Haiku
  if (request.complexity === 'LOW') {
    return 'claude-3-5-haiku-20241022';
  }

  // Default to Claude 3.5 Sonnet for balanced performance
  return 'claude-3-5-sonnet-20241022';
}

function calculateMaxTokens(request: UserRequest): number {
  switch (request.type) {
    case 'SYSTEM_OPERATION':
      return 8192;  // Claude 3 Opus max output
    case 'REASONING':
      return 4096;
    default:
      return request.complexity === 'LOW' ? 2048 : 4096;
  }
}

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});