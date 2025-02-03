import type { Message, MessageRole, Conversation } from '../../types/chat';
import type { SystemOperation, SystemResponse } from '../../types/system';
import type { Notification } from '../../store/ui';
import {
  assertMessage,
  assertConversation,
  assertOperation,
  assertResponse,
  assertNotification,
  assertArrayLength,
  assertArrayContains,
  assertArrayNotContains,
  assertObjectHasKeys,
  assertObjectEquals,
  assertError,
  assertResolves,
  assertRejects,
  assertElementExists,
  assertElementNotExists,
  assertElementHasText,
  assertElementHasClass,
  assertElementHasAttribute,
  assertEventFired,
  assertEventNotFired,
  assertEventFiredWith,
  assertTimerCalled,
  assertTimerNotCalled,
  assertFetchCalled,
  assertFetchNotCalled
} from '../assertions';

describe('Test Assertions', () => {
  describe('Message Assertions', () => {
    const validMessage: Message = {
      id: 'test-id',
      role: 'user' as MessageRole,
      content: 'test content',
      timestamp: Date.now(),
      status: 'sent'
    };

    it('should validate a valid message', () => {
      expect(() => assertMessage(validMessage)).not.toThrow();
    });

    it('should validate a message with specific values', () => {
      expect(() => assertMessage(validMessage, { id: 'test-id', role: 'user' })).not.toThrow();
    });

    it('should fail for an invalid message', () => {
      const invalidMessage = { id: 'test-id' };
      expect(() => assertMessage(invalidMessage as Message)).toThrow();
    });
  });

  describe('Conversation Assertions', () => {
    const validConversation: Conversation = {
      id: 'test-id',
      title: 'test title',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    it('should validate a valid conversation', () => {
      expect(() => assertConversation(validConversation)).not.toThrow();
    });

    it('should validate a conversation with specific values', () => {
      expect(() => assertConversation(validConversation, { id: 'test-id' })).not.toThrow();
    });
  });

  describe('System Operation Assertions', () => {
    const validOperation: SystemOperation = {
      type: 'COMMAND',
      action: 'EXECUTE',
      params: { command: 'test' },
      requestId: 'test-id'
    };

    it('should validate a valid operation', () => {
      expect(() => assertOperation(validOperation)).not.toThrow();
    });

    it('should validate an operation with specific values', () => {
      expect(() => assertOperation(validOperation, { type: 'COMMAND' })).not.toThrow();
    });
  });

  describe('System Response Assertions', () => {
    const validResponse: SystemResponse = {
      type: 'COMMAND',
      action: 'EXECUTE',
      requestId: 'test-id',
      success: true,
      timestamp: Date.now()
    };

    it('should validate a valid response', () => {
      expect(() => assertResponse(validResponse)).not.toThrow();
    });

    it('should validate a response with specific values', () => {
      expect(() => assertResponse(validResponse, { success: true })).not.toThrow();
    });
  });

  describe('Notification Assertions', () => {
    const validNotification: Notification = {
      id: 'test-id',
      type: 'info',
      message: 'test message',
      timestamp: Date.now(),
      isRead: false
    };

    it('should validate a valid notification', () => {
      expect(() => assertNotification(validNotification)).not.toThrow();
    });

    it('should validate a notification with specific values', () => {
      expect(() => assertNotification(validNotification, { isRead: false })).not.toThrow();
    });
  });

  describe('Array Assertions', () => {
    const array = [1, 2, 3];

    it('should validate array length', () => {
      expect(() => assertArrayLength(array, 3)).not.toThrow();
      expect(() => assertArrayLength(array, 4)).toThrow();
    });

    it('should validate array contains', () => {
      expect(() => assertArrayContains(array, 1)).not.toThrow();
      expect(() => assertArrayContains(array, 4)).toThrow();
    });

    it('should validate array not contains', () => {
      expect(() => assertArrayNotContains(array, 4)).not.toThrow();
      expect(() => assertArrayNotContains(array, 1)).toThrow();
    });
  });

  describe('Object Assertions', () => {
    const obj = { a: 1, b: 2, c: 3 };
    type TestObj = typeof obj;

    it('should validate object has keys', () => {
      expect(() => assertObjectHasKeys<TestObj>(obj, ['a', 'b'])).not.toThrow();
      expect(() => assertObjectHasKeys<TestObj>(obj, ['d' as keyof TestObj])).toThrow();
    });

    it('should validate object equals', () => {
      expect(() => assertObjectEquals(obj, { a: 1, b: 2, c: 3 })).not.toThrow();
      expect(() => assertObjectEquals(obj, { a: 1, b: 2 } as TestObj)).toThrow();
    });
  });

  describe('Error Assertions', () => {
    it('should validate error instance', () => {
      const error = new Error('test error');
      expect(() => assertError(error)).not.toThrow();
      expect(() => assertError(error, 'test error')).not.toThrow();
      expect(() => assertError(error, 'wrong message')).toThrow();
    });

    it('should fail for non-Error objects', () => {
      const notAnError = { message: 'test' };
      expect(() => assertError(notAnError as Error)).toThrow();
    });
  });

  describe('Promise Assertions', () => {
    it('should validate resolving promise', async () => {
      const promise = Promise.resolve('test');
      await expect(assertResolves(promise)).resolves.not.toThrow();
    });

    it('should fail for rejecting promise when expecting resolve', async () => {
      const promise = Promise.reject(new Error('test error'));
      await expect(assertResolves(promise)).rejects.toThrow();
    });

    it('should validate rejecting promise', async () => {
      const promise = Promise.reject(new Error('test error'));
      await expect(assertRejects(promise)).resolves.not.toThrow();
      await expect(assertRejects(promise, 'test error')).resolves.not.toThrow();
    });

    it('should fail for resolving promise when expecting reject', async () => {
      const promise = Promise.resolve('test');
      await expect(assertRejects(promise)).rejects.toThrow();
    });
  });

  describe('DOM Assertions', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      document.body.removeChild(element);
    });

    it('should validate element exists', () => {
      expect(() => assertElementExists(element)).not.toThrow();
      expect(() => assertElementExists(null)).toThrow();
    });

    it('should validate element not exists', () => {
      const nonExistentElement = document.querySelector('.non-existent') as HTMLElement | null;
      expect(() => assertElementNotExists(nonExistentElement)).not.toThrow();
      expect(() => assertElementNotExists(element)).toThrow();
    });

    it('should validate element has text', () => {
      element.textContent = 'test text';
      expect(() => assertElementHasText(element, 'test text')).not.toThrow();
      expect(() => assertElementHasText(element, 'wrong text')).toThrow();
    });

    it('should validate element has class', () => {
      element.className = 'test-class';
      expect(() => assertElementHasClass(element, 'test-class')).not.toThrow();
      expect(() => assertElementHasClass(element, 'wrong-class')).toThrow();
    });

    it('should validate element has attribute', () => {
      element.setAttribute('data-test', 'value');
      expect(() => assertElementHasAttribute(element, 'data-test')).not.toThrow();
      expect(() => assertElementHasAttribute(element, 'data-test', 'value')).not.toThrow();
      expect(() => assertElementHasAttribute(element, 'wrong-attr')).toThrow();
    });
  });

  describe('Event Assertions', () => {
    const mock = jest.fn();

    afterEach(() => {
      mock.mockClear();
    });

    it('should validate event fired', () => {
      mock();
      expect(() => assertEventFired(mock)).not.toThrow();
      expect(() => assertEventFired(mock, 2)).toThrow();
    });

    it('should validate event not fired', () => {
      expect(() => assertEventNotFired(mock)).not.toThrow();
      mock();
      expect(() => assertEventNotFired(mock)).toThrow();
    });

    it('should validate event fired with args', () => {
      mock('test');
      expect(() => assertEventFiredWith(mock, 'test')).not.toThrow();
      expect(() => assertEventFiredWith(mock, 'wrong')).toThrow();
    });
  });

  describe('Timer Assertions', () => {
    const mock = jest.fn();

    afterEach(() => {
      mock.mockClear();
    });

    it('should validate timer called', () => {
      mock(jest.fn(), 1000);
      expect(() => assertTimerCalled(mock, 1000)).not.toThrow();
      expect(() => assertTimerCalled(mock, 2000)).toThrow();
    });

    it('should validate timer not called', () => {
      expect(() => assertTimerNotCalled(mock)).not.toThrow();
      mock(jest.fn(), 1000);
      expect(() => assertTimerNotCalled(mock)).toThrow();
    });
  });

  describe('Network Assertions', () => {
    const mock = jest.fn();

    afterEach(() => {
      mock.mockClear();
    });

    it('should validate fetch called', () => {
      mock('https://api.example.com');
      expect(() => assertFetchCalled(mock, 'https://api.example.com')).not.toThrow();
      expect(() => assertFetchCalled(mock, 'wrong-url')).toThrow();
    });

    it('should validate fetch not called', () => {
      expect(() => assertFetchNotCalled(mock)).not.toThrow();
      mock('https://api.example.com');
      expect(() => assertFetchNotCalled(mock)).toThrow();
    });
  });
});