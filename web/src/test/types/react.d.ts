/// <reference types="@testing-library/jest-dom" />

export {};

declare module 'expect' {
  interface Matchers<R> {
    toHaveStyleRule(property: keyof CSSStyleDeclaration, value: string): R;
    toBeVisibleInViewport(): R;
  }
}