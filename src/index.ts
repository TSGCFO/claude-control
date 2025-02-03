import { NaturalLanguageProcessor } from './core/nli/processor';
import { ActionExecutor } from './core/executor/executor';
import { FileSystemIntegration } from './core/system/file';
import { ApplicationIntegration } from './core/system/app';
import { WebIntegration } from './core/system/web';
import { SettingsManager } from './core/system/settings';
import { SystemIntegration, ExecutionResult, SettingValue } from './types';

export class ClaudeControl {
  private nlp: NaturalLanguageProcessor;
  private executor: ActionExecutor;
  private fileSystem: FileSystemIntegration;
  private appControl: ApplicationIntegration;
  private webControl: WebIntegration;
  private settings: SettingsManager;

  constructor(configDir?: string) {
    // Initialize system integration components
    this.fileSystem = new FileSystemIntegration(configDir);
    this.appControl = new ApplicationIntegration();
    this.webControl = new WebIntegration();
    this.settings = new SettingsManager(configDir);

    // Create system integration interface
    const systemIntegration: SystemIntegration = {
      fileSystem: {
        read: (path: string) => this.fileSystem.read(path),
        write: (path: string, content: string) => this.fileSystem.write(path, content),
        delete: (path: string) => this.fileSystem.delete(path),
        list: (path: string) => this.fileSystem.list(path)
      },
      applications: {
        launch: (app: string) => this.appControl.launch(app),
        close: (app: string) => this.appControl.close(app),
        focus: (app: string) => this.appControl.focus(app),
        sendKeys: (keys: string) => this.appControl.sendKeys(keys)
      },
      browser: {
        navigate: (url: string) => this.webControl.navigate(url),
        search: (query: string) => this.webControl.search(query),
        click: (selector: string) => this.webControl.click(selector),
        type: (text: string) => this.webControl.type(text)
      },
      settings: {
        get: (setting: string) => this.settings.get(setting),
        set: (setting: string, value: SettingValue) => this.settings.set(setting, value),
        reset: (setting: string) => this.settings.reset(setting)
      }
    };

    // Initialize core components
    this.nlp = new NaturalLanguageProcessor();
    this.executor = new ActionExecutor(systemIntegration);
  }

  async initialize(): Promise<void> {
    // Initialize all components
    await this.webControl.initialize();
    await this.settings.initialize();
  }

  async executeCommand(input: string): Promise<ExecutionResult> {
    try {
      // Parse natural language input into command
      const command = this.nlp.parseCommand(input);

      // Execute command
      const result = await this.executor.execute(command);

      // Update NLP context with result
      this.nlp.updateContext(result.commandId, result);

      return result;
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      // Cleanup all components
      await this.webControl.cleanup();
      await this.appControl.cleanup();
      await this.settings.resetAll();
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }

  // Utility methods for direct access to components
  getExecutor(): ActionExecutor {
    return this.executor;
  }

  getFileSystem(): FileSystemIntegration {
    return this.fileSystem;
  }

  getAppControl(): ApplicationIntegration {
    return this.appControl;
  }

  getWebControl(): WebIntegration {
    return this.webControl;
  }

  getSettings(): SettingsManager {
    return this.settings;
  }
}

// Export individual components for direct use if needed
export {
  NaturalLanguageProcessor,
  ActionExecutor,
  FileSystemIntegration,
  ApplicationIntegration,
  WebIntegration,
  SettingsManager
};

// Create and export default instance
const defaultInstance = new ClaudeControl();
export default defaultInstance;
