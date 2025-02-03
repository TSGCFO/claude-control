import React, { createContext, useContext, useState, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'pending' | 'complete' | 'error';
}

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
      // Simulate assistant response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `I received your message: "${content}"\nI'm currently simulating responses, but in the future, I'll be able to help you with various tasks.`,
        timestamp: Date.now(),
        status: 'complete',
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // In the future, this would be replaced with actual API call:
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ message: content }),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to send message');
      // }
      // 
      // const data = await response.json();
      // setMessages(prev => [...prev, {
      //   id: generateId(),
      //   role: 'assistant',
      //   content: data.response,
      //   timestamp: Date.now(),
      //   status: 'complete',
      // }]);
      
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