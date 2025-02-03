import React from 'react';
import { useCommand } from '../../contexts/CommandContext';
import { Task } from '../../types';
import styles from './TaskHistory.module.css';

export const TaskHistory: React.FC = () => {
  // In a real app, this would come from a store or context
  const tasks: Task[] = []; // Placeholder for task history
  const { executeCommand } = useCommand();

  const handleRetry = async (command: string) => {
    await executeCommand(command);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  if (tasks.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>No tasks yet</h2>
        <p>Your command history will appear here</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Task History</h1>
      <div className={styles.taskList}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`${styles.taskItem} ${
              task.status === 'error' ? styles.error : styles.success
            }`}
          >
            <div className={styles.taskHeader}>
              <span className={styles.timestamp}>
                {formatDate(task.timestamp)}
              </span>
              <button
                className={styles.retryButton}
                onClick={() => handleRetry(task.command)}
                aria-label="Retry command"
              >
                ↺ Retry
              </button>
            </div>
            <div className={styles.command}>
              <strong>Command:</strong>
              <pre>{task.command}</pre>
            </div>
            <div className={styles.output}>
              <strong>Output:</strong>
              <pre>{task.output}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskHistory;