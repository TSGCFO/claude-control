import { useChatStore } from '../chat';
import { useSystemStore } from '../system';
import { useUIStore } from '../ui';
import {
  selectActiveConversationFromRoot,
  selectIsLoadingFromRoot,
  selectHasErrors,
  selectSystemErrors,
  selectUnreadNotificationCountFromRoot,
  selectTheme,
  selectNotifications,
  selectUnreadNotifications
} from '../selectors';
import type { Message } from '../../types/chat';

describe('Store Selectors', () => {
  beforeEach(() => {
    // Initialize stores with test data
    const conversationId = '123';
    const message: Message = {
      id: '1',
      role: 'user',
      content: 'Test message',
      timestamp: Date.now(),
      status: 'sent'
    };

    // Set up chat store
    useChatStore.setState({
      conversations: {
        [conversationId]: {
          id: conversationId,
          title: 'Test Conversation',
          messages: [message],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      },
      activeConversationId: conversationId,
      isTyping: false,
      error: null
    });

    // Set up system store
    useSystemStore.setState({
      capabilities: [],
      status: {
        isConnected: true,
        lastOperation: null,
        lastResponse: null,
        pendingOperations: 1,
        errors: ['Test error']
      },
      events: [],
      isInitialized: true
    });

    // Set up UI store
    useUIStore.setState({
      theme: 'dark',
      sidebarOpen: true,
      activePanel: 'chat',
      modals: {
        settings: false,
        help: false,
        fileViewer: false
      },
      notifications: [
        {
          id: '1',
          type: 'info',
          message: 'Test notification 1',
          timestamp: Date.now(),
          isRead: true
        },
        {
          id: '2',
          type: 'error',
          message: 'Test notification 2',
          timestamp: Date.now(),
          isRead: false
        }
      ]
    });
  });

  describe('Chat Selectors', () => {
    it('should select active conversation', () => {
      const store = {
        chat: useChatStore.getState(),
        system: useSystemStore.getState(),
        ui: useUIStore.getState()
      };

      const conversation = selectActiveConversationFromRoot(store);
      expect(conversation).toBeDefined();
      expect(conversation?.messages).toHaveLength(1);
      expect(conversation?.messages[0].content).toBe('Test message');
    });
  });

  describe('System Selectors', () => {
    it('should select loading state', () => {
      const store = {
        chat: useChatStore.getState(),
        system: useSystemStore.getState(),
        ui: useUIStore.getState()
      };

      const isLoading = selectIsLoadingFromRoot(store);
      expect(isLoading).toBe(true);
    });

    it('should select error state', () => {
      const systemStore = useSystemStore.getState();

      const hasErrors = selectHasErrors(systemStore);
      expect(hasErrors).toBe(true);

      const errors = selectSystemErrors(systemStore);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe('Test error');
    });
  });

  describe('UI Selectors', () => {
    it('should select theme', () => {
      const uiStore = useUIStore.getState();
      const theme = selectTheme(uiStore);
      expect(theme).toBe('dark');
    });

    it('should select notifications', () => {
      const store = {
        chat: useChatStore.getState(),
        system: useSystemStore.getState(),
        ui: useUIStore.getState()
      };

      const uiStore = useUIStore.getState();
      const notifications = selectNotifications(uiStore);
      expect(notifications).toHaveLength(2);

      const unreadNotifications = selectUnreadNotifications(uiStore);
      expect(unreadNotifications).toHaveLength(1);
      expect(unreadNotifications[0].isRead).toBe(false);

      const unreadCount = selectUnreadNotificationCountFromRoot(store);
      expect(unreadCount).toBe(1);
    });
  });
});