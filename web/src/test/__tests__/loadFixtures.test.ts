import fs from 'fs';
import {
  loadFixture,
  loadMessageFixtures,
  loadSystemFixtures,
  getTestMessage,
  getTestConversation,
  getTestNotification,
  getTestOperation,
  getTestResponse,
  getTestCapability,
  getTestMetrics,
  getTestEvents,
  createTempFixture,
  cleanupTempFixtures
} from '../loadFixtures';

type MessageFixtures = ReturnType<typeof loadMessageFixtures>;

describe('Fixture Loading Utilities', () => {
  afterEach(() => {
    cleanupTempFixtures();
  });

  describe('loadFixture', () => {
    it('should load a JSON fixture file', () => {
      const messages = loadFixture<MessageFixtures>('messages.json');
      expect(messages).toBeDefined();
      expect(Array.isArray(messages.messages)).toBe(true);
    });

    it('should throw error for non-existent fixture', () => {
      expect(() => loadFixture('non-existent.json')).toThrow();
    });
  });

  describe('Message Fixtures', () => {
    it('should load message fixtures', () => {
      const fixtures = loadMessageFixtures();
      expect(fixtures.messages).toBeDefined();
      expect(fixtures.conversations).toBeDefined();
      expect(fixtures.notifications).toBeDefined();
      expect(fixtures.systemOperations).toBeDefined();
      expect(fixtures.systemResponses).toBeDefined();
    });

    it('should get specific message by id', () => {
      const message = getTestMessage('msg-1');
      expect(message).toBeDefined();
      expect(message?.id).toBe('msg-1');
      expect(message?.role).toBe('user');
    });

    it('should get specific conversation by id', () => {
      const conversation = getTestConversation('conv-1');
      expect(conversation).toBeDefined();
      expect(conversation?.id).toBe('conv-1');
      expect(conversation?.messages).toHaveLength(4);
    });

    it('should get specific notification by id', () => {
      const notification = getTestNotification('notif-1');
      expect(notification).toBeDefined();
      expect(notification?.id).toBe('notif-1');
      expect(notification?.type).toBe('success');
    });

    it('should get specific operation by requestId', () => {
      const operation = getTestOperation('op-1');
      expect(operation).toBeDefined();
      expect(operation?.requestId).toBe('op-1');
      expect(operation?.type).toBe('COMMAND');
    });

    it('should get specific response by requestId', () => {
      const response = getTestResponse('op-1');
      expect(response).toBeDefined();
      expect(response?.requestId).toBe('op-1');
      expect(response?.success).toBe(true);
    });
  });

  describe('System Fixtures', () => {
    it('should load system fixtures', () => {
      const fixtures = loadSystemFixtures();
      expect(fixtures.capabilities).toBeDefined();
      expect(fixtures.status).toBeDefined();
      expect(fixtures.events).toBeDefined();
      expect(fixtures.metrics).toBeDefined();
    });

    it('should get specific capability by type', () => {
      const capability = getTestCapability('FILE');
      expect(capability).toBeDefined();
      expect(capability?.type).toBe('FILE');
      expect(capability?.actions).toContain('READ');
    });

    it('should get system metrics', () => {
      const metrics = getTestMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.cpu).toBeDefined();
      expect(metrics.memory).toBeDefined();
      expect(metrics.disk).toBeDefined();
      expect(metrics.network).toBeDefined();
    });

    it('should get system events', () => {
      const events = getTestEvents();
      expect(events).toBeDefined();
      expect(Array.isArray(events)).toBe(true);
      expect(events[0].type).toBe('STATUS');
    });
  });

  describe('Temporary Fixtures', () => {
    it('should create and cleanup temporary fixtures', async () => {
      const testData = { test: 'data' };
      const tempFile = await createTempFixture(testData);
      
      expect(fs.existsSync(tempFile)).toBe(true);
      expect(JSON.parse(fs.readFileSync(tempFile, 'utf-8'))).toEqual(testData);
      
      cleanupTempFixtures();
      expect(fs.existsSync(tempFile)).toBe(false);
    });

    it('should handle multiple temporary fixtures', async () => {
      const files = await Promise.all([
        createTempFixture({ id: 1 }),
        createTempFixture({ id: 2 }),
        createTempFixture({ id: 3 })
      ]);

      files.forEach(file => {
        expect(fs.existsSync(file)).toBe(true);
      });

      cleanupTempFixtures();
      files.forEach(file => {
        expect(fs.existsSync(file)).toBe(false);
      });
    });
  });
});