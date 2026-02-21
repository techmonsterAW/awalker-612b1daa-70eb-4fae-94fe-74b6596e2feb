/** Run from workspace root: npx jest --config=jest.api.config.js */
module.exports = {
  displayName: 'api',
  rootDir: 'apps/api',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
  moduleNameMapper: {
    '^@taskmgmt/data$': '<rootDir>/../../libs/data/src/index.ts',
    '^@taskmgmt/data/(.*)$': '<rootDir>/../../libs/data/src/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!(@taskmgmt)/)'],
};
