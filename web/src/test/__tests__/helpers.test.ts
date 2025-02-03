import {
  createMockMessage,
  createMockConversation,
  createMockOperation,
  createMockResponse,
  createMockNotification,
  createMockEvent,
  createMockMessageEvent,
  createMockSuccessResponse,
  createMockErrorResponse,
  MockWebSocket,
  MockStorage,
  waitForNextTick,
  waitForCondition
} from '../helpers';

describe('Test Helpers', () => {
  describe('Mock Data Generators', () => {
    it('should create mock message with default values', () => {
      const message = createMockMessage();
      expect(message.id).toBe('mock-message-id');
      expect(message.role).toBe('user');
      expect(message.content).toBe('Mock message content');
      expect(message.status).toBe('sent');
      expect(message.timestamp).toBeDefined();
    });

    it('should create mock message with overrides', () => {
      const message = createMockMessage({
        id: 'custom-id',
        content: 'Custom content'
      });
      expect(message.id).toBe('custom-id');
      expect(message.content).toBe('Custom content');
    });

    it('should create mock conversation with default values', () => {
      const conversation = createMockConversation();
      expect(conversation.id).toBe('mock-conversation-id');
      expect(conversation.title).toBe('Mock Conversation');
      expect(conversation.messages).toHaveLength(1);
      expect(conversation.createdAt).toBeDefined();
      expect(conversation.updatedAt).toBeDefined();
    });

    it('should create mock operation with default values', () => {
      const operation = createMockOperation();
      expect(operation.type).toBe('COMMAND');
      expect(operation.action).toBe('EXECUTE');
      expect(operation.params.command).toBe('mock-command');
      expect(operation.requestId).toBe('mock-request-id');
    });

    it('should create mock response with default values', () => {
      const response = createMockResponse();
      expect(response.type).toBe('COMMAND');
      expect(response.action).toBe('EXECUTE');
      expect(response.requestId).toBe('mock-request-id');
      expect(response.success).toBe(true);
      expect(response.timestamp).toBeDefined();
    });

    it('should create mock notification with default values', () => {
      const notification = createMockNotification();
      expect(notification.id).toBe('mock-notification-id');
      expect(notification.type).toBe('info');
      expect(notification.message).toBe('Mock notification message');
      expect(notification.isRead).toBe(false);
      expect(notification.timestamp).toBeDefined();
    });
  });

  describe('Event Creators', () => {
    it('should create mock event', () => {
      const event = createMockEvent('click');
      expect(event.type).toBe('click');
    });

    it('should create mock message event', () => {
      const data = { test: 'data' };
      const event = createMockMessageEvent(data);
      expect(event.type).toBe('message');
      expect(JSON.parse(event.data)).toEqual(data);
      expect(event.origin).toBe('http://localhost:8000');
    });
  });

  describe('Response Creators', () => {
    it('should create mock success response', async () => {
      const data = { success: true };
      const response = createMockSuccessResponse(data);
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(data);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should create mock error response', async () => {
      const response = createMockErrorResponse(404, 'Not Found');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'Not Found' });
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('MockWebSocket', () => {
    it('should simulate WebSocket lifecycle', () => {
      const onOpen = jest.fn();
      const ws = new MockWebSocket('ws://localhost:8000');
      ws.onopen = onOpen;

      expect(ws.url).toBe('ws://localhost:8000');
      expect(ws.readyState).toBe(MockWebSocket.CONNECTING);

      return waitForNextTick().then(() => {
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

  describe('MockStorage', () => {
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

  describe('Test Utilities', () => {
    it('should wait for next tick', async () => {
      let flag = false;
      setTimeout(() => { flag = true; }, 0);
      await waitForNextTick();
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