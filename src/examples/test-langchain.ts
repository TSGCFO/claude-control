import { createControlChain } from '../core/chain';
import { FileSystemIntegration } from '../core/system/file';
import { ApplicationIntegration } from '../core/system/app';
import { WebIntegration } from '../core/system/web';
import { SettingsManager } from '../core/system/settings';
import { SystemIntegration, SettingValue } from '../types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testLangChainIntegration() {
  try {
    // Initialize system components
    const fileSystem = new FileSystemIntegration();
    const appControl = new ApplicationIntegration();
    const webControl = new WebIntegration();
    const settings = new SettingsManager();

    // Create system integration interface
    const systemIntegration: SystemIntegration = {
      fileSystem: {
        read: (path: string) => fileSystem.read(path),
        write: (path: string, content: string) => fileSystem.write(path, content),
        delete: (path: string) => fileSystem.delete(path),
        list: (path: string) => fileSystem.list(path)
      },
      applications: {
        launch: (app: string) => appControl.launch(app),
        close: (app: string) => appControl.close(app),
        focus: (app: string) => appControl.focus(app),
        sendKeys: (keys: string) => appControl.sendKeys(keys)
      },
      browser: {
        navigate: (url: string) => webControl.navigate(url),
        search: (query: string) => webControl.search(query),
        click: (selector: string) => webControl.click(selector),
        type: (text: string) => webControl.type(text)
      },
      settings: {
        get: (setting: string) => settings.get(setting),
        set: (setting: string, value: SettingValue) => settings.set(setting, value),
        reset: (setting: string) => settings.reset(setting)
      }
    };

    // Create control chain
    const chain = createControlChain(systemIntegration);

    // Test cases to demonstrate agent behavior
    const testCases = [
      'create a file named test.txt with content "Hello World"',
      'open notepad and type "This is a test"',
      'search the web for "LangChain documentation"',
      'what files are in the current directory?'
    ];

    console.log('Starting LangChain Agent test...\n');

    for (const testCase of testCases) {
      console.log(`User: ${testCase}`);
      console.log('---');

      const result = await chain._call({ input: testCase });

      if (result.thought) {
        console.log('Thought:', result.thought);
        console.log('---');
      }

      console.log('Result:', {
        success: result.success,
        result: result.result,
        error: result.error
      });
      console.log(`\n${'='.repeat(50)}\n`);

      // Add delay between commands
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Clear memory at the end
    await chain.clearMemory();
    console.log('Test completed successfully');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
void testLangChainIntegration();
