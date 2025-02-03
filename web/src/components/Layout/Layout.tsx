import React, { PropsWithChildren } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './Layout.module.css';

export const Layout: React.FC<PropsWithChildren> = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActiveRoute = (path: string): boolean => {
    return location.pathname === path || 
      (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <div className={styles.container} data-theme={theme}>
      <nav className={styles.sidebar}>
        <div className={styles.logo}>
          Claude Control
        </div>
        <ul className={styles.nav}>
          <li>
            <Link 
              to="/" 
              className={`${styles.navLink} ${isActiveRoute('/') ? styles.active : ''}`}
            >
              Command Interface
            </Link>
          </li>
          <li>
            <Link 
              to="/history" 
              className={`${styles.navLink} ${isActiveRoute('/history') ? styles.active : ''}`}
            >
              Task History
            </Link>
          </li>
          <li>
            <Link 
              to="/settings" 
              className={`${styles.navLink} ${isActiveRoute('/settings') ? styles.active : ''}`}
            >
              Settings
            </Link>
          </li>
        </ul>
        <button 
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;