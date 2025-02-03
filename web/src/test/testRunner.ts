import { Config } from '@jest/types';
import { defaults } from 'jest-config';

// Import test environment setup
import './setupEnv';
import './setup';
import './types/jest';

// Configure test environment
process.env.TZ = 'UTC';
process.env.NODE_ENV = 'test';

// Configure test timeouts
const timeout = 10000;
jest.setTimeout(timeout);

// Configure test matchers
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

// Configure global mocks
global.console = {
  ...console,
  // Only log errors during tests
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Configure test hooks
beforeAll(() => {
  // Set up any global test dependencies
});

afterAll(() => {
  // Clean up any global test dependencies
});

beforeEach(() => {
  // Reset any per-test state
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  // Clean up any per-test state
});

// Export test configuration
const config: Config.InitialOptions = {
  ...defaults,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/testRunner.ts'],
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

export default config;