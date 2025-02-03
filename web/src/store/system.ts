import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  SystemState,
  SystemOperation,
  SystemResponse,
  SystemCapability,
  SystemStatus,
  SystemEvent
} from '../types/system';

interface SystemActions {
  executeOperation: (operation: Omit<SystemOperation, 'requestId'>) => Promise<SystemResponse>;
  cancelOperation: (requestId: string) => void;
  clearErrors: () => void;
  updateStatus: (status: Partial<SystemStatus>) => void;
  refreshCapabilities: () => Promise<void>;
  addEvent: (event: Omit<SystemEvent, 'timestamp'>) => void;
  clearEvents: () => void;
}

const initialState: SystemState = {
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
};

export const useSystemStore = create<SystemState & SystemActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        executeOperation: async (operation) => {
          const requestId = uuidv4();
          const fullOperation = { ...operation, requestId };

          // Update pending operations
          set((state) => ({
            status: {
              ...state.status,
              pendingOperations: state.status.pendingOperations + 1,
              lastOperation: fullOperation
            }
          }));

          try {
            // TODO: Execute operation through appropriate system handler
            // const response = await executeSystemOperation(fullOperation);
            const response: SystemResponse = {
              type: operation.type,
              action: operation.action,
              requestId,
              success: true,
              timestamp: Date.now()
            };

            // Update state with response
            set((state) => ({
              status: {
                ...state.status,
                pendingOperations: state.status.pendingOperations - 1,
                lastResponse: response
              }
            }));

            return response;
          } catch (error) {
            const errorResponse: SystemResponse = {
              type: operation.type,
              action: operation.action,
              requestId,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: Date.now()
            };

            // Update state with error
            set((state) => ({
              status: {
                ...state.status,
                pendingOperations: state.status.pendingOperations - 1,
                lastResponse: errorResponse,
                errors: [...state.status.errors, errorResponse.error as string]
              }
            }));

            throw error;
          }
        },

        cancelOperation: (requestId: string) => {
          // TODO: Implement operation cancellation
          set((state) => ({
            status: {
              ...state.status,
              pendingOperations: Math.max(0, state.status.pendingOperations - 1),
              lastResponse: {
                type: state.status.lastOperation?.type || 'COMMAND',
                action: 'CANCEL',
                requestId,
                success: true,
                timestamp: Date.now()
              }
            }
          }));
        },

        clearErrors: () => {
          set((state) => ({
            status: {
              ...state.status,
              errors: []
            }
          }));
        },

        updateStatus: (status) => {
          set((state) => ({
            status: {
              ...state.status,
              ...status
            }
          }));
        },

        refreshCapabilities: async () => {
          try {
            // TODO: Fetch capabilities from system
            const capabilities: SystemCapability[] = [
              {
                type: 'FILE',
                actions: ['READ', 'WRITE', 'DELETE'],
                permissions: ['read', 'write'],
                isAvailable: true
              },
              {
                type: 'PROCESS',
                actions: ['START', 'STOP', 'LIST'],
                permissions: ['execute'],
                isAvailable: true
              }
            ];

            set({ capabilities, isInitialized: true });
          } catch (error) {
            set((state) => ({
              status: {
                ...state.status,
                errors: [...state.status.errors, error instanceof Error ? error.message : 'Unknown error']
              }
            }));
          }
        },

        addEvent: (event) => {
          const fullEvent: SystemEvent = {
            ...event,
            timestamp: Date.now()
          };

          set((state) => ({
            events: [...state.events, fullEvent]
          }));
        },

        clearEvents: () => {
          set({ events: [] });
        }
      }),
      {
        name: 'system-store',
        version: 1
      }
    )
  )
);