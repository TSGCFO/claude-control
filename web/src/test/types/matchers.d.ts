import { ReactNode } from 'react';

declare module 'expect' {
  interface Matchers<R> {
    toHaveBeenCalledWithProps(props: Record<string, unknown>): R;
    toHaveBeenCalledWithChildren(children: ReactNode): R;
    toHaveStyle(style: Record<string, string>): R;
  }
}

// Augment jest namespace
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWithProps(props: Record<string, unknown>): R;
      toHaveBeenCalledWithChildren(children: ReactNode): R;
      toHaveStyle(style: Record<string, string>): R;
    }
  }
}