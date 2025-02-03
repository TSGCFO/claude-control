import { Config } from '@jest/types';
import { defaults } from 'jest-config';
import testConfig from './config';

// Determine test environment based on test file path
const getTestEnvironment = (testPath: string): string => {
  if (testPath.includes('__tests__/e2e/')) {
    return 'jsdom'; // Use jsdom for E2E tests
  }
  if (testPath.includes('__tests__/browser/')) {
    return 'jsdom'; // Use jsdom for browser-specific tests
  }
  return 'node'; // Default to Node.js environment
};

// Configure test runner
const config: Config.InitialOptions = {
  ...defaults,
  
  // Test environment configuration
  testEnvironment: getTestEnvironment(''),
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },

  // Test matching patterns
  testMatch: [
    '**/__tests__/**/*.(spec|test).[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/e2e/'
  ],

  // Module configuration
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },

  // Transform configuration
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }]
  },

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [testConfig.filePatterns.SOURCE],
  coveragePathIgnorePatterns: [...testConfig.filePatterns.EXCLUDE],
  coverageDirectory: testConfig.paths.COVERAGE,
  coverageThreshold: {
    global: {
      branches: testConfig.coverageThresholds.GLOBAL.branches,
      functions: testConfig.coverageThresholds.GLOBAL.functions,
      lines: testConfig.coverageThresholds.GLOBAL.lines,
      statements: testConfig.coverageThresholds.GLOBAL.statements
    }
  },

  // Setup files
  setupFiles: [
    '<rootDir>/src/test/setupNode.ts'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/test/setupEnv.ts',
    '<rootDir>/src/test/testEnv.ts'
  ],

  // Global configuration
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }
  },

  // Timing configuration
  testTimeout: testConfig.timeouts.DEFAULT,
  slowTestThreshold: 5,

  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: testConfig.paths.REPORTS,
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ],

  // Watch configuration
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  // Project configuration
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '**/__tests__/!(browser|e2e)/**/*.(spec|test).[jt]s?(x)',
        '!**/__tests__/browser/**/*',
        '!**/__tests__/e2e/**/*'
      ]
    },
    {
      displayName: 'browser',
      testEnvironment: 'jsdom',
      testMatch: [
        '**/__tests__/browser/**/*.(spec|test).[jt]s?(x)'
      ],
      setupFiles: [
        '<rootDir>/src/test/setupReact.ts'
      ]
    },
    {
      displayName: 'e2e',
      testEnvironment: 'jsdom',
      testMatch: [
        '**/__tests__/e2e/**/*.(spec|test).[jt]s?(x)'
      ],
      setupFiles: [
        '<rootDir>/src/test/setupReact.ts'
      ],
      testTimeout: testConfig.timeouts.NETWORK
    }
  ] as Config.InitialProjectOptions[],

  // Custom resolver
  resolver: '<rootDir>/src/test/resolver.js',

  // Error handling
  bail: 0,
  verbose: true,

  // Cache configuration
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // Cleanup configuration
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Notification configuration
  notify: true,
  notifyMode: 'failure-change',

  // Performance configuration
  maxConcurrency: 5,
  maxWorkers: '50%'
};

export default config;