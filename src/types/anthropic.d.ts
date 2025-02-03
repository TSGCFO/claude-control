declare module '@anthropic-ai/sdk' {
  interface TextBlock {
    type: 'text';
    text: string;
  }

  interface ToolUseBlock {
    type: 'tool_use';
    [key: string]: unknown;
  }

  type ContentBlock = TextBlock | ToolUseBlock;

  interface MessageUsage {
    input_tokens: number;
    output_tokens: number;
  }

  interface MessageCreateParams {
    model: string;
    max_tokens: number;
    messages: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>;
    system?: string;
  }

  interface MessageResponse {
    id: string;
    type: 'message';
    role: 'assistant';
    content: ContentBlock[];
    model: string;
    usage: MessageUsage;
  }

  interface MessagesAPI {
    create(params: MessageCreateParams): Promise<MessageResponse>;
  }

  interface ClientOptions {
    apiKey?: string;
  }

  class Anthropic {
    constructor(options?: ClientOptions);
    messages: MessagesAPI;
  }

  export = Anthropic;
}
