import { LangbaseConfig, ToolResponse } from '../../types/langbase';

export const langbaseConfig: LangbaseConfig = {
  apiKey: 'user_4M2gDyty9DzVPVkvGddJ9fM7QoTVMwJW3izJTxMtnrjvBUhGgdki8EkgSBK1XmpSjhbQR1iHgvEUVRy1eBWmD6VJ',
  environment: 'development',
  agents: {
    computerControl: {
      type: 'pipe',
      description: 'AI agent for computer control and system operations',
      tools: [
        {
          name: 'fileSystem',
          description: 'File system operations like read, write, delete',
          handler: async (_params: Record<string, unknown>): Promise<ToolResponse> => ({
            success: true,
            data: null
          })
        },
        {
          name: 'systemCommand',
          description: 'Execute system commands safely',
          handler: async (_params: Record<string, unknown>): Promise<ToolResponse> => ({
            success: true,
            data: null
          })
        },
        {
          name: 'webNavigation',
          description: 'Control web browser and navigation',
          handler: async (_params: Record<string, unknown>): Promise<ToolResponse> => ({
            success: true,
            data: null
          })
        }
      ],
      memory: {
        type: 'semantic',
        config: {
          indexName: 'computer-control-memory',
          dimensions: 1536
        }
      }
    }
  }
};