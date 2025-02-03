import constants, {
  TEST_IDS,
  TEST_CLASSES,
  TEST_EVENTS,
  TEST_KEYS,
  TEST_ROLES,
  TEST_LABELS,
  TEST_MOCKS,
  TEST_VALIDATION,
  TEST_ERROR_CODES
} from '../constants';
import testConfig from '../config';

describe('Test Constants', () => {
  describe('Test IDs', () => {
    it('should have correct chat IDs', () => {
      expect(TEST_IDS.CHAT.CONTAINER).toBe('chat-container');
      expect(TEST_IDS.CHAT.MESSAGE_LIST).toBe('message-list');
      expect(TEST_IDS.CHAT.MESSAGE_ITEM).toBe('message-item');
      expect(TEST_IDS.CHAT.INPUT).toBe('chat-input');
      expect(TEST_IDS.CHAT.SEND_BUTTON).toBe('send-button');
    });

    it('should have correct system IDs', () => {
      expect(TEST_IDS.SYSTEM.STATUS).toBe('system-status');
      expect(TEST_IDS.SYSTEM.ERROR).toBe('system-error');
      expect(TEST_IDS.SYSTEM.LOADING).toBe('system-loading');
      expect(TEST_IDS.SYSTEM.NOTIFICATION).toBe('system-notification');
    });

    it('should have correct UI IDs', () => {
      expect(TEST_IDS.UI.SIDEBAR).toBe('sidebar');
      expect(TEST_IDS.UI.HEADER).toBe('header');
      expect(TEST_IDS.UI.FOOTER).toBe('footer');
      expect(TEST_IDS.UI.MODAL).toBe('modal');
      expect(TEST_IDS.UI.BUTTON).toBe('button');
      expect(TEST_IDS.UI.INPUT).toBe('input');
      expect(TEST_IDS.UI.SELECT).toBe('select');
    });
  });

  describe('Test Classes', () => {
    it('should have correct state classes', () => {
      expect(TEST_CLASSES.ACTIVE).toBe('active');
      expect(TEST_CLASSES.DISABLED).toBe('disabled');
      expect(TEST_CLASSES.LOADING).toBe('loading');
      expect(TEST_CLASSES.HIDDEN).toBe('hidden');
      expect(TEST_CLASSES.VISIBLE).toBe('visible');
      expect(TEST_CLASSES.SELECTED).toBe('selected');
    });

    it('should have correct status classes', () => {
      expect(TEST_CLASSES.ERROR).toBe('error');
      expect(TEST_CLASSES.SUCCESS).toBe('success');
      expect(TEST_CLASSES.WARNING).toBe('warning');
      expect(TEST_CLASSES.INFO).toBe('info');
    });
  });

  describe('Test Events', () => {
    it('should have correct mouse events', () => {
      expect(TEST_EVENTS.CLICK).toBe('click');
      expect(TEST_EVENTS.MOUSEOVER).toBe('mouseover');
      expect(TEST_EVENTS.MOUSEOUT).toBe('mouseout');
    });

    it('should have correct keyboard events', () => {
      expect(TEST_EVENTS.KEYDOWN).toBe('keydown');
      expect(TEST_EVENTS.KEYUP).toBe('keyup');
      expect(TEST_EVENTS.KEYPRESS).toBe('keypress');
    });

    it('should have correct form events', () => {
      expect(TEST_EVENTS.CHANGE).toBe('change');
      expect(TEST_EVENTS.SUBMIT).toBe('submit');
      expect(TEST_EVENTS.FOCUS).toBe('focus');
      expect(TEST_EVENTS.BLUR).toBe('blur');
    });
  });

  describe('Test Keys', () => {
    it('should have correct navigation keys', () => {
      expect(TEST_KEYS.ARROW_UP).toBe('ArrowUp');
      expect(TEST_KEYS.ARROW_DOWN).toBe('ArrowDown');
      expect(TEST_KEYS.ARROW_LEFT).toBe('ArrowLeft');
      expect(TEST_KEYS.ARROW_RIGHT).toBe('ArrowRight');
      expect(TEST_KEYS.TAB).toBe('Tab');
    });

    it('should have correct action keys', () => {
      expect(TEST_KEYS.ENTER).toBe('Enter');
      expect(TEST_KEYS.ESCAPE).toBe('Escape');
      expect(TEST_KEYS.SPACE).toBe(' ');
      expect(TEST_KEYS.BACKSPACE).toBe('Backspace');
      expect(TEST_KEYS.DELETE).toBe('Delete');
    });
  });

  describe('Test Roles', () => {
    it('should have correct ARIA roles', () => {
      expect(TEST_ROLES.BUTTON).toBe('button');
      expect(TEST_ROLES.LINK).toBe('link');
      expect(TEST_ROLES.HEADING).toBe('heading');
      expect(TEST_ROLES.NAVIGATION).toBe('navigation');
      expect(TEST_ROLES.MAIN).toBe('main');
      expect(TEST_ROLES.DIALOG).toBe('dialog');
      expect(TEST_ROLES.ALERT).toBe('alert');
      expect(TEST_ROLES.STATUS).toBe('status');
    });
  });

  describe('Test Labels', () => {
    it('should have correct action labels', () => {
      expect(TEST_LABELS.CLOSE).toBe('Close');
      expect(TEST_LABELS.SUBMIT).toBe('Submit');
      expect(TEST_LABELS.CANCEL).toBe('Cancel');
      expect(TEST_LABELS.SAVE).toBe('Save');
      expect(TEST_LABELS.DELETE).toBe('Delete');
      expect(TEST_LABELS.EDIT).toBe('Edit');
    });

    it('should have correct navigation labels', () => {
      expect(TEST_LABELS.NEXT).toBe('Next');
      expect(TEST_LABELS.PREVIOUS).toBe('Previous');
      expect(TEST_LABELS.MENU).toBe('Menu');
      expect(TEST_LABELS.MORE).toBe('More');
    });
  });

  describe('Test Mocks', () => {
    it('should have correct user mocks', () => {
      expect(TEST_MOCKS.USER.ID).toBe('test-user-id');
      expect(TEST_MOCKS.USER.NAME).toBe('Test User');
      expect(TEST_MOCKS.USER.EMAIL).toBe(testConfig.env.USER_EMAIL);
      expect(TEST_MOCKS.USER.PASSWORD).toBe(testConfig.env.USER_PASSWORD);
    });

    it('should have correct message mocks', () => {
      expect(TEST_MOCKS.MESSAGE.ID).toBe('test-message-id');
      expect(TEST_MOCKS.MESSAGE.CONTENT).toBe('Test message content');
      expect(typeof TEST_MOCKS.MESSAGE.TIMESTAMP).toBe('number');
    });

    it('should have correct conversation mocks', () => {
      expect(TEST_MOCKS.CONVERSATION.ID).toBe('test-conversation-id');
      expect(TEST_MOCKS.CONVERSATION.TITLE).toBe('Test Conversation');
    });
  });

  describe('Test Validation', () => {
    it('should have correct validation messages', () => {
      expect(TEST_VALIDATION.REQUIRED).toBe('This field is required');
      expect(TEST_VALIDATION.INVALID_EMAIL).toBe('Invalid email address');
      expect(TEST_VALIDATION.INVALID_PASSWORD).toBe('Invalid password');
      expect(TEST_VALIDATION.MATCH).toBe('Fields must match');
      expect(TEST_VALIDATION.UNIQUE).toBe('Must be unique');
    });

    it('should have correct dynamic validation messages', () => {
      expect(TEST_VALIDATION.MIN_LENGTH(5)).toBe('Must be at least 5 characters');
      expect(TEST_VALIDATION.MAX_LENGTH(10)).toBe('Must be at most 10 characters');
    });
  });

  describe('Test Error Codes', () => {
    it('should have correct error codes', () => {
      expect(TEST_ERROR_CODES.VALIDATION).toBe('VALIDATION_ERROR');
      expect(TEST_ERROR_CODES.AUTHENTICATION).toBe('AUTHENTICATION_ERROR');
      expect(TEST_ERROR_CODES.AUTHORIZATION).toBe('AUTHORIZATION_ERROR');
      expect(TEST_ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND_ERROR');
      expect(TEST_ERROR_CODES.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(TEST_ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(TEST_ERROR_CODES.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
      expect(TEST_ERROR_CODES.BAD_REQUEST).toBe('BAD_REQUEST_ERROR');
    });
  });

  describe('Combined Constants', () => {
    it('should export all constants in a single object', () => {
      expect(constants.ids).toBe(TEST_IDS);
      expect(constants.classes).toBe(TEST_CLASSES);
      expect(constants.events).toBe(TEST_EVENTS);
      expect(constants.keys).toBe(TEST_KEYS);
      expect(constants.roles).toBe(TEST_ROLES);
      expect(constants.labels).toBe(TEST_LABELS);
      expect(constants.mocks).toBe(TEST_MOCKS);
      expect(constants.validation).toBe(TEST_VALIDATION);
      expect(constants.errorCodes).toBe(TEST_ERROR_CODES);
    });
  });
});