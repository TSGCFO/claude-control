/**
 * Type definition for our mock response
 */
export interface IMockResponse {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  readonly body: ReadableStream<Uint8Array> | null;
  readonly bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  clone(): IMockResponse;
  formData(): Promise<FormData>;
  json(): Promise<unknown>;
  text(): Promise<string>;
  bytes(): Promise<Uint8Array>;
}

/**
 * Mock implementation of the Response class
 */
export class MockResponse implements IMockResponse {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  readonly body: ReadableStream<Uint8Array> | null;
  readonly bodyUsed: boolean;

  constructor(options: Partial<IMockResponse> = {}) {
    this.headers = options.headers ?? new Headers();
    this.ok = options.ok ?? true;
    this.redirected = options.redirected ?? false;
    this.status = options.status ?? 200;
    this.statusText = options.statusText ?? 'OK';
    this.type = options.type ?? 'basic';
    this.url = options.url ?? 'http://localhost:3000';
    this.body = options.body ?? null;
    this.bodyUsed = options.bodyUsed ?? false;
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return new ArrayBuffer(0);
  }

  async blob(): Promise<Blob> {
    return new Blob();
  }

  clone(): MockResponse {
    return new MockResponse({
      headers: new Headers(this.headers),
      ok: this.ok,
      redirected: this.redirected,
      status: this.status,
      statusText: this.statusText,
      type: this.type,
      url: this.url,
      body: this.body,
      bodyUsed: this.bodyUsed
    });
  }

  async formData(): Promise<FormData> {
    return new FormData();
  }

  async json(): Promise<unknown> {
    return {};
  }

  async text(): Promise<string> {
    return '';
  }

  async bytes(): Promise<Uint8Array> {
    return new Uint8Array(0);
  }
}

// Type guard to check if a response is a mock
export function isMockResponse(response: unknown): response is MockResponse {
  return response instanceof MockResponse;
}

// Helper to create a mock response
export function createMockResponse(options: Partial<IMockResponse> = {}): MockResponse {
  return new MockResponse(options);
}

// Helper to create a mock fetch function
export function createMockFetch(): jest.Mock<Promise<MockResponse>> {
  return jest.fn(() => Promise.resolve(createMockResponse()));
}