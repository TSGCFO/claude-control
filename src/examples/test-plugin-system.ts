import { DefaultPluginLoader } from '../core/plugin/plugin-loader';
import { DefaultPluginManager } from '../core/plugin/plugin-manager';
import * as path from 'path';
import { promises as fs } from 'fs';

async function testPluginSystem() {
  try {
    console.log('Testing plugin system...');

    // Create plugin loader and manager
    const loader = new DefaultPluginLoader();
    const manager = new DefaultPluginManager(loader);

    // Test plugin directory path
    const pluginDir = path.join(__dirname, '../../test-data/test-plugin');

    // Load plugin
    console.log(`Loading plugin from ${pluginDir}...`);
    await manager.loadPlugin(pluginDir);

    // List loaded plugins
    const plugins = manager.listPlugins();
    console.log('Loaded plugins:', plugins.map(p => ({
      id: p.id,
      version: p.version,
      capabilities: p.manifest.capabilities.map(c => c.name)
    })));

    // Test plugin command execution
    const testPlugin = plugins[0];
    if (testPlugin) {
      console.log(`Testing commands for plugin ${testPlugin.id}...`);

      // Execute test command
      const result = await manager.executePluginCommand(
        testPlugin.id,
        'test',
        { message: 'Hello from test!' }
      );
      console.log('Command result:', result);

      // Get plugin resource usage
      const usage = await manager.getResourceUsage();
      console.log('Plugin resource usage:', usage);

      // Test plugin events
      await manager.emitEvent('test:event', {
        timestamp: Date.now(),
        type: 'TEST'
      });

      // Disable plugin
      await manager.disablePlugin(testPlugin.id);
      console.log(`Plugin ${testPlugin.id} disabled`);

      // Try executing command while disabled (should fail)
      try {
        await manager.executePluginCommand(
          testPlugin.id,
          'test',
          { message: 'Should fail' }
        );
      } catch (error) {
        console.log('Expected error:', error instanceof Error ? error.message : String(error));
      }

      // Enable plugin
      await manager.enablePlugin(testPlugin.id);
      console.log(`Plugin ${testPlugin.id} enabled`);

      // Unload plugin
      await manager.unloadPlugin(testPlugin.id);
      console.log(`Plugin ${testPlugin.id} unloaded`);
    }

  } catch (error) {
    console.error('Error during test:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Create test plugin files if they don't exist
async function createTestPlugin() {
  const pluginDir = path.join(__dirname, '../../test-data/test-plugin');
  const manifestPath = path.join(pluginDir, 'plugin.json');
  const indexPath = path.join(pluginDir, 'index.js');

  try {
    // Create plugin directory
    await fs.mkdir(pluginDir, { recursive: true });

    // Create manifest file
    const manifest = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin for the plugin system',
      author: 'Test Author',
      capabilities: [
        {
          type: 'CUSTOM',
          name: 'test',
          description: 'Test capability',
          permissions: []
        }
      ],
      commands: [
        {
          id: 'test',
          name: 'Test Command',
          description: 'A test command',
          parameters: [
            {
              name: 'message',
              type: 'string',
              required: true,
              description: 'Test message'
            }
          ],
          handler: 'handleTest'
        }
      ]
    };

    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    // Create plugin implementation file
    const implementation = `
      let enabled = true;

      module.exports = {
        initialize: async (config) => {
          enabled = config.enabled;
          console.log('Test plugin initialized');
        },

        shutdown: async () => {
          console.log('Test plugin shutdown');
        },

        handleTest: async (params) => {
          return {
            success: true,
            data: {
              message: params.message,
              timestamp: Date.now()
            }
          };
        },

        getResourceUsage: () => ({
          memoryUsage: process.memoryUsage().heapUsed,
          cpuUsage: 0,
          diskUsage: 0,
          networkUsage: 0,
          timestamp: Date.now()
        }),

        onEvent: async (event, data) => {
          console.log('Test plugin received event:', event, data);
        },

        onConfigUpdate: async (config) => {
          enabled = config.enabled;
          console.log('Test plugin config updated:', config);
        }
      };
    `;

    await fs.writeFile(indexPath, implementation);

    console.log('Test plugin created successfully');
  } catch (error) {
    console.error('Failed to create test plugin:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  createTestPlugin()
    .then(() => testPluginSystem())
    .catch(error => {
      console.error('Fatal error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
