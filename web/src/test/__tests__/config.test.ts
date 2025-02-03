import config, {
  ENV,
  PATHS,
  TIMEOUTS,
  INTERVALS,
  COVERAGE_THRESHOLDS,
  FILE_PATTERNS,
  MODULE_CONFIG,
  BROWSER_CONFIG,
  TEST_DATA,
  FEATURES,
  ERROR_MESSAGES,
  STATUS_CODES
} from '../config';

describe('Test Configuration', () => {
  describe('Environment Configuration', () => {
    it('should have correct environment values', () => {
      expect(ENV.NODE_ENV).toBe('test');
      expect(ENV.TZ).toBe('UTC');
      expect(ENV.API_URL).toBe('http://localhost:8000');
      expect(ENV.WS_URL).toBe('ws://localhost:8000');
      expect(ENV.USER_EMAIL).toBe('test@example.com');
      expect(ENV.USER_PASSWORD).toBe('test-password');
      expect(ENV.API_KEY).toBe('test-api-key');
    });
  });

  describe('Paths Configuration', () => {
    it('should have correct path values', () => {
      expect(PATHS.ROOT).toBe('src/test');
      expect(PATHS.FIXTURES).toBe('src/test/fixtures');
      expect(PATHS.MOCKS).toBe('src/test/__mocks__');
      expect(PATHS.OUTPUT).toBe('src/test/output');
      expect(PATHS.REPORTS).toBe('src/test/reports');
      expect(PATHS.COVERAGE).toBe('coverage');
    });
  });

  describe('Timeouts Configuration', () => {
    it('should have correct timeout values', () => {
      expect(TIMEOUTS.DEFAULT).toBe(5000);
      expect(TIMEOUTS.ASYNC).toBe(10000);
      expect(TIMEOUTS.NETWORK).toBe(15000);
      expect(TIMEOUTS.ANIMATION).toBe(1000);
      expect(TIMEOUTS.DEBOUNCE).toBe(300);
    });
  });

  describe('Intervals Configuration', () => {
    it('should have correct interval values', () => {
      expect(INTERVALS.POLL).toBe(100);
      expect(INTERVALS.ANIMATION).toBe(16);
      expect(INTERVALS.DEBOUNCE).toBe(150);
    });
  });

  describe('Coverage Thresholds Configuration', () => {
    it('should have correct coverage threshold values', () => {
      expect(COVERAGE_THRESHOLDS.GLOBAL).toEqual({
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      });

      expect(COVERAGE_THRESHOLDS.UNIT).toEqual({
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90
      });

      expect(COVERAGE_THRESHOLDS.INTEGRATION).toEqual({
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      });
    });
  });

  describe('File Patterns Configuration', () => {
    it('should have correct file pattern values', () => {
      expect(FILE_PATTERNS.TEST).toBe('(/__tests__/.*|(\\.|/)(test|spec))\\.[tj]sx?$');
      expect(FILE_PATTERNS.SOURCE).toBe('src/**/*.{ts,tsx}');
      expect(FILE_PATTERNS.EXCLUDE).toContain('src/**/*.d.ts');
      expect(FILE_PATTERNS.EXCLUDE).toContain('src/main.tsx');
    });
  });

  describe('Module Configuration', () => {
    it('should have correct module configuration values', () => {
      expect(MODULE_CONFIG.FILE_EXTENSIONS).toContain('ts');
      expect(MODULE_CONFIG.FILE_EXTENSIONS).toContain('tsx');
      expect(MODULE_CONFIG.NAME_MAPPER['^@/(.*)$']).toBe('<rootDir>/src/$1');
    });
  });

  describe('Browser Configuration', () => {
    it('should have correct browser configuration values', () => {
      expect(BROWSER_CONFIG.VIEWPORT).toEqual({
        width: 1280,
        height: 800
      });
      expect(BROWSER_CONFIG.DEVICE_SCALE_FACTOR).toBe(1);
      expect(BROWSER_CONFIG.IS_MOBILE).toBe(false);
      expect(BROWSER_CONFIG.HAS_TOUCH).toBe(false);
      expect(BROWSER_CONFIG.IS_LANDSCAPE).toBe(false);
    });
  });

  describe('Test Data Configuration', () => {
    it('should have correct test data configuration values', () => {
      expect(TEST_DATA.BATCH_SIZE).toBe(10);
      expect(TEST_DATA.MAX_ITEMS).toBe(100);
      expect(TEST_DATA.STRING_LENGTH).toBe(10);
      expect(TEST_DATA.MIN_NUMBER).toBe(0);
      expect(TEST_DATA.MAX_NUMBER).toBe(1000);
    });
  });

  describe('Features Configuration', () => {
    it('should have correct feature flag values', () => {
      expect(FEATURES.MOCK_DATE).toBe(true);
      expect(FEATURES.MOCK_RANDOM).toBe(true);
      expect(FEATURES.SKIP_ANIMATIONS).toBe(true);
      expect(FEATURES.ENABLE_COVERAGE).toBe(true);
      expect(FEATURES.ENABLE_SNAPSHOTS).toBe(true);
      expect(FEATURES.ENABLE_LOGGING).toBe(false);
    });
  });

  describe('Error Messages Configuration', () => {
    it('should have correct error message values', () => {
      expect(ERROR_MESSAGES.TIMEOUT).toBe('Operation timed out');
      expect(ERROR_MESSAGES.NETWORK).toBe('Network error occurred');
      expect(ERROR_MESSAGES.VALIDATION).toBe('Validation error occurred');
      expect(ERROR_MESSAGES.NOT_FOUND).toBe('Resource not found');
    });
  });

  describe('Status Codes Configuration', () => {
    it('should have correct status code values', () => {
      expect(STATUS_CODES.OK).toBe(200);
      expect(STATUS_CODES.CREATED).toBe(201);
      expect(STATUS_CODES.BAD_REQUEST).toBe(400);
      expect(STATUS_CODES.NOT_FOUND).toBe(404);
    });
  });

  describe('Combined Configuration', () => {
    it('should export all configurations in a single object', () => {
      expect(config.env).toBe(ENV);
      expect(config.paths).toBe(PATHS);
      expect(config.timeouts).toBe(TIMEOUTS);
      expect(config.intervals).toBe(INTERVALS);
      expect(config.coverageThresholds).toBe(COVERAGE_THRESHOLDS);
      expect(config.filePatterns).toBe(FILE_PATTERNS);
      expect(config.moduleConfig).toBe(MODULE_CONFIG);
      expect(config.browserConfig).toBe(BROWSER_CONFIG);
      expect(config.testData).toBe(TEST_DATA);
      expect(config.features).toBe(FEATURES);
      expect(config.errorMessages).toBe(ERROR_MESSAGES);
      expect(config.statusCodes).toBe(STATUS_CODES);
    });
  });
});