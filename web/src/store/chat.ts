import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { ChatState, ChatActions, Message, Conversation } from '../types/chat';

const initialState: ChatState = {
  conversations: {},
  activeConversationId: null,
  isTyping: false,
  error: null
};

export const useChatStore = create<ChatState & ChatActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        sendMessage: async (content: string) => {
          const { activeConversationId } = get();
          if (!activeConversationId) return;

          const messageId = uuidv4();
          const message: Message = {
            id: messageId,
            role: 'user',
            content,
            timestamp: Date.now(),
            status: 'sending'
          };

          // Update conversation with new message
          set((state) => ({
            conversations: {
              ...state.conversations,
              [activeConversationId]: {
                ...state.conversations[activeConversationId],
                messages: [...state.conversations[activeConversationId].messages, message],
                updatedAt: Date.now()
              }
            }
          }));

          try {
            // Set typing indicator
            set({ isTyping: true });

            // TODO: Send message to backend
            // const response = await sendMessageToBackend(content);

            // Update message status to sent
            set((state) => ({
              conversations: {
                ...state.conversations,
                [activeConversationId]: {
                  ...state.conversations[activeConversationId],
                  messages: state.conversations[activeConversationId].messages.map((m) =>
                    m.id === messageId ? { ...m, status: 'sent' } : m
                  )
                }
              },
              isTyping: false
            }));
          } catch (error) {
            // Update message status to error
            set((state) => ({
              conversations: {
                ...state.conversations,
                [activeConversationId]: {
                  ...state.conversations[activeConversationId],
                  messages: state.conversations[activeConversationId].messages.map((m) =>
                    m.id === messageId
                      ? { ...m, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
                      : m
                  )
                }
              },
              isTyping: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }));
          }
        },

        clearConversation: (conversationId: string) => {
          set((state) => {
            const newConversations = { ...state.conversations };
            delete newConversations[conversationId];
            return {
              conversations: newConversations,
              activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId
            };
          });
        },

        createConversation: () => {
          const conversationId = uuidv4();
          const conversation: Conversation = {
            id: conversationId,
            title: 'New Conversation',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          set((state) => ({
            conversations: {
              ...state.conversations,
              [conversationId]: conversation
            },
            activeConversationId: conversationId
          }));

          return conversationId;
        },

        deleteConversation: (conversationId: string) => {
          set((state) => {
            const newConversations = { ...state.conversations };
            delete newConversations[conversationId];
            return {
              conversations: newConversations,
              activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId
            };
          });
        },

        setActiveConversation: (conversationId: string | null) => {
          set({ activeConversationId: conversationId });
        },

        retryMessage: async (conversationId: string, messageId: string) => {
          const conversation = get().conversations[conversationId];
          if (!conversation) return;

          const message = conversation.messages.find((m) => m.id === messageId);
          if (!message || message.role !== 'user') return;

          // Reset message status
          set((state) => ({
            conversations: {
              ...state.conversations,
              [conversationId]: {
                ...conversation,
                messages: conversation.messages.map((m) =>
                  m.id === messageId ? { ...m, status: 'sending', error: undefined } : m
                )
              }
            }
          }));

          // Retry sending the message
          await get().sendMessage(message.content);
        },

        updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => {
          set((state) => ({
            conversations: {
              ...state.conversations,
              [conversationId]: {
                ...state.conversations[conversationId],
                messages: state.conversations[conversationId].messages.map((m) =>
                  m.id === messageId ? { ...m, ...updates } : m
                ),
                updatedAt: Date.now()
              }
            }
          }));
        }
      }),
      {
        name: 'chat-store',
        version: 1
      }
    )
  )
);