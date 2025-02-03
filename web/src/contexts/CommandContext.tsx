import React, { createContext, useContext, useState, useCallback } from 'react';
import { Message } from '../types';
import { UserRequest } from '../../../src/types';
import { llmService } from '../services/llm';

interface CommandContextType {
  messages: Message[];
  isExecuting: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

interface CommandProviderProps {
  children: React.ReactNode;
}

export const CommandProvider: React.FC<CommandProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const determineRequestType = (content: string): UserRequest['type'] => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('file') || 
        lowerContent.includes('open') || 
        lowerContent.includes('run') ||
        lowerContent.includes('execute')) {
      return 'SYSTEM_OPERATION';
    }
    if (lowerContent.includes('why') || 
        lowerContent.includes('how') || 
        lowerContent.includes('explain')) {
      return 'REASONING';
    }
    return 'GENERAL';
  };

  const determineComplexity = (content: string): UserRequest['complexity'] => {
    const words = content.split(' ').length;
    if (words < 5) return 'LOW';
    if (words < 15) return 'MEDIUM';
    return 'HIGH';
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isExecuting) return;

    setIsExecuting(true);
    setError(null);

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Create request for LLM
      const request: UserRequest = {
        type: determineRequestType(content),
        content,
        complexity: determineComplexity(content)
      };

      // Process through LLM service
      const response = await llmService.processRequest(request);

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        status: 'complete',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'error' }
          : msg
      ));
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    messages,
    isExecuting,
    error,
    sendMessage,
    clearMessages,
    clearError,
  };

  return (
    <CommandContext.Provider value={value}>
      {children}
    </CommandContext.Provider>
  );
};

export const useCommand = () => {
  const context = useContext(CommandContext);
  if (context === undefined) {
    throw new Error('useCommand must be used within a CommandProvider');
  }
  return context;
};