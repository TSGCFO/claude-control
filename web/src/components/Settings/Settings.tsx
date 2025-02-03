import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Settings as SettingsType, Theme } from '../../types';
import styles from './Settings.module.css';

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const Section: React.FC<SettingsSectionProps> = ({ title, description, children }) => (
  <div className={styles.section}>
    <div className={styles.sectionHeader}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
    <div className={styles.sectionContent}>
      {children}
    </div>
  </div>
);

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsType>({
    autoScroll: true,
    maxHistory: 100,
    confirmDangerous: true
  });

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as Theme;
    if (newTheme !== theme) {
      toggleTheme();
    }
  };

  const handleSettingChange = (key: keyof SettingsType, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMaxHistoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      handleSettingChange('maxHistory', value);
    }
  };

  const handleClearHistory = () => {
    if (!settings.confirmDangerous || window.confirm('Are you sure you want to clear all history?')) {
      // Clear history logic would go here
      console.log('Clearing history...');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Settings</h1>
      
      <Section
        title="Appearance"
        description="Customize the look and feel of the interface"
      >
        <div className={styles.setting}>
          <label className={styles.label}>
            Theme
            <select
              value={theme}
              onChange={handleThemeChange}
              className={styles.select}
              aria-label="Select theme"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </Section>

      <Section
        title="Behavior"
        description="Configure how the interface behaves"
      >
        <div className={styles.setting}>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={settings.autoScroll}
              onChange={(e) => handleSettingChange('autoScroll', e.target.checked)}
              className={styles.checkbox}
            />
            Auto-scroll to new output
          </label>
        </div>

        <div className={styles.setting}>
          <label className={styles.label}>
            Maximum history items
            <input
              type="number"
              value={settings.maxHistory}
              onChange={handleMaxHistoryChange}
              min="0"
              className={styles.input}
              aria-label="Maximum history items"
            />
          </label>
        </div>

        <div className={styles.setting}>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={settings.confirmDangerous}
              onChange={(e) => handleSettingChange('confirmDangerous', e.target.checked)}
              className={styles.checkbox}
            />
            Confirm dangerous operations
          </label>
        </div>
      </Section>

      <Section
        title="System"
        description="System-related settings and information"
      >
        <div className={styles.setting}>
          <button
            className={styles.dangerButton}
            onClick={handleClearHistory}
            aria-label="Clear all history"
          >
            Clear All History
          </button>
        </div>
      </Section>
    </div>
  );
};

export default Settings;