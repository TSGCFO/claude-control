import { WindowsSystemHandler } from '../core/system/windows';
import {
  SystemContext,
  FileSystemOperation,
  CommandOperation
} from '../types/system';

async function testWindowsSystem() {
  try {
    // Initialize system context
    const context: SystemContext = {
      cwd: process.cwd(),
      env: Object.fromEntries(
        Object.entries(process.env).filter(([_, v]) => v !== undefined)
      ) as Record<string, string>,
      isAdmin: false,
      platform: 'win32',
      activeProcesses: [],
      activeWindows: [],
      activeBrowsers: []
    };

    // Create system handler
    const systemHandler = new WindowsSystemHandler();
    await systemHandler.initialize(context);

    console.log('Testing file operations...');

    // Test file creation
    const createOperation: FileSystemOperation = {
      type: 'FILE_SYSTEM',
      action: 'CREATE',
      path: 'test.txt',
      content: 'Hello, World!'
    };

    const createResult = await systemHandler.executeOperation(createOperation, context);
    console.log('Create file result:', createResult);

    // Test file reading
    const readOperation: FileSystemOperation = {
      type: 'FILE_SYSTEM',
      action: 'READ',
      path: 'test.txt'
    };

    const readResult = await systemHandler.executeOperation(readOperation, context);
    console.log('Read file result:', readResult);

    // Test file listing
    const listOperation: FileSystemOperation = {
      type: 'FILE_SYSTEM',
      action: 'LIST',
      path: '.'
    };

    const listResult = await systemHandler.executeOperation(listOperation, context);
    console.log('List directory result:', listResult);

    // Test command execution
    const commandOperation: CommandOperation = {
      type: 'COMMAND',
      action: 'EXECUTE',
      command: 'dir',
      args: ['/b'],
      shell: true
    };

    const commandResult = await systemHandler.executeOperation(commandOperation, context);
    console.log('Command execution result:', commandResult);

    // Test file deletion
    const deleteOperation: FileSystemOperation = {
      type: 'FILE_SYSTEM',
      action: 'DELETE',
      path: 'test.txt'
    };

    const deleteResult = await systemHandler.executeOperation(deleteOperation, context);
    console.log('Delete file result:', deleteResult);

    // Clean up
    await systemHandler.cleanup();

  } catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testWindowsSystem().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
