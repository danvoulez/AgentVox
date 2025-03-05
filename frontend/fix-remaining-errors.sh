#!/bin/bash

echo "Corrigindo erros restantes..."

# 1. Corrigir duplicação de Tabs
echo "Corrigindo duplicação de Tabs..."
find /Users/Amarilho/Documents/2_AgentVox/frontend/src -type f -name "*.tsx" | xargs sed -i '' 's/Tabs, Tabs,/Tabs,/g'

# 2. Corrigir caminhos de importação
echo "Corrigindo caminhos de importação..."
find /Users/Amarilho/Documents/2_AgentVox/frontend/src/pages/api -type f -name "*.ts" | xargs sed -i '' "s/@\\/utils\\/supabase\\/api/@\\/utils\\/supabase/g"

echo "Correções adicionais concluídas!"
