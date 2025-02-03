/**
 * Plugin capability types that define what a plugin can do
 */
export type PluginCapabilityType =
  | 'FILE_SYSTEM'
  | 'PROCESS'
  | 'WINDOW'
  | 'NETWORK'
  | 'SYSTEM'
  | 'CUSTOM';

/**
 * Plugin capability definition
 */
export interface PluginCapability {
  type: PluginCapabilityType;
  name: string;
  description: string;
  permissions: string[];
}

/**
 * Resource usage metrics for plugins
 */
export interface ResourceMetrics {
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkUsage: number;
  timestamp: number;
}

/**
 * Plugin command structure
 */
export interface PluginCommand {
  id: string;
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  handler: string;
}

/**
 * Plugin command execution result
 */
export interface PluginResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metrics?: ResourceMetrics;
}

/**
 * Plugin manifest that describes the plugin
 */
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  capabilities: PluginCapability[];
  commands: PluginCommand[];
  dependencies?: {
    [key: string]: string;
  };
  configSchema?: Record<string, unknown>;
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  enabled: boolean;
  settings: Record<string, unknown>;
}

/**
 * Plugin interface that all plugins must implement
 */
export interface Plugin {
  readonly id: string;
  readonly version: string;
  readonly manifest: PluginManifest;

  // Plugin lifecycle
  initialize(config: PluginConfig): Promise<void>;
  shutdown(): Promise<void>;

  // Command handling
  executeCommand(
    commandId: string,
    parameters: Record<string, unknown>
  ): Promise<PluginResult>;

  // Resource management
  getResourceUsage(): ResourceMetrics;

  // Configuration
  getConfig(): PluginConfig;
  updateConfig(config: Partial<PluginConfig>): Promise<void>;

  // Event handling
  onEvent(event: string, data: unknown): Promise<void>;
}

/**
 * Plugin validation result
 */
export interface PluginValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Plugin manager interface
 */
export interface PluginManager {
  // Plugin lifecycle
  loadPlugin(pluginPath: string): Promise<void>;
  unloadPlugin(pluginId: string): Promise<void>;
  enablePlugin(pluginId: string): Promise<void>;
  disablePlugin(pluginId: string): Promise<void>;

  // Plugin operations
  getPlugin(pluginId: string): Plugin | undefined;
  listPlugins(): Plugin[];
  validatePlugin(pluginPath: string): Promise<PluginValidationResult>;

  // Command handling
  executePluginCommand(
    pluginId: string,
    commandId: string,
    parameters: Record<string, unknown>
  ): Promise<PluginResult>;

  // Event handling
  emitEvent(event: string, data: unknown): Promise<void>;

  // Resource management
  getResourceUsage(): Promise<{
    [pluginId: string]: ResourceMetrics;
  }>;
}

/**
 * Plugin loader interface
 */
export interface PluginLoader {
  loadPlugin(pluginPath: string): Promise<Plugin>;
  validatePlugin(pluginPath: string): Promise<PluginValidationResult>;
}

/**
 * Plugin event emitter interface
 */
export interface PluginEventEmitter {
  emit(event: string, data: unknown): Promise<void>;
  on(event: string, handler: (data: unknown) => Promise<void>): void;
  off(event: string, handler: (data: unknown) => Promise<void>): void;
}
