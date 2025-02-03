import { ChatState, Message, Conversation } from './chat';
import { SystemState, SystemOperation, SystemResponse } from './system';
import { WebSocketStatus } from './api';

// UI State
export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activePanel: 'chat' | 'system' | 'settings' | null;
  modals: {
    settings: boolean;
    help: boolean;
    fileViewer: boolean;
  };
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
  duration?: number;
  isRead: boolean;
}

// Chat Store Actions
export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  clearConversation: (conversationId: string) => void;
  createConversation: () => string;
  deleteConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
  retryMessage: (conversationId: string, messageId: string) => Promise<void>;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
}

// System Store Actions
export interface SystemActions {
  executeOperation: (operation: SystemOperation) => Promise<SystemResponse>;
  cancelOperation: (requestId: string) => void;
  clearErrors: () => void;
  updateStatus: (status: Partial<WebSocketStatus>) => void;
  refreshCapabilities: () => Promise<void>;
}

// UI Store Actions
export interface UIActions {
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setActivePanel: (panel: UIState['activePanel']) => void;
  toggleModal: (modal: keyof UIState['modals']) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => string;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

// Root Store
export interface RootStore {
  chat: ChatState & ChatActions;
  system: SystemState & SystemActions;
  ui: UIState & UIActions;
}

// Store Selectors
export interface StoreSelectors {
  selectActiveConversation: (state: RootStore) => Conversation | null;
  selectConversationMessages: (state: RootStore, conversationId: string) => Message[];
  selectLatestMessage: (state: RootStore, conversationId: string) => Message | null;
  selectUnreadNotifications: (state: RootStore) => Notification[];
  selectPendingOperations: (state: RootStore) => SystemOperation[];
  selectSystemErrors: (state: RootStore) => string[];
  selectIsConnected: (state: RootStore) => boolean;
  selectTheme: (state: RootStore) => UIState['theme'];
}

// Store Middleware
export type StoreMiddleware = (
  config: StateCreatorConfig
) => (
  set: StoreApi['setState'],
  get: StoreApi['getState'],
  api: StoreApi
) => RootStore;

// Store API
export interface StoreApi {
  setState: (
    partial: RootStore | Partial<RootStore> | ((state: RootStore) => RootStore | Partial<RootStore>),
    replace?: boolean
  ) => void;
  getState: () => RootStore;
  subscribe: (listener: (state: RootStore, prevState: RootStore) => void) => () => void;
  destroy: () => void;
}

// Store Configuration
export interface StateCreatorConfig {
  name?: string;
  version?: number;
  middleware?: StoreMiddleware[];
  devtools?: boolean;
}