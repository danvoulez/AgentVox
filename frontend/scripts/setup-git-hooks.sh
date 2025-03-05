#!/bin/bash

# Script para configurar hooks do Git para o projeto AgentVox
# Este script configura hooks para ajudar a implementar melhores práticas de Git

echo "=== Configurando Git Hooks para AgentVox ==="
echo

# Verificar se estamos na raiz do projeto
if [ ! -d ".git" ]; then
  echo "❌ Este script deve ser executado na raiz do repositório Git."
  echo "Navegue para a raiz do projeto e tente novamente."
  exit 1
fi

# Criar diretório de hooks se não existir
mkdir -p .git/hooks

# Criar hook de pre-commit
echo "Criando hook de pre-commit..."
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Hook de pre-commit para verificar segredos e garantir qualidade do código

echo "=== Executando verificações de pre-commit ==="

# Verificar segredos
echo "Verificando segredos nos arquivos staged..."
./scripts/check-secrets.sh --staged
if [ $? -ne 0 ]; then
  echo "❌ Verificação de segredos falhou. Corrija os problemas antes de commit."
  exit 1
fi

# Verificar lint (se eslint estiver configurado)
if [ -f "node_modules/.bin/eslint" ]; then
  echo "Executando lint nos arquivos staged..."
  git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|ts|tsx)$' | xargs -n 1 node_modules/.bin/eslint --quiet
  if [ $? -ne 0 ]; then
    echo "❌ ESLint encontrou problemas. Corrija-os antes de commit."
    exit 1
  fi
fi

echo "✅ Todas as verificações passaram. Prosseguindo com o commit."
exit 0
EOF

# Tornar o hook executável
chmod +x .git/hooks/pre-commit

# Criar hook de commit-msg para garantir mensagens de commit padronizadas
echo "Criando hook de commit-msg..."
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash

# Hook de commit-msg para verificar o formato da mensagem de commit

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat $COMMIT_MSG_FILE)

# Padrão esperado: tipo: mensagem (ex: feat: adiciona autenticação com Google)
PATTERN="^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\([a-z]+\))?: .{1,}"

if ! [[ $COMMIT_MSG =~ $PATTERN ]]; then
  echo "❌ Formato de mensagem de commit inválido."
  echo "Use o formato: tipo: mensagem"
  echo "Tipos válidos: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert"
  echo "Exemplo: feat: adiciona autenticação com Google"
  echo "Exemplo com escopo: feat(auth): adiciona autenticação com Google"
  exit 1
fi

echo "✅ Formato de mensagem de commit válido."
exit 0
EOF

# Tornar o hook executável
chmod +x .git/hooks/commit-msg

# Criar hook de post-commit para lembrar de push frequente
echo "Criando hook de post-commit..."
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash

# Hook de post-commit para lembrar de push frequente

# Contar número de commits não enviados para o remoto
UNPUSHED=$(git log @{u}.. 2>/dev/null | grep -c "^commit")

if [ $UNPUSHED -gt 5 ]; then
  echo "⚠️  Você tem $UNPUSHED commits locais não enviados para o repositório remoto."
  echo "Considere fazer push para evitar perda de dados e facilitar colaboração."
fi

# Mostrar dica aleatória sobre Git
TIPS=(
  "Dica: Faça commits pequenos e frequentes para facilitar o rastreamento de mudanças."
  "Dica: Use 'git pull --rebase' para manter o histórico de commits limpo."
  "Dica: Verifique o status com 'git status' antes de cada commit."
  "Dica: Use branches para desenvolver novas funcionalidades isoladamente."
  "Dica: Escreva mensagens de commit claras e descritivas."
  "Dica: Nunca comite credenciais ou segredos no repositório."
  "Dica: Use 'git diff' para revisar suas alterações antes de commit."
)

RANDOM_TIP=${TIPS[$RANDOM % ${#TIPS[@]}]}
echo "💡 $RANDOM_TIP"

exit 0
EOF

# Tornar o hook executável
chmod +x .git/hooks/post-commit

echo "✅ Hooks do Git configurados com sucesso!"
echo
echo "Os seguintes hooks foram instalados:"
echo "- pre-commit: Verifica segredos e executa lint antes de cada commit"
echo "- commit-msg: Garante mensagens de commit padronizadas"
echo "- post-commit: Lembra de fazer push e exibe dicas sobre Git"
echo
echo "Para testar os hooks, faça um commit de teste:"
echo "git commit -m 'test: verifica configuração de hooks'"
