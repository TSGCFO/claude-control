import { testContext } from './test/TestContext';

// Import test type definitions
import './test/types/dom';
import './test/types/global';
import './test/types/matchers';
import './test/types/react';
import './test/types/testing-library';

// Configure test environment
testContext.configureTestEnvironment();

// Configure Jest mocks
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
  useState: jest.fn(),
  useContext: jest.fn(),
  useCallback: jest.fn(),
  useMemo: jest.fn(),
  useRef: jest.fn(),
  useReducer: jest.fn()
}));

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
  testContext.reset();
});

afterEach(() => {
  // Clean up any per-test state
  testContext.reset();
});

// Configure global test matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor} - ${ceiling}`,
      pass
    };
  },

  toHaveBeenCalledAfter(received: jest.Mock, other: jest.Mock) {
    const receivedCalls = received.mock.invocationCallOrder;
    const otherCalls = other.mock.invocationCallOrder;

    if (receivedCalls.length === 0) {
      return {
        message: () => 'Expected function to have been called',
        pass: false
      };
    }

    if (otherCalls.length === 0) {
      return {
        message: () => 'Expected comparison function to have been called',
        pass: false
      };
    }

    const pass = Math.min(...receivedCalls) > Math.max(...otherCalls);

    return {
      message: () =>
        `expected ${received.getMockName()} to ${
          pass ? 'not ' : ''
        }have been called after ${other.getMockName()}`,
      pass
    };
  }
});

// Export test context for use in tests
export { testContext };