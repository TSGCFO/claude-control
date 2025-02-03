declare module '@testing-library/react' {
  export const configure: (config: {
    testIdAttribute?: string;
    asyncUtilTimeout?: number;
    computedStyleSupportsPseudoElements?: boolean;
    defaultHidden?: boolean;
  }) => void;
}

declare module '@testing-library/user-event' {
  interface UserEvent {
    click: (element: HTMLElement) => Promise<void>;
    hover: (element: HTMLElement) => Promise<void>;
    tab: () => Promise<void>;
    type: (element: HTMLElement, text: string) => Promise<void>;
    upload: (element: HTMLElement, files: File[]) => Promise<void>;
    copy: (element: HTMLElement) => Promise<void>;
    cut: (element: HTMLElement) => Promise<void>;
    paste: (element: HTMLElement) => Promise<void>;
    drag: (element: HTMLElement) => Promise<void>;
    drop: (element: HTMLElement) => Promise<void>;
  }

  const userEvent: UserEvent;
  export default userEvent;
}