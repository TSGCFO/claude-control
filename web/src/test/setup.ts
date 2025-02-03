import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
  }

  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: readonly number[] = [];

  private callback: IntersectionObserverCallback;
  private options?: IntersectionObserverInit;

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = () => [] as IntersectionObserverEntry[];
};

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve(new Response(JSON.stringify({}), {
    status: 200,
    statusText: 'OK',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  }))
) as jest.Mock;

// Mock WebSocket
class MockWebSocket implements WebSocket {
  static readonly CONNECTING = 0 as const;
  static readonly OPEN = 1 as const;
  static readonly CLOSING = 2 as const;
  static readonly CLOSED = 3 as const;

  readonly CONNECTING = 0 as const;
  readonly OPEN = 1 as const;
  readonly CLOSING = 2 as const;
  readonly CLOSED = 3 as const;

  url = '';
  readyState: 0 | 1 | 2 | 3 = this.CONNECTING;
  bufferedAmount = 0;
  extensions = '';
  protocol = '';
  binaryType: BinaryType = 'blob';

  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string | URL, protocols?: string | string[]) {
    this.url = url.toString();
    if (protocols) {
      this.protocol = Array.isArray(protocols) ? protocols[0] : protocols;
    }
  }

  send = jest.fn();
  close = jest.fn();
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  dispatchEvent = jest.fn(() => true);
}

// Need to cast to preserve the static properties
global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// Add custom matchers
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

// Add custom environment variables
process.env.VITE_API_URL = 'http://localhost:8000';
process.env.VITE_WS_URL = 'ws://localhost:8000';