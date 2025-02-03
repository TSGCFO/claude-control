import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './Settings.module.css';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Settings</h2>
      
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Appearance</h3>
        <p className={styles.sectionDescription}>
          Customize the look and feel of the interface
        </p>
        <div className={styles.setting}>
          <label htmlFor="theme" className={styles.label}>
            Theme
          </label>
          <select
            id="theme"
            className={styles.select}
            value={theme}
            onChange={() => toggleTheme()}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Behavior</h3>
        <p className={styles.sectionDescription}>
          Configure how the interface behaves
        </p>
        <div className={styles.setting}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={true}
              onChange={() => {/* TODO: Implement auto-scroll setting */}}
            />
            Auto-scroll to new output
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>System</h3>
        <p className={styles.sectionDescription}>
          View system information and status
        </p>
        <div className={styles.systemInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Version</span>
            <span className={styles.infoValue}>1.0.0</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Status</span>
            <span className={`${styles.infoValue} ${styles.statusOnline}`}>
              Online
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;