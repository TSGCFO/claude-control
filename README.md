# Claude Control Interface

An AI-powered computer control interface that allows Claude to interact with your system through natural language instructions.

## Features

- Natural Language Command Processing
- File System Operations
- Application Control
- Web Navigation
- System Settings Management
- Robust Error Handling
- Type-Safe Implementation

## Prerequisites

- Node.js >= 16.x
- TypeScript >= 5.x
- Windows (for full application control support)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/claude-control.git
cd claude-control
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

### Basic Usage

```typescript
import claudeControl from './src';

// Initialize the system
await claudeControl.initialize();

// Execute commands
try {
  // File operations
  const fileResult = await claudeControl.executeCommand(
    'FILE write path="example.txt" content="Hello World!"'
  );

  // Web navigation
  const webResult = await claudeControl.executeCommand(
    'WEB navigate url="https://example.com"'
  );

  // Application control
  const appResult = await claudeControl.executeCommand(
    'APP launch app="notepad.exe"'
  );

  // System settings
  const settingsResult = await claudeControl.executeCommand(
    'SYSTEM set setting="defaultBrowser" value="chrome"'
  );
} catch (error) {
  console.error('Error:', error);
} finally {
  // Clean up
  await claudeControl.cleanup();
}
```

### Command Types

1. **File Operations**
   - `FILE read path="file.txt"`
   - `FILE write path="file.txt" content="Hello"`
   - `FILE delete path="file.txt"`
   - `FILE list path="directory"`

2. **Application Control**
   - `APP launch app="notepad.exe"`
   - `APP close app="notepad.exe"`
   - `APP focus app="notepad.exe"`

3. **Web Navigation**
   - `WEB navigate url="https://example.com"`
   - `WEB search text="search query"`
   - `WEB click selector=".button"`
   - `WEB type text="Hello World"`

4. **System Settings**
   - `SYSTEM get setting="defaultBrowser"`
   - `SYSTEM set setting="defaultBrowser" value="chrome"`
   - `SYSTEM reset setting="defaultBrowser"`

## Project Structure

```
claude-control/
├── src/
│   ├── core/
│   │   ├── nli/              # Natural Language Interface
│   │   ├── executor/         # Command Execution
│   │   └── system/          # System Integration
│   │       ├── file/        # File Operations
│   │       ├── app/         # Application Control
│   │       ├── web/         # Web Navigation
│   │       └── settings/    # Settings Management
│   ├── types/               # TypeScript Types
│   ├── index.ts            # Main Entry Point
│   └── example.ts          # Usage Examples
├── tests/                  # Test Files
├── package.json
└── tsconfig.json
```

## Development

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

### Running the Example

```bash
npm run dev src/example.ts
```

## Error Handling

The system includes comprehensive error handling:

- Input validation
- Command parsing errors
- Execution errors
- System integration errors
- Resource cleanup

## Security Considerations

- Path traversal prevention
- Process management
- Resource cleanup
- Input sanitization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Based on Anthropic's Computer Use implementation
- Uses Puppeteer for web automation
- Built with TypeScript for type safety