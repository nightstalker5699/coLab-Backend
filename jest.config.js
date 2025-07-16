/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      isolatedModules: true,
      // Disable type checking
      diagnostics: false,
    },
  },

  // Test file patterns
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],

  // Source and test directories
  roots: ["<rootDir>"],

  // Coverage configuration
  collectCoverageFrom: [
    "**/*.ts",
    "!**/*Types.ts",
    "!server.ts", // exclude entry point
  ],

  // Coverage output
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],

  // Setup files (if needed)
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,
};
