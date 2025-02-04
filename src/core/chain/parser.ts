import { LLMChain } from 'langchain/chains';
import { ChatAnthropic } from '@langchain/anthropic';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

const CommandType = z.enum(['FILE', 'APP', 'WEB', 'SYSTEM']);

const commandSchema = z.object({
  type: CommandType,
  action: z.string(),
  parameters: z.record(z.string())
});

type ParsedCommand = z.infer<typeof commandSchema>;

interface ParserResponse {
  text: string;
}

export class CommandParserChain extends LLMChain<ParsedCommand> {
  private parser: StructuredOutputParser<typeof commandSchema>;

  constructor() {
    const model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: 'claude-3-opus-20240229'
    });

    const parser = StructuredOutputParser.fromZodSchema(commandSchema);

    const prompt = new PromptTemplate({
      template: 'Parse this command: {input}\n\n{format_instructions}',
      inputVariables: ['input', 'format_instructions']
    });

    super({ prompt, llm: model });
    this.parser = parser;
  }

  async parse(input: string): Promise<ParsedCommand> {
    const response = await this.call({
      input,
      format_instructions: this.parser.getFormatInstructions()
    }) as ParserResponse;

    if (!('text' in response)) {
      throw new Error('Invalid response format from model');
    }

    const parsed = await this.parser.parse(response.text);
    const isValid = await this.validateCommand(parsed);

    if (!isValid) {
      throw new Error('Command validation failed');
    }

    return parsed;
  }

  private async validateCommand(command: unknown): Promise<boolean> {
    try {
      await commandSchema.parseAsync(command);
      return true;
    } catch (error: unknown) {
      return false;
    }
  }
}
