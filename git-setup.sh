#!/bin/bash

# Script para configurar o Git com as melhores práticas

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Configurando Git com as melhores práticas...${NC}"

# Inicializar repositório Git se não existir
if [ ! -d ".git" ]; then
  echo -e "${GREEN}Inicializando repositório Git...${NC}"
  git init
fi

# Configurar usuário Git local para este repositório
git config user.name "Dan Voulez"
git config user.email "dan@danvoulez.com"

# Criar .gitignore se não existir
if [ ! -f ".gitignore" ]; then
  echo -e "${GREEN}Criando arquivo .gitignore...${NC}"
  cat > .gitignore << 'EOL'
# Node.js
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log
.pnp/
.pnp.js

# Next.js
.next/
out/

# Arquivos de ambiente
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Outros
.DS_Store
*.pem
EOL
fi

# Incluir configuração local
echo -e "${GREEN}Incluindo configuração Git local...${NC}"
git config --local include.path ../.gitconfig

# Adicionar arquivos ao staging
echo -e "${GREEN}Adicionando arquivos ao staging...${NC}"
git add .

# Verificar se há alterações para commit
if ! git diff-index --quiet HEAD --; then
  echo -e "${GREEN}Fazendo commit inicial...${NC}"
  git commit -m "feat: Implementação de múltiplos temas (madrugada, dia e noite)

- Adicionado sistema de temas com três variações baseadas em períodos do dia
- Criado contexto React para gerenciamento de temas
- Implementado seletor visual de temas na interface
- Adicionada detecção automática de tema baseada na hora do dia
- Integrado nas páginas de login e principal"
else
  echo -e "${BLUE}Nenhuma alteração para commit.${NC}"
fi

echo -e "${BLUE}Configuração concluída!${NC}"
echo -e "${BLUE}Para conectar ao GitHub, execute:${NC}"
echo -e "git remote add origin https://github.com/seu-usuario/2_AgentVox.git"
echo -e "git push -u origin main"
