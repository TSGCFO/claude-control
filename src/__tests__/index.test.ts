import { ClaudeControl } from '../index';
import * as path from 'path';
import * as fs from 'fs/promises';

describe('ClaudeControl Integration Tests', () => {
  let claude: ClaudeControl;
  const testDir = path.join(process.cwd(), 'test-data');

  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true });
    claude = new ClaudeControl(testDir);
    await claude.initialize();
  });

  afterAll(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('File Operations', () => {
    it('should create and read files', async () => {
      const testContent = 'Hello, World!';
      const testFile = path.join(testDir, 'test.txt');

      // Test file creation
      const createResult = await claude.executeCommand(
        `FILE write path="${testFile}" content="${testContent}"`
      );
      expect(createResult.success).toBe(true);

      // Test file reading
      const readResult = await claude.executeCommand(
        `FILE read path="${testFile}"`
      );
      expect(readResult.success).toBe(true);
      expect(readResult.output).toBe(testContent);
    });
  });

  describe('Web Navigation', () => {
    it('should navigate to websites', async () => {
      const result = await claude.executeCommand(
        'WEB navigate url="https://example.com"'
      );
      expect(result.success).toBe(true);
    });
  });

  describe('System Settings', () => {
    it('should manage system settings', async () => {
      // Test setting a value
      const setResult = await claude.executeCommand(
        'SYSTEM set setting="theme" value="dark"'
      );
      expect(setResult.success).toBe(true);

      // Verify the setting was saved
      const getResult = await claude.executeCommand(
        'SYSTEM get setting="theme"'
      );
      expect(getResult.success).toBe(true);
      expect(getResult.output).toBe('dark');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid commands gracefully', async () => {
      const result = await claude.executeCommand(
        'FILE invalid action="test"'
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle file not found errors', async () => {
      const result = await claude.executeCommand(
        'FILE read path="nonexistent.txt"'
      );
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/no such file/i);
    });
  });

  describe('Application Control', () => {
    it('should launch and close applications', async () => {
      // Launch app
      const launchResult = await claude.executeCommand(
        'APP launch app="notepad.exe"'
      );
      expect(launchResult.success).toBe(true);

      // Close app
      const closeResult = await claude.executeCommand(
        'APP close app="notepad.exe"'
      );
      expect(closeResult.success).toBe(true);
    });
  });
});
