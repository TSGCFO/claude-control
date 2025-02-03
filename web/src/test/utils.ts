import { testContext } from './TestContext';
import type { Message } from '../types/chat';
import type { SystemOperation } from '../types/system';

/**
 * Test utility functions for common testing operations
 */

// DOM utilities
export const getElement = (selector: string): Element | null => {
  return document.querySelector(selector);
};

export const getAllElements = (selector: string): NodeListOf<Element> => {
  return document.querySelectorAll(selector);
};

export const createElement = (tag: string, props: Record<string, string> = {}): HTMLElement => {
  const element = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
};

// Event utilities
export const createEvent = (type: string, props: Record<string, unknown> = {}): Event => {
  return new Event(type, { bubbles: true, cancelable: true, ...props });
};

export const dispatchEvent = (element: Element, event: Event): void => {
  element.dispatchEvent(event);
};

// Timer utilities
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const waitFor = async (
  condition: () => boolean | Promise<boolean>,
  timeout = testContext.config.timeouts.DEFAULT
): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await Promise.resolve(condition());
    if (result) {
      return;
    }
    await delay(testContext.config.intervals.POLL);
  }

  throw new Error('Condition not met within timeout');
};

// Mock data utilities
export const createMockData = <T>(template: T, count = 1): T[] => {
  return Array.from({ length: count }, () => ({ ...template }));
};

export const createMockId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const createMockTimestamp = (): number => {
  return Date.now();
};

// Network utilities
export const mockFetch = (response: unknown): void => {
  global.fetch = jest.fn().mockImplementation(() => 
    Promise.resolve(testContext.createMockResponse({
      json: () => Promise.resolve(response)
    }))
  );
};

export const mockWebSocket = (): WebSocket => {
  return new WebSocket('ws://localhost:8080');
};

// Storage utilities
export const mockStorage = (): Storage => {
  return testContext.createMockStorage();
};

// Message utilities
export const createMockMessageData = (overrides: Partial<Message> = {}): Message => {
  return {
    id: createMockId(),
    role: 'user',
    content: 'Test message',
    timestamp: createMockTimestamp(),
    status: 'sent',
    ...overrides
  };
};

// Operation utilities
export const createMockOperationData = (overrides: Partial<SystemOperation> = {}): SystemOperation => {
  return {
    type: 'COMMAND',
    action: 'EXECUTE',
    params: { command: 'test' },
    requestId: createMockId(),
    ...overrides
  };
};

// Cleanup utilities
export const cleanup = (): void => {
  testContext.reset();
};

// Export all utilities
export default {
  getElement,
  getAllElements,
  createElement,
  createEvent,
  dispatchEvent,
  delay,
  waitFor,
  createMockData,
  createMockId,
  createMockTimestamp,
  mockFetch,
  mockWebSocket,
  mockStorage,
  createMockMessageData,
  createMockOperationData,
  cleanup
};