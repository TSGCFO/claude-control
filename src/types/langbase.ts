export interface LangbaseConfig {
  apiKey: string;
  environment: 'development' | 'production';
  agents: {
    [key: string]: AgentConfig;
  };
}

export interface AgentConfig {
  type: 'pipe' | 'memory';
  description: string;
  tools?: ToolConfig[];
  memory?: MemoryConfig;
}

export interface ToolConfig {
  name: string;
  description: string;
  handler: (params: Record<string, unknown>) => Promise<ToolResponse>;
}

export interface ToolResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface MemoryConfig {
  type: 'semantic' | 'vector';
  config: {
    indexName: string;
    dimensions: number;
  };
}