import { BaseChain } from 'langchain/chains';
import { ActionExecutor } from '../executor/executor';
import { z } from 'zod';
import { SystemIntegration } from '../../types';

const CommandType = z.enum(['FILE', 'APP', 'WEB', 'SYSTEM']);

const commandSchema = z.object({
  type: CommandType,
  action: z.string(),
  parameters: z.record(z.string())
});

type ParsedCommand = z.infer<typeof commandSchema>;

interface ExecutorInput {
  command: ParsedCommand;
}

interface ExecutorOutput {
  success: boolean;
  result: unknown;
  error?: string;
}

export class ExecutorChain extends BaseChain<ExecutorInput, ExecutorOutput> {
  private executor: ActionExecutor;

  constructor(systemIntegration: SystemIntegration) {
    super();
    this.executor = new ActionExecutor(systemIntegration);
  }

  get inputKeys(): string[] {
    return ['command'];
  }

  get outputKeys(): string[] {
    return ['success', 'result', 'error'];
  }

  async _call(values: ExecutorInput): Promise<ExecutorOutput> {
    try {
      const result = await this.executor.execute(values.command);

      return {
        success: result.success,
        result: result.output,
        error: result.error?.toString()
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
    return 'executor_chain';
  }

  async validateCommand(command: ParsedCommand): Promise<boolean> {
    try {
      await commandSchema.parseAsync(command);
      return true;
    } catch (error: unknown) {
      return false;
    }
  }

  getExecutor(): ActionExecutor {
    return this.executor;
  }
}
