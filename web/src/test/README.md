# Test Infrastructure

This directory contains the test infrastructure for the project, providing a robust and type-safe testing environment using Jest.

## Directory Structure

```
test/
├── __tests__/          # Test files
├── __mocks__/         # Mock implementations
├── fixtures/          # Test fixtures and data
├── mocks/            # Reusable mock classes
├── types/            # TypeScript type definitions
├── assertions.ts     # Custom test assertions
├── config.ts         # Test configuration
├── constants.ts      # Test constants
├── helpers.ts        # Test helper functions
├── setupNode.ts      # Node.js environment setup
├── setupReact.ts     # React environment setup
└── testRunner.ts     # Jest test runner configuration
```

## Key Features

- **Type-Safe Testing**: Full TypeScript support with proper type definitions
- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **Context-Based Testing**: TestContext provides centralized test utilities
- **Mock System**: Comprehensive mocking capabilities for API responses, storage, etc.
- **Environment Support**: Configurable test environments for Node.js and browser
- **Custom Assertions**: Extended Jest matchers for common test scenarios

## Usage

### Basic Test Structure

```typescript
import { testContext } from '../TestContext';

describe('Feature', () => {
  beforeEach(() => {
    testContext.reset();
  });

  it('should work as expected', () => {
    // Test implementation
  });
});
```

### Using Test Constants

```typescript
import { TEST_IDS, TEST_CLASSES } from '../constants';

it('should have correct classes', () => {
  expect(element).toHaveClass(TEST_CLASSES.ACTIVE);
});

it('should have correct test IDs', () => {
  expect(element).toHaveAttribute('data-testid', TEST_IDS.BUTTON);
});
```

### Using Mock Response

```typescript
import { testContext } from '../TestContext';

it('should handle API response', async () => {
  const mockResponse = testContext.createMockResponse({
    status: 200,
    ok: true,
    json: () => Promise.resolve({ data: 'test' })
  });

  global.fetch = testContext.createMockFetch();
  const response = await fetch('/api/test');
  expect(response).toEqual(mockResponse);
});
```

### Using Test Configuration

```typescript
import testConfig from '../config';

it('should respect timeouts', async () => {
  await testContext.waitForCondition(
    () => condition,
    testConfig.timeouts.DEFAULT
  );
});
```

## Custom Matchers

### toBeWithinRange

```typescript
expect(number).toBeWithinRange(floor, ceiling);
```

### toHaveBeenCalledAfter

```typescript
expect(laterCallback).toHaveBeenCalledAfter(earlierCallback);
```

## Environment Configuration

The test environment can be configured through:

- `setupTests.ts`: Global test setup
- `setupNode.ts`: Node.js specific setup
- `setupReact.ts`: React specific setup
- `config.ts`: Test configuration values

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.ts
```

## Best Practices

1. **Reset State**: Use `testContext.reset()` in `beforeEach` to ensure clean test state
2. **Isolation**: Each test should be independent and not rely on other tests
3. **Mock External Dependencies**: Use mock implementations for external services
4. **Type Safety**: Leverage TypeScript for better test reliability
5. **Constants**: Use predefined constants instead of magic strings
6. **Configuration**: Use test configuration for timeouts and other settings

## Contributing

When adding new features to the test infrastructure:

1. Add appropriate type definitions in `types/`
2. Update test configuration if needed
3. Add tests for new functionality
4. Update this documentation

## License

This test infrastructure is part of the main project and follows its licensing terms.