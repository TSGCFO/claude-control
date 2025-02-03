import claudeControl from './index';
import { ExecutionResult } from './types';

async function runExample() {
  try {
    // Initialize the system
    await claudeControl.initialize();
    console.log('Claude Control System initialized successfully.');

    // Example 1: File System Operation
    console.log('\nExample 1: File System Operation');
    const fileResult = await claudeControl.executeCommand(
      'FILE write path="example.txt" content="Hello from Claude Control!"'
    );
    logResult('File operation', fileResult);

    // Example 2: Web Navigation
    console.log('\nExample 2: Web Navigation');
    const webResult = await claudeControl.executeCommand(
      'WEB navigate url="https://example.com"'
    );
    logResult('Web navigation', webResult);

    // Example 3: Application Control
    console.log('\nExample 3: Application Control');
    const appResult = await claudeControl.executeCommand(
      'APP launch app="calc"'
    );
    logResult('Application control', appResult);

    // Example 4: System Settings
    console.log('\nExample 4: System Settings');
    const settingsResult = await claudeControl.executeCommand(
      'SYSTEM set setting="defaultBrowser" value="chrome"'
    );
    logResult('Settings operation', settingsResult);

    // Example 5: Sequential Web Operations
    console.log('\nExample 5: Sequential Web Operations');

    // Navigate to a page with a more reliable structure
    await claudeControl.executeCommand(
      'WEB navigate url="https://www.google.com"'
    );

    // Type in the search box
    await claudeControl.executeCommand('WEB type text="Claude AI"');

    // Click the search button
    const searchResult = await claudeControl.executeCommand(
      'WEB click selector="input[name=\'btnK\']"'
    );
    logResult('Sequential web operations', searchResult);

    // Get current system state
    const executor = claudeControl.getExecutor();
    const state = executor.getState();
    console.log('\nCurrent System State:', {
      status: state.status,
      progress: state.progress,
      currentOperation: state.currentOperation,
      errorCount: state.errors.length
    });
  } catch (error) {
    console.error(
      'Error running example:',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  } finally {
    try {
      console.log('\nCleaning up...');
      await claudeControl.cleanup();
      console.log('Cleanup complete.');
    } catch (error) {
      console.error(
        'Error during cleanup:',
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}

function logResult(operation: string, result: ExecutionResult): void {
  console.log(`${operation} result:`, {
    success: result.success,
    output: result.output,
    commandId: result.commandId,
    systemState: {
      runningProcesses: result.newState.runningProcesses.length,
      activeWindows: result.newState.activeWindows.length,
      resources: result.newState.resources
    }
  });
}

// Run the example if this script is executed directly
if (require.main === module) {
  runExample().catch(error => {
    console.error(
      'Fatal error:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  });
}

// Export the example function for use in tests
export { runExample };
