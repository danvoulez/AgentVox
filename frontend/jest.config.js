const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Forneça o caminho para seu aplicativo Next.js para carregar next.config.js e .env arquivos na configuração de teste
  dir: './',
});

// Configuração customizada do Jest para seus testes
const customJestConfig = {
  // Adicione mais opções de configuração para personalizar o ambiente de teste
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Mapear aliases para caminhos absolutos
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transform: {
    // Usar babel-jest para transformar arquivos JavaScript e TypeScript
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
};

// createJestConfig é exportado desta forma para garantir que next/jest possa carregar a configuração Next.js que é necessária ao execução dos testes
module.exports = createJestConfig(customJestConfig);
