import {
  Plugin,
  PluginLoader,
  PluginValidationResult,
  PluginManifest,
  PluginResult,
  ResourceMetrics,
  PluginConfig
} from '../../types/plugin';

import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Interface for plugin module implementation
 */
interface PluginModule {
  initialize?(config: PluginConfig): Promise<void>;
  shutdown?(): Promise<void>;
  onConfigUpdate?(config: PluginConfig): Promise<void>;
  onEvent?(event: string, data: unknown): Promise<void>;
  getResourceUsage?(): ResourceMetrics;
  [key: string]: unknown;
}

/**
 * Interface for dynamic imports
 */
interface DynamicImport {
  default?: unknown;
  [key: string]: unknown;
}

/**
 * Default implementation of plugin loader
 */
export class DefaultPluginLoader implements PluginLoader {
  private readonly manifestFileName = 'plugin.json';

  async loadPlugin(pluginPath: string): Promise<Plugin> {
    try {
      // Validate plugin first
      const validation = await this.validatePlugin(pluginPath);
      if (!validation.valid) {
        throw new Error(`Invalid plugin: ${validation.errors.join(', ')}`);
      }

      // Load manifest
      const manifest = await this.loadManifest(pluginPath);

      // Load plugin module
      const pluginModule = await this.loadPluginModule(pluginPath);

      // Create plugin instance
      return new DefaultPlugin(manifest, pluginModule);
    } catch (error) {
      throw new Error(
        `Failed to load plugin from ${pluginPath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async validatePlugin(pluginPath: string): Promise<PluginValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if plugin directory exists
      const stats = await fs.stat(pluginPath);
      if (!stats.isDirectory()) {
        errors.push('Plugin path must be a directory');
        return { valid: false, errors, warnings };
      }

      // Check for manifest file
      const manifestPath = path.join(pluginPath, this.manifestFileName);
      try {
        await fs.access(manifestPath);
      } catch {
        errors.push('Missing plugin.json manifest file');
        return { valid: false, errors, warnings };
      }

      // Load and validate manifest
      const manifest = await this.loadManifest(pluginPath);
      const manifestValidation = this.validateManifest(manifest);
      errors.push(...manifestValidation.errors);
      warnings.push(...manifestValidation.warnings);

      // Check for main plugin file
      const mainFile = path.join(pluginPath, 'index.js');
      try {
        await fs.access(mainFile);
      } catch {
        errors.push('Missing index.js main plugin file');
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(
        `Failed to validate plugin: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return { valid: false, errors, warnings };
    }
  }

  private async loadManifest(pluginPath: string): Promise<PluginManifest> {
    const manifestPath = path.join(pluginPath, this.manifestFileName);
    const manifestContent = await fs.readFile(manifestPath, 'utf8');
    let parsed: unknown;
    try {
      parsed = JSON.parse(manifestContent);
    } catch {
      throw new Error('Invalid JSON in manifest file');
    }
    if (!this.isPluginManifest(parsed)) {
      throw new Error('Invalid plugin manifest format');
    }
    return parsed;
  }

  private isPluginManifest(value: unknown): value is PluginManifest {
    if (typeof value !== 'object' || value === null) return false;
    const manifest = value as Record<string, unknown>;
    return (
      typeof manifest.id === 'string' &&
      typeof manifest.name === 'string' &&
      typeof manifest.version === 'string' &&
      typeof manifest.description === 'string' &&
      typeof manifest.author === 'string' &&
      Array.isArray(manifest.capabilities) &&
      Array.isArray(manifest.commands)
    );
  }

  private validateManifest(manifest: PluginManifest): PluginValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!manifest.id) errors.push('Missing plugin ID');
    if (!manifest.name) errors.push('Missing plugin name');
    if (!manifest.version) errors.push('Missing plugin version');
    if (!manifest.description) errors.push('Missing plugin description');
    if (!manifest.author) errors.push('Missing plugin author');

    // Validate capabilities
    if (!Array.isArray(manifest.capabilities)) {
      errors.push('Missing or invalid capabilities array');
    } else {
      manifest.capabilities.forEach((capability, index) => {
        if (!capability.type) {
          errors.push(`Missing type in capability at index ${index}`);
        }
        if (!capability.name) {
          errors.push(`Missing name in capability at index ${index}`);
        }
      });
    }

    // Validate commands
    if (!Array.isArray(manifest.commands)) {
      errors.push('Missing or invalid commands array');
    } else {
      manifest.commands.forEach((command, index) => {
        if (!command.id) {
          errors.push(`Missing ID in command at index ${index}`);
        }
        if (!command.name) {
          errors.push(`Missing name in command at index ${index}`);
        }
        if (!command.handler) {
          errors.push(`Missing handler in command at index ${index}`);
        }
      });
    }

    // Optional fields warnings
    if (!manifest.dependencies) {
      warnings.push('No dependencies specified');
    }
    if (!manifest.configSchema) {
      warnings.push('No configuration schema specified');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async loadPluginModule(pluginPath: string): Promise<PluginModule> {
    const mainFile = path.join(pluginPath, 'index.js');
    try {
      // Dynamic import for ESM support
      const imported = (await import(mainFile)) as DynamicImport;
      const module = imported.default ?? imported;
      if (!this.isPluginModule(module)) {
        throw new Error('Invalid plugin module format');
      }
      return module;
    } catch (error) {
      throw new Error(
        `Failed to load plugin module: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private isPluginModule(value: unknown): value is PluginModule {
    if (typeof value !== 'object' || value === null) return false;
    const module = value as Record<string, unknown>;
    return (
      (typeof module.initialize === 'function' || module.initialize === undefined) &&
      (typeof module.shutdown === 'function' || module.shutdown === undefined) &&
      (typeof module.onConfigUpdate === 'function' || module.onConfigUpdate === undefined) &&
      (typeof module.onEvent === 'function' || module.onEvent === undefined) &&
      (typeof module.getResourceUsage === 'function' || module.getResourceUsage === undefined)
    );
  }
}

/**
 * Default plugin implementation
 */
class DefaultPlugin implements Plugin {
  readonly id: string;
  readonly version: string;
  readonly manifest: PluginManifest;
  private module: PluginModule;
  private config: PluginConfig;

  constructor(manifest: PluginManifest, module: PluginModule) {
    this.manifest = manifest;
    this.id = manifest.id;
    this.version = manifest.version;
    this.module = module;
    this.config = {
      enabled: true,
      settings: {}
    };
  }

  async initialize(config: PluginConfig): Promise<void> {
    this.config = config;
    if (this.module.initialize) {
      await this.module.initialize(config);
    }
  }

  async shutdown(): Promise<void> {
    if (this.module.shutdown) {
      await this.module.shutdown();
    }
  }

  async executeCommand(
    commandId: string,
    parameters: Record<string, unknown>
  ): Promise<PluginResult> {
    const command = this.manifest.commands.find(cmd => cmd.id === commandId);
    if (!command) {
      throw new Error(`Command ${commandId} not found`);
    }

    const handler = this.module[command.handler];
    if (typeof handler !== 'function') {
      throw new Error(`Handler ${command.handler} not found or not a function`);
    }

    const result = await Promise.resolve(handler.call(this.module, parameters)) as unknown;
    if (!this.isPluginResult(result)) {
      throw new Error('Invalid plugin result format');
    }
    return result;
  }

  private isPluginResult(value: unknown): value is PluginResult {
    if (typeof value !== 'object' || value === null) return false;
    const result = value as Record<string, unknown>;
    return (
      typeof result.success === 'boolean' &&
      (result.data === undefined || typeof result.data === 'object') &&
      (result.error === undefined || typeof result.error === 'string') &&
      (result.metrics === undefined || this.isResourceMetrics(result.metrics))
    );
  }

  private isResourceMetrics(value: unknown): value is ResourceMetrics {
    if (typeof value !== 'object' || value === null) return false;
    const metrics = value as Record<string, unknown>;
    return (
      typeof metrics.memoryUsage === 'number' &&
      typeof metrics.cpuUsage === 'number' &&
      typeof metrics.diskUsage === 'number' &&
      typeof metrics.networkUsage === 'number' &&
      typeof metrics.timestamp === 'number'
    );
  }

  getResourceUsage(): ResourceMetrics {
    if (this.module.getResourceUsage) {
      const usage = this.module.getResourceUsage();
      if (!this.isResourceMetrics(usage)) {
        throw new Error('Invalid resource metrics format');
      }
      return usage;
    }

    // Default resource usage if not implemented by plugin
    return {
      memoryUsage: process.memoryUsage().heapUsed,
      cpuUsage: 0,
      diskUsage: 0,
      networkUsage: 0,
      timestamp: Date.now()
    };
  }

  getConfig(): PluginConfig {
    return this.config;
  }

  async updateConfig(config: Partial<PluginConfig>): Promise<void> {
    this.config = {
      ...this.config,
      ...config
    };

    if (this.module.onConfigUpdate) {
      await this.module.onConfigUpdate(this.config);
    }
  }

  async onEvent(event: string, data: unknown): Promise<void> {
    if (this.module.onEvent) {
      await this.module.onEvent(event, data);
    }
  }
}
