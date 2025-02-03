import {
  Command,
  ExecutionResult,
  CommandValidationError,
  SystemState
} from '../../types';

export interface CommandParser {
  parse(input: string): Command;
  validate(command: Command): void;
}

export interface CommandExecutor {
  execute(command: Command): Promise<ExecutionResult>;
  cleanup(): Promise<void>;
}

export interface SystemMonitor {
  getState(): SystemState;
  updateState(newState: SystemState): void;
}

export class CommandProcessor {
  private parser: CommandParser;
  private executor: CommandExecutor;
  private monitor: SystemMonitor;

  constructor(
    parser: CommandParser,
    executor: CommandExecutor,
    monitor: SystemMonitor
  ) {
    this.parser = parser;
    this.executor = executor;
    this.monitor = monitor;
  }

  async processCommand(input: string): Promise<ExecutionResult> {
    try {
      // Parse and validate the command
      const command = this.parser.parse(input);
      this.parser.validate(command);

      // Execute the command
      const result = await this.executor.execute(command);

      // Update system state
      this.monitor.updateState(result.newState);

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new CommandValidationError(error.message);
      }
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    await this.executor.cleanup();
  }

  getSystemState(): SystemState {
    return this.monitor.getState();
  }
}
