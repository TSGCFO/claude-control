// System operation types
export type SystemOperationType =
  | 'FILE'
  | 'PROCESS'
  | 'WINDOW'
  | 'BROWSER'
  | 'COMMAND'
  | 'SETTING';

// System operation interfaces
export interface SystemOperation {
  type: SystemOperationType;
  action: string;
  params: Record<string, unknown>;
  requestId: string;
}

export interface SystemResponse {
  type: SystemOperationType;
  action: string;
  requestId: string;
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: number;
}

// System status interfaces
export interface SystemStatus {
  isConnected: boolean;
  lastOperation: SystemOperation | null;
  lastResponse: SystemResponse | null;
  pendingOperations: number;
  errors: string[];
}

// System capability interfaces
export interface SystemCapability {
  type: SystemOperationType;
  actions: string[];
  permissions: string[];
  isAvailable: boolean;
}

// System state interface
export interface SystemState {
  capabilities: SystemCapability[];
  status: SystemStatus;
  events: SystemEvent[];
  isInitialized: boolean;
}

// File operation interfaces
export interface FileOperation extends SystemOperation {
  type: 'FILE';
  action: 'READ' | 'WRITE' | 'DELETE' | 'MOVE' | 'COPY' | 'LIST';
  params: {
    path: string;
    content?: string;
    destination?: string;
    recursive?: boolean;
  };
}

// Process operation interfaces
export interface ProcessOperation extends SystemOperation {
  type: 'PROCESS';
  action: 'START' | 'STOP' | 'LIST';
  params: {
    command?: string;
    args?: string[];
    cwd?: string;
    env?: Record<string, string>;
  };
}

// Window operation interfaces
export interface WindowOperation extends SystemOperation {
  type: 'WINDOW';
  action: 'FOCUS' | 'MINIMIZE' | 'MAXIMIZE' | 'CLOSE';
  params: {
    title?: string;
    pid?: number;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
  };
}

// Browser operation interfaces
export interface BrowserOperation extends SystemOperation {
  type: 'BROWSER';
  action: 'NAVIGATE' | 'CLICK' | 'TYPE' | 'SCROLL';
  params: {
    url?: string;
    selector?: string;
    text?: string;
    position?: { x: number; y: number };
    coordinates?: { x: number; y: number };
  };
}

// Command operation interfaces
export interface CommandOperation extends SystemOperation {
  type: 'COMMAND';
  action: 'EXECUTE';
  params: {
    command: string;
    args?: string[];
    cwd?: string;
    env?: Record<string, string>;
    timeout?: number;
  };
}

// Setting operation interfaces
export interface SettingOperation extends SystemOperation {
  type: 'SETTING';
  action: 'GET' | 'SET';
  params: {
    key: string;
    value?: unknown;
    scope?: 'user' | 'workspace' | 'global';
  };
}

// System event interfaces
export type SystemEventType = 'STATUS' | 'ERROR' | 'NOTIFICATION';

export interface SystemEvent {
  type: SystemEventType;
  content: unknown;
  timestamp: number;
}

// Resource metrics interface
export interface ResourceMetrics {
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkUsage: number;
  timestamp: number;
}

// Permission interfaces
export type PermissionType = 'read' | 'write' | 'execute';

export interface Permission {
  type: PermissionType;
  resource: string;
  granted: boolean;
}

// Error interfaces
export interface SystemError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: number;
  operation?: SystemOperation;
}

// Configuration interfaces
export interface SystemConfig {
  permissions: Permission[];
  capabilities: SystemCapability[];
  settings: Record<string, unknown>;
}