# Getting Started Guide

## Project Setup

1. Create the project structure:
```
claude-control/
├── src/
│   ├── core/
│   │   ├── nli/              # Natural Language Interface
│   │   │   ├── processor.ts
│   │   │   ├── types.ts
│   │   │   └── context.ts
│   │   ├── executor/         # Action Executor
│   │   │   ├── executor.ts
│   │   │   ├── types.ts
│   │   │   └── state.ts
│   │   └── system/          # System Integration
│   │       ├── file.ts
│   │       ├── app.ts
│   │       ├── web.ts
│   │       └── settings.ts
│   ├── utils/
│   │   ├── sanitizer.ts
│   │   ├── validator.ts
│   │   └── logger.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── unit/
│   │   ├── nli.test.ts
│   │   ├── executor.test.ts
│   │   └── system.test.ts
│   └── integration/
│       └── end-to-end.test.ts
├── package.json
└── tsconfig.json
```

2. Initialize the project:
```bash
mkdir claude-control
cd claude-control
npm init -y
npm install typescript @types/node --save-dev
npx tsc --init
```

3. Configure TypeScript (tsconfig.json):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "tests"]
}
```

## Implementation Steps

### Step 1: Define Core Types

Create `src/types/index.ts`:
```typescript
// Command Types
export interface Command {
  type: 'FILE' | 'APP' | 'WEB' | 'SYSTEM';
  action: string;
  parameters: Record<string, any>;
  context?: CommandContext;
}

export interface CommandContext {
  previousCommands: Command[];
  systemState: SystemState;
  userPreferences: UserPreferences;
}

// Execution Types
export interface ExecutionResult {
  success: boolean;
  output: any;
  error?: Error;
  command: Command;
  newState: SystemState;
}

export interface ExecutionState {
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  currentOperation?: string;
  errors: Error[];
}

// System Integration Types
export interface FileAction {
  action: 'read' | 'write' | 'delete' | 'list';
  path: string;
  content?: string;
}

export interface AppAction {
  action: 'launch' | 'close' | 'focus';
  app: string;
  parameters?: Record<string, any>;
}

export interface WebAction {
  action: 'navigate' | 'search' | 'click' | 'type';
  url?: string;
  selector?: string;
  text?: string;
}

export interface SettingsAction {
  action: 'get' | 'set' | 'reset';
  setting: string;
  value?: any;
}
```

### Step 2: Implement Natural Language Interface

Create `src/core/nli/processor.ts`:
```typescript
import { Command, CommandContext } from '../../types';

export class NaturalLanguageProcessor {
  private context: CommandContext;

  constructor() {
    this.context = {
      previousCommands: [],
      systemState: {},
      userPreferences: {}
    };
  }

  async parseCommand(input: string): Promise<Command> {
    // Initial implementation
    const [type, action, ...params] = input.split(' ');
    
    return {
      type: this.validateType(type.toUpperCase()),
      action: action.toLowerCase(),
      parameters: this.parseParameters(params),
      context: this.context
    };
  }

  private validateType(type: string): Command['type'] {
    const validTypes = ['FILE', 'APP', 'WEB', 'SYSTEM'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid command type: ${type}`);
    }
    return type as Command['type'];
  }

  private parseParameters(params: string[]): Record<string, any> {
    // Simple parameter parsing
    const result: Record<string, any> = {};
    for (let i = 0; i < params.length; i += 2) {
      result[params[i]] = params[i + 1];
    }
    return result;
  }
}
```

### Step 3: Implement Action Executor

Create `src/core/executor/executor.ts`:
```typescript
import { Command, ExecutionResult, ExecutionState } from '../../types';
import { SystemIntegration } from '../system/types';

export class ActionExecutor {
  private state: ExecutionState;
  private systemIntegration: SystemIntegration;

  constructor(systemIntegration: SystemIntegration) {
    this.systemIntegration = systemIntegration;
    this.state = {
      status: 'PENDING',
      progress: 0,
      errors: []
    };
  }

  async execute(command: Command): Promise<ExecutionResult> {
    try {
      this.updateState('RUNNING', command);
      
      const output = await this.executeByType(command);
      
      this.updateState('COMPLETED', command);
      
      return {
        success: true,
        output,
        command,
        newState: await this.getSystemState()
      };
    } catch (error) {
      this.updateState('FAILED', command, error);
      throw error;
    }
  }

  private async executeByType(command: Command): Promise<any> {
    switch (command.type) {
      case 'FILE':
        return this.systemIntegration.fileSystem[command.action](
          command.parameters
        );
      case 'APP':
        return this.systemIntegration.applications[command.action](
          command.parameters
        );
      case 'WEB':
        return this.systemIntegration.browser[command.action](
          command.parameters
        );
      case 'SYSTEM':
        return this.systemIntegration.settings[command.action](
          command.parameters
        );
      default:
        throw new Error(`Unknown command type: ${command.type}`);
    }
  }

  private updateState(
    status: ExecutionState['status'],
    command: Command,
    error?: Error
  ): void {
    this.state = {
      status,
      progress: this.calculateProgress(status),
      currentOperation: command.action,
      errors: error ? [...this.state.errors, error] : this.state.errors
    };
  }

  private calculateProgress(status: ExecutionState['status']): number {
    switch (status) {
      case 'PENDING': return 0;
      case 'RUNNING': return 50;
      case 'COMPLETED': return 100;
      case 'FAILED': return -1;
      default: return 0;
    }
  }

  private async getSystemState(): Promise<any> {
    // Implement system state collection
    return {};
  }
}
```

### Step 4: Begin System Integration

Create `src/core/system/file.ts`:
```typescript
import { FileAction } from '../../types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FileSystem {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async read(params: FileAction): Promise<string> {
    const safePath = this.sanitizePath(params.path);
    return fs.readFile(safePath, 'utf8');
  }

  async write(params: FileAction): Promise<void> {
    const safePath = this.sanitizePath(params.path);
    await fs.writeFile(safePath, params.content || '');
  }

  async delete(params: FileAction): Promise<void> {
    const safePath = this.sanitizePath(params.path);
    await fs.unlink(safePath);
  }

  async list(params: FileAction): Promise<string[]> {
    const safePath = this.sanitizePath(params.path);
    return fs.readdir(safePath);
  }

  private sanitizePath(filePath: string): string {
    const normalized = path.normalize(filePath);
    const safe = path.join(this.basePath, normalized);
    
    if (!safe.startsWith(this.basePath)) {
      throw new Error('Path traversal attempt detected');
    }
    
    return safe;
  }
}
```

## Next Steps

1. Implement remaining system integration components:
   - Application control
   - Web navigation
   - System settings

2. Add error handling and logging:
   - Implement error types
   - Add logging system
   - Create error recovery strategies

3. Implement testing:
   - Unit tests for each component
   - Integration tests for end-to-end flows
   - Mock system operations for testing

4. Add documentation:
   - API documentation
   - Usage examples
   - Configuration guide

## References

- [Core Implementation](core-implementation.md)
- [Architecture Documentation](architecture.md)
- [Node.js File System](https://nodejs.org/api/fs.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)