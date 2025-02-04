import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';

interface CommandExample {
  input: string;
  commands: string[];
  result: {
    success: boolean;
    output: string;
  };
}

export class CommandVectorStore {
  private vectorStore: MemoryVectorStore;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    });
    this.vectorStore = new MemoryVectorStore(this.embeddings);
  }

  async initialize(): Promise<void> {
    // Create initial examples based on available commands
    const examples: CommandExample[] = [
      {
        input: 'create a file named test.txt with content "hello"',
        commands: ['FILE write path="test.txt" content="hello"'],
        result: { success: true, output: 'File created successfully' }
      },
      {
        input: 'open notepad and type hello world',
        commands: [
          'APP launch name="notepad.exe"',
          'APP sendKeys name="notepad.exe" keys="hello world"'
        ],
        result: { success: true, output: 'Text typed in notepad' }
      },
      {
        input: 'search the web for langchain docs',
        commands: ['WEB search query="langchain documentation"'],
        result: { success: true, output: 'Search results displayed' }
      }
    ];

    // Convert examples to documents with metadata
    const documents = examples.map(example => new Document({
      pageContent: example.input,
      metadata: {
        commands: example.commands,
        result: example.result,
        type: 'example'
      }
    }));

    // Add command documentation
    const commandDocs = [
      new Document({
        pageContent: 'FILE commands for file operations',
        metadata: {
          type: 'documentation',
          commands: {
            write: 'Create or update a file (path, content)',
            read: 'Read file content (path)',
            delete: 'Delete a file (path)',
            list: 'List directory contents (path)'
          }
        }
      }),
      new Document({
        pageContent: 'APP commands for application control',
        metadata: {
          type: 'documentation',
          commands: {
            launch: 'Start an application (name)',
            close: 'Close an application (name)',
            focus: 'Focus window (name)',
            sendKeys: 'Type text (name, keys)'
          }
        }
      }),
      new Document({
        pageContent: 'WEB commands for browser control',
        metadata: {
          type: 'documentation',
          commands: {
            navigate: 'Go to URL (url)',
            search: 'Web search (query)',
            click: 'Click element (selector)',
            type: 'Enter text (text)'
          }
        }
      })
    ];

    // Add all documents to vector store
    await this.vectorStore.addDocuments([...documents, ...commandDocs]);
  }

  async findSimilarExamples(input: string, k = 3): Promise<Document[]> {
    return this.vectorStore.similaritySearch(input, k);
  }

  async addExample(example: CommandExample): Promise<void> {
    const document = new Document({
      pageContent: example.input,
      metadata: {
        commands: example.commands,
        result: example.result,
        type: 'example'
      }
    });

    await this.vectorStore.addDocuments([document]);
  }
}
