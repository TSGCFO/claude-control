import {
  SettingsAction,
  SystemIntegrationError,
  SettingValue
} from '../../../types';
import * as fs from 'fs/promises';
import * as path from 'path';

interface Settings {
  [key: string]: SettingValue;
}

export class SettingsManager {
  private settings: Settings = {};
  private settingsPath: string;
  private readonly defaultSettings: Settings = {
    defaultBrowser: 'msedge',
    defaultEditor: 'vscode',
    maxProcesses: 10,
    timeoutMs: 30000,
    retryAttempts: 3,
    logLevel: 'info'
  };

  constructor(configDir: string = process.cwd()) {
    this.settingsPath = path.join(configDir, 'settings.json');
    this.settings = { ...this.defaultSettings };
  }

  async initialize(): Promise<void> {
    try {
      await this.ensureConfigDirectory();
      await this.loadSettings();
    } catch (error) {
      // If settings file doesn't exist, create it with defaults
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await this.saveSettings();
      } else {
        throw this.handleError('initialize', {}, error);
      }
    }
  }

  async get(setting: string): Promise<SettingValue> {
    await this.ensureInitialized();
    if (!(setting in this.settings)) {
      throw new Error(`Setting '${setting}' not found`);
    }
    return this.settings[setting];
  }

  async set(setting: string, value: SettingValue): Promise<void> {
    await this.ensureInitialized();

    // Validate setting name
    if (!setting || typeof setting !== 'string') {
      throw new Error('Setting name must be a non-empty string');
    }

    // Validate setting if it exists in defaults
    if (setting in this.defaultSettings) {
      const validationType = typeof this.defaultSettings[setting];
      if (typeof value !== validationType) {
        throw new Error(
          `Invalid type for setting '${setting}'. Expected ${validationType}, got ${typeof value}`
        );
      }
    }

    // Additional validation for specific settings
    if (setting === 'maxProcesses' && typeof value === 'number' && value < 1) {
      throw new Error('maxProcesses must be greater than 0');
    }
    if (setting === 'timeoutMs' && typeof value === 'number' && value < 0) {
      throw new Error('timeoutMs must be non-negative');
    }
    if (setting === 'retryAttempts' && typeof value === 'number' && value < 0) {
      throw new Error('retryAttempts must be non-negative');
    }

    this.settings[setting] = value;
    await this.saveSettings();
  }

  async reset(setting: string): Promise<void> {
    await this.ensureInitialized();
    if (!(setting in this.defaultSettings)) {
      throw new Error(`Cannot reset unknown setting '${setting}'`);
    }

    this.settings[setting] = this.defaultSettings[setting];
    await this.saveSettings();
  }

  async getAllSettings(): Promise<Settings> {
    await this.ensureInitialized();
    return { ...this.settings };
  }

  async resetAll(): Promise<void> {
    this.settings = { ...this.defaultSettings };
    await this.saveSettings();
  }

  private async ensureInitialized(): Promise<void> {
    if (Object.keys(this.settings).length === 0) {
      await this.initialize();
    }
  }

  private async ensureConfigDirectory(): Promise<void> {
    try {
      const configDir = path.dirname(this.settingsPath);
      await fs.mkdir(configDir, { recursive: true });
    } catch (error) {
      throw this.handleError('initialize', {}, error);
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const content = await fs.readFile(this.settingsPath, 'utf8');
      let loadedSettings: unknown;

      try {
        loadedSettings = JSON.parse(content);
      } catch {
        throw new Error('Invalid JSON in settings file');
      }

      const validatedSettings = this.validateSettings(loadedSettings);
      this.settings = {
        ...this.defaultSettings,
        ...validatedSettings
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // If file doesn't exist, we'll use default settings
        this.settings = { ...this.defaultSettings };
      } else {
        throw error;
      }
    }
  }

  private validateSettings(settings: unknown): Settings {
    if (typeof settings !== 'object' || settings === null) {
      throw new Error('Settings must be an object');
    }

    const validatedSettings: Settings = {};
    const settingsObj = settings as Record<string, unknown>;

    for (const [key, value] of Object.entries(settingsObj)) {
      // Skip null or undefined values
      if (value == null) {
        continue;
      }

      // Validate value type
      if (
        typeof value !== 'string' &&
        typeof value !== 'number' &&
        typeof value !== 'boolean'
      ) {
        throw new Error(`Invalid setting value type for ${key}`);
      }

      // Validate specific settings
      if (key === 'maxProcesses' && (typeof value !== 'number' || value < 1)) {
        throw new Error('maxProcesses must be a positive number');
      }
      if (key === 'timeoutMs' && (typeof value !== 'number' || value < 0)) {
        throw new Error('timeoutMs must be a non-negative number');
      }
      if (key === 'retryAttempts' && (typeof value !== 'number' || value < 0)) {
        throw new Error('retryAttempts must be a non-negative number');
      }

      validatedSettings[key] = value;
    }

    return validatedSettings;
  }

  private async saveSettings(): Promise<void> {
    try {
      const content = JSON.stringify(this.settings, null, 2);
      await fs.writeFile(this.settingsPath, content, 'utf8');
    } catch (error) {
      throw this.handleError('set', {}, error);
    }
  }

  private handleError(
    action: SettingsAction['action'],
    params: Partial<SettingsAction>,
    error: unknown
  ): SystemIntegrationError {
    const baseMessage = `Failed to ${action} setting`;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return new SystemIntegrationError(`${baseMessage}: ${errorMessage}`, {
      action,
      ...params
    } as SettingsAction);
  }
}
