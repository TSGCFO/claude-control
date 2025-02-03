import testConfig from './config';
import * as testUtils from './utils';
import * as testHelpers from './helpers';
import * as testFixtures from './loadFixtures';
import * as testReactUtils from './setupReact';
import { createMockResponse, createMockFetch, type IMockResponse } from './mocks/Response';

/**
 * TestContext provides a centralized way to manage test utilities and configuration
 * without relying on global objects.
 */
class TestContext {
  private static instance: TestContext;

  private constructor(
    public readonly config = testConfig,
    public readonly utils = testUtils,
    public readonly helpers = testHelpers,
    public readonly fixtures = testFixtures,
    public readonly reactUtils = testReactUtils
  ) {}

  /**
   * Get the singleton instance of TestContext
   */
  public static getInstance(): TestContext {
    if (!TestContext.instance) {
      TestContext.instance = new TestContext();
    }
    return TestContext.instance;
  }

  /**
   * Wait for the next tick in the event loop
   */
  public async waitForNextTick(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * Wait for a condition to be met
   * @param condition Function that returns true when condition is met
   * @param timeout Maximum time to wait in milliseconds
   * @param interval Time between condition checks in milliseconds
   */
  public async waitForCondition(
    condition: () => boolean,
    timeout: number = this.config.timeouts.DEFAULT,
    interval: number = this.config.intervals.POLL
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Condition not met within timeout');
  }

  /**
   * Create a mock Response object
   */
  public createMockResponse(options: Partial<IMockResponse> = {}): IMockResponse {
    return createMockResponse(options);
  }

  /**
   * Create a mock fetch function
   */
  public createMockFetch(): jest.Mock {
    return createMockFetch();
  }

  /**
   * Create mock storage (localStorage/sessionStorage)
   */
  public createMockStorage(): Storage {
    const store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: jest.fn((key: string) => { delete store[key]; }),
      clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
      key: jest.fn((index: number) => Object.keys(store)[index] || null),
      length: 0
    };
  }

  /**
   * Reset all test state
   */
  public reset(): void {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    localStorage.clear();
    sessionStorage.clear();
  }

  /**
   * Configure the test environment
   */
  public configureTestEnvironment(): void {
    // Set environment variables
    process.env.TZ = 'UTC';
    process.env.NODE_ENV = 'test';

    // Configure Jest timeouts
    jest.setTimeout(this.config.timeouts.DEFAULT);

    // Configure global mocks
    global.console = {
      ...console,
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // Configure fetch mock
    global.fetch = this.createMockFetch();

    // Configure storage mocks
    Object.defineProperty(window, 'localStorage', {
      value: this.createMockStorage()
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: this.createMockStorage()
    });
  }
}

// Export singleton instance
export const testContext = TestContext.getInstance();

// Export types
export type { TestContext };