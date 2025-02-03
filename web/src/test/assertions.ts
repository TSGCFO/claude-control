import '@testing-library/jest-dom';
import './types/dom';
import type { Message, Conversation } from '../types/chat';
import type { SystemOperation, SystemResponse } from '../types/system';
import type { Notification } from '../store/ui';

// Message assertions
export const assertMessage = (message: Message, expected: Partial<Message> = {}): void => {
  expect(message).toBeDefined();
  expect(message.id).toBeDefined();
  expect(message.role).toBeDefined();
  expect(message.content).toBeDefined();
  expect(message.timestamp).toBeDefined();
  expect(message.status).toBeDefined();

  Object.entries(expected).forEach(([key, value]) => {
    expect(message[key as keyof Message]).toEqual(value);
  });
};

// Conversation assertions
export const assertConversation = (conversation: Conversation, expected: Partial<Conversation> = {}): void => {
  expect(conversation).toBeDefined();
  expect(conversation.id).toBeDefined();
  expect(conversation.title).toBeDefined();
  expect(conversation.messages).toBeDefined();
  expect(conversation.createdAt).toBeDefined();
  expect(conversation.updatedAt).toBeDefined();

  Object.entries(expected).forEach(([key, value]) => {
    expect(conversation[key as keyof Conversation]).toEqual(value);
  });
};

// System operation assertions
export const assertOperation = (operation: SystemOperation, expected: Partial<SystemOperation> = {}): void => {
  expect(operation).toBeDefined();
  expect(operation.type).toBeDefined();
  expect(operation.action).toBeDefined();
  expect(operation.params).toBeDefined();
  expect(operation.requestId).toBeDefined();

  Object.entries(expected).forEach(([key, value]) => {
    expect(operation[key as keyof SystemOperation]).toEqual(value);
  });
};

// System response assertions
export const assertResponse = (response: SystemResponse, expected: Partial<SystemResponse> = {}): void => {
  expect(response).toBeDefined();
  expect(response.type).toBeDefined();
  expect(response.action).toBeDefined();
  expect(response.requestId).toBeDefined();
  expect(response.success).toBeDefined();
  expect(response.timestamp).toBeDefined();

  Object.entries(expected).forEach(([key, value]) => {
    expect(response[key as keyof SystemResponse]).toEqual(value);
  });
};

// Notification assertions
export const assertNotification = (notification: Notification, expected: Partial<Notification> = {}): void => {
  expect(notification).toBeDefined();
  expect(notification.id).toBeDefined();
  expect(notification.type).toBeDefined();
  expect(notification.message).toBeDefined();
  expect(notification.timestamp).toBeDefined();
  expect(notification.isRead).toBeDefined();

  Object.entries(expected).forEach(([key, value]) => {
    expect(notification[key as keyof Notification]).toEqual(value);
  });
};

// Array assertions
export const assertArrayLength = <T>(array: T[], expectedLength: number): void => {
  expect(array).toHaveLength(expectedLength);
};

export const assertArrayContains = <T>(array: T[], item: T): void => {
  expect(array).toContain(item);
};

export const assertArrayNotContains = <T>(array: T[], item: T): void => {
  expect(array).not.toContain(item);
};

// Object assertions
export const assertObjectHasKeys = <T extends object>(obj: T, keys: Array<keyof T>): void => {
  keys.forEach(key => {
    expect(obj).toHaveProperty(String(key));
  });
};

export const assertObjectEquals = <T extends object>(obj: T, expected: T): void => {
  expect(obj).toEqual(expected);
};

// Error assertions
export const assertError = (error: Error, expectedMessage?: string): void => {
  expect(error).toBeInstanceOf(Error);
  if (expectedMessage) {
    expect(error.message).toBe(expectedMessage);
  }
};

// Promise assertions
export const assertResolves = async <T>(promise: Promise<T>): Promise<void> => {
  await expect(promise).resolves.toBeDefined();
};

export const assertRejects = async (promise: Promise<unknown>, expectedError?: string | RegExp): Promise<void> => {
  if (expectedError) {
    await expect(promise).rejects.toThrow(expectedError);
  } else {
    await expect(promise).rejects.toBeDefined();
  }
};

// DOM assertions
export const assertElementExists = (element: HTMLElement | null): void => {
  expect(element).toBeInTheDocument();
};

export const assertElementNotExists = (element: HTMLElement | null): void => {
  expect(element).not.toBeInTheDocument();
};

export const assertElementHasText = (element: HTMLElement | null, text: string): void => {
  expect(element).toHaveTextContent(text);
};

export const assertElementHasClass = (element: HTMLElement | null, className: string): void => {
  expect(element).toHaveClass(className);
};

export const assertElementHasAttribute = (element: HTMLElement | null, attribute: string, value?: string): void => {
  if (value) {
    expect(element).toHaveAttribute(attribute, value);
  } else {
    expect(element).toHaveAttribute(attribute);
  }
};

// Event assertions
export const assertEventFired = (mock: jest.Mock, times = 1): void => {
  expect(mock).toHaveBeenCalledTimes(times);
};

export const assertEventNotFired = (mock: jest.Mock): void => {
  expect(mock).not.toHaveBeenCalled();
};

export const assertEventFiredWith = (mock: jest.Mock, ...args: unknown[]): void => {
  expect(mock).toHaveBeenCalledWith(...args);
};

// Timer assertions
export const assertTimerCalled = (mock: jest.Mock, delay: number): void => {
  expect(mock).toHaveBeenCalledWith(expect.any(Function), delay);
};

export const assertTimerNotCalled = (mock: jest.Mock): void => {
  expect(mock).not.toHaveBeenCalled();
};

// Network assertions
export const assertFetchCalled = (mock: jest.Mock, url: string, options?: RequestInit): void => {
  if (options) {
    expect(mock).toHaveBeenCalledWith(url, options);
  } else {
    expect(mock).toHaveBeenCalledWith(url);
  }
};

export const assertFetchNotCalled = (mock: jest.Mock): void => {
  expect(mock).not.toHaveBeenCalled();
};