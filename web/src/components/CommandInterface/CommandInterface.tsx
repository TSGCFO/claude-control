import React, { useState, useRef, useEffect } from 'react';
import { useCommand } from '../../contexts/CommandContext';
import styles from './CommandInterface.module.css';

export const CommandInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const { executeCommand, isExecuting, output, error } = useCommand();
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isExecuting) return;

    try {
      await executeCommand(input);
      setInput('');
    } catch (err) {
      // Error handling is managed by CommandContext
      console.error('Failed to execute command:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.outputContainer} ref={outputRef}>
        {error && (
          <div className={styles.error} role="alert">
            Error: {error}
          </div>
        )}
        {output && (
          <div className={styles.output}>
            {output}
          </div>
        )}
      </div>
      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <textarea
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your command or task..."
          disabled={isExecuting}
          rows={3}
          aria-label="Command input"
        />
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isExecuting || !input.trim()}
          aria-label={isExecuting ? 'Executing command...' : 'Execute command'}
        >
          {isExecuting ? 'Executing...' : 'Execute'}
        </button>
      </form>
    </div>
  );
};

export default CommandInterface;