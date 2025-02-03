import { UserRequest, ModelResponse, LLMProvider } from '../../types';
import { AnthropicProvider } from './anthropic';
import { OpenAIProvider } from './openai';

export type ProviderType = 'anthropic' | 'openai';

interface ProviderConfig {
  readonly type: ProviderType;
  readonly apiKey?: string;
}

interface ProviderCapabilities {
  readonly maxTokens: number;
  readonly costPerToken: number;
  readonly specializations: string[];
  readonly responseTime: number;
}

export class ModelSelector {
  private readonly providers: Map<ProviderType, LLMProvider>;
  private readonly capabilities: Map<ProviderType, ProviderCapabilities>;

  constructor(configs: ProviderConfig[]) {
    this.providers = new Map();
    this.capabilities = new Map();

    for (const config of configs) {
      this.initializeProvider(config);
    }
  }

  private initializeProvider(config: ProviderConfig): void {
    switch (config.type) {
      case 'anthropic':
        this.providers.set('anthropic', new AnthropicProvider(config.apiKey));
        this.capabilities.set('anthropic', {
          maxTokens: 4096,
          costPerToken: 0.0001,
          specializations: ['system-control', 'reasoning'],
          responseTime: 1000
        });
        break;

      case 'openai':
        this.providers.set('openai', new OpenAIProvider(config.apiKey));
        this.capabilities.set('openai', {
          maxTokens: 4096,
          costPerToken: 0.00015,
          specializations: ['reasoning', 'optimization'],
          responseTime: 800
        });
        break;

      default: {
        const type: never = config.type;
        throw new Error(`Unsupported provider type: ${String(type)}`);
      }
    }
  }

  async processRequest(request: UserRequest): Promise<ModelResponse> {
    const provider = this.selectProvider(request);
    if (!provider) {
      throw new Error('No suitable provider found for the request');
    }

    return provider.processRequest(request);
  }

  private selectProvider(request: UserRequest): LLMProvider | null {
    // For system operations, prefer Anthropic
    if (request.type === 'SYSTEM_OPERATION') {
      return this.providers.get('anthropic') || this.providers.get('openai') || null;
    }

    // For reasoning tasks, prefer OpenAI
    if (request.type === 'REASONING') {
      return this.providers.get('openai') || this.providers.get('anthropic') || null;
    }

    // For general tasks, select based on complexity
    if (request.complexity === 'LOW') {
      // For simple tasks, prefer faster response time
      const providers = Array.from(this.capabilities.entries())
        .sort(([, a], [, b]) => a.responseTime - b.responseTime);

      for (const [type] of providers) {
        const provider = this.providers.get(type);
        if (provider) return provider;
      }
    } else {
      // For complex tasks, prefer lower cost
      const providers = Array.from(this.capabilities.entries())
        .sort(([, a], [, b]) => a.costPerToken - b.costPerToken);

      for (const [type] of providers) {
        const provider = this.providers.get(type);
        if (provider) return provider;
      }
    }

    // Fallback to any available provider
    return this.providers.get('anthropic') ||
           this.providers.get('openai') ||
           null;
  }

  getProvider(type: ProviderType): LLMProvider | undefined {
    return this.providers.get(type);
  }

  getCapabilities(type: ProviderType): ProviderCapabilities | undefined {
    return this.capabilities.get(type);
  }
}
