const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  collectCoverageFrom: [
    "app/api/**/*.{ts,tsx}",
    "app/admin/services/**/*.{ts,tsx}",
    "widgets/services/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/generated/**",
  ],
};

module.exports = createJestConfig(customJestConfig);
