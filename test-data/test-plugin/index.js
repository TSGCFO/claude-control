
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
    