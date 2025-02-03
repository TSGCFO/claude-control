import { testContext } from '../TestContext';
import { isMockResponse } from '../mocks/Response';

describe('TestContext', () => {
  describe('Singleton Instance', () => {
    it('should return the same instance', () => {
      const instance1 = testContext;
      const instance2 = testContext;
      expect(instance1).toBe(instance2);
    });

    it('should have all utilities available', () => {
      expect(testContext.config).toBeDefined();
      expect(testContext.utils).toBeDefined();
      expect(testContext.helpers).toBeDefined();
      expect(testContext.fixtures).toBeDefined();
      expect(testContext.reactUtils).toBeDefined();
    });
  });

  describe('Utility Methods', () => {
    it('should wait for next tick', async () => {
      let flag = false;
      setTimeout(() => { flag = true; }, 0);
      await testContext.waitForNextTick();
      expect(flag).toBe(true);
    });

    it('should wait for condition', async () => {
      let flag = false;
      setTimeout(() => { flag = true; }, testContext.config.intervals.POLL);
      await testContext.waitForCondition(() => flag);
      expect(flag).toBe(true);
    });

    it('should timeout when condition not met', async () => {
      await expect(
        testContext.waitForCondition(
          () => false,
          testContext.config.intervals.POLL * 2
        )
      ).rejects.toThrow('Condition not met within timeout');
    });
  });

  describe('Mock Response', () => {
    it('should create mock response', () => {
      const response = testContext.createMockResponse();
      expect(isMockResponse(response)).toBe(true);
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });

    it('should create mock response with custom options', () => {
      const response = testContext.createMockResponse({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(response.statusText).toBe('Not Found');
    });

    it('should create mock fetch function', async () => {
      const fetch = testContext.createMockFetch();
      const response = await fetch('https://api.example.com');
      expect(isMockResponse(response)).toBe(true);
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });
  });

  describe('Mock Storage', () => {
    let storage: Storage;

    beforeEach(() => {
      storage = testContext.createMockStorage();
    });

    it('should set and get items', () => {
      storage.setItem('key', 'value');
      expect(storage.getItem('key')).toBe('value');
    });

    it('should remove items', () => {
      storage.setItem('key', 'value');
      storage.removeItem('key');
      expect(storage.getItem('key')).toBeNull();
    });

    it('should clear all items', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.clear();
      expect(storage.getItem('key1')).toBeNull();
      expect(storage.getItem('key2')).toBeNull();
    });
  });

  describe('Environment Configuration', () => {
    beforeEach(() => {
      testContext.configureTestEnvironment();
    });

    it('should configure environment variables', () => {
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.TZ).toBe('UTC');
    });

    it('should configure global mocks', () => {
      console.log('test');
      expect(console.log).toHaveBeenCalledWith('test');
    });

    it('should configure fetch mock', async () => {
      const response = await fetch('https://api.example.com');
      expect(isMockResponse(response)).toBe(true);
    });

    it('should configure storage mocks', () => {
      localStorage.setItem('test', 'value');
      expect(localStorage.getItem('test')).toBe('value');

      sessionStorage.setItem('test', 'value');
      expect(sessionStorage.getItem('test')).toBe('value');
    });
  });

  describe('Reset', () => {
    beforeEach(() => {
      jest.spyOn(document.body, 'innerHTML', 'set');
      localStorage.setItem('test', 'value');
      sessionStorage.setItem('test', 'value');
      console.log('test');
    });

    it('should reset all test state', () => {
      testContext.reset();

      expect(document.body.innerHTML).toBe('');
      expect(localStorage.getItem('test')).toBeNull();
      expect(sessionStorage.getItem('test')).toBeNull();
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});