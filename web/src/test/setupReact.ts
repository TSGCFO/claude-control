import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import './types/react';

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 1000,
  computedStyleSupportsPseudoElements: true,
  defaultHidden: true
});

// Add custom matchers for React components
expect.extend({
  toHaveStyleRule(received: HTMLElement, property: keyof CSSStyleDeclaration, value: string) {
    const style = window.getComputedStyle(received);
    const pass = style[property] === value;
    return {
      pass,
      message: () =>
        `expected ${received} to ${pass ? 'not ' : ''}have CSS property "${property}: ${value}"`
    };
  },

  toBeVisibleInViewport(received: HTMLElement) {
    const rect = received.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    const isVisible = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= windowHeight &&
      rect.right <= windowWidth
    );
    return {
      pass: isVisible,
      message: () =>
        `expected ${received} to ${isVisible ? 'not ' : ''}be visible in viewport`
    };
  }
});

// Helper to wait for component updates
export const waitForComponentUpdate = async (): Promise<void> => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

// Helper to simulate user interactions
export const simulateUserInteraction = async (
  element: HTMLElement,
  interaction: 'click' | 'hover' | 'focus' | 'blur'
): Promise<void> => {
  switch (interaction) {
    case 'click':
      await userEvent.click(element);
      break;
    case 'hover':
      await userEvent.hover(element);
      break;
    case 'focus':
      await userEvent.tab(); // Tab to focus the element
      break;
    case 'blur':
      element.blur();
      break;
  }
  await waitForComponentUpdate();
};

// Helper to simulate form interactions
export const simulateFormInteraction = async (
  element: HTMLElement,
  value: string
): Promise<void> => {
  await userEvent.type(element, value);
  await waitForComponentUpdate();
};

// Helper to simulate keyboard interactions
export const simulateKeyboardInteraction = async (
  element: HTMLElement,
  key: string
): Promise<void> => {
  await userEvent.type(element, `{${key}}`);
  await waitForComponentUpdate();
};

// Helper to simulate drag and drop
export const simulateDragAndDrop = async (
  dragElement: HTMLElement,
  dropElement: HTMLElement
): Promise<void> => {
  await userEvent.drag(dragElement);
  await userEvent.drop(dropElement);
  await waitForComponentUpdate();
};

// Helper to simulate file upload
export const simulateFileUpload = async (
  inputElement: HTMLElement,
  files: File[]
): Promise<void> => {
  await userEvent.upload(inputElement, files);
  await waitForComponentUpdate();
};

// Helper to simulate clipboard operations
export const simulateClipboardOperation = async (
  element: HTMLElement,
  operation: 'copy' | 'cut' | 'paste'
): Promise<void> => {
  switch (operation) {
    case 'copy':
      await userEvent.copy(element);
      break;
    case 'cut':
      await userEvent.cut(element);
      break;
    case 'paste':
      await userEvent.paste(element);
      break;
  }
  await waitForComponentUpdate();
};

// Helper to simulate scroll
export const simulateScroll = async (
  element: HTMLElement,
  position: { top?: number; left?: number }
): Promise<void> => {
  element.scrollTo(position);
  await waitForComponentUpdate();
};

// Helper to simulate resize
export const simulateResize = async (
  width: number,
  height: number
): Promise<void> => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
  await waitForComponentUpdate();
};

// Helper to simulate media query changes
export const simulateMediaQuery = (query: string, matches: boolean): void => {
  window.matchMedia = jest.fn().mockImplementation(q => ({
    matches: q === query ? matches : false,
    media: q,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};