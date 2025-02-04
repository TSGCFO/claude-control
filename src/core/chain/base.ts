import { BaseChain } from 'langchain/chains';
import { ChatAnthropic } from '@langchain/anthropic';
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate
} from '@langchain/core/prompts';
import { BaseMessage, AIMessage } from '@langchain/core/messages';
import { SystemIntegration } from '../../types';

interface ChainInput {
  input: string;
  chat_history: BaseMessage[];
}

interface ChainOutput {
  output: string;
  thought?: string;
  actions: Array<{
    type: 'FILE' | 'APP' | 'WEB' | 'SYSTEM';
    name: string;
    args: Record<string, unknown>;
  }>;
}

export class ClaudeControlChain extends BaseChain<ChainInput, ChainOutput> {
  private model: ChatAnthropic;
  private prompt: ChatPromptTemplate;
  private systemIntegration?: SystemIntegration;

  get inputKeys(): string[] {
    return ['input', 'chat_history'];
  }

  get outputKeys(): string[] {
    return ['output', 'thought', 'actions'];
  }

  constructor(systemIntegration?: SystemIntegration) {
    super();
    this.model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: 'claude-3-opus-20240229'
    });
    this.systemIntegration = systemIntegration;

    const systemPrompt = `You are an AI agent that helps users control their computer. You have access to these capabilities:

${this.getToolDescriptions()}

When users make requests:
1. First, carefully think through ALL steps needed to complete the task
2. For each step, determine the exact command needed
3. Make sure to complete the ENTIRE task, not just the first step
4. Explain your plan and actions clearly to the user

Remember:
- Break complex tasks into all necessary steps
- Use the exact command names and parameters shown above
- Complete the full task, not partial solutions

    const response = await this.model.call(messages);

    if (!(response instanceof AIMessage)) {
      throw new Error('Unexpected response type from model');
    }

    return this.parseResponse(response.content);
  }

  private parseResponse(content: string | Array<unknown>): ChainOutput {
    const textContent = this.extractTextContent(content);
    const output: ChainOutput = { output: '' };

    // Extract thought
    const thoughtMatch = textContent.match(/<thought>([\s\S]*?)<\/thought>/);
    if (thoughtMatch) {
      output.thought = thoughtMatch[1].trim();
    }

    // Extract command
    const commandMatch = textContent.match(/<command>([\s\S]*?)<\/command>/);
    if (commandMatch) {
      const commandText = commandMatch[1].trim();
      const match = commandText.match(/(\w+)\s+(\w+)\s+(.+)/);
      if (match) {
        const [, type, name, argsText] = match;
        const args = this.parseActionArgs(argsText);
        output.action = {
          type: type as 'FILE' | 'APP' | 'WEB' | 'SYSTEM',
          name,
          args
        };
      }
    }

    // Extract response
    const responseMatch = textContent.match(/<response>([\s\S]*?)<\/response>/);
    if (responseMatch) {
      output.output = responseMatch[1].trim();
    } else {
      output.output = textContent;
    }

    return output;
  }

  private parseActionArgs(argsText: string): Record<string, unknown> {
    const args: Record<string, unknown> = {};
    const pairs = argsText.match(/(\w+)="([^"]*)"/g) || [];
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      args[key] = value.replace(/^"|"$/g, '');
    }
    return args;
  }

  private extractTextContent(content: string | Array<unknown>): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map(item => {
          if (typeof item === 'string') {
            return item;
          }
          if (this.isTextBlock(item)) {
            return item.text;
          }
          return '';
        })
        .filter(Boolean)
        .join('\n');
    }

    throw new Error('Unable to extract text content from model response');
  }

  private isTextBlock(item: unknown): item is { text: string } {
    return typeof item === 'object' &&
           item !== null &&
           'text' in item &&
           typeof (item as { text: string }).text === 'string';
  }

  _chainType(): string {
    return 'claude_control_chain';
  }
}
