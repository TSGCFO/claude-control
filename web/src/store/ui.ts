import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
  duration?: number;
  isRead: boolean;
}

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

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  activePanel: 'chat',
  modals: {
    settings: false,
    help: false,
    fileViewer: false
  },
  notifications: []
};

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        toggleTheme: () => {
          set((state) => ({
            theme: state.theme === 'light' ? 'dark' : 'light'
          }));
        },

        toggleSidebar: () => {
          set((state) => ({
            sidebarOpen: !state.sidebarOpen
          }));
        },

        setActivePanel: (panel) => {
          set({ activePanel: panel });
        },

        toggleModal: (modal) => {
          set((state) => ({
            modals: {
              ...state.modals,
              [modal]: !state.modals[modal]
            }
          }));
        },

        addNotification: (notification) => {
          const id = uuidv4();
          const newNotification: Notification = {
            ...notification,
            id,
            timestamp: Date.now(),
            isRead: false
          };

          set((state) => ({
            notifications: [...state.notifications, newNotification]
          }));

          // Auto remove notification after duration
          if (notification.duration) {
            setTimeout(() => {
              set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id)
              }));
            }, notification.duration);
          }

          return id;
        },

        removeNotification: (id) => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id)
          }));
        },

        markNotificationAsRead: (id) => {
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            )
          }));
        },

        clearNotifications: () => {
          set({ notifications: [] });
        }
      }),
      {
        name: 'ui-store',
        version: 1
      }
    )
  )
);