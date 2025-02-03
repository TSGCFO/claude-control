import {
  WebAction,
  SystemIntegrationError,
  SearchResult
} from '../../../types';
import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer';

export class WebIntegration {
  private browser: Browser | null = null;
  private activePage: Page | null = null;

  async initialize(): Promise<void> {
    try {
      if (!this.browser) {
        this.browser = await puppeteer.launch({
          headless: false,
          defaultViewport: { width: 1280, height: 800 }
        });
        this.activePage = await this.browser.newPage();
      }
    } catch (error) {
      throw this.handleError('initialize', {}, error);
    }
  }

  async navigate(url: string): Promise<void> {
    try {
      const page = await this.getActivePage();

      // Ensure URL has protocol
      const validUrl = url.startsWith('http') ? url : `https://${url}`;

      await page.goto(validUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
    } catch (error) {
      throw this.handleError('navigate', { url }, error);
    }
  }

  async search(query: string): Promise<SearchResult> {
    try {
      const page = await this.getActivePage();

      // Navigate to search engine
      await page.goto('https://www.google.com');

      // Type search query
      await page.type('input[name="q"]', query);

      // Submit search
      await Promise.all([
        page.keyboard.press('Enter'),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);

      // Extract search results
      const results = await page.evaluate(() => {
        const searchResults = Array.from(document.querySelectorAll('.g'));
        return searchResults.map(result => {
          const titleElement = result.querySelector('h3');
          const linkElement = result.querySelector('a');
          const snippetElement = result.querySelector('.VwiC3b');

          return {
            title: titleElement?.textContent || '',
            url: linkElement?.href || '',
            description: snippetElement?.textContent || ''
          };
        });
      });

      return {
        query,
        results: results.slice(0, 10) // Return top 10 results
      };
    } catch (error) {
      throw this.handleError('search', { text: query }, error);
    }
  }

  async click(selector: string): Promise<void> {
    try {
      const page = await this.getActivePage();

      // Wait for element to be available
      await page.waitForSelector(selector, {
        visible: true,
        timeout: 5000
      });

      // Click the element
      await page.click(selector);

      // Wait for any navigation or network activity to complete
      await page.waitForNetworkIdle();
    } catch (error) {
      throw this.handleError('click', { selector }, error);
    }
  }

  async type(text: string): Promise<void> {
    try {
      const page = await this.getActivePage();

      // Get the active element
      const activeElement = (await page.evaluateHandle(
        () => document.activeElement
      )) as ElementHandle<Element>;

      if (!activeElement) {
        throw new Error('No active element found for typing');
      }

      // Type the text
      await page.keyboard.type(text);

      // Clean up the handle
      await activeElement.dispose();
    } catch (error) {
      throw this.handleError('type', { text }, error);
    }
  }

  async getCurrentUrl(): Promise<string> {
    const page = await this.getActivePage();
    return page.url();
  }

  async getPageTitle(): Promise<string> {
    const page = await this.getActivePage();
    return page.title();
  }

  async takeScreenshot(path: string): Promise<void> {
    const page = await this.getActivePage();
    await page.screenshot({ path });
  }

  async cleanup(): Promise<void> {
    try {
      if (this.activePage) {
        await this.activePage.close();
        this.activePage = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      throw this.handleError('cleanup', {}, error);
    }
  }

  private async getActivePage(): Promise<Page> {
    await this.ensureBrowserInitialized();
    if (!this.activePage) {
      throw new Error('Browser page not initialized');
    }
    return this.activePage;
  }

  private async ensureBrowserInitialized(): Promise<void> {
    if (!this.browser || !this.activePage) {
      await this.initialize();
      return;
    }

    // Verify browser and page are still valid
    try {
      await this.activePage.evaluate(() => true);
    } catch {
      await this.cleanup();
      await this.initialize();
    }

    if (!this.activePage) {
      throw new Error('Failed to initialize browser page');
    }
  }

  private handleError(
    action: WebAction['action'],
    params: Partial<WebAction>,
    error: unknown
  ): SystemIntegrationError {
    const baseMessage = `Failed to ${action} web action`;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return new SystemIntegrationError(`${baseMessage}: ${errorMessage}`, {
      action,
      ...params
    } as WebAction);
  }
}
