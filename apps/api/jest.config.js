module.exports = {
  displayName: 'api',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/apps/api',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/run.ts', '!src/main.ts'],
  testMatch: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
  moduleNameMapper: {
    '^@taskmgmt/data$': '<rootDir>/../../libs/data/src/index.ts',
    '^@taskmgmt/data/(.*)$': '<rootDir>/../../libs/data/src/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!(@taskmgmt)/)'],
};
