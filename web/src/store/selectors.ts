import type { ChatState, ChatActions, Conversation } from '../types/chat';
import type { SystemState, SystemStatus } from '../types/system';
import type { UIState, UIActions, Notification } from './ui';

// Store types
export type ChatStore = ChatState & ChatActions;
export type SystemStore = SystemState & { status: SystemStatus };
export type UIStore = UIState & UIActions;

// Type guards
export const isChatStore = (store: unknown): store is ChatStore =>
  store !== null &&
  typeof store === 'object' &&
  'conversations' in store &&
  'activeConversationId' in store;

export const isSystemStore = (store: unknown): store is SystemStore =>
  store !== null &&
  typeof store === 'object' &&
  'status' in store &&
  'capabilities' in store;

export const isUIStore = (store: unknown): store is UIStore =>
  store !== null &&
  typeof store === 'object' &&
  'notifications' in store &&
  'theme' in store;

// Selector types
type ChatSelector<R> = (store: ChatStore) => R;
type SystemSelector<R> = (store: SystemStore) => R;
type UISelector<R> = (store: UIStore) => R;

// Selector creators
export const createChatSelector = <R>(selector: ChatSelector<R>): ChatSelector<R> => selector;
export const createSystemSelector = <R>(selector: SystemSelector<R>): SystemSelector<R> => selector;
export const createUISelector = <R>(selector: UISelector<R>): UISelector<R> => selector;

// Chat selectors
export const selectActiveConversation = createChatSelector((store: ChatStore): Conversation | null => 
  store.activeConversationId ? store.conversations[store.activeConversationId] : null
);

export const selectConversations = createChatSelector((store: ChatStore): Conversation[] => 
  Object.values(store.conversations)
);

// System selectors
export const selectIsLoading = createSystemSelector((store: SystemStore): boolean => 
  store.status.pendingOperations > 0
);

export const selectHasErrors = createSystemSelector((store: SystemStore): boolean => 
  store.status.errors.length > 0
);

export const selectSystemErrors = createSystemSelector((store: SystemStore): string[] => 
  store.status.errors
);

// UI selectors
export const selectTheme = createUISelector((store: UIStore): 'light' | 'dark' => 
  store.theme
);

export const selectNotifications = createUISelector((store: UIStore): Notification[] => 
  store.notifications
);

export const selectUnreadNotifications = createUISelector((store: UIStore): Notification[] => 
  store.notifications.filter((notification: Notification) => !notification.isRead)
);

export const selectUnreadNotificationCount = createUISelector((store: UIStore): number => 
  store.notifications.filter((notification: Notification) => !notification.isRead).length
);

// Selector composition utilities
type StoreKey = 'chat' | 'system' | 'ui';
type StoreType<K extends StoreKey> = K extends 'chat' 
  ? ChatStore 
  : K extends 'system' 
    ? SystemStore 
    : UIStore;

export const composeSelector = <K extends StoreKey, R>(
  key: K,
  selector: (store: StoreType<K>) => R
) => {
  return (rootStore: { [key in K]: StoreType<K> }): R => {
    const store = rootStore[key];
    switch (key) {
      case 'chat':
        if (!isChatStore(store)) throw new Error('Invalid chat store');
        break;
      case 'system':
        if (!isSystemStore(store)) throw new Error('Invalid system store');
        break;
      case 'ui':
        if (!isUIStore(store)) throw new Error('Invalid UI store');
        break;
    }
    return selector(store as StoreType<K>);
  };
};

// Example usage:
export const selectActiveConversationFromRoot = composeSelector('chat', selectActiveConversation);
export const selectIsLoadingFromRoot = composeSelector('system', selectIsLoading);
export const selectUnreadNotificationCountFromRoot = composeSelector('ui', selectUnreadNotificationCount);