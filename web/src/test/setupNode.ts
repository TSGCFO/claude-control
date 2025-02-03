import { TextEncoder, TextDecoder } from 'util';

// Configure test environment
process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';

// Mock global objects that are not available in Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock window object
global.window = {
  location: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
  },
  sessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
  },
  matchMedia: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  })),
  requestAnimationFrame: jest.fn(callback => setTimeout(callback, 0)),
  cancelAnimationFrame: jest.fn(),
  innerWidth: 1280,
  innerHeight: 800,
  devicePixelRatio: 1,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  scrollTo: jest.fn(),
  scrollBy: jest.fn(),
  getComputedStyle: jest.fn().mockReturnValue({
    getPropertyValue: jest.fn()
  })
} as unknown as Window & typeof globalThis;

// Mock document object
global.document = {
  documentElement: {
    clientWidth: 1280,
    clientHeight: 800,
    scrollTop: 0,
    scrollLeft: 0
  },
  createElement: jest.fn().mockImplementation(tag => ({
    tagName: tag.toUpperCase(),
    children: [],
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    style: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
      toggle: jest.fn()
    }
  })),
  createElementNS: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  getElementById: jest.fn(),
  getElementsByClassName: jest.fn(),
  getElementsByTagName: jest.fn(),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }
} as unknown as Document;

// Mock fetch API
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    headers: new Headers()
  })
);

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url = '';
  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 0);
  }

  send = jest.fn();
  close = jest.fn();
}

global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  (global.window.localStorage as jest.Mocked<Storage>).clear();
  (global.window.sessionStorage as jest.Mocked<Storage>).clear();
});