import { FileAction, SystemIntegrationError } from '../../../types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FileSystemIntegration {
  private basePath: string;
  private readonly allowedExtensions = new Set([
    '.txt',
    '.json',
    '.md',
    '.js',
    '.ts',
    '.html',
    '.css'
  ]);

  constructor(basePath: string = process.cwd()) {
    this.basePath = path.resolve(basePath);
  }

  async read(filePath: string): Promise<string> {
    try {
      const safePath = this.sanitizePath(filePath);
      await this.validateFileExists(safePath);
      this.validateFileType(safePath);
      return fs.readFile(safePath, 'utf8');
    } catch (error) {
      throw this.handleError('read', { path: filePath }, error);
    }
  }

  async write(filePath: string, content: string): Promise<void> {
    try {
      const safePath = this.sanitizePath(filePath);
      this.validateFileType(safePath);
      await this.ensureDirectoryExists(path.dirname(safePath));
      await fs.writeFile(safePath, content, 'utf8');
    } catch (error) {
      throw this.handleError('write', { path: filePath, content }, error);
    }
  }

  async delete(filePath: string): Promise<void> {
    try {
      const safePath = this.sanitizePath(filePath);
      await this.validateFileExists(safePath);
      this.validateFileType(safePath);
      await fs.unlink(safePath);
    } catch (error) {
      throw this.handleError('delete', { path: filePath }, error);
    }
  }

  async list(dirPath: string): Promise<string[]> {
    try {
      const safePath = this.sanitizePath(dirPath);
      await this.validateDirectoryExists(safePath);
      const files = await fs.readdir(safePath);
      return files
        .filter(file => this.isAllowedFile(file))
        .map(file => path.relative(this.basePath, path.join(safePath, file)));
    } catch (error) {
      throw this.handleError('list', { path: dirPath }, error);
    }
  }

  private sanitizePath(filePath: string): string {
    if (!filePath) {
      throw new Error('File path cannot be empty');
    }

    // Normalize the path and resolve it relative to the base path
    const normalizedPath = path.normalize(filePath);
    const resolvedPath = path.resolve(this.basePath, normalizedPath);

    // Ensure the resolved path is within the base path
    if (!resolvedPath.startsWith(this.basePath)) {
      throw new Error('Path traversal attempt detected');
    }

    return resolvedPath;
  }

  private async validateFileExists(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        throw new Error('Path exists but is not a file');
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`File does not exist: ${filePath}`);
      }
      throw error;
    }
  }

  private async validateDirectoryExists(dirPath: string): Promise<void> {
    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        throw new Error('Path exists but is not a directory');
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Directory does not exist: ${dirPath}`);
      }
      throw error;
    }
  }

  private validateFileType(filePath: string): void {
    if (!this.isAllowedFile(filePath)) {
      throw new Error('File type not allowed for security reasons');
    }
  }

  private isAllowedFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.allowedExtensions.has(ext) || ext === '';
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // Ignore error if directory already exists
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  private handleError(
    action: FileAction['action'],
    params: Partial<FileAction>,
    error: unknown
  ): SystemIntegrationError {
    const baseMessage = `Failed to ${action} file`;
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new SystemIntegrationError(`${baseMessage}: ${errorMessage}`, {
      action,
      ...params
    } as FileAction);
  }
}
