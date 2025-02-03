import {
  Plugin,
  PluginManager,
  PluginLoader,
  PluginResult,
  PluginValidationResult,
  ResourceMetrics,
  PluginEventEmitter
} from '../../types/plugin';

import { EventEmitter } from 'events';

/**
 * Implementation of the plugin manager that handles plugin lifecycle and operations
 */
export class DefaultPluginManager implements PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private eventEmitter: PluginEventEmitter;
  private loader: PluginLoader;

  constructor(loader: PluginLoader, eventEmitter?: PluginEventEmitter) {
    this.loader = loader;
    this.eventEmitter = eventEmitter || new DefaultPluginEventEmitter();
  }

  async loadPlugin(pluginPath: string): Promise<void> {
    try {
      // Validate plugin before loading
      const validation = await this.validatePlugin(pluginPath);
      if (!validation.valid) {
        throw new Error(`Invalid plugin: ${validation.errors.join(', ')}`);
      }

      // Load plugin using the loader
      const plugin = await this.loader.loadPlugin(pluginPath);

      // Check for duplicate plugins
      if (this.plugins.has(plugin.id)) {
        throw new Error(`Plugin with ID ${plugin.id} is already loaded`);
      }

      // Initialize plugin with default config
      await plugin.initialize({
        enabled: true,
        settings: {}
      });

      // Store plugin
      this.plugins.set(plugin.id, plugin);

      // Emit plugin loaded event
      await this.emitEvent('plugin:loaded', {
        pluginId: plugin.id,
        version: plugin.version
      });
    } catch (error) {
      throw new Error(
        `Failed to load plugin from ${pluginPath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    try {
      // Shutdown plugin
      await plugin.shutdown();

      // Remove from plugins map
      this.plugins.delete(pluginId);

      // Emit plugin unloaded event
      await this.emitEvent('plugin:unloaded', {
        pluginId
      });
    } catch (error) {
      throw new Error(
        `Failed to unload plugin ${pluginId}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const config = plugin.getConfig();
    if (config.enabled) {
      return; // Already enabled
    }

    await plugin.updateConfig({
      enabled: true
    });

    await this.emitEvent('plugin:enabled', {
      pluginId
    });
  }

  async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const config = plugin.getConfig();
    if (!config.enabled) {
      return; // Already disabled
    }

    await plugin.updateConfig({
      enabled: false
    });

    await this.emitEvent('plugin:disabled', {
      pluginId
    });
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  listPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  async validatePlugin(pluginPath: string): Promise<PluginValidationResult> {
    return this.loader.validatePlugin(pluginPath);
  }

  async executePluginCommand(
    pluginId: string,
    commandId: string,
    parameters: Record<string, unknown>
  ): Promise<PluginResult> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const config = plugin.getConfig();
    if (!config.enabled) {
      throw new Error(`Plugin ${pluginId} is disabled`);
    }

    try {
      // Execute command and measure performance
      const startTime = Date.now();
      const result = await plugin.executeCommand(commandId, parameters);
      const executionTime = Date.now() - startTime;

      // Add execution metrics if not provided
      if (!result.metrics) {
        result.metrics = {
          ...plugin.getResourceUsage(),
          timestamp: Date.now()
        };
      }

      // Emit command execution event
      await this.emitEvent('plugin:command:executed', {
        pluginId,
        commandId,
        executionTime,
        success: result.success
      });

      return result;
    } catch (error) {
      // Emit command error event
      await this.emitEvent('plugin:command:error', {
        pluginId,
        commandId,
        error: error instanceof Error ? error.message : String(error)
      });

      throw error;
    }
  }

  async emitEvent(event: string, data: unknown): Promise<void> {
    await this.eventEmitter.emit(event, data);
  }

  async getResourceUsage(): Promise<{ [pluginId: string]: ResourceMetrics }> {
    const usage: { [pluginId: string]: ResourceMetrics } = {};
    const plugins = Array.from(this.plugins.entries());
    await Promise.all(
      plugins.map(async ([id, plugin]) => {
        usage[id] = await Promise.resolve(plugin.getResourceUsage());
      })
    );
    return usage;
  }
}

/**
 * Default implementation of plugin event emitter using Node's EventEmitter
 */
class DefaultPluginEventEmitter implements PluginEventEmitter {
  private emitter = new EventEmitter();

  async emit(event: string, data: unknown): Promise<void> {
    await Promise.resolve();
    this.emitter.emit(event, data);
  }

  on(event: string, handler: (data: unknown) => void): void {
    this.emitter.on(event, data => {
      void Promise.resolve(handler(data));
    });
  }

  off(event: string, handler: (data: unknown) => void): void {
    this.emitter.off(event, handler);
  }
}
