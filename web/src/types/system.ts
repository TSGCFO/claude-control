export type SystemOperationType =
  | 'FILE'
  | 'PROCESS'
  | 'WINDOW'
  | 'BROWSER'
  | 'COMMAND'
  | 'SETTING';

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

export interface SystemStatus {
  isConnected: boolean;
  lastOperation: SystemOperation | null;
  lastResponse: SystemResponse | null;
  pendingOperations: number;
  errors: string[];
}

export interface FileOperation {
  action: 'READ' | 'WRITE' | 'DELETE' | 'MOVE' | 'COPY' | 'LIST';
  path: string;
  content?: string;
  destination?: string;
  recursive?: boolean;
}

export interface ProcessOperation {
  action: 'START' | 'STOP' | 'LIST';
  name?: string;
  command?: string;
  args?: string[];
}

export interface WindowOperation {
  action: 'FOCUS' | 'MINIMIZE' | 'MAXIMIZE' | 'CLOSE';
  title?: string;
  pid?: number;
}

export interface BrowserOperation {
  action: 'NAVIGATE' | 'CLICK' | 'TYPE' | 'SCROLL';
  url?: string;
  selector?: string;
  text?: string;
  position?: { x: number; y: number };
}

export interface CommandOperation {
  action: 'EXECUTE';
  command: string;
  args?: string[];
  cwd?: string;
}

export interface SettingOperation {
  action: 'GET' | 'SET';
  key: string;
  value?: unknown;
}

export interface SystemEvent {
  type: 'STATUS' | 'ERROR' | 'NOTIFICATION';
  content: unknown;
  timestamp: number;
}

export interface SystemCapability {
  type: SystemOperationType;
  actions: string[];
  permissions: string[];
  isAvailable: boolean;
}

export interface SystemState {
  capabilities: SystemCapability[];
  status: SystemStatus;
  events: SystemEvent[];
  isInitialized: boolean;
}