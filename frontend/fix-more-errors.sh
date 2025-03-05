#!/bin/bash

# Corrigir mais erros de tipo em arquivos TypeScript/TSX

# Adicionar tipos explícitos para parâmetros implícitos
find /Users/Amarilho/Documents/2_AgentVox/frontend/src/pages/api -type f -name "*.ts" -exec sed -i '' 's/person =>/person: any =>/g' {} \;
find /Users/Amarilho/Documents/2_AgentVox/frontend/src/pages/api -type f -name "*.ts" -exec sed -i '' 's/product =>/product: any =>/g' {} \;
find /Users/Amarilho/Documents/2_AgentVox/frontend/src/pages/api -type f -name "*.ts" -exec sed -i '' 's/sale =>/sale: any =>/g' {} \;
find /Users/Amarilho/Documents/2_AgentVox/frontend/src/pages/api -type f -name "*.ts" -exec sed -i '' 's/item =>/item: any =>/g' {} \;
find /Users/Amarilho/Documents/2_AgentVox/frontend/src/pages/api -type f -name "*.ts" -exec sed -i '' 's/result =>/result: any =>/g' {} \;

echo "Correções adicionais concluídas!"
