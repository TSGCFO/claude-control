import { useChatStore } from '../store/chat';
import { useSystemStore } from '../store/system';
import { useUIStore } from '../store/ui';
import type { Message } from '../types/chat';
import type { SystemOperation } from '../types/system';
import type { Notification } from '../store/ui';

async function testStores() {
  console.log('Testing store integration...');

  // Initialize stores
  const chatStore = useChatStore.getState();
  const systemStore = useSystemStore.getState();
  const uiStore = useUIStore.getState();

  // Test chat functionality
  console.log('\nTesting chat store...');
  const chatId = chatStore.createConversation();
  console.log('Created conversation:', chatId);

  await chatStore.sendMessage('Hello, this is a test message');
  const conversation = chatStore.conversations[chatStore.activeConversationId!];
  console.log('Active conversation:', conversation);

  // Test system functionality
  console.log('\nTesting system store...');
  await systemStore.refreshCapabilities();
  const isLoading = systemStore.status.pendingOperations > 0;
  console.log('System capabilities loaded, isLoading:', isLoading);

  const operation: SystemOperation = {
    type: 'COMMAND',
    action: 'EXECUTE',
    params: {
      command: 'echo',
      args: ['Hello, World!']
    },
    requestId: '1'
  };

  await systemStore.executeOperation(operation);

  // Test UI functionality
  console.log('\nTesting UI store...');
  uiStore.toggleTheme();
  console.log('Theme:', uiStore.theme);

  const notificationId = uiStore.addNotification({
    type: 'info',
    message: 'Test notification',
    duration: 3000
  });
  console.log('Added notification:', notificationId);

  const unreadCount = uiStore.notifications.filter((n: Notification) => !n.isRead).length;
  console.log('Unread notifications:', unreadCount);

  // Test store interactions
  console.log('\nTesting store interactions...');

  // 1. System operation with UI feedback
  try {
    const fileOperation: SystemOperation = {
      type: 'FILE',
      action: 'READ',
      params: {
        path: '/test/file.txt'
      },
      requestId: '2'
    };

    await systemStore.executeOperation(fileOperation);
  } catch (error) {
    uiStore.addNotification({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: 5000
    });
  }

  // 2. Chat message with system command
  const commandMessage: Message = {
    id: '1',
    role: 'user',
    content: '/execute ls -la',
    timestamp: Date.now(),
    status: 'sent'
  };

  if (conversation) {
    chatStore.updateMessage(conversation.id, commandMessage.id, commandMessage);
    
    // Execute system command
    if (commandMessage.content.startsWith('/execute')) {
      const command = commandMessage.content.slice(9);
      const commandOperation: SystemOperation = {
        type: 'COMMAND',
        action: 'EXECUTE',
        params: {
          command,
          args: []
        },
        requestId: '3'
      };

      await systemStore.executeOperation(commandOperation);
    }
  }

  // 3. System event with UI notification
  systemStore.addEvent({
    type: 'STATUS',
    content: 'System check completed'
  });

  uiStore.addNotification({
    type: 'success',
    message: 'System check completed successfully',
    duration: 3000
  });

  // Clean up
  console.log('\nCleaning up...');
  chatStore.clearConversation(chatId);
  systemStore.clearEvents();
  uiStore.clearNotifications();

  console.log('Store integration test completed');
}

// Run the test
if (require.main === module) {
  testStores()
    .then(() => {
      console.log('Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}