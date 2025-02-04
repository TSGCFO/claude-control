import { v4 as uuidv4 } from 'uuid';

export interface Command {
  type: 'FILE' | 'APP' | 'WEB' | 'SYSTEM';
  action: string;
  parameters: Record<string, string>;
  contextId: string;
}

export interface SystemState {
  runningProcesses: string[];
  activeWindows: string[];
  resources: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export interface UserPreferences {
  defaultBrowser: string;
  defaultEditor: string;
  customCommands: Record<string, string>;
}

export interface CommandContext {
  id: string;
  previousCommands: string[];
  systemState: SystemState;
  userPreferences: UserPreferences;
}

export interface ExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  newState?: SystemState;
}

export class CommandValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommandValidationError';
  }
}

export class NaturalLanguageProcessor {
  private context: CommandContext;
  private commandHistory: Map<string, Command> = new Map();

  constructor() {
    this.context = {
      id: uuidv4(),
      previousCommands: [],
      systemState: this.initializeSystemState(),
      userPreferences: this.initializeUserPreferences()
    };
  }

  parseCommand(input: string): Command {
    try {
      // Clean and normalize input while preserving case
      const cleanInput = this.sanitizeInput(input);

      // Extract command type and action
      const { type, action, remaining } = this.extractCommandParts(cleanInput);

      // Parse parameters
      const parameters = this.parseParameters(remaining);

      // Validate command
      this.validateCommand(type, action, parameters);

      // Create command with unique ID
      const commandId = uuidv4();
      const command: Command = {
        type,
        action,
        parameters,
        contextId: this.context.id
      };

      // Store command in history
      this.commandHistory.set(commandId, command);

      return command;
    } catch (error) {
      if (error instanceof Error) {
        throw new CommandValidationError(`Failed to parse command: ${error.message}`);
      }
      throw error;
    }
  }

  private sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, ' ');
  }

  private extractCommandParts(input: string): {
    type: Command['type'];
    action: string;
    remaining: string;
  } {
    const parts = input.split(' ');
    if (parts.length < 2) {
      throw new Error('Command must include both type and action');
    }

    const type = this.validateType(parts[0].toUpperCase());
    const action = parts[1].toLowerCase();
    const remaining = parts.slice(2).join(' ');

    return { type, action, remaining };
  }

  private validateType(type: string): Command['type'] {
    const validTypes = ['FILE', 'APP', 'WEB', 'SYSTEM'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid command type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }
    return type as Command['type'];
  }

  private parseParameters(paramString: string): Record<string, string> {
    const params: Record<string, string> = {};

    if (!paramString) {
      return params;
    }

    // Match key=value pairs, handling both quoted and unquoted values
    const regex = /([a-zA-Z0-9_]+)=(?:"((?:[^"\\]|\\.)*)"|([^\s]*))/g;
    let match;

    while ((match = regex.exec(paramString)) !== null) {
      const [, key, quotedValue, unquotedValue] = match;
      const value = quotedValue
        ? quotedValue.replace(/\\"/g, '"')
        : unquotedValue;
      params[key] = value;
    }

    return params;
  }

  private validateCommand(
    type: Command['type'],
    action: string,
    parameters: Record<string, string>
  ): void {
    // Validate action based on type
    const validActions = this.getValidActions(type);
    if (!validActions.includes(action)) {
      throw new Error(
        `Invalid action '${action}' for type '${type}'. Valid actions are: ${validActions.join(', ')}`
      );
    }

    // Validate required parameters
    const requiredParams = this.getRequiredParameters(type, action);
    for (const param of requiredParams) {
      if (!(param in parameters)) {
        throw new Error(`Missing required parameter '${param}' for ${type} ${action}`);
      }
    }
  }

  private getValidActions(type: Command['type']): string[] {
    switch (type) {
      case 'FILE':
        return ['read', 'write', 'delete', 'list'];
      case 'APP':
        return ['launch', 'close', 'focus', 'cleanup'];
      case 'WEB':
        return ['initialize', 'cleanup', 'navigate', 'search', 'click', 'type'];
      case 'SYSTEM':
        return ['get', 'set', 'reset', 'initialize'];
      default:
        return [];
    }
  }

  private getRequiredParameters(type: Command['type'], action: string): string[] {
    switch (type) {
      case 'FILE':
        return action === 'write' ? ['path', 'content'] : ['path'];
      case 'APP':
        return action === 'cleanup' ? [] : ['app'];
      case 'WEB':
        return action === 'navigate' ? ['url'] :
               action === 'click' ? ['selector'] :
               action === 'type' ? ['text'] : [];
      case 'SYSTEM':
        return action === 'set' ? ['setting', 'value'] : ['setting'];
      default:
        return [];
    }
  }

  private initializeSystemState(): SystemState {
    return {
      runningProcesses: [],
      activeWindows: [],
      resources: {
        cpu: 0,
        memory: 0,
        disk: 0
      }
    };
  }

  private initializeUserPreferences(): UserPreferences {
    return {
      defaultBrowser: 'chrome',
      defaultEditor: 'vscode',
      customCommands: {}
    };
  }
}