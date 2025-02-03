import '@testing-library/jest-dom';
import './types/matchers';
import './types/react';
import './types/global';
import './setupEnv';
import './setupReact';
import './setup';

// Re-export all test utilities
export * from './helpers';
export * from './loadFixtures';
export * from './setupReact';

// Configure global test environment
process.env.TZ = 'UTC';
process.env.NODE_ENV = 'test';

// Configure test timeouts
const timeout = 10000;
jest.setTimeout(timeout);

// Configure global mocks
global.console = {
  ...console,
  // Only log errors during tests
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Configure global test hooks
beforeAll(() => {
  // Set up any global test dependencies
  localStorage.clear();
  sessionStorage.clear();
});

afterAll(() => {
  // Clean up any global test dependencies
  localStorage.clear();
  sessionStorage.clear();
  jest.clearAllMocks();
});

beforeEach(() => {
  // Reset any per-test state
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  document.body.innerHTML = '';
});

afterEach(() => {
  // Clean up any per-test state
  document.body.innerHTML = '';
});

// Configure global test utilities
global.waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

global.waitForCondition = async (
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

// Configure global test matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Export test configuration
export const testConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/testEnv.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[tj]sx?$',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/types/**/*',
    '!src/**/*.stories.*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  resetMocks: true,
  clearMocks: true,
  verbose: true
};