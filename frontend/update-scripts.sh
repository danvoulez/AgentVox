#!/bin/bash

# Adicionar scripts de teste ao package.json
echo "Atualizando scripts no package.json..."

# Usar jq para modificar o package.json
jq '.scripts += {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "cypress": "cypress open",
  "cypress:headless": "cypress run",
  "test:e2e": "start-server-and-test dev 3000 cypress",
  "test:e2e:headless": "start-server-and-test dev 3000 cypress:headless"
}' package.json > package.json.tmp && mv package.json.tmp package.json

echo "Scripts de teste adicionados ao package.json!"
