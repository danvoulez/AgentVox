# Guia de Workflow Git para o AgentVox

Este documento descreve as melhores práticas de Git para o projeto AgentVox, com foco em commits frequentes e segurança.

## Configuração Inicial

Execute o script de configuração de hooks do Git para garantir boas práticas:

```bash
./scripts/setup-git-hooks.sh
```

Este script configura:
- Verificação automática de segredos antes de cada commit
- Validação do formato de mensagens de commit
- Lembretes para push frequente

## Commits Frequentes

### Por que fazer commits frequentes?

1. **Rastreabilidade**: Facilita identificar quando e por que uma alteração foi feita
2. **Reversibilidade**: Permite reverter alterações específicas sem afetar outras partes do código
3. **Colaboração**: Reduz conflitos de merge quando várias pessoas trabalham no mesmo projeto
4. **Segurança**: Diminui o risco de perda de trabalho por problemas técnicos
5. **Qualidade**: Incentiva revisões de código mais focadas e eficientes

### Diretrizes para Commits

1. **Frequência**:
   - Faça commits a cada alteração lógica completa
   - Idealmente, várias vezes ao dia
   - Nunca acumule muitas alterações em um único commit

2. **Tamanho**:
   - Cada commit deve ser pequeno e focado
   - Deve representar uma única alteração lógica
   - Se você precisa usar "e" para descrever o commit, provavelmente deve ser dividido

3. **Mensagens**:
   - Use o formato: `tipo: descrição concisa`
   - Tipos comuns: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Exemplos:
     - `feat: adiciona autenticação com Google`
     - `fix: corrige timeout na conexão com Supabase`
     - `docs: atualiza instruções de deploy`

## Workflow Recomendado

### Fluxo de Trabalho Diário

1. **Início do dia**:
   ```bash
   git pull origin master  # Obter alterações mais recentes
   ```

2. **Durante o desenvolvimento**:
   ```bash
   # Após cada alteração lógica completa:
   git add [arquivos específicos]  # Evite usar git add .
   git commit -m "tipo: descrição concisa"
   ```

3. **A cada poucas horas**:
   ```bash
   git push origin master  # Enviar alterações para o repositório remoto
   ```

### Para Novas Funcionalidades

1. **Criar branch para a funcionalidade**:
   ```bash
   git checkout -b feature/nome-da-funcionalidade
   ```

2. **Desenvolvimento com commits frequentes**:
   ```bash
   # Após cada alteração lógica:
   git add [arquivos]
   git commit -m "feat: descrição da alteração"
   ```

3. **Manter o branch atualizado**:
   ```bash
   git fetch origin
   git rebase origin/master
   ```

4. **Finalizar e mesclar**:
   ```bash
   git push origin feature/nome-da-funcionalidade
   # Criar Pull Request no GitHub
   ```

## Verificação de Segredos

Antes de cada commit, verifique se não há segredos no código:

```bash
./scripts/check-secrets.sh
```

Este script verifica:
- Chaves de API
- Tokens de acesso
- Credenciais
- URLs hardcoded do Supabase
- Arquivos .env

## Dicas Adicionais

1. **Revisão antes de commit**:
   ```bash
   git diff  # Revisar alterações não staged
   git diff --staged  # Revisar alterações staged para commit
   ```

2. **Histórico de commits**:
   ```bash
   git log --oneline --graph  # Visualizar histórico de commits
   ```

3. **Desfazer alterações**:
   ```bash
   git reset --soft HEAD~1  # Desfazer último commit mantendo alterações
   git reset --hard HEAD~1  # Desfazer último commit descartando alterações (cuidado!)
   ```

4. **Stash para alterações temporárias**:
   ```bash
   git stash  # Salvar alterações temporariamente
   git stash pop  # Recuperar alterações salvas
   ```

Lembre-se: commits frequentes e mensagens claras tornam o desenvolvimento mais eficiente e seguro para toda a equipe!
