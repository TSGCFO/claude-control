// WebSocket Events
export type WebSocketEventType =
  | 'connect'
  | 'disconnect'
  | 'message'
  | 'command'
  | 'response'
  | 'error'
  | 'status';

export interface WebSocketEvent<T = unknown> {
  type: WebSocketEventType;
  payload: T;
  timestamp: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: number;
    requestId: string;
    duration: number;
  };
}

// API Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
}

// API Request Types
export interface ApiRequest<T = unknown> {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  data?: T;
  headers?: Record<string, string>;
}

// WebSocket Message Types
export interface WebSocketMessage<T = unknown> {
  id: string;
  type: string;
  data: T;
  timestamp: number;
}

// WebSocket Command Types
export interface WebSocketCommand {
  id: string;
  type: 'EXECUTE' | 'CANCEL' | 'STATUS';
  command: string;
  args?: unknown[];
  timestamp: number;
}

// WebSocket Response Types
export interface WebSocketResponse {
  id: string;
  success: boolean;
  data?: unknown;
  error?: ApiError;
  timestamp: number;
}

// WebSocket Status Types
export interface WebSocketStatus {
  connected: boolean;
  lastPing?: number;
  lastPong?: number;
  latency?: number;
  messageCount: {
    sent: number;
    received: number;
    errors: number;
  };
}

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    MESSAGES: '/chat/messages',
    STREAM: '/chat/stream',
  },
  SYSTEM: {
    STATUS: '/system/status',
    OPERATIONS: '/system/operations',
    CAPABILITIES: '/system/capabilities',
  },
  FILES: {
    UPLOAD: '/files/upload',
    DOWNLOAD: '/files/download',
    LIST: '/files/list',
  },
} as const;

// API Routes Type
export type ApiRoute = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS][keyof typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS]];

// WebSocket Events Map
export interface WebSocketEventMap {
  connect: void;
  disconnect: void;
  message: WebSocketMessage;
  command: WebSocketCommand;
  response: WebSocketResponse;
  error: ApiError;
  status: WebSocketStatus;
}

// WebSocket Event Handler Type
export type WebSocketEventHandler<T extends WebSocketEventType> = (
  event: WebSocketEvent<WebSocketEventMap[T]>
) => void | Promise<void>;

// WebSocket Event Emitter Type
export interface WebSocketEventEmitter {
  on<T extends WebSocketEventType>(
    event: T,
    handler: WebSocketEventHandler<T>
  ): void;
  off<T extends WebSocketEventType>(
    event: T,
    handler: WebSocketEventHandler<T>
  ): void;
  emit<T extends WebSocketEventType>(
    event: T,
    payload: WebSocketEventMap[T]
  ): void;
}