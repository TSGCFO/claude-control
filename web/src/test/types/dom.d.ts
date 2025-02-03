/// <reference types="@testing-library/jest-dom" />

declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveTextContent(text: string): R;
    toHaveClass(className: string): R;
    toHaveAttribute(attr: string, value?: string): R;
  }
}

declare module '@testing-library/jest-dom' {
  export interface Matchers<R extends void | Promise<void>, T> {
    toBeInTheDocument(this: T): R;
    toHaveTextContent(this: T, text: string): R;
    toHaveClass(this: T, className: string): R;
    toHaveAttribute(this: T, attr: string, value?: string): R;
  }
}