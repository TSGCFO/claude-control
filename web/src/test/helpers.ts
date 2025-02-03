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

// Type guards
export const isMockMessage = (value: unknown): value is Message => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'role' in value &&
    'content' in value &&
    'timestamp' in value &&
    'status' in value
  );
};

export const isMockConversation = (value: unknown): value is Conversation => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'messages' in value &&
    'createdAt' in value &&
    'updatedAt' in value
  );
};

export const isMockOperation = (value: unknown): value is SystemOperation => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'action' in value &&
    'params' in value &&
    'requestId' in value
  );
};

export const isMockResponse = (value: unknown): value is SystemResponse => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'action' in value &&
    'requestId' in value &&
    'success' in value &&
    'timestamp' in value
  );
};

export const isMockNotification = (value: unknown): value is Notification => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'type' in value &&
    'message' in value &&
    'timestamp' in value &&
    'isRead' in value
  );
};

// Test data generators
export const generateMockData = <T>(count: number, generator: () => T): T[] => {
  return Array.from({ length: count }, generator);
};

// Helper to create a temporary test data
export const createTempData = <T>(data: T): T => {
  return { ...data };
};

// Helper to clean up test data
export const cleanupMockData = <T>(data: T[]): void => {
  data.length = 0;
};

// Helper to verify mock data
export const verifyMockData = <T>(actual: T, expected: T): boolean => {
  return JSON.stringify(actual) === JSON.stringify(expected);
};