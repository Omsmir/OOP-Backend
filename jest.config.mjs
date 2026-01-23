/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    globalSetup: '<rootDir>/src/__tests__/globalSetup.ts',
    globalTeardown: '<rootDir>/src/__tests__/globalTeardown.ts',
    moduleNameMapper: {
        '^app$': '<rootDir>/src/app',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^__tests__/(.*)$': '<rootDir>/src/__tests__/$1',
    },
};

