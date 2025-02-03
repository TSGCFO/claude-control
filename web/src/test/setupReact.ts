import React, { ReactElement } from 'react';
import '@testing-library/jest-dom';
import { render as rtlRender, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { CommandProvider } from '../contexts/CommandContext';
import './types/matchers';

interface WrapperProps {
  children: React.ReactNode;
}

/**
 * Custom render function that includes providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  const AllTheProviders = ({ children }: WrapperProps) => 
    React.createElement(ThemeProvider, null,
      React.createElement(CommandProvider, null,
        React.createElement(BrowserRouter, null,
          children
        )
      )
    );

  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// React testing utilities
export const mockComponent = (name: string): React.FC<{ children?: React.ReactNode } & Record<string, unknown>> => {
  const MockComponent: React.FC<{ children?: React.ReactNode } & Record<string, unknown>> = ({ children, ...props }) => 
    React.createElement('div', { 'data-testid': `mock-${name}`, ...props }, children);
  MockComponent.displayName = `Mock${name}`;
  return MockComponent;
};

export const mockHook = <T,>(returnValue: T): jest.Mock<T, []> => {
  return jest.fn().mockReturnValue(returnValue);
};

export const mockContext = <T,>(defaultValue: T): {
  Context: React.Context<T>;
  useContext: () => T;
} => {
  const Context = React.createContext(defaultValue);
  const useContext = (): T => React.useContext(Context);
  return { Context, useContext };
};

export const mockEvent = {
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
} as const;

export const mockRef = <T,>(current: T): React.RefObject<T> => {
  return { current } as React.RefObject<T>;
};

// React testing matchers
expect.extend({
  toHaveBeenCalledWithProps(received: jest.Mock, props: Record<string, unknown>) {
    const calls = received.mock.calls;
    const pass = calls.some(call => {
      const callProps = call[0] || {};
      return Object.entries(props).every(([key, value]) => callProps[key] === value);
    });

    return {
      pass,
      message: () => pass
        ? `Expected mock not to have been called with props ${JSON.stringify(props)}`
        : `Expected mock to have been called with props ${JSON.stringify(props)}`
    };
  },

  toHaveBeenCalledWithChildren(received: jest.Mock, children: React.ReactNode) {
    const calls = received.mock.calls;
    const pass = calls.some(call => {
      const callProps = call[0] || {};
      return callProps.children === children;
    });

    return {
      pass,
      message: () => pass
        ? `Expected mock not to have been called with children ${String(children)}`
        : `Expected mock to have been called with children ${String(children)}`
    };
  },

  toHaveStyle(received: HTMLElement, style: Record<string, string>) {
    const computedStyle = window.getComputedStyle(received);
    const pass = Object.entries(style).every(
      ([prop, value]) => computedStyle[prop as keyof CSSStyleDeclaration] === value
    );

    return {
      pass,
      message: () => pass
        ? `Expected element not to have style ${JSON.stringify(style)}`
        : `Expected element to have style ${JSON.stringify(style)}`
    };
  }
});