import type { Config } from '@jest/types';
import type { Mock } from 'jest-mock';

declare module '@jest/types' {
  namespace Config {
    interface InitialOptions {
      testEnvironment?: string;
      testEnvironmentOptions?: Record<string, unknown>;
      testTimeout?: number;
      slowTestThreshold?: number;
      projects?: InitialProjectOptions[];
      testMatch?: string[];
      testPathIgnorePatterns?: string[];
      moduleFileExtensions?: string[];
      moduleNameMapper?: Record<string, string>;
      transform?: Record<string, [string, Record<string, unknown>]>;
      collectCoverage?: boolean;
      collectCoverageFrom?: string[];
      coveragePathIgnorePatterns?: string[];
      coverageDirectory?: string;
      coverageThreshold?: {
        global?: {
          branches?: number;
          functions?: number;
          lines?: number;
          statements?: number;
        };
      };
      setupFiles?: string[];
      setupFilesAfterEnv?: string[];
      globals?: Record<string, unknown>;
      reporters?: (string | [string, Record<string, unknown>])[];
      watchPlugins?: string[];
      resolver?: string;
      bail?: number;
      verbose?: boolean;
      cacheDirectory?: string;
      clearMocks?: boolean;
      resetMocks?: boolean;
      restoreMocks?: boolean;
      notify?: boolean;
      notifyMode?: string;
      maxConcurrency?: number;
      maxWorkers?: number | string;
    }

    interface InitialProjectOptions {
      displayName?: string;
      testEnvironment?: string;
      testMatch?: string[];
      setupFiles?: string[];
      testTimeout?: number;
    }
  }
}

declare module 'expect' {
  interface Matchers<R> {
    toBeWithinRange(floor: number, ceiling: number): R;
    toHaveBeenCalledAfter(other: Mock<unknown>): R;
  }
}

declare module 'jest-mock' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Mock<TReturn = unknown, TArgs extends readonly unknown[] = readonly unknown[]> {
    getMockName(): string;
  }
}

// Export config type for use in other files
export type { Config };