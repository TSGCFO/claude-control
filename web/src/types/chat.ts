export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'error';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  status: MessageStatus;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  metadata?: {
    model?: string;
    context?: string;
    tags?: string[];
    [key: string]: unknown;
  };
}

export interface ChatState {
  conversations: Record<string, Conversation>;
  activeConversationId: string | null;
  isTyping: boolean;
  error: string | null;
}

export interface ChatActions {
  // Message actions
  sendMessage: (content: string) => Promise<void>;
  retryMessage: (conversationId: string, messageId: string) => Promise<void>;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;

  // Conversation actions
  createConversation: () => string;
  deleteConversation: (conversationId: string) => void;
  clearConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
}

// Response types for chat operations
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

// Command types for chat operations
export interface ChatCommand {
  type: 'message' | 'clear' | 'retry';
  conversationId: string;
  content?: string;
  messageId?: string;
}

// Event types for chat operations
export type ChatEventType =
  | 'message:sent'
  | 'message:received'
  | 'message:error'
  | 'conversation:created'
  | 'conversation:deleted'
  | 'conversation:cleared'
  | 'typing:start'
  | 'typing:end';

export interface ChatEvent {
  type: ChatEventType;
  conversationId: string;
  timestamp: number;
  data?: unknown;
}

// Metadata types for enhanced chat features
export interface ConversationMetadata {
  model?: string;
  context?: string;
  tags?: string[];
  summary?: string;
  participants?: string[];
  customData?: Record<string, unknown>;
}

export interface MessageMetadata {
  tokens?: number;
  processingTime?: number;
  model?: string;
  confidence?: number;
  customData?: Record<string, unknown>;
}

// Utility types for chat operations
export type ConversationFilter = (conversation: Conversation) => boolean;
export type MessageFilter = (message: Message) => boolean;

export interface ConversationUpdate {
  title?: string;
  metadata?: Partial<ConversationMetadata>;
}

export interface MessageUpdate {
  content?: string;
  metadata?: Partial<MessageMetadata>;
  status?: MessageStatus;
  error?: string;
}