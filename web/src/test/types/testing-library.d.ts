import '@testing-library/jest-dom';
import { ReactElement } from 'react';

declare module '@testing-library/react' {
  export interface RenderOptions {
    container?: HTMLElement;
    baseElement?: HTMLElement;
    hydrate?: boolean;
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  }

  export interface RenderResult {
    container: HTMLElement;
    baseElement: HTMLElement;
    debug: (baseElement?: HTMLElement | DocumentFragment) => void;
    rerender: (ui: ReactElement) => void;
    unmount: () => void;
    asFragment: () => DocumentFragment;
  }

  export function render(
    ui: ReactElement,
    options?: RenderOptions
  ): RenderResult & typeof queries;

  export type queries = {
    getByLabelText: (text: string) => HTMLElement;
    getByText: (text: string) => HTMLElement;
    getByTestId: (id: string) => HTMLElement;
    queryByLabelText: (text: string) => HTMLElement | null;
    queryByText: (text: string) => HTMLElement | null;
    queryByTestId: (id: string) => HTMLElement | null;
    getAllByLabelText: (text: string) => HTMLElement[];
    getAllByText: (text: string) => HTMLElement[];
    getAllByTestId: (id: string) => HTMLElement[];
    queryAllByLabelText: (text: string) => HTMLElement[];
    queryAllByText: (text: string) => HTMLElement[];
    queryAllByTestId: (id: string) => HTMLElement[];
    findByLabelText: (text: string) => Promise<HTMLElement>;
    findByText: (text: string) => Promise<HTMLElement>;
    findByTestId: (id: string) => Promise<HTMLElement>;
    findAllByLabelText: (text: string) => Promise<HTMLElement[]>;
    findAllByText: (text: string) => Promise<HTMLElement[]>;
    findAllByTestId: (id: string) => Promise<HTMLElement[]>;
  };
}

type FormValue = string | string[] | number | boolean | File;
type StyleValue = string | number;

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmpty(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(html: string): R;
      toHaveDescription(text: string): R;
      toHaveFocus(): R;
      toHaveFormValues(values: Record<string, FormValue>): R;
      toHaveStyle(css: Record<string, StyleValue>): R;
      toHaveValue(value: string | string[] | number): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
      toBeEmptyDOMElement(): R;
      toHaveAccessibleDescription(description?: string | RegExp): R;
      toHaveAccessibleName(name?: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string | RegExp): R;
      toHaveErrorMessage(text?: string | RegExp): R;
    }
  }
}