/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare namespace jest {
  interface Matchers<R> {
    toHaveStyleRule(property: keyof CSSStyleDeclaration, value: string): R;
    toBeVisibleInViewport(): R;
  }

  interface Expect {
    toHaveStyleRule(property: keyof CSSStyleDeclaration, value: string): void;
    toBeVisibleInViewport(): void;
  }

  interface InverseAsymmetricMatchers {
    toHaveStyleRule(property: keyof CSSStyleDeclaration, value: string): void;
    toBeVisibleInViewport(): void;
  }
}

declare module '@jest/expect' {
  interface AsymmetricMatchers {
    toHaveStyleRule(property: keyof CSSStyleDeclaration, value: string): void;
    toBeVisibleInViewport(): void;
  }
}