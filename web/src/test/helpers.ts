import type { Message, Conversation } from '../types/chat';
import type { SystemOperation, SystemResponse } from '../types/system';
import type { Notification } from '../store/ui';

// Mock data generators
export const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'mock-message-id',
  role: 'user',
  content: 'Mock message content',
  timestamp: Date.now(),
  status: 'sent',
  ...overrides
});

export const createMockConversation = (overrides: Partial<Conversation> = {}): Conversation => ({
  id: 'mock-conversation-id',
  title: 'Mock Conversation',
  messages: [createMockMessage()],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides
});

export const createMockOperation = (overrides: Partial<SystemOperation> = {}): SystemOperation => ({
  type: 'COMMAND',
  action: 'EXECUTE',
  params: {
    command: 'mock-command'
  },
  requestId: 'mock-request-id',
  ...overrides
});

export const createMockResponse = (overrides: Partial<SystemResponse> = {}): SystemResponse => ({
  type: 'COMMAND',
  action: 'EXECUTE',
  requestId: 'mock-request-id',
  success: true,
  timestamp: Date.now(),
  ...overrides
});

export const createMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'mock-notification-id',
  type: 'info',
  message: 'Mock notification message',
  timestamp: Date.now(),
  isRead: false,
  ...overrides
});

// Mock event creators
export const createMockEvent = <T extends Event>(
  eventType: string,
  properties: Partial<T> = {}
): T => {
  const event = new Event(eventType) as T;
  Object.assign(event, properties);
  return event;
};

export const createMockMessageEvent = (data: unknown = {}): MessageEvent => {
  return new MessageEvent('message', {
    data: JSON.stringify(data),
    origin: 'http://localhost:8000',
    lastEventId: '',
    source: null,
    ports: []
  });
};

// Mock response creators
export const createMockSuccessResponse = (data: unknown = {}) => ({
  ok: true,
  status: 200,
  json: async () => data,
  text: async () => JSON.stringify(data),
  headers: new Headers({ 'Content-Type': 'application/json' })
});

export const createMockErrorResponse = (status = 500, message = 'Internal Server Error') => ({
  ok: false,
  status,
  json: async () => ({ error: message }),
  text: async () => message,
  headers: new Headers({ 'Content-Type': 'application/json' })
});

// Mock WebSocket
export class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url = '';
  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 0);
  }

  send = jest.fn();
  close = jest.fn();
}

// Mock storage
export class MockStorage implements Storage {
  private store: Record<string, string> = {};
  length = 0;

  clear(): void {
    this.store = {};
    this.length = 0;
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
    this.length = Object.keys(this.store).length;
  }

  removeItem(key: string): void {
    delete this.store[key];
    this.length = Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// Test utilities
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error('Condition not met within timeout');
};