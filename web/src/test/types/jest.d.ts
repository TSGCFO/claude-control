/// <reference types="jest" />

export {};

declare module 'expect' {
  interface Matchers<R> {
    toBeWithinRange(floor: number, ceiling: number): R;
  }
}