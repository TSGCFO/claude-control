import { ChatAnthropic } from '@langchain/anthropic';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { CommandVectorStore } from '../memory/vectorstore';
import { BufferMemory } from 'langchain/memory';
import { BaseMessage } from '@langchain/core/messages';

interface AgentResponse {
  thought: string;
  commands: string[];
  response: string;
}

interface ParsedResponse {
  thought?: string;
  commands?: string[];
  response?: string;
}

interface MemoryVariables {
  chat_history: BaseMessage[];
}

export class RAGCommandAgent {
  private model: ChatAnthropic;
  private vectorStore: CommandVectorStore;
  private memory: BufferMemory;
  private chain: RunnableSequence;

  constructor() {
    this.model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: 'claude-3-opus-20240229'
    });

    this.vectorStore = new CommandVectorStore();

    this.memory = new BufferMemory({
      returnMessages: true,
      inputKey: 'input',
      outputKey: 'output',
      memoryKey: 'chat_history'
    });

    const promptTemplate = PromptTemplate.fromTemplate(`
You are an AI agent that helps users control their computer by converting natural language requests into commands.

Context from similar examples:
{examples}

Chat history:
{chat_history}

Based on these examples and the chat history, convert this request into commands:
{input}

Think through your response:
1. Analyze what needs to be done
2. Look at similar examples for guidance
3. Break down complex tasks into steps
4. Generate the exact commands needed

Respond in this format:
Thought: Your step-by-step reasoning
Commands: List each command on a new line
Response: Clear explanation for the user
`);

    this.chain = RunnableSequence.from([
      {
        input: (input: string) => input,
        examples: async (input: string) => {
          const docs = await this.vectorStore.findSimilarExamples(input);
          return docs.map(doc => {
            const commands = Array.isArray(doc.metadata.commands) 
              ? doc.metadata.commands 
              : [];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const output = typeof doc.metadata.result?.output === 'string'
              ? doc.metadata.result.output
              : 'No output available';
            return `Example: "${doc.pageContent}"
Commands: ${commands.join('\n')}
Result: ${output}`;
          }).join('\n\n');
        },
        chat_history: async () => {
          const history = await this.memory.loadMemoryVariables({}) as MemoryVariables;
          return history.chat_history.map(msg => msg.content).join('\n');
        }
      },
      promptTemplate,
      this.model,
      new StringOutputParser()
    ]);
  }

  async initialize(): Promise<void> {
    await this.vectorStore.initialize();
  }

  async process(input: string): Promise<AgentResponse> {
    const result = await this.chain.invoke(input);

    if (typeof result !== 'string') {
      throw new Error('Unexpected response type from model');
    }

    const parsed = this.parseResponse(result);

    await this.memory.saveContext(
      { input },
      { output: parsed.response || '' }
    );

    if (parsed.commands && parsed.commands.length > 0) {
      await this.vectorStore.addExample({
        input,
        commands: parsed.commands,
        result: {
          success: true,
          output: parsed.response || ''
        }
      });
    }

    return {
      thought: parsed.thought || '',
      commands: parsed.commands || [],
      response: parsed.response || ''
    };
  }

  private parseResponse(text: string): ParsedResponse {
    const parsed: ParsedResponse = {};

    const thoughtMatch = text.match(/Thought: (.*?)(?=Commands:|$)/s);
    if (thoughtMatch?.[1]) {
      parsed.thought = thoughtMatch[1].trim();
    }

    const commandsMatch = text.match(/Commands: (.*?)(?=Response:|$)/s);
    if (commandsMatch?.[1]) {
      parsed.commands = commandsMatch[1]
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
    }

    const responseMatch = text.match(/Response: (.*?)$/s);
    if (responseMatch?.[1]) {
      parsed.response = responseMatch[1].trim();
    }

    return parsed;
  }

  async clearMemory(): Promise<void> {
    await this.memory.clear();
  }
}
