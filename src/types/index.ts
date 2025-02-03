// Core Types
export interface Command {
  type: 'FILE' | 'APP' | 'WEB' | 'SYSTEM';
  action: string;
  parameters: Record<string, string>;
  contextId?: string;
}

export interface CommandContext {
  id: string;
  previousCommands: string[];
  systemState: SystemState;
  userPreferences: UserPreferences;
}

export interface SystemState {
  runningProcesses: string[];
  activeWindows: string[];
  resources: SystemResources;
}

export interface SystemResources {
  cpu: number;
  memory: number;
  disk: number;
}

export interface UserPreferences {
  defaultBrowser?: string;
  defaultEditor?: string;
  customCommands?: Record<string, string>;
}

// Execution Types
export interface ExecutionResult {
  success: boolean;
  output: string | number | boolean | SearchResult | null;
  error?: Error;
  commandId: string;
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
  action: 'launch' | 'close' | 'focus' | 'cleanup';
  app?: string;
  parameters?: Record<string, string | number | boolean>;
}

export interface WebAction {
  action: 'initialize' | 'cleanup' | 'navigate' | 'search' | 'click' | 'type';
  url?: string;
  selector?: string;
  text?: string;
}

export interface SettingsAction {
  action: 'get' | 'set' | 'reset' | 'initialize';
  setting?: string;
  value?: SettingValue;
}

// Settings Types
export type SettingValue = string | number | boolean;

// Error Types
export class CommandValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommandValidationError';
  }
}

export class ExecutionError extends Error {
  constructor(message: string, public commandId: string) {
    super(message);
    this.name = 'ExecutionError';
  }
}

export class SystemIntegrationError extends Error {
  constructor(
    message: string,
    public action: FileAction | AppAction | WebAction | SettingsAction
  ) {
    super(message);
    this.name = 'SystemIntegrationError';
  }
}

// LLM Integration Types
export interface UserRequest {
  type: 'SYSTEM_OPERATION' | 'REASONING' | 'GENERAL';
  content: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ModelResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  executionTime: number;
}

export interface LLMModel {
  provider: 'anthropic' | 'openai';
  model: string;
}

export interface LLMError extends Error {
  name: 'AnthropicError' | 'OpenAIError' | 'LLMError';
  code?: string;
  status?: number;
  provider?: string;
}

export interface LLMProvider {
  processRequest(request: UserRequest): Promise<ModelResponse>;
}

export interface AnthropicMessage {
  content: Array<{ text: string; type: 'text' }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface AnthropicResponse {
  messages: AnthropicMessage[];
  model: string;
  role: string;
}

// System Integration Interface
export interface SystemIntegration {
  fileSystem: {
    read(path: string): Promise<string>;
    write(path: string, content: string): Promise<void>;
    delete(path: string): Promise<void>;
    list(path: string): Promise<string[]>;
  };
  applications: {
    launch(app: string): Promise<void>;
    close(app: string): Promise<void>;
    focus(app: string): Promise<void>;
    sendKeys(keys: string): Promise<void>;
  };
  browser: {
    navigate(url: string): Promise<void>;
    search(query: string): Promise<SearchResult>;
    click(selector: string): Promise<void>;
    type(text: string): Promise<void>;
  };
  settings: {
    get(setting: string): Promise<SettingValue>;
    set(setting: string, value: SettingValue): Promise<void>;
    reset(setting: string): Promise<void>;
  };
}

// Search Result Type
export interface SearchResult {
  query: string;
  results: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
}
