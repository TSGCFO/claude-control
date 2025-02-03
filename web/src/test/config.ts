// Test environment configuration
const ENV = {
  NODE_ENV: 'test',
  TZ: 'UTC',
  API_URL: 'http://localhost:8000',
  WS_URL: 'ws://localhost:8000',
  USER_EMAIL: 'test@example.com',
  USER_PASSWORD: 'test-password',
  API_KEY: 'test-api-key'
} as const;

// Test paths configuration
const PATHS = {
  ROOT: 'src/test',
  FIXTURES: 'src/test/fixtures',
  MOCKS: 'src/test/__mocks__',
  OUTPUT: 'src/test/output',
  REPORTS: 'src/test/reports',
  COVERAGE: 'coverage'
} as const;

// Test timeouts configuration
const TIMEOUTS = {
  DEFAULT: 5000,
  ASYNC: 10000,
  NETWORK: 15000,
  ANIMATION: 1000,
  DEBOUNCE: 300
} as const;

// Test intervals configuration
const INTERVALS = {
  POLL: 100,
  ANIMATION: 16,
  DEBOUNCE: 150
} as const;

// Test coverage thresholds
const COVERAGE_THRESHOLDS = {
  GLOBAL: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  UNIT: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  },
  INTEGRATION: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
} as const;

// Test file patterns
const FILE_PATTERNS = {
  TEST: '(/__tests__/.*|(\\.|/)(test|spec))\\.[tj]sx?$',
  SOURCE: 'src/**/*.{ts,tsx}',
  EXCLUDE: [
    'src/**/*.d.ts',
    'src/main.tsx',
    'src/vite-env.d.ts',
    'src/types/**/*',
    'src/**/*.stories.*'
  ]
} as const;

// Test module configuration
const MODULE_CONFIG = {
  FILE_EXTENSIONS: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  NAME_MAPPER: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  }
} as const;

// Test browser configuration
const BROWSER_CONFIG = {
  VIEWPORT: {
    width: 1280,
    height: 800
  },
  DEVICE_SCALE_FACTOR: 1,
  IS_MOBILE: false,
  HAS_TOUCH: false,
  IS_LANDSCAPE: false
} as const;

// Test data configuration
const TEST_DATA = {
  BATCH_SIZE: 10,
  MAX_ITEMS: 100,
  STRING_LENGTH: 10,
  MIN_NUMBER: 0,
  MAX_NUMBER: 1000
} as const;

// Test feature flags
const FEATURES = {
  MOCK_DATE: true,
  MOCK_RANDOM: true,
  SKIP_ANIMATIONS: true,
  ENABLE_COVERAGE: true,
  ENABLE_SNAPSHOTS: true,
  ENABLE_LOGGING: false
} as const;

// Test error messages
const ERROR_MESSAGES = {
  TIMEOUT: 'Operation timed out',
  NETWORK: 'Network error occurred',
  VALIDATION: 'Validation error occurred',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  SERVER_ERROR: 'Internal server error',
  BAD_REQUEST: 'Bad request'
} as const;

// Test status codes
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
} as const;

// Export test configuration
const testConfig = {
  env: ENV,
  paths: PATHS,
  timeouts: TIMEOUTS,
  intervals: INTERVALS,
  coverageThresholds: COVERAGE_THRESHOLDS,
  filePatterns: FILE_PATTERNS,
  moduleConfig: MODULE_CONFIG,
  browserConfig: BROWSER_CONFIG,
  testData: TEST_DATA,
  features: FEATURES,
  errorMessages: ERROR_MESSAGES,
  statusCodes: STATUS_CODES
} as const;

export default testConfig;

// Export individual configurations for granular access
export {
  ENV,
  PATHS,
  TIMEOUTS,
  INTERVALS,
  COVERAGE_THRESHOLDS,
  FILE_PATTERNS,
  MODULE_CONFIG,
  BROWSER_CONFIG,
  TEST_DATA,
  FEATURES,
  ERROR_MESSAGES,
  STATUS_CODES
};

// Export type for use in other files
export type TestConfig = typeof testConfig;