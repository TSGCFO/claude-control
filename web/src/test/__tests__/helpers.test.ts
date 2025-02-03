import {
  createMockMessage,
  createMockConversation,
  createMockOperation,
  createMockResponse,
  createMockNotification,
  isMockMessage,
  isMockConversation,
  isMockOperation,
  isMockResponse,
  isMockNotification,
  generateMockData,
  createTempData,
  cleanupMockData,
  verifyMockData
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

  describe('Type Guards', () => {
    it('should validate mock message', () => {
      const validMessage = createMockMessage();
      const invalidMessage = { id: 'test' };
      expect(isMockMessage(validMessage)).toBe(true);
      expect(isMockMessage(invalidMessage)).toBe(false);
    });

    it('should validate mock conversation', () => {
      const validConversation = createMockConversation();
      const invalidConversation = { id: 'test' };
      expect(isMockConversation(validConversation)).toBe(true);
      expect(isMockConversation(invalidConversation)).toBe(false);
    });

    it('should validate mock operation', () => {
      const validOperation = createMockOperation();
      const invalidOperation = { id: 'test' };
      expect(isMockOperation(validOperation)).toBe(true);
      expect(isMockOperation(invalidOperation)).toBe(false);
    });

    it('should validate mock response', () => {
      const validResponse = createMockResponse();
      const invalidResponse = { id: 'test' };
      expect(isMockResponse(validResponse)).toBe(true);
      expect(isMockResponse(invalidResponse)).toBe(false);
    });

    it('should validate mock notification', () => {
      const validNotification = createMockNotification();
      const invalidNotification = { id: 'test' };
      expect(isMockNotification(validNotification)).toBe(true);
      expect(isMockNotification(invalidNotification)).toBe(false);
    });
  });

  describe('Test Data Utilities', () => {
    it('should generate mock data array', () => {
      const count = 3;
      const data = generateMockData(count, createMockMessage);
      expect(data).toHaveLength(count);
      data.forEach(item => {
        expect(isMockMessage(item)).toBe(true);
      });
    });

    it('should create temporary test data', () => {
      const original = createMockMessage();
      const temp = createTempData(original);
      expect(temp).toEqual(original);
      expect(temp).not.toBe(original);
    });

    it('should clean up mock data array', () => {
      const data = generateMockData(3, createMockMessage);
      cleanupMockData(data);
      expect(data).toHaveLength(0);
    });

    it('should verify mock data equality', () => {
      const message1 = createMockMessage({ id: 'test' });
      const message2 = createMockMessage({ id: 'test' });
      const message3 = createMockMessage({ id: 'different' });

      expect(verifyMockData(message1, message2)).toBe(true);
      expect(verifyMockData(message1, message3)).toBe(false);
    });
  });
});