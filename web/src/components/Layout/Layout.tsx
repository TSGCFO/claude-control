import React from 'react';
import { CommandInterface } from '../CommandInterface/CommandInterface';
import { TaskHistory } from '../TaskHistory/TaskHistory';
import { Settings } from '../Settings/Settings';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './Layout.module.css';

export const Layout: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={styles.container} data-theme={theme}>
      <aside className={styles.sidebar}>
        <header className={styles.header}>
          <h1 className={styles.title}>Claude Control</h1>
        </header>
        <nav className={styles.nav}>
          <TaskHistory />
          <Settings />
        </nav>
      </aside>
      <main className={styles.main}>
        <CommandInterface />
      </main>
    </div>
  );
};

export default Layout;