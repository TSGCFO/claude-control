/**
 * Custom Jest resolver to handle module resolution
 * @param {string} path - The path to resolve
 * @param {object} options - Resolution options
 * @returns {string} The resolved path
 */
module.exports = (path, options) => {
  // Call the default resolver
  return options.defaultResolver(path, {
    ...options,
    // List of file extensions to try
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.node'],
    // Package entry points to try
    mainFields: ['browser', 'module', 'main'],
    // Additional module directories
    moduleDirectories: ['node_modules', 'src'],
    // Handle path aliases
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    // Handle specific file types
    packageFilter: pkg => {
      // Use ES modules version if available
      if (pkg.module) {
        pkg.main = pkg.module;
      }
      return pkg;
    },
    // Handle symlinks
    preserveSymlinks: false,
    // Root directory for module resolution
    rootDir: options.rootDir,
    // Handle specific conditions
    conditions: ['import', 'require', 'node', 'default'],
    // Handle specific module types
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs']
    }
  });
};

/**
 * Custom Jest resolver for style imports
 * @param {string} path - The path to resolve
 * @param {object} options - Resolution options
 * @returns {string} The resolved path
 */
module.exports.style = (path, options) => {
  return 'identity-obj-proxy';
};

/**
 * Custom Jest resolver for asset imports
 * @param {string} path - The path to resolve
 * @param {object} options - Resolution options
 * @returns {string} The resolved path
 */
module.exports.asset = (path, options) => {
  return '<rootDir>/__mocks__/fileMock.js';
};

/**
 * Custom Jest resolver for test files
 * @param {string} path - The path to resolve
 * @param {object} options - Resolution options
 * @returns {string} The resolved path
 */
module.exports.test = (path, options) => {
  // Handle test file resolution
  if (path.includes('__tests__')) {
    return options.defaultResolver(path, {
      ...options,
      // Additional test file extensions
      extensions: ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx', ...options.extensions]
    });
  }
  return module.exports(path, options);
};

/**
 * Custom Jest resolver for mocks
 * @param {string} path - The path to resolve
 * @param {object} options - Resolution options
 * @returns {string} The resolved path
 */
module.exports.mock = (path, options) => {
  // Handle mock file resolution
  if (path.includes('__mocks__')) {
    return options.defaultResolver(path, {
      ...options,
      // Additional mock file extensions
      extensions: ['.mock.ts', '.mock.tsx', ...options.extensions]
    });
  }
  return module.exports(path, options);
};

/**
 * Custom Jest resolver for fixtures
 * @param {string} path - The path to resolve
 * @param {object} options - Resolution options
 * @returns {string} The resolved path
 */
module.exports.fixture = (path, options) => {
  // Handle fixture file resolution
  if (path.includes('fixtures')) {
    return options.defaultResolver(path, {
      ...options,
      // Additional fixture file extensions
      extensions: ['.json', '.ts', '.tsx', ...options.extensions]
    });
  }
  return module.exports(path, options);
};

/**
 * Custom Jest resolver for type definitions
 * @param {string} path - The path to resolve
 * @param {object} options - Resolution options
 * @returns {string} The resolved path
 */
module.exports.types = (path, options) => {
  // Handle type definition resolution
  if (path.endsWith('.d.ts')) {
    return options.defaultResolver(path, {
      ...options,
      // Only allow .d.ts files
      extensions: ['.d.ts']
    });
  }
  return module.exports(path, options);
};

// Export all resolvers
module.exports.resolvers = {
  style: module.exports.style,
  asset: module.exports.asset,
  test: module.exports.test,
  mock: module.exports.mock,
  fixture: module.exports.fixture,
  types: module.exports.types
};