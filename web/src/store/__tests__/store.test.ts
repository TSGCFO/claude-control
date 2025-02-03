import { useChatStore } from '../chat';
import { useSystemStore } from '../system';
import { useUIStore } from '../ui';
import type { Message } from '../../types/chat';
import type { SystemOperation } from '../../types/system';
import type { Notification } from '../ui';

describe('Store Integration Tests', () => {
  beforeEach(() => {
    // Clear all stores before each test
    useChatStore.setState({
      conversations: {},
      activeConversationId: null,
      isTyping: false,
      error: null
    });

    useSystemStore.setState({
      capabilities: [],
      status: {
        isConnected: false,
        lastOperation: null,
        lastResponse: null,
        pendingOperations: 0,
        errors: []
      },
      events: [],
      isInitialized: false
    });

    useUIStore.setState({
      theme: 'light',
      sidebarOpen: true,
      activePanel: 'chat',
      modals: {
        settings: false,
        help: false,
        fileViewer: false
      },
      notifications: []
    });
  });

  describe('Chat Store', () => {
    it('should create and manage conversations', () => {
      const store = useChatStore.getState();
      const conversationId = store.createConversation();

      expect(conversationId).toBeDefined();
      expect(store.conversations[conversationId]).toBeDefined();
      expect(store.activeConversationId).toBe(conversationId);

      store.setActiveConversation(null);
      expect(store.activeConversationId).toBeNull();

      store.deleteConversation(conversationId);
      expect(store.conversations[conversationId]).toBeUndefined();
    });

    it('should handle messages', async () => {
      const store = useChatStore.getState();
      const conversationId = store.createConversation();
      
      await store.sendMessage('Test message');
      const conversation = store.conversations[conversationId];
      
      expect(conversation.messages).toHaveLength(1);
      expect(conversation.messages[0].content).toBe('Test message');
      expect(conversation.messages[0].status).toBe('sent');
    });
  });

  describe('System Store', () => {
    it('should manage system operations', async () => {
      const store = useSystemStore.getState();
      const operation: Omit<SystemOperation, 'requestId'> = {
        type: 'COMMAND',
        action: 'EXECUTE',
        params: {
          command: 'test'
        }
      };

      const response = await store.executeOperation(operation);
      expect(response.success).toBe(true);
      expect(store.status.lastOperation?.type).toBe(operation.type);
      expect(store.status.lastOperation?.action).toBe(operation.action);
    });

    it('should handle capabilities', async () => {
      const store = useSystemStore.getState();
      await store.refreshCapabilities();
      
      expect(store.capabilities).toHaveLength(2);
      expect(store.isInitialized).toBe(true);
    });
  });

  describe('UI Store', () => {
    it('should manage theme', () => {
      const store = useUIStore.getState();
      expect(store.theme).toBe('light');
      
      store.toggleTheme();
      expect(store.theme).toBe('dark');
      
      store.toggleTheme();
      expect(store.theme).toBe('light');
    });

    it('should handle notifications', () => {
      const store = useUIStore.getState();
      const notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'> = {
        type: 'info',
        message: 'Test notification',
        duration: 3000
      };

      const id = store.addNotification(notification);
      expect(store.notifications).toHaveLength(1);
      expect(store.notifications[0].id).toBe(id);
      expect(store.notifications[0].isRead).toBe(false);

      store.markNotificationAsRead(id);
      expect(store.notifications[0].isRead).toBe(true);

      store.clearNotifications();
      expect(store.notifications).toHaveLength(0);
    });
  });

  describe('Store Interactions', () => {
    it('should handle system operations with UI feedback', async () => {
      const systemStore = useSystemStore.getState();
      const uiStore = useUIStore.getState();

      try {
        await systemStore.executeOperation({
          type: 'FILE',
          action: 'READ',
          params: {
            path: '/nonexistent'
          }
        });
      } catch (error) {
        const notifications = uiStore.notifications;
        expect(notifications).toHaveLength(1);
        expect(notifications[0].type).toBe('error');
        expect(notifications[0].message).toBe(error instanceof Error ? error.message : 'Unknown error');
      }
    });

    it('should handle chat commands with system operations', async () => {
      const chatStore = useChatStore.getState();
      const systemStore = useSystemStore.getState();
      const conversationId = chatStore.createConversation();

      const commandMessage: Message = {
        id: '1',
        role: 'user',
        content: '/execute test',
        timestamp: Date.now(),
        status: 'sent'
      };

      chatStore.updateMessage(conversationId, commandMessage.id, commandMessage);
      
      if (commandMessage.content.startsWith('/execute')) {
        const command = commandMessage.content.slice(9);
        await systemStore.executeOperation({
          type: 'COMMAND',
          action: 'EXECUTE',
          params: {
            command
          }
        });
      }

      expect(systemStore.status.lastOperation?.type).toBe('COMMAND');
      expect(systemStore.status.lastOperation?.params.command).toBe('test');
    });
  });
});