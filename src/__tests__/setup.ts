import { jest } from '@jest/globals';
import * as path from 'path';

// Configure test environment
process.env.NODE_ENV = 'test';
process.env.TEST_DIR = path.join(process.cwd(), 'test-data');

// Extend timeout for integration tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Export test constants
export const TEST_CONFIG = {
  TEST_DIR: process.env.TEST_DIR,
  SETTINGS_PATH: path.join(process.env.TEST_DIR, 'settings.json')
};
