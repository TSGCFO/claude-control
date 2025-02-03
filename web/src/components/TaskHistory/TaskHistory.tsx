import React from 'react';
import { useCommand } from '../../contexts/CommandContext';
import styles from './TaskHistory.module.css';
import { Message } from '../../types';

export const TaskHistory: React.FC = () => {
  const { messages, clearMessages } = useCommand();

  // Group messages by conversation
  const conversations = messages.reduce((acc, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, Message[]>);

  if (Object.keys(conversations).length === 0) {
    return (
      <div className={styles.empty}>
        <h2>No History</h2>
        <p>Your conversations with Claude will appear here</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>History</h2>
        <button
          onClick={clearMessages}
          className={styles.clearButton}
          aria-label="Clear history"
        >
          Clear All
        </button>
      </div>
      <div className={styles.conversationList}>
        {Object.entries(conversations).map(([date, dateMessages]) => (
          <div key={date} className={styles.dateGroup}>
            <div className={styles.dateHeader}>{date}</div>
            {dateMessages.map((message) => (
              <div
                key={message.id}
                className={`${styles.conversationItem} ${
                  message.role === 'assistant' ? styles.assistant : styles.user
                }`}
              >
                <div className={styles.messagePreview}>
                  {message.content.length > 100
                    ? `${message.content.slice(0, 100)}...`
                    : message.content}
                </div>
                <div className={styles.messageTime}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskHistory;