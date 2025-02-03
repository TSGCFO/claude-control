# Web Interface for Claude Control

This is the web interface for the Claude Control system, providing a user-friendly way to interact with Claude's computer control capabilities.

## Architecture

The application uses a modular store architecture with three main stores:

### Chat Store
Manages conversations and messages between the user and Claude:
- Conversation management (create, delete, clear)
- Message handling (send, retry, update)
- Real-time typing indicators
- Error handling

### System Store
Handles system operations and capabilities:
- File operations (read, write, delete)
- Process management (start, stop, list)
- Window control (focus, minimize, maximize)
- Browser automation
- Command execution
- Settings management

### UI Store
Controls the user interface state:
- Theme management (light/dark)
- Sidebar visibility
- Active panel selection
- Modal states
- Notification system

## Store Integration

The stores are designed to work together seamlessly:
1. Chat messages can trigger system operations
2. System events generate UI notifications
3. UI actions can affect both chat and system states

## Usage

### Basic Store Usage
```typescript
import { useChatStore } from './store/chat';
import { useSystemStore } from './store/system';
import { useUIStore } from './store/ui';

// Chat operations
const chatStore = useChatStore();
const conversationId = chatStore.createConversation();
await chatStore.sendMessage('Hello, Claude!');

// System operations
const systemStore = useSystemStore();
await systemStore.executeOperation({
  type: 'COMMAND',
  action: 'EXECUTE',
  params: {
    command: 'echo',
    args: ['Hello, World!']
  }
});

// UI operations
const uiStore = useUIStore();
uiStore.toggleTheme();
uiStore.addNotification({
  type: 'success',
  message: 'Operation completed',
  duration: 3000
});
```

### Using Selectors
```typescript
import { 
  selectActiveConversation,
  selectIsLoading,
  selectUnreadNotificationCount
} from './store/selectors';

// Get current state
const store = {
  chat: useChatStore(),
  system: useSystemStore(),
  ui: useUIStore()
};

const conversation = selectActiveConversation(store);
const isLoading = selectIsLoading(store);
const unreadCount = selectUnreadNotificationCount(store);
```

## Development

### Adding New Features

1. Define types in appropriate type file:
```typescript
// types/system.ts
export interface NewFeature {
  // ...
}
```

2. Add actions to store:
```typescript
// store/system.ts
interface SystemActions {
  newFeature: (params: NewFeature) => Promise<void>;
}
```

3. Implement action in store:
```typescript
newFeature: async (params) => {
  // Implementation
}
```

4. Create selectors if needed:
```typescript
// store/selectors.ts
export const selectNewFeature = (store: RootStore) => // ...
```

### Testing

Run the store integration tests:
```bash
npm test
```

Or run specific test:
```bash
npx ts-node src/examples/test-store.ts
```

## Security

- All system operations are validated before execution
- File operations are restricted to allowed directories
- Command execution is limited to approved commands
- User permissions are checked for sensitive operations

## Error Handling

The stores implement comprehensive error handling:
- Chat errors are displayed in the message thread
- System errors generate UI notifications
- All errors are logged for debugging
- Operations can be retried when appropriate

## Performance

- Stores use efficient state updates
- Heavy operations are executed asynchronously
- Resources are cleaned up automatically
- State persistence is optimized

## Contributing

1. Create a feature branch
2. Add tests for new functionality
3. Update documentation
4. Submit pull request

## License

MIT License
