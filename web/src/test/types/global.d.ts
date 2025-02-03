export {};

declare global {
  // Add global utility functions
  function waitForNextTick(): Promise<void>;
  function waitForCondition(
    condition: () => boolean,
    timeout?: number,
    interval?: number
  ): Promise<void>;
}

// Extend Jest matchers
declare module 'expect' {
  interface Matchers<R> {
    toBeWithinRange(floor: number, ceiling: number): R;
  }
}