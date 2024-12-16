import type { Config } from "jest";

const config: Config = {
  clearMocks: true,

  collectCoverage: false,

  coverageDirectory: "coverage",

  coverageProvider: "v8",

  preset: "ts-jest",

  testEnvironment: "node",

  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],

  transformIgnorePatterns: ["/node_modules/"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  transform: {
    "^.+\\.ts$": "ts-jest",
  },

  restoreMocks: true,

  verbose: true,

  watchman: true,

  detectOpenHandles: true,

  forceExit: true,
  maxConcurrency: 10,

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  globalTeardown: "<rootDir>/jest.teardown.ts",
};

export default config;
