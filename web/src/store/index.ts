import { useChatStore } from './chat';
import { useSystemStore } from './system';
import { useUIStore } from './ui';
import type { ChatState, ChatActions, Message, Conversation } from '../types/chat';
import type { 
  SystemState, 
  SystemOperation, 
  SystemResponse, 
  SystemCapability, 
  SystemOperationType, 
  SystemStatus 
} from '../types/system';
import type { UIState, UIActions, Notification } from './ui';
import type { StoreApi as ZustandStoreApi } from 'zustand';

import {
  type ChatStore,
  type SystemStore,
  type UIStore,
  selectActiveConversation,
  selectConversations,
  selectIsLoading,
  selectHasErrors,
  selectSystemErrors,
  selectTheme,
  selectNotifications,
  selectUnreadNotifications,
  selectUnreadNotificationCount,
  selectActiveConversationFromRoot,
  selectIsLoadingFromRoot,
  selectUnreadNotificationCountFromRoot
} from './selectors';

// Re-export types
export type {
  ChatState,
  ChatActions,
  Message,
  Conversation,
  SystemState,
  SystemOperation,
  SystemResponse,
  SystemCapability,
  SystemOperationType,
  SystemStatus,
  UIState,
  UIActions,
  Notification,
  ChatStore,
  SystemStore,
  UIStore
};

// Re-export selectors
export {
  selectActiveConversation,
  selectConversations,
  selectIsLoading,
  selectHasErrors,
  selectSystemErrors,
  selectTheme,
  selectNotifications,
  selectUnreadNotifications,
  selectUnreadNotificationCount,
  selectActiveConversationFromRoot,
  selectIsLoadingFromRoot,
  selectUnreadNotificationCountFromRoot
};

// Root store type
export interface RootStore {
  chat: ChatStore;
  system: SystemStore;
  ui: UIStore;
}

// Root store hook
export const useStore = (): RootStore => ({
  chat: useChatStore(),
  system: useSystemStore(),
  ui: useUIStore()
});

// Store middleware type
export type StoreMiddleware<T extends object> = (
  config: StateCreatorConfig
) => (
  set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void,
  get: () => T,
  api: StoreApi<T>
) => T;

// Store configuration type
export interface StateCreatorConfig {
  name?: string;
  version?: number;
  middleware?: Array<StoreMiddleware<object>>;
  devtools?: boolean;
}

// Store API type
export interface StoreApi<T> extends ZustandStoreApi<T> {
  setState: (
    partial: T | Partial<T> | ((state: T) => T | Partial<T>),
    replace?: boolean
  ) => void;
  getState: () => T;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  destroy: () => void;
}

// Helper to combine multiple stores
export function combineStores<
  T extends Record<string, () => ReturnType<T[keyof T]>>
>(stores: T): () => { [K in keyof T]: ReturnType<T[K]> } {
  return () => {
    const state = {} as { [K in keyof T]: ReturnType<T[K]> };
    for (const [key, store] of Object.entries(stores) as Array<[keyof T, T[keyof T]]>) {
      state[key] = store();
    }
    return state;
  };
}

// Helper to create a store slice
export function createStoreSlice<TState extends object, TSlice extends object>(
  set: (fn: (state: TState) => TState) => void,
  get: () => TState,
  slice: TSlice
): TSlice & {
  set: (fn: (state: TSlice) => Partial<TSlice>) => void;
  get: () => TSlice;
} {
  return {
    ...slice,
    set: (fn: (state: TSlice) => Partial<TSlice>) => {
      set((state: TState) => ({
        ...state,
        ...fn(state as unknown as TSlice)
      }));
    },
    get: () => get() as unknown as TSlice
  };
}