// Configure test environment variables
process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';

// Configure API endpoints
process.env.VITE_API_URL = 'http://localhost:8000';
process.env.VITE_WS_URL = 'ws://localhost:8000';

// Configure test timeouts
process.env.JEST_TIMEOUT = '10000';

// Configure test paths
process.env.TEST_DATA_DIR = './src/test/fixtures';
process.env.TEST_OUTPUT_DIR = './src/test/output';

// Configure test features
process.env.ENABLE_TEST_LOGGING = 'false';
process.env.ENABLE_TEST_COVERAGE = 'true';
process.env.ENABLE_TEST_SNAPSHOTS = 'true';

// Configure test behavior
process.env.SKIP_ANIMATIONS = 'true';
process.env.MOCK_DATE = '2025-02-03T00:00:00.000Z';
process.env.MOCK_RANDOM = 'true';

// Configure test authentication
process.env.TEST_USER_EMAIL = 'test@example.com';
process.env.TEST_USER_PASSWORD = 'test-password';
process.env.TEST_API_KEY = 'test-api-key';

// Configure test database
process.env.TEST_DB_HOST = 'localhost';
process.env.TEST_DB_PORT = '5432';
process.env.TEST_DB_NAME = 'test_db';
process.env.TEST_DB_USER = 'test_user';
process.env.TEST_DB_PASSWORD = 'test_password';

// Configure test caching
process.env.TEST_CACHE_ENABLED = 'true';
process.env.TEST_CACHE_TTL = '3600';

// Configure test rate limiting
process.env.TEST_RATE_LIMIT_ENABLED = 'false';
process.env.TEST_RATE_LIMIT_MAX = '1000';
process.env.TEST_RATE_LIMIT_WINDOW = '60000';

// Configure test logging
process.env.TEST_LOG_LEVEL = 'error';
process.env.TEST_LOG_FORMAT = 'json';
process.env.TEST_LOG_FILE = './src/test/output/test.log';

// Configure test metrics
process.env.TEST_METRICS_ENABLED = 'false';
process.env.TEST_METRICS_PORT = '9090';

// Configure test tracing
process.env.TEST_TRACING_ENABLED = 'false';
process.env.TEST_TRACING_ENDPOINT = 'http://localhost:14268/api/traces';

// Configure test feature flags
process.env.TEST_FEATURE_NEW_UI = 'true';
process.env.TEST_FEATURE_EXPERIMENTAL = 'false';

// Configure test error handling
process.env.TEST_ERROR_RETRY_COUNT = '3';
process.env.TEST_ERROR_RETRY_DELAY = '1000';

// Configure test performance thresholds
process.env.TEST_PERF_CPU_THRESHOLD = '80';
process.env.TEST_PERF_MEMORY_THRESHOLD = '90';
process.env.TEST_PERF_LATENCY_THRESHOLD = '1000';

// Configure test security
process.env.TEST_SECURITY_ENABLED = 'true';
process.env.TEST_SECURITY_KEY = 'test-security-key';
process.env.TEST_SECURITY_SALT = 'test-security-salt';

// Configure test notifications
process.env.TEST_NOTIFICATIONS_ENABLED = 'false';
process.env.TEST_NOTIFICATIONS_PROVIDER = 'console';

// Configure test cleanup
process.env.TEST_CLEANUP_ENABLED = 'true';
process.env.TEST_CLEANUP_INTERVAL = '3600000';

// Configure test monitoring
process.env.TEST_MONITORING_ENABLED = 'false';
process.env.TEST_MONITORING_ENDPOINT = 'http://localhost:3000';

// Configure test reporting
process.env.TEST_REPORT_FORMAT = 'junit';
process.env.TEST_REPORT_DIR = './src/test/reports';