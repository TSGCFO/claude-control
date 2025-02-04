import { BaseChain } from 'langchain/chains';
import { SystemIntegration } from '../../types';
import { ClaudeControlChain } from './base';
import { CommandParserChain } from './parser';
import { ExecutorChain } from './executor';
import { BufferMemory } from 'langchain/memory';
import { BaseMessage } from '@langchain/core/messages';

interface ChainInput {
  input: string;
}

interface ChainOutput {
  success: boolean;
  result: unknown;
  error?: string;
  thought?: string;
}

interface MemoryVariables {
  chat_history: BaseMessage[];
}

export class ControlChain extends BaseChain<ChainInput, ChainOutput> {
  public memory: BufferMemory;
  protected baseChain: ClaudeControlChain;
  protected parserChain: CommandParserChain;
  protected executorChain: ExecutorChain;

  constructor(systemIntegration: SystemIntegration) {
    super();
    this.baseChain = new ClaudeControlChain(systemIntegration);
    this.parserChain = new CommandParserChain();
    this.executorChain = new ExecutorChain(systemIntegration);
    this.memory = new BufferMemory({
      memoryKey: 'chat_history',
      returnMessages: true,
      inputKey: 'input',
      outputKey: 'output'
    });
  }

  get inputKeys(): string[] {
    return ['input'];
  }

  get outputKeys(): string[] {
    return ['success', 'result', 'error', 'thought'];
  }

  async _call(values: ChainInput): Promise<ChainOutput> {
    try {
      // Get chat history
      const memoryVars = await this.memory.loadMemoryVariables({}) as MemoryVariables;

      // Process through base chain with agent capabilities
      const baseResult = await this.baseChain._call({
        input: values.input,
        chat_history: memoryVars.chat_history
      });

      // If there's an action, execute it
      if (baseResult.action) {
        // Execute the action
        const executionResult = await this.executorChain._call({
          command: {
            type: baseResult.action.type,
            action: baseResult.action.name,
            parameters: baseResult.action.args as Record<string, string>
          }
        });

        // Save to memory
        await this.memory.saveContext(
          { input: values.input },
          { output: baseResult.output }
        );

        return {
          success: executionResult.success,
          result: executionResult.result,
          error: executionResult.error,
          thought: baseResult.thought
        };
      }

      // If no action, just return the response
      await this.memory.saveContext(
        { input: values.input },
        { output: baseResult.output }
      );

      return {
        success: true,
        result: baseResult.output,
        thought: baseResult.thought
      };

    } catch (error: unknown) {
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  _chainType(): string {
    return 'control_chain';
  }

  async clearMemory(): Promise<void> {
    await this.memory.clear();
  }
}

// Export individual chains for direct use if needed
export { ClaudeControlChain } from './base';
export { CommandParserChain } from './parser';
export { ExecutorChain } from './executor';

// Create and export default instance
export const createControlChain = (systemIntegration: SystemIntegration): ControlChain => (
  new ControlChain(systemIntegration)
);
