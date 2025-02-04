import { AppAction, SystemIntegrationError } from '../../../types';
import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

interface ProcessError extends Error {
  code?: string;
}

export class ApplicationIntegration {
  private runningProcesses: Map<string, ChildProcess> = new Map();
  private readonly windowsSystemApps = new Set(['notepad', 'calc', 'mspaint', 'cmd', 'powershell']);
  private readonly autoClosingApps = new Set(['calc']); // Apps that auto-close when their window is closed

  async launch(app: string, parameters: Record<string, string | number | boolean> = {}): Promise<void> {
    try {
      if (!app) {
        throw new Error('Application name is required');
      }

      // Remove .exe if present for comparison
      const baseApp = app.toLowerCase().replace('.exe', '');
      const isWindowsSystemApp = this.windowsSystemApps.has(baseApp);

      let executablePath: string;
      if (process.platform === 'win32' && isWindowsSystemApp) {
        const systemRoot = process.env.SystemRoot || 'C:\\Windows';
        executablePath = path.join(systemRoot, 'System32', `${baseApp}.exe`);
      } else {
        executablePath = app;
      }

      const childProcess = spawn(executablePath, [], {
        detached: true,
        stdio: 'ignore',
        windowsHide: false,
        shell: !isWindowsSystemApp // Only use shell for non-system apps
      });

      // Wait for process to start
      await new Promise<void>((resolve, reject) => {
        childProcess.once('spawn', () => {
          if (!childProcess.pid) {
            reject(new Error('Failed to get process ID'));
            return;
          }
          this.runningProcesses.set(app, childProcess);
          if (isWindowsSystemApp) {
            childProcess.unref();
          }
          resolve();
        });

        childProcess.once('error', (error: ProcessError) => {
          if (error.code === 'ENOENT') {
            reject(new Error(`Application not found: ${app}`));
          } else {
            reject(error);
          }
        });

        // Handle auto-closing apps
        if (this.autoClosingApps.has(baseApp)) {
          childProcess.once('exit', () => {
            this.runningProcesses.delete(app);
          });
        }
      });
    } catch (error) {
      throw this.handleError('launch', { app, parameters }, error);
    }
  }

  async close(app: string): Promise<void> {
    try {
      if (!app) {
        throw new Error('Application name is required');
      }

      const childProcess = this.runningProcesses.get(app);
      if (!childProcess?.pid) {
        // Don't throw for auto-closing apps
        if (this.autoClosingApps.has(app.toLowerCase().replace('.exe', ''))) {
          return;
        }
        throw new Error(`Application ${app} is not running or not managed by this process`);
      }

      if (process.platform === 'win32') {
        try {
          await execAsync(`taskkill /PID ${childProcess.pid} /F`);
        } catch (error) {
          const processError = error as ProcessError;
          // Ignore if process is already terminated
          if (processError.code !== '128' && !this.autoClosingApps.has(app.toLowerCase().replace('.exe', ''))) {
            throw error;
          }
        }
      } else {
        try {
          childProcess.kill('SIGTERM');
          // Give the process a chance to terminate gracefully
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (this.isProcessRunning(childProcess)) {
            childProcess.kill('SIGKILL');
          }
        } catch (error) {
          const processError = error as ProcessError;
          // Ignore if process is already terminated
          if (processError.code !== 'ESRCH' && !this.autoClosingApps.has(app.toLowerCase().replace('.exe', ''))) {
            throw error;
          }
        }
      }

      this.runningProcesses.delete(app);
    } catch (error) {
      throw this.handleError('close', { app }, error);
    }
  }

  async focus(app: string): Promise<void> {
    try {
      if (!app) {
        throw new Error('Application name is required');
      }

      if (process.platform === 'win32') {
        await this.focusWindowsApp(app);
      } else {
        throw new Error('Focus operation not implemented for this platform');
      }
    } catch (error) {
      throw this.handleError('focus', { app }, error);
    }
  }

  async sendKeys(keys: string): Promise<void> {
    try {
      if (!keys) {
        throw new Error('Keys are required');
      }

      if (process.platform === 'win32') {
        const escapedKeys = this.escapeKeys(keys);
        const command = `
          powershell -command "
            Add-Type -AssemblyName System.Windows.Forms;
            [System.Windows.Forms.SendKeys]::SendWait('${escapedKeys}');
          "
        `;
        await execAsync(command);
      } else {
        throw new Error('SendKeys operation not implemented for this platform');
      }
    } catch (error) {
      throw this.handleError('launch', { parameters: { keys } }, error);
    }
  }

  isRunning(app: string): boolean {
    try {
      if (!app) {
        return false;
      }

      const childProcess = this.runningProcesses.get(app);
      if (!childProcess?.pid) {
        return false;
      }

      return this.isProcessRunning(childProcess);
    } catch {
      return false;
    }
  }

  async cleanup(): Promise<void> {
    try {
      const apps = Array.from(this.runningProcesses.keys());
      await Promise.all(
        apps.map(app =>
          this.close(app).catch(error => {
            // Only log errors for non-auto-closing apps
            if (!this.autoClosingApps.has(app.toLowerCase().replace('.exe', ''))) {
              console.error(`Failed to close ${app}:`, error);
            }
          })
        )
      );
    } catch (error) {
      throw this.handleError('cleanup', {}, error);
    }
  }

  private buildCommand(app: string, parameters: Record<string, string | number | boolean>): string {
    const args = Object.entries(parameters)
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return value ? `--${key}` : '';
        }
        return `--${key}="${value}"`;
      })
      .filter(Boolean)
      .join(' ');

    return args ? `${app} ${args}` : app;
  }

  private async focusWindowsApp(app: string): Promise<void> {
    const baseApp = app.toLowerCase().replace('.exe', '');
    const command = `
      powershell -command "
        $process = Get-Process '${baseApp}' -ErrorAction SilentlyContinue;
        if ($process) {
          $window = $process.MainWindowHandle;
          if ($window) {
            [void][System.Runtime.InteropServices.Marshal]::SetForegroundWindow($window);
          }
        }
      "
    `;

    await execAsync(command);
  }

  private escapeKeys(keys: string): string {
    return keys
      .replace(/[{}+^%~()]/g, '\\$&')
      .replace(/\\/g, '\\\\');
  }

  private isProcessRunning(process: ChildProcess): boolean {
    try {
      process.kill(0);
      return true;
    } catch {
      return false;
    }
  }

  private handleError(
    action: AppAction['action'],
    params: Partial<AppAction>,
    error: unknown
  ): SystemIntegrationError {
    const baseMessage = `Failed to ${action} application`;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return new SystemIntegrationError(
      `${baseMessage}: ${errorMessage}`,
      {
        action,
        ...params
      } as AppAction
    );
  }
}
