import { UserRequest, ModelResponse, LLMModel, LLMError } from '../../types';

export interface LLMProvider {
  processRequest(request: UserRequest): Promise<ModelResponse>;
}

export class ModelSelector {
  selectModel(request: UserRequest): LLMModel {
    // For complex system operations, use Claude 3 Opus
    if (request.type === 'SYSTEM_OPERATION') {
      return {
        provider: 'anthropic',
        model: 'claude-3-opus-20240229'
      };
    }

    // For fast, routine tasks use Claude 3.5 Haiku
    if (request.complexity === 'LOW') {
      return {
        provider: 'anthropic',
        model: 'claude-3-5-haiku-20241022'
      };
    }

    // For reasoning tasks use OpenAI's O3-mini
    if (request.type === 'REASONING') {
      return {
        provider: 'openai',
        model: 'o3-mini-2025-01-31'
      };
    }

    // Default to Claude 3.5 Sonnet
    return {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022'
    };
  }
}

export class ModelVersionManager {
  private readonly ANTHROPIC_MODELS: Record<string, string> = {
    'claude-3-opus': 'claude-3-opus-20240229',
    'claude-3-sonnet': 'claude-3-sonnet-20240229',
    'claude-3-haiku': 'claude-3-haiku-20240307',
    'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku': 'claude-3-5-haiku-20241022'
  };

  private readonly OPENAI_MODELS: Record<string, string> = {
    'gpt-4o': 'gpt-4o-2024-08-06',
    'gpt-4o-mini': 'gpt-4o-mini-2024-07-18',
    o1: 'o1-2024-12-17',
    'o3-mini': 'o3-mini-2025-01-31'
  };

  getModelVersion(alias: string): string {
    return this.ANTHROPIC_MODELS[alias] || this.OPENAI_MODELS[alias] || alias;
  }
}

export class ErrorHandler {
  handleModelError(error: unknown): void {
    if (this.isLLMError(error)) {
      this.handleLLMError(error);
    } else {
      this.handleGenericError(error);
    }
  }

  private isLLMError(error: unknown): error is LLMError {
    return (
      error instanceof Error &&
      (error.name === 'AnthropicError' ||
        error.name === 'OpenAIError' ||
        error.name === 'LLMError')
    );
  }

  private handleLLMError(error: LLMError): void {
    const provider = error.provider ? `[${error.provider}] ` : '';
    const code = error.code ? `(${error.code}) ` : '';
    console.error(`${provider}LLM Error ${code}: ${error.message}`);

    if (error.status === 429) {
      console.error('Rate limit exceeded. Implementing backoff...');
    } else if (error.status && error.status >= 500) {
      console.error('Service unavailable. Trying fallback...');
    }
  }

  private handleGenericError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Generic Error: ${message}`);
  }
}

export class LLMIntegration {
  private modelSelector: ModelSelector;
  private versionManager: ModelVersionManager;
  private errorHandler: ErrorHandler;
  private providers: Map<string, LLMProvider>;

  constructor() {
    this.modelSelector = new ModelSelector();
    this.versionManager = new ModelVersionManager();
    this.errorHandler = new ErrorHandler();
    this.providers = new Map();
  }

  registerProvider(name: 'anthropic' | 'openai', provider: LLMProvider): void {
    this.providers.set(name, provider);
  }

  async processRequest(request: UserRequest): Promise<ModelResponse> {
    try {
      const selectedModel = this.modelSelector.selectModel(request);
      const provider = this.providers.get(selectedModel.provider);

      if (!provider) {
        throw new Error(`Provider ${selectedModel.provider} not found`);
      }

      return await provider.processRequest(request);
    } catch (error) {
      this.errorHandler.handleModelError(error);
      throw error;
    }
  }
}
