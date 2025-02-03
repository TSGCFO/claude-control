// System Operation Types
export type SystemOperationType =
  | FileSystemOperation
  | ProcessOperation
  | BrowserOperation
  | CommandOperation
  | WindowOperation
  | SystemSettingOperation;

// File System Operations
export interface FileSystemOperation {
  type: 'FILE_SYSTEM';
  action: 'CREATE' | 'READ' | 'WRITE' | 'DELETE' | 'MOVE' | 'COPY' | 'LIST' | 'SEARCH';
  path: string;
  content?: string;
  destination?: string;
  recursive?: boolean;
  pattern?: string;  // For search operations
}

// Process Operations
export interface ProcessOperation {
  type: 'PROCESS';
  action: 'START' | 'STOP' | 'KILL' | 'LIST' | 'FIND';
  name?: string;
  command?: string;
  args?: string[];
  pid?: number;
  elevated?: boolean;  // For admin privileges
}

// Browser Operations
export interface BrowserOperation {
  type: 'BROWSER';
  action: 'NAVIGATE' | 'CLICK' | 'TYPE' | 'SCROLL' | 'SCREENSHOT' | 'DOWNLOAD';
  url?: string;
  selector?: string;  // CSS selector for elements
  text?: string;      // Text to type
  coordinates?: { x: number; y: number };  // For click operations
  direction?: 'UP' | 'DOWN';  // For scroll operations
  savePath?: string;  // For downloads/screenshots
}

// Command Operations
export interface CommandOperation {
  type: 'COMMAND';
  action: 'EXECUTE';
  command: string;
  args?: string[];
  cwd?: string;
  shell?: boolean;
  elevated?: boolean;  // For admin privileges
  timeout?: number;    // Command timeout in ms
}

// Window Operations
export interface WindowOperation {
  type: 'WINDOW';
  action: 'FOCUS' | 'MINIMIZE' | 'MAXIMIZE' | 'RESTORE' | 'CLOSE' | 'LIST' | 'CAPTURE';
  title?: string;
  pid?: number;
  id?: string;
  savePath?: string;  // For window captures
}

// System Setting Operations
export interface SystemSettingOperation {
  type: 'SYSTEM_SETTING';
  action: 'GET' | 'SET';
  category: 'DISPLAY' | 'AUDIO' | 'NETWORK' | 'POWER' | 'SECURITY';
  setting: string;
  value?: string | number | boolean;
}

// Operation Results
export interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

// System Integration Interface
export interface SystemIntegration {
  // Execute any system operation with full control
  execute(operation: SystemOperationType): Promise<OperationResult>;

  // Validate operation safety
  validateOperation(operation: SystemOperationType): Promise<boolean>;

  // Get system capabilities
  getCapabilities(): Promise<{
    hasElevatedPrivileges: boolean;
    availableOperations: string[];
    restrictions: string[];
  }>;

  // Handle operation confirmation if needed
  confirmOperation(operation: SystemOperationType): Promise<boolean>;
}

// Error Types
export class SystemError extends Error {
  constructor(
    message: string,
    public readonly operation: SystemOperationType,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'SystemError';
  }
}

// System Operation Context
export interface SystemContext {
  // Current working directory
  cwd: string;

  // Environment variables
  env: Record<string, string>;

  // User privileges
  isAdmin: boolean;

  // Operating system info
  platform: 'win32' | 'darwin' | 'linux';

  // Active processes
  activeProcesses: {
    pid: number;
    name: string;
    command?: string;
  }[];

  // Active windows
  activeWindows: {
    id: string;
    title: string;
    pid?: number;
  }[];

  // Browser instances
  activeBrowsers: {
    id: string;
    type: 'chrome' | 'firefox' | 'edge';
    url?: string;
  }[];
}

// System Operation Handler
export interface SystemOperationHandler {
  // Initialize system integration
  initialize(context: SystemContext): Promise<void>;

  // Execute operation with full system access
  executeOperation(
    operation: SystemOperationType,
    context: SystemContext
  ): Promise<OperationResult>;

  // Clean up resources
  cleanup(): Promise<void>;
}
