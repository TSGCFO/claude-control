// Import and re-export test environment setup
import './testEnv';
export { testConfig } from './testEnv';

// Import utility functions
import {
  flushPromises as waitForNextTick,
  waitForCondition,
  createSuccessResponse as createMockResponse,
  createTestEvent as createMockEvent
} from './utils';

import {
  createMockMessage as createTestMessage,
  createMockConversation as createTestConversation,
  createMockOperation as createTestOperation,
  createMockResponse as createTestResponse,
  createMockNotification as createTestNotification
} from './helpers';

import {
  loadFixture,
  loadMessageFixtures,
  loadSystemFixtures,
  getTestMessage,
  getTestConversation,
  getTestNotification,
  getTestOperation,
  getTestResponse,
  getTestCapability,
  getTestMetrics,
  getTestEvents,
  type MessageFixtures,
  type SystemFixtures
} from './loadFixtures';

import {
  simulateUserInteraction,
  simulateFormInteraction,
  simulateKeyboardInteraction,
  simulateDragAndDrop,
  simulateFileUpload,
  simulateClipboardOperation,
  simulateScroll,
  simulateResize,
  simulateMediaQuery
} from './setupReact';

// Export test types
export type { Message, Conversation } from '../types/chat';
export type { SystemOperation, SystemResponse, SystemCapability } from '../types/system';
export type { Notification } from '../store/ui';
export type { MessageFixtures, SystemFixtures };

// Export test constants
export const TEST_TIMEOUT = 10000;
export const TEST_INTERVAL = 100;

// Export test paths
export const TEST_PATHS = {
  FIXTURES: 'src/test/fixtures',
  MOCKS: 'src/test/__mocks__',
  OUTPUT: 'src/test/output',
  REPORTS: 'src/test/reports'
} as const;

// Export test environment variables
export const TEST_ENV = {
  API_URL: 'http://localhost:8000',
  WS_URL: 'ws://localhost:8000',
  USER_EMAIL: 'test@example.com',
  USER_PASSWORD: 'test-password',
  API_KEY: 'test-api-key'
} as const;

// Export test matchers
export const matchers = {
  toHaveStyleRule: (element: HTMLElement, property: keyof CSSStyleDeclaration, value: string) => {
    const style = window.getComputedStyle(element);
    const pass = style[property] === value;
    return {
      pass,
      message: () =>
        `expected ${element} to ${pass ? 'not ' : ''}have CSS property "${property}: ${value}"`
    };
  },

  toBeVisibleInViewport: (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    const isVisible = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= windowHeight &&
      rect.right <= windowWidth
    );
    return {
      pass: isVisible,
      message: () =>
        `expected ${element} to ${isVisible ? 'not ' : ''}be visible in viewport`
    };
  },

  toBeWithinRange: (received: number, floor: number, ceiling: number) => {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        `expected ${received} to ${pass ? 'not ' : ''}be within range ${floor} - ${ceiling}`
    };
  }
} as const;

// Export test hooks
export const hooks = {
  useMockStore: <T extends Record<string, unknown>>(initialState: T) => {
    let state = { ...initialState };
    const setState = (newState: Partial<T>) => {
      state = { ...state, ...newState };
    };
    return [state, setState] as const;
  },

  useMockRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  })
} as const;

// Export utility functions
export {
  // Test utilities
  waitForNextTick,
  waitForCondition,
  createMockEvent,
  createMockResponse,

  // Test helpers
  createTestMessage,
  createTestConversation,
  createTestOperation,
  createTestResponse,
  createTestNotification,

  // Test fixtures
  loadFixture,
  loadMessageFixtures,
  loadSystemFixtures,
  getTestMessage,
  getTestConversation,
  getTestNotification,
  getTestOperation,
  getTestResponse,
  getTestCapability,
  getTestMetrics,
  getTestEvents,

  // React utilities
  simulateUserInteraction,
  simulateFormInteraction,
  simulateKeyboardInteraction,
  simulateDragAndDrop,
  simulateFileUpload,
  simulateClipboardOperation,
  simulateScroll,
  simulateResize,
  simulateMediaQuery
};