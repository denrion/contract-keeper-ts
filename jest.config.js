module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest'
  }
};
