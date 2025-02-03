import {
  createTestEvent,
  createMessageEvent,
  createSuccessResponse,
  createErrorResponse,
  MockStorage,
  MockWebSocket,
  isError,
  isResponse,
  formatError,
  createMockElement,
  simulateEvent,
  flushPromises,
  waitForCondition
} from '../utils';

describe('Test Utilities', () => {
  describe('Event Utilities', () => {
    it('should create test event', () => {
      const event = createTestEvent('click');
      expect(event.type).toBe('click');
    });

    it('should create message event', () => {
      const data = { test: 'data' };
      const event = createMessageEvent(data);
      expect(event.type).toBe('message');
      expect(JSON.parse(event.data)).toEqual(data);
      expect(event.origin).toBe('http://localhost:8000');
    });
  });

  describe('Response Utilities', () => {
    it('should create success response', async () => {
      const data = { success: true };
      const response = createSuccessResponse(data);
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(data);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should create error response', async () => {
      const response = createErrorResponse(404, 'Not Found');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'Not Found' });
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('Mock Storage', () => {
    let storage: MockStorage;

    beforeEach(() => {
      storage = new MockStorage();
    });

    it('should set and get items', () => {
      storage.setItem('key', 'value');
      expect(storage.getItem('key')).toBe('value');
      expect(storage.length).toBe(1);
    });

    it('should remove items', () => {
      storage.setItem('key', 'value');
      storage.removeItem('key');
      expect(storage.getItem('key')).toBeNull();
      expect(storage.length).toBe(0);
    });

    it('should clear all items', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.clear();
      expect(storage.length).toBe(0);
      expect(storage.getItem('key1')).toBeNull();
      expect(storage.getItem('key2')).toBeNull();
    });

    it('should get key by index', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      expect(storage.key(0)).toBe('key1');
      expect(storage.key(1)).toBe('key2');
      expect(storage.key(2)).toBeNull();
    });
  });

  describe('Mock WebSocket', () => {
    it('should simulate WebSocket lifecycle', () => {
      const onOpen = jest.fn();
      const ws = new MockWebSocket('ws://localhost:8000');
      ws.onopen = onOpen;

      expect(ws.url).toBe('ws://localhost:8000');
      expect(ws.readyState).toBe(MockWebSocket.CONNECTING);

      return flushPromises().then(() => {
        expect(ws.readyState).toBe(MockWebSocket.OPEN);
        expect(onOpen).toHaveBeenCalled();
      });
    });

    it('should mock send and close methods', () => {
      const ws = new MockWebSocket('ws://localhost:8000');
      ws.send('test message');
      ws.close();

      expect(ws.send).toHaveBeenCalledWith('test message');
      expect(ws.close).toHaveBeenCalled();
    });
  });

  describe('Type Guards', () => {
    it('should check if value is Error', () => {
      expect(isError(new Error('test'))).toBe(true);
      expect(isError('not an error')).toBe(false);
    });

    it('should check if value is Response', () => {
      const response = createSuccessResponse({});
      expect(isResponse(response)).toBe(true);
      expect(isResponse({})).toBe(false);
    });
  });

  describe('String Utilities', () => {
    it('should format error message', () => {
      expect(formatError(new Error('test'))).toBe('test');
      expect(formatError('error string')).toBe('error string');
      expect(formatError({})).toBe('Unknown error');
    });
  });

  describe('DOM Utilities', () => {
    it('should create mock element', () => {
      const element = createMockElement('div', { id: 'test', class: 'test-class' });
      expect(element.tagName.toLowerCase()).toBe('div');
      expect(element.getAttribute('id')).toBe('test');
      expect(element.getAttribute('class')).toBe('test-class');
    });

    it('should simulate event', () => {
      const element = createMockElement('button');
      const onClick = jest.fn();
      element.addEventListener('click', onClick);
      simulateEvent(element, 'click');
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('Async Utilities', () => {
    it('should wait for next tick', async () => {
      let flag = false;
      setTimeout(() => { flag = true; }, 0);
      await flushPromises();
      expect(flag).toBe(true);
    });

    it('should wait for condition', async () => {
      let flag = false;
      setTimeout(() => { flag = true; }, 100);
      await waitForCondition(() => flag, 1000, 10);
      expect(flag).toBe(true);
    });

    it('should throw error if condition not met within timeout', async () => {
      await expect(waitForCondition(() => false, 100, 10))
        .rejects.toThrow('Condition not met within timeout');
    });
  });
});