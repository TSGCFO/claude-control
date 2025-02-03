import testConfig from './config';

// Test IDs for components
const TEST_IDS = {
  CHAT: {
    CONTAINER: 'chat-container',
    MESSAGE_LIST: 'message-list',
    MESSAGE_ITEM: 'message-item',
    INPUT: 'chat-input',
    SEND_BUTTON: 'send-button'
  },
  SYSTEM: {
    STATUS: 'system-status',
    ERROR: 'system-error',
    LOADING: 'system-loading',
    NOTIFICATION: 'system-notification'
  },
  UI: {
    SIDEBAR: 'sidebar',
    HEADER: 'header',
    FOOTER: 'footer',
    MODAL: 'modal',
    BUTTON: 'button',
    INPUT: 'input',
    SELECT: 'select'
  }
} as const;

// Test classes for styling
const TEST_CLASSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
  HIDDEN: 'hidden',
  VISIBLE: 'visible',
  SELECTED: 'selected'
} as const;

// Test events for component interactions
const TEST_EVENTS = {
  CLICK: 'click',
  CHANGE: 'change',
  SUBMIT: 'submit',
  FOCUS: 'focus',
  BLUR: 'blur',
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',
  KEYPRESS: 'keypress',
  MOUSEOVER: 'mouseover',
  MOUSEOUT: 'mouseout'
} as const;

// Test keyboard keys
const TEST_KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  SPACE: ' ',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete'
} as const;

// Test roles for accessibility
const TEST_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  HEADING: 'heading',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  COMPLEMENTARY: 'complementary',
  DIALOG: 'dialog',
  ALERT: 'alert',
  STATUS: 'status',
  TAB: 'tab',
  TABPANEL: 'tabpanel',
  LISTBOX: 'listbox',
  OPTION: 'option'
} as const;

// Test labels for accessibility
const TEST_LABELS = {
  CLOSE: 'Close',
  SUBMIT: 'Submit',
  CANCEL: 'Cancel',
  SAVE: 'Save',
  DELETE: 'Delete',
  EDIT: 'Edit',
  SEARCH: 'Search',
  MENU: 'Menu',
  MORE: 'More',
  NEXT: 'Next',
  PREVIOUS: 'Previous'
} as const;

// Test mock data
const TEST_MOCKS = {
  USER: {
    ID: 'test-user-id',
    NAME: 'Test User',
    EMAIL: testConfig.env.USER_EMAIL,
    PASSWORD: testConfig.env.USER_PASSWORD
  },
  MESSAGE: {
    ID: 'test-message-id',
    CONTENT: 'Test message content',
    TIMESTAMP: Date.now()
  },
  CONVERSATION: {
    ID: 'test-conversation-id',
    TITLE: 'Test Conversation'
  },
  NOTIFICATION: {
    ID: 'test-notification-id',
    MESSAGE: 'Test notification message'
  }
} as const;

// Test validation messages
const TEST_VALIDATION = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PASSWORD: 'Invalid password',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be at most ${max} characters`,
  MATCH: 'Fields must match',
  UNIQUE: 'Must be unique'
} as const;

// Test error codes
const TEST_ERROR_CODES = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  BAD_REQUEST: 'BAD_REQUEST_ERROR'
} as const;

// Export all constants
const constants = {
  ids: TEST_IDS,
  classes: TEST_CLASSES,
  events: TEST_EVENTS,
  keys: TEST_KEYS,
  roles: TEST_ROLES,
  labels: TEST_LABELS,
  mocks: TEST_MOCKS,
  validation: TEST_VALIDATION,
  errorCodes: TEST_ERROR_CODES
} as const;

export {
  constants as default,
  TEST_IDS,
  TEST_CLASSES,
  TEST_EVENTS,
  TEST_KEYS,
  TEST_ROLES,
  TEST_LABELS,
  TEST_MOCKS,
  TEST_VALIDATION,
  TEST_ERROR_CODES
};