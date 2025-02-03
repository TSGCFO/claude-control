import type { Config } from '@jest/types';
import testConfig from './src/test/config';

const config: Config.InitialOptions = {
  // Test environment
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },

  // Test patterns
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
    '<rootDir>/src/setupTests.ts'
  ],

  // Global configuration
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }
  },

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
  ],

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
  maxWorkers: '50%',

  // Timing configuration
  testTimeout: testConfig.timeouts.DEFAULT,
  slowTestThreshold: 5
};

export default config;