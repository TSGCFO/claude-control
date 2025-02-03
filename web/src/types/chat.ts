export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'error';
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatState {
  conversations: Record<string, Conversation>;
  activeConversationId: string | null;
  isTyping: boolean;
  error: string | null;
}

export interface ChatCommand {
  type: 'message' | 'clear' | 'retry';
  conversationId: string;
  content?: string;
  messageId?: string;
}

export interface ChatResponse {
  type: 'message' | 'error' | 'status';
  conversationId: string;
  content?: string;
  error?: string;
  status?: {
    isTyping?: boolean;
    progress?: number;
  };
}

export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  clearConversation: (conversationId: string) => void;
  createConversation: () => string;
  deleteConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
  retryMessage: (conversationId: string, messageId: string) => Promise<void>;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
}