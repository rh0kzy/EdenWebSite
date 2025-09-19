module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "**/*.js",
    "!node_modules/**",
    "!coverage/**",
    "!jest.config.js",
    "!server.js"
  ],
  coverageDirectory: "coverage",
  coverageReporters: [
    "text",
    "lcov",
    "html"
  ],
  testMatch: [
    "**/__tests__/**/*.js",
    "**/?(*.)+(spec|test).js"
  ],
  testPathIgnorePatterns: [
    "tests/controllers.test.js",
    "tests/api.test.js"
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  verbose: true
};