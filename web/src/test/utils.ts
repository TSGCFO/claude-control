// Async utilities
export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error('Condition not met within timeout');
};

// Event utilities
export const createTestEvent = <T extends Event>(
  eventType: string,
  properties: Partial<T> = {}
): T => {
  const event = new Event(eventType) as T;
  Object.assign(event, properties);
  return event;
};

export const createMessageEvent = (data: unknown = {}): MessageEvent => {
  return new MessageEvent('message', {
    data: JSON.stringify(data),
    origin: 'http://localhost:8000',
    lastEventId: '',
    source: null,
    ports: []
  });
};

// Response utilities
export const createSuccessResponse = (data: unknown = {}) => ({
  ok: true,
  status: 200,
  json: async () => data,
  text: async () => JSON.stringify(data),
  headers: new Headers({ 'Content-Type': 'application/json' })
});

export const createErrorResponse = (status = 500, message = 'Internal Server Error') => ({
  ok: false,
  status,
  json: async () => ({ error: message }),
  text: async () => message,
  headers: new Headers({ 'Content-Type': 'application/json' })
});

// Mock class utilities
export class MockStorage implements Storage {
  private store: Record<string, string> = {};
  length = 0;

  clear(): void {
    this.store = {};
    this.length = 0;
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
    this.length = Object.keys(this.store).length;
  }

  removeItem(key: string): void {
    delete this.store[key];
    this.length = Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

export class MockWebSocket {
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

// Type utilities
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export const isResponse = (response: unknown): response is Response => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'ok' in response &&
    'status' in response &&
    'headers' in response
  );
};

// String utilities
export const formatError = (error: unknown): string => {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
};

// DOM utilities
export const createMockElement = (tagName: string, attributes: Record<string, string> = {}): HTMLElement => {
  const element = document.createElement(tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
};

export const simulateEvent = (element: HTMLElement, eventType: string, eventInit: EventInit = {}): void => {
  const event = new Event(eventType, eventInit);
  element.dispatchEvent(event);
};