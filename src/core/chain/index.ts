import { Command, ExecutionResult, SettingValue } from '../../types';

interface ChainedCommand {
  command: Command;
  condition?: (prevResult: ExecutionResult) => boolean;
  onSuccess?: (result: ExecutionResult) => void;
  onError?: (error: Error) => void;
}

export class CommandChain {
  private commands: ChainedCommand[] = [];
  private results: ExecutionResult[] = [];
  private currentIndex = -1;

  addCommand(
    command: Command,
    options: {
      condition?: (prevResult: ExecutionResult) => boolean;
      onSuccess?: (result: ExecutionResult) => void;
      onError?: (error: Error) => void;
    } = {}
  ): CommandChain {
    this.commands.push({
      command,
      condition: options.condition,
      onSuccess: options.onSuccess,
      onError: options.onError
    });
    return this;
  }

  addConditionalCommand(
    condition: (prevResult: ExecutionResult) => boolean,
    command: Command
  ): CommandChain {
    return this.addCommand(command, { condition });
  }

  async execute(
    executor: (command: Command) => Promise<ExecutionResult>
  ): Promise<ExecutionResult[]> {
    this.results = [];
    this.currentIndex = -1;

    for (const chainedCommand of this.commands) {
      try {
        this.currentIndex++;

        // Check condition if present
        if (chainedCommand.condition && this.results.length > 0) {
          const prevResult = this.results[this.results.length - 1];
          if (!chainedCommand.condition(prevResult)) {
            continue; // Skip this command if condition is not met
          }
        }

        // Execute command
        const result = await executor(chainedCommand.command);
        this.results.push(result);

        // Handle success callback
        if (chainedCommand.onSuccess) {
          chainedCommand.onSuccess(result);
        }
      } catch (error) {
        // Handle error callback
        if (chainedCommand.onError && error instanceof Error) {
          chainedCommand.onError(error);
        }
        throw error; // Re-throw to stop chain execution
      }
    }

    return this.results;
  }

  async undo(
    executor: (command: Command) => Promise<ExecutionResult>
  ): Promise<ExecutionResult[]> {
    const undoResults: ExecutionResult[] = [];

    // Undo commands in reverse order
    for (let i = this.currentIndex; i >= 0; i--) {
      const chainedCommand = this.commands[i];
      const originalResult = this.results[i];

      // Generate undo command based on original command type
      const undoCommand = this.createUndoCommand(chainedCommand.command, originalResult);
      if (undoCommand) {
        try {
          const result = await executor(undoCommand);
          undoResults.push(result);
        } catch (error) {
          console.error(`Failed to undo command at index ${i}:`, error);
          throw error;
        }
      }
    }

    // Clear results and reset index after successful undo
    this.results = [];
    this.currentIndex = -1;

    return undoResults;
  }

  private createUndoCommand(command: Command, result: ExecutionResult): Command | null {
    switch (command.type) {
      case 'FILE':
        return this.createFileUndoCommand(command);
      case 'APP':
        return this.createAppUndoCommand(command);
      case 'WEB':
        return this.createWebUndoCommand(command);
      case 'SYSTEM':
        return this.createSystemUndoCommand(command, result);
      default:
        return null;
    }
  }

  private createFileUndoCommand(command: Command): Command | null {
    switch (command.action) {
      case 'write':
        return {
          type: 'FILE',
          action: 'delete',
          parameters: {
            path: command.parameters.path
          },
          contextId: command.contextId
        };
      case 'delete':
        // Can't undo delete without original content
        return null;
      default:
        return null;
    }
  }

  private createAppUndoCommand(command: Command): Command | null {
    switch (command.action) {
      case 'launch':
        return {
          type: 'APP',
          action: 'close',
          parameters: {
            app: command.parameters.app
          },
          contextId: command.contextId
        };
      default:
        return null;
    }
  }

  private createWebUndoCommand(command: Command): Command | null {
    switch (command.action) {
      case 'navigate':
        // Could implement browser back navigation
        return null;
      default:
        return null;
    }
  }

  private createSystemUndoCommand(command: Command, result: ExecutionResult): Command | null {
    switch (command.action) {
      case 'set':
        if (this.isSettingValue(result.output)) {
          return {
            type: 'SYSTEM',
            action: 'set',
            parameters: {
              setting: command.parameters.setting,
              value: result.output
            },
            contextId: command.contextId
          };
        }
        return null;
      default:
        return null;
    }
  }

  private isSettingValue(value: unknown): value is SettingValue {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    );
  }

  getResults(): ExecutionResult[] {
    return [...this.results];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  reset(): void {
    this.commands = [];
    this.results = [];
    this.currentIndex = -1;
  }
}
