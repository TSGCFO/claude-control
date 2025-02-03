const resolver = require('../resolver');

describe('Jest Custom Resolver', () => {
  const mockOptions = {
    defaultResolver: jest.fn(path => path),
    rootDir: '/root',
    extensions: ['.js'],
    moduleDirectories: ['node_modules']
  };

  beforeEach(() => {
    mockOptions.defaultResolver.mockClear();
  });

  describe('Main Resolver', () => {
    it('should resolve with default options and additional extensions', () => {
      const path = 'test/path';
      resolver(path, mockOptions);

      expect(mockOptions.defaultResolver).toHaveBeenCalledWith(path, expect.objectContaining({
        extensions: expect.arrayContaining(['.ts', '.tsx', '.js', '.jsx', '.json', '.node']),
        moduleDirectories: expect.arrayContaining(['node_modules', 'src'])
      }));
    });

    it('should handle path aliases', () => {
      const path = '@/components/Button';
      resolver(path, mockOptions);

      expect(mockOptions.defaultResolver).toHaveBeenCalledWith(path, expect.objectContaining({
        moduleNameMapper: expect.objectContaining({
          '^@/(.*)$': '<rootDir>/src/$1'
        })
      }));
    });

    it('should handle package.json module field', () => {
      const path = 'some-package';
      const pkg = { module: 'dist/index.js', main: 'index.js' };
      
      resolver(path, mockOptions);
      const packageFilter = mockOptions.defaultResolver.mock.calls[0][1].packageFilter;
      const result = packageFilter(pkg);

      expect(result.main).toBe(pkg.module);
    });
  });

  describe('Style Resolver', () => {
    it('should resolve style imports to identity-obj-proxy', () => {
      const path = 'styles.css';
      const result = resolver.style(path, mockOptions);

      expect(result).toBe('identity-obj-proxy');
    });
  });

  describe('Asset Resolver', () => {
    it('should resolve asset imports to fileMock', () => {
      const path = 'image.png';
      const result = resolver.asset(path, mockOptions);

      expect(result).toBe('<rootDir>/__mocks__/fileMock.js');
    });
  });

  describe('Test Resolver', () => {
    it('should handle test file resolution', () => {
      const path = '__tests__/component.test.ts';
      resolver.test(path, mockOptions);

      expect(mockOptions.defaultResolver).toHaveBeenCalledWith(path, expect.objectContaining({
        extensions: expect.arrayContaining([
          '.test.ts',
          '.test.tsx',
          '.spec.ts',
          '.spec.tsx'
        ])
      }));
    });

    it('should fallback to main resolver for non-test files', () => {
      const path = 'src/component.ts';
      resolver.test(path, mockOptions);

      expect(mockOptions.defaultResolver).toHaveBeenCalledWith(path, expect.objectContaining({
        extensions: expect.arrayContaining(['.ts', '.tsx', '.js', '.jsx', '.json', '.node'])
      }));
    });
  });

  describe('Mock Resolver', () => {
    it('should handle mock file resolution', () => {
      const path = '__mocks__/service.mock.ts';
      resolver.mock(path, mockOptions);

      expect(mockOptions.defaultResolver).toHaveBeenCalledWith(path, expect.objectContaining({
        extensions: expect.arrayContaining(['.mock.ts', '.mock.tsx'])
      }));
    });

    it('should fallback to main resolver for non-mock files', () => {
      const path = 'src/service.ts';
      resolver.mock(path, mockOptions);

      expect(mockOptions.defaultResolver).toHaveBeenCalledWith(path, expect.objectContaining({
        extensions: expect.arrayContaining(['.ts', '.tsx', '.js', '.jsx', '.json', '.node'])
      }));
    });
  });

  describe('Fixture Resolver', () => {
    it('should handle fixture file resolution', () => {
      const path = 'fixtures/data.json';
      resolver.fixture(path, mockOptions);

      expect(mockOptions.defaultResolver).toHaveBeenCalledWith(path, expect.objectContaining({
        extensions: expect.arrayContaining(['.json', '.ts', '.tsx'])
      }));
    });

    it('should fallback to main resolver for non-fixture files', () => {
      const path = 'src/data.ts';
      resolver.fixture(path, mockOptions);

      expect(mockOptions.defaultResolver).toHaveBeenCalledWith(path, expect.objectContaining({
        extensions: expect.arrayContaining(['.ts', '.tsx', '.js', '.jsx', '.json', '.node'])
      }));
    });
  });

  describe('Types Resolver', () => {
    it('should handle type definition resolution', () => {
      const path = 'types/index.d.ts';
      resolver.types(path, mockOptions);

      expect(mockOptions.defaultResolver).toHaveBeenCalledWith(path, expect.objectContaining({
        extensions: ['.d.ts']
      }));
    });

    it('should fallback to main resolver for non-type files', () => {
      const path = 'src/types.ts';
      resolver.types(path, mockOptions);

      expect(mockOptions.defaultResolver).toHaveBeenCalledWith(path, expect.objectContaining({
        extensions: expect.arrayContaining(['.ts', '.tsx', '.js', '.jsx', '.json', '.node'])
      }));
    });
  });

  describe('Resolvers Export', () => {
    it('should export all resolvers', () => {
      expect(resolver.resolvers).toEqual({
        style: resolver.style,
        asset: resolver.asset,
        test: resolver.test,
        mock: resolver.mock,
        fixture: resolver.fixture,
        types: resolver.types
      });
    });
  });
});