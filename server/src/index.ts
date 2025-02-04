import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Anthropic } from '@anthropic-ai/sdk';
import { NaturalLanguageProcessor } from './core/nli/processor';
import { ApplicationIntegration } from './core/system/app';
import { LearningSystem } from './core/learning';

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
const port = process.env.PORT || 3002;

// Initialize components
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
const nlp = new NaturalLanguageProcessor();
const appControl = new ApplicationIntegration();
const learningSystem = new LearningSystem();

// Base system prompt
const baseSystemPrompt = 
  'You are a computer control interface assistant. Your role is to help users ' +
  'control their computer through natural language commands. When users request ' +
  'system operations, respond with a structured command in the format: ' +
  'COMMAND_TYPE ACTION param1=value1 param2=value2\n\n' +
  'For example:\n' +
  '- "launch notepad" -> APP launch app=notepad\n' +
  '- "close notepad" -> APP close app=notepad\n' +
  '- "open chrome" -> APP launch app=chrome\n' +
  '- "terminate program" -> APP close app=program\n' +
  '- "create a file" -> FILE write path=filename.txt content=""\n\n' +
  'Valid APP actions are: launch, close, focus, cleanup\n' +
  'Always respond with both the structured command and a natural language confirmation.';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.post('/api/chat', async (req: express.Request<{}, {}, UserRequest>, res: express.Response) => {
  const startTime = Date.now();

  try {
    const request = req.body;
    console.log('Received request:', request);

    // Check for improved response based on past interactions
    const improvedResponse = await learningSystem.getImprovedResponse(request.content);
    if (improvedResponse) {
      console.log('Using improved response from learning system');
      return res.json({
        content: improvedResponse,
        usage: { promptTokens: 0, completionTokens: 0 },
        executionTime: Date.now() - startTime
      });
    }

    // Get optimized system prompt
    const systemPrompt = await learningSystem.getOptimizedPrompt(baseSystemPrompt);
    console.log('Using optimized system prompt');

    // Send request to Anthropic
    console.log('Sending request to Anthropic...');
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

    console.log('Claude response:', content);

    let success = true;
    let error: string | undefined;
    let executedCommand: any | undefined;

    // Extract structured command from Claude's response
    const commandMatch = content.match(/([A-Z]+)\s+(\w+)(?:\s+(.+))?/);
    if (commandMatch) {
      const [, type, action, paramString] = commandMatch;
      console.log('Extracted command:', { type, action, paramString });
      
      try {
        // Parse and execute command
        console.log('Parsing command...');
        const command = nlp.parseCommand(`${type} ${action} ${paramString || ''}`);
        console.log('Parsed command:', command);
        executedCommand = command;
        
        // Execute command based on type
        if (command.type === 'APP') {
          if (command.action === 'launch') {
            console.log('Launching application:', command.parameters.app);
            await appControl.launch(command.parameters.app);
            console.log('Application launched successfully');
          } else if (command.action === 'close') {
            console.log('Closing application:', command.parameters.app);
            await appControl.close(command.parameters.app);
            console.log('Application closed successfully');
          }
        }
        // Add other command types as needed
      } catch (err) {
        success = false;
        error = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error executing command:', error);
      }
    } else {
      console.log('No structured command found in response');
    }

    // Record interaction for learning
    await learningSystem.recordInteraction({
      input: request.content,
      command: executedCommand,
      response: content,
      success,
      error
    });

    // Get metrics after recording interaction
    const metrics = learningSystem.getMetrics();
    console.log('Learning system metrics:', metrics);

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

// Add endpoint to get learning metrics
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = learningSystem.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

// Add endpoint to get command suggestions
app.get('/api/suggestions', async (req, res) => {
  try {
    const { input } = req.query;
    if (typeof input !== 'string') {
      return res.status(400).json({ error: 'Input parameter is required' });
    }
    const suggestions = await learningSystem.getSuggestions(input);
    res.json(suggestions);
  } catch (error) {
    console.error('Error getting suggestions:', error);
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