import React, { useState, useRef, useEffect } from 'react';
import { useCommand } from '../../contexts/CommandContext';
import styles from './CommandInterface.module.css';

export const CommandInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const { messages, isExecuting, error, sendMessage } = useCommand();
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isExecuting) return;

    try {
      await sendMessage(input);
      setInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.outputContainer} ref={outputRef}>
        {error && (
          <div className={styles.error} role="alert">
            Error: {error}
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.role === 'assistant' ? styles.assistant : styles.user
            }`}
          >
            <div className={styles.messageHeader}>
              <span className={styles.messageRole}>
                {message.role === 'assistant' ? 'Claude' : 'You'}
              </span>
              <span className={styles.messageTime}>
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
            <div className={styles.messageContent}>
              {message.content}
            </div>
            {message.status === 'error' && (
              <div className={styles.messageError}>
                Failed to process message
              </div>
            )}
          </div>
        ))}
        {isExecuting && (
          <div className={styles.typing}>
            Claude is thinking...
          </div>
        )}
      </div>
      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <textarea
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message to Claude..."
          disabled={isExecuting}
          rows={3}
          aria-label="Message input"
        />
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isExecuting || !input.trim()}
          aria-label={isExecuting ? 'Sending message...' : 'Send message'}
        >
          {isExecuting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default CommandInterface;