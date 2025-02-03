import {
  Command,
  ExecutionResult,
  ExecutionState,
  ExecutionError,
  SystemIntegration,
  SystemState,
  FileAction,
  AppAction,
  WebAction,
  SettingsAction,
  SettingValue,
  SearchResult
} from '../../types';

type CommandOutput = string | number | boolean | SearchResult | null;

export class ActionExecutor {
  private state: ExecutionState;
  private systemIntegration: SystemIntegration;

  constructor(systemIntegration: SystemIntegration) {
    this.systemIntegration = systemIntegration;
    this.state = this.initializeState();
  }

  async execute(command: Command): Promise<ExecutionResult> {
    const commandId = command.contextId || 'default';

    try {
      // Update state to running
      this.updateState('RUNNING', commandId);

      // Execute command based on type
      const output = await this.executeByType(command);

      // Get updated system state
      const newState = this.getSystemState();

      // Update state to completed
      this.updateState('COMPLETED', commandId);

      return {
        success: true,
        output,
        commandId,
        newState
      };
    } catch (error) {
      // Update state to failed
      this.updateState('FAILED', commandId, error as Error);

      throw new ExecutionError(
        error instanceof Error ? error.message : String(error),
        commandId
      );
    }
  }

  getState(): ExecutionState {
    return { ...this.state };
  }

  private async executeByType(command: Command): Promise<CommandOutput> {
    switch (command.type) {
      case 'FILE':
        return this.executeFileCommand(command);
      case 'APP':
        return this.executeAppCommand(command);
      case 'WEB':
        return this.executeWebCommand(command);
      case 'SYSTEM':
        return this.executeSystemCommand(command);
      default:
        throw new Error(`Unknown command type: ${String(command.type)}`);
    }
  }

  private async executeFileCommand(command: Command): Promise<string> {
    const action: FileAction = {
      action: command.action as FileAction['action'],
      path: command.parameters.path,
      content: command.parameters.content
    };

    let files: string[];

    switch (action.action) {
      case 'read':
        return this.systemIntegration.fileSystem.read(action.path);
      case 'write':
        await this.systemIntegration.fileSystem.write(
          action.path,
          action.content ?? ''
        );
        return 'File written successfully';
      case 'delete':
        await this.systemIntegration.fileSystem.delete(action.path);
        return 'File deleted successfully';
      case 'list':
        files = await this.systemIntegration.fileSystem.list(action.path);
        return files.join('\n');
      default:
        throw new Error(`Unknown file action: ${String(action.action)}`);
    }
  }

  private async executeAppCommand(command: Command): Promise<string> {
    const action: AppAction = {
      action: command.action as AppAction['action'],
      app: command.parameters.app,
      parameters: command.parameters
    };

    switch (action.action) {
      case 'launch':
        if (!action.app) throw new Error('App name is required');
        await this.systemIntegration.applications.launch(action.app);
        return 'Application launched successfully';
      case 'close':
        if (!action.app) throw new Error('App name is required');
        await this.systemIntegration.applications.close(action.app);
        return 'Application closed successfully';
      case 'focus':
        if (!action.app) throw new Error('App name is required');
        await this.systemIntegration.applications.focus(action.app);
        return 'Application focused successfully';
      case 'cleanup':
        return 'Cleanup completed successfully';
      default:
        throw new Error(`Unknown app action: ${String(action.action)}`);
    }
  }

  private async executeWebCommand(command: Command): Promise<string | SearchResult> {
    const action: WebAction = {
      action: command.action as WebAction['action'],
      url: command.parameters.url,
      selector: command.parameters.selector,
      text: command.parameters.text
    };

    switch (action.action) {
      case 'initialize':
        return 'Browser initialized successfully';
      case 'cleanup':
        return 'Browser cleanup completed successfully';
      case 'navigate':
        if (!action.url) throw new Error('URL is required');
        await this.systemIntegration.browser.navigate(action.url);
        return 'Navigation successful';
      case 'search':
        if (!action.text) throw new Error('Search text is required');
        return this.systemIntegration.browser.search(action.text);
      case 'click':
        if (!action.selector) throw new Error('Selector is required');
        await this.systemIntegration.browser.click(action.selector);
        return 'Click successful';
      case 'type':
        if (!action.text) throw new Error('Text is required');
        await this.systemIntegration.browser.type(action.text);
        return 'Text input successful';
      default:
        throw new Error(`Unknown web action: ${String(action.action)}`);
    }
  }

  private async executeSystemCommand(command: Command): Promise<SettingValue> {
    const action: SettingsAction = {
      action: command.action as SettingsAction['action'],
      setting: command.parameters.setting,
      value: command.parameters.value as SettingValue | undefined
    };

    switch (action.action) {
      case 'initialize':
        return 'System initialized successfully';
      case 'get':
        if (!action.setting) throw new Error('Setting name is required');
        return this.systemIntegration.settings.get(action.setting);
      case 'set':
        if (!action.setting) throw new Error('Setting name is required');
        if (action.value === undefined) throw new Error('Setting value is required');
        await this.systemIntegration.settings.set(action.setting, action.value);
        return action.value;
      case 'reset':
        if (!action.setting) throw new Error('Setting name is required');
        await this.systemIntegration.settings.reset(action.setting);
        return this.systemIntegration.settings.get(action.setting);
      default:
        throw new Error(`Unknown settings action: ${String(action.action)}`);
    }
  }

  private updateState(
    status: ExecutionState['status'],
    commandId: string,
    error?: Error
  ): void {
    this.state = {
      status,
      progress: this.calculateProgress(status),
      currentOperation: commandId,
      errors: error ? [...this.state.errors, error] : this.state.errors
    };
  }

  private calculateProgress(status: ExecutionState['status']): number {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'RUNNING':
        return 50;
      case 'COMPLETED':
        return 100;
      case 'FAILED':
        return -1;
      default:
        return 0;
    }
  }

  private getSystemState(): SystemState {
    return {
      runningProcesses: [],
      activeWindows: [],
      resources: {
        cpu: 0,
        memory: 0,
        disk: 0
      }
    };
  }

  private initializeState(): ExecutionState {
    return {
      status: 'PENDING',
      progress: 0,
      errors: []
    };
  }
}
