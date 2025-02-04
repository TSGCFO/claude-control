import { spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { exec } from 'child_process';

const execAsync = promisify(exec);

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

        childProcess.once('error', (error: Error & { code?: string }) => {
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

      // Remove .exe if present for comparison
      const baseApp = app.toLowerCase().replace('.exe', '');

      if (process.platform === 'win32') {
        try {
          // First try taskkill with process name
          await execAsync(`taskkill /F /IM "${baseApp}.exe"`);
          console.log(`Successfully terminated ${app} using taskkill`);
          return;
        } catch (error) {
          try {
            // If that fails, try to find the process by name and kill it
            const { stdout } = await execAsync(`wmic process where "name like '%${baseApp}%'" get processid`);
            const pids = stdout.split('\n')
              .slice(1) // Skip header
              .map(line => line.trim())
              .filter(Boolean)
              .map(Number);

            if (pids.length > 0) {
              await Promise.all(pids.map(pid => 
                execAsync(`taskkill /F /PID ${pid}`).catch(() => {})
              ));
              console.log(`Successfully terminated ${app} processes by PID`);
              return;
            }
          } catch (findError) {
            console.error('Error finding process:', findError);
          }
        }
      }

      // If we get here, try the managed process
      const childProcess = this.runningProcesses.get(app);
      if (childProcess?.pid) {
        try {
          childProcess.kill('SIGTERM');
          // Give the process a chance to terminate gracefully
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (this.isProcessRunning(childProcess)) {
            childProcess.kill('SIGKILL');
          }
          this.runningProcesses.delete(app);
          console.log(`Successfully terminated managed process ${app}`);
          return;
        } catch (error) {
          console.error('Error killing managed process:', error);
        }
      }

      throw new Error(`Failed to terminate ${app}`);
    } catch (error) {
      throw this.handleError('close', { app }, error);
    }
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
    action: string,
    params: Record<string, any>,
    error: unknown
  ): Error {
    const baseMessage = `Failed to ${action} application`;
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Error(`${baseMessage}: ${errorMessage}`);
  }
}