import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  transform: {
    "(.*).ts$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  preset: "ts-jest/presets/default-esm",
  moduleNameMapper: {
    "^@/(.*).js$": "<rootDir>/மூலம்/$1",
    "^@/(.*)$": "<rootDir>/மூலம்/$1",
  },
  testMatch: ["**/*.சோதனை.ts"],
  testEnvironment: "node",
};

export default config;
