import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  SystemOperation,
  SystemResponse,
  SystemEvent,
  SystemCapability,
  SystemOperationType,
  SystemStatus
} from '../types/system';

interface SystemState {
  capabilities: SystemCapability[];
  status: SystemStatus;
  events: SystemEvent[];
  isInitialized: boolean;
}

interface SystemActions {
  executeOperation: (operation: SystemOperation) => Promise<SystemResponse>;
  cancelOperation: (requestId: string) => void;
  clearErrors: () => void;
  updateStatus: (status: Partial<SystemStatus>) => void;
  refreshCapabilities: () => Promise<void>;
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

        executeOperation: async (operation: SystemOperation) => {
          const requestId = operation.requestId || uuidv4();
          const operationWithId = { ...operation, requestId };

          // Update pending operations
          set((state: SystemState) => ({
            status: {
              ...state.status,
              pendingOperations: state.status.pendingOperations + 1,
              lastOperation: operationWithId
            }
          }));

          try {
            // TODO: Send operation to backend
            // const response = await sendOperationToBackend(operationWithId);
            const response: SystemResponse = {
              type: operation.type,
              action: operation.action,
              requestId,
              success: true,
              data: undefined,
              timestamp: Date.now()
            };

            // Update state with response
            set((state: SystemState) => ({
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
            set((state: SystemState) => ({
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
          // TODO: Send cancel request to backend
          set((state: SystemState) => ({
            status: {
              ...state.status,
              pendingOperations: Math.max(0, state.status.pendingOperations - 1)
            }
          }));
        },

        clearErrors: () => {
          set((state: SystemState) => ({
            status: {
              ...state.status,
              errors: []
            }
          }));
        },

        updateStatus: (status: Partial<SystemStatus>) => {
          set((state: SystemState) => ({
            status: {
              ...state.status,
              ...status
            }
          }));
        },

        refreshCapabilities: async () => {
          try {
            // TODO: Fetch capabilities from backend
            const capabilities: SystemCapability[] = [
              {
                type: 'FILE' as SystemOperationType,
                actions: ['READ', 'WRITE', 'DELETE'],
                permissions: ['read', 'write'],
                isAvailable: true
              },
              {
                type: 'PROCESS' as SystemOperationType,
                actions: ['START', 'STOP', 'LIST'],
                permissions: ['execute'],
                isAvailable: true
              }
            ];

            set({ capabilities, isInitialized: true });
          } catch (error) {
            set((state: SystemState) => ({
              status: {
                ...state.status,
                errors: [...state.status.errors, error instanceof Error ? error.message : 'Unknown error']
              }
            }));
          }
        }
      }),
      {
        name: 'system-store',
        version: 1
      }
    )
  )
);

// Selectors
export const selectIsConnected = (state: SystemState) => state.status.isConnected;

export const selectPendingOperations = (state: SystemState) => state.status.pendingOperations;

export const selectSystemErrors = (state: SystemState) => state.status.errors;

export const selectLastOperation = (state: SystemState) => state.status.lastOperation;

export const selectLastResponse = (state: SystemState) => state.status.lastResponse;

export const selectCapabilities = (state: SystemState) => state.capabilities;

export const selectCapabilityByType = (state: SystemState, type: SystemOperationType) =>
  state.capabilities.find((cap: SystemCapability) => cap.type === type);

export const selectIsCapabilityAvailable = (state: SystemState, type: SystemOperationType) =>
  selectCapabilityByType(state, type)?.isAvailable || false;