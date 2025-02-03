import type { Message, Conversation } from '../types/chat';
import type { SystemOperation, SystemResponse } from '../types/system';
import type { Notification } from '../store/ui';

// Load message fixtures
export const loadMessageFixtures = (): Message[] => {
  return [
    {
      id: 'msg-1',
      role: 'user',
      content: 'Hello, how can I help you?',
      timestamp: 1625097600000,
      status: 'sent'
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: 'I can help you with various tasks. What would you like to do?',
      timestamp: 1625097610000,
      status: 'sent'
    }
  ];
};

// Load conversation fixtures
export const loadConversationFixtures = (): Conversation[] => {
  return [
    {
      id: 'conv-1',
      title: 'Test Conversation 1',
      messages: loadMessageFixtures(),
      createdAt: 1625097600000,
      updatedAt: 1625097610000
    },
    {
      id: 'conv-2',
      title: 'Test Conversation 2',
      messages: [],
      createdAt: 1625097620000,
      updatedAt: 1625097620000
    }
  ];
};

// Load system operation fixtures
export const loadOperationFixtures = (): SystemOperation[] => {
  return [
    {
      type: 'COMMAND',
      action: 'EXECUTE',
      params: { command: 'ls' },
      requestId: 'op-1'
    },
    {
      type: 'COMMAND',
      action: 'EXECUTE',
      params: { command: 'pwd' },
      requestId: 'op-2'
    }
  ];
};

// Load system response fixtures
export const loadResponseFixtures = (): SystemResponse[] => {
  return [
    {
      type: 'COMMAND',
      action: 'EXECUTE',
      requestId: 'op-1',
      success: true,
      timestamp: 1625097600000
    },
    {
      type: 'COMMAND',
      action: 'EXECUTE',
      requestId: 'op-2',
      success: false,
      timestamp: 1625097610000
    }
  ];
};

// Load notification fixtures
export const loadNotificationFixtures = (): Notification[] => {
  return [
    {
      id: 'notif-1',
      type: 'info',
      message: 'Test notification 1',
      timestamp: 1625097600000,
      isRead: false
    },
    {
      id: 'notif-2',
      type: 'error',
      message: 'Test notification 2',
      timestamp: 1625097610000,
      isRead: true
    }
  ];
};

// Export all fixtures
export default {
  loadMessageFixtures,
  loadConversationFixtures,
  loadOperationFixtures,
  loadResponseFixtures,
  loadNotificationFixtures
};