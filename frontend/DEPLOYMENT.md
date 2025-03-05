# Guia de Implantação do AgentVox

Este documento descreve o processo de implantação e as conexões entre GitHub, Vercel e Supabase para o projeto AgentVox.

## Arquitetura de Implantação

```
GitHub (Código) → Vercel (Hospedagem) ← Supabase (Backend/Autenticação)
```

## Configuração do GitHub

1. **Repositório**: https://github.com/danvoulez/AgentVox
2. **Branch principal**: `master`
3. **Fluxo de trabalho**:
   - Desenvolvimento local
   - Commit e push para o GitHub
   - Vercel detecta alterações e inicia o deploy automaticamente

## Configuração do Vercel

1. **Projeto**: AgentVox
2. **Framework**: Next.js
3. **Variáveis de ambiente necessárias**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (para funções do servidor)
   - `NEXT_PUBLIC_BUILD_TIME` (definido automaticamente durante o build)

4. **Configuração de build**:
   - Comando de build: `next build`
   - Diretório de saída: `.next`

5. **Domínios**:
   - Produção: [URL de produção]
   - Preview: [gerado automaticamente pelo Vercel]

## Configuração do Supabase

1. **Projeto**: AgentVox
2. **URL**: https://nwvxzlkhoobtotuixvpn.supabase.co
3. **Chaves de API**:
   - Chave anônima: Usada no frontend (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Chave de serviço: Usada para operações privilegiadas (SUPABASE_SERVICE_ROLE_KEY)

4. **Autenticação**:
   - Método principal: Email/Senha
   - Página de login: `/simple-login`

## Processo de Implantação

1. **Desenvolvimento local**:
   - Use `.env.local` para variáveis de ambiente locais
   - Execute `npm run dev` para testar localmente

2. **Preparação para produção**:
   - Verifique se todas as alterações estão commitadas
   - Certifique-se de que `.env.production` está configurado corretamente
   - Execute `npm run build` localmente para testar o build

3. **Implantação**:
   - Push para o GitHub (`git push origin master`)
   - O Vercel detectará automaticamente as alterações e iniciará o deploy
   - Monitore o status do deploy no painel do Vercel

4. **Verificação**:
   - Após o deploy, acesse a URL de produção
   - Verifique a página `/status` para confirmar que todas as conexões estão funcionando
   - Teste o fluxo de login para garantir que a autenticação com o Supabase está funcionando

## Solução de Problemas

### Erro 404 em páginas

- Verifique se a página existe na estrutura correta (`src/pages/`)
- Confirme que a página foi commitada e enviada para o GitHub
- Verifique os logs de build no Vercel para erros
- Execute `node scripts/check-vercel-status.js` para verificar o status do deploy

### Problemas de Autenticação com Supabase

- Verifique se as variáveis de ambiente estão configuradas corretamente no Vercel
- Acesse a página `/status` para diagnosticar problemas de conexão
- Verifique os logs do Supabase para erros de autenticação
- Execute `node scripts/test-supabase.js` para testar a conexão com o Supabase
- Verifique se as variáveis de ambiente estão corretas com `node scripts/check-env-vars.js`
- Acesse as páginas de diagnóstico `/test-login` e `/troubleshoot` para testes específicos

### Falha no Deploy do Vercel

- Verifique os logs de build no painel do Vercel
- Confirme que o build local funciona com `npm run build`
- Verifique se todas as dependências estão instaladas e atualizadas
- Certifique-se de que o arquivo `vercel.json` está configurado corretamente
- Verifique se as variáveis de ambiente estão configuradas no painel do Vercel

### Erro "Invalid API Key" no Supabase

- Este erro geralmente ocorre quando as credenciais do Supabase estão incorretas
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão corretos
- Confirme que a URL do Supabase está no formato `https://<project-id>.supabase.co`
- Verifique se a chave anônima está correta no painel do Supabase
- Execute `node scripts/test-supabase.js` para diagnosticar problemas de conexão

### Problemas de Conexão com o Supabase

- Verifique se há erros de rede ("Failed to fetch")
- Confirme que o projeto do Supabase está ativo e acessível
- Verifique se as políticas RLS (Row Level Security) estão configuradas corretamente
- Teste a conexão direta com o Supabase usando `curl` ou Postman

## Scripts de Diagnóstico

O projeto inclui vários scripts para diagnosticar e resolver problemas de integração:

### Scripts Principais

1. **check-env-vars.js**
   - Verifica se as variáveis de ambiente estão configuradas corretamente
   - Uso: `node scripts/check-env-vars.js`

2. **test-supabase.js**
   - Testa a conexão com o Supabase
   - Verifica se as credenciais estão corretas
   - Uso: `node scripts/test-supabase.js`

3. **check-vercel-status.js**
   - Verifica o status do deploy no Vercel
   - Testa a acessibilidade de páginas críticas
   - Uso: `node scripts/check-vercel-status.js`

4. **generate-integration-report.js**
   - Gera um relatório completo sobre a integração
   - Verifica configuração do Git, Vercel e Supabase
   - Uso: `node scripts/generate-integration-report.js`

5. **consolidate-pages.sh**
   - Consolida a estrutura de diretórios de páginas
   - Move arquivos de `pages/` para `src/pages/`
   - Uso: `./scripts/consolidate-pages.sh`

## Melhores Práticas de Segurança

1. **Variáveis de Ambiente**
   - Nunca comite arquivos `.env` no repositório
   - Use `.env.example` como modelo sem credenciais reais
   - Configure as variáveis de ambiente no painel do Vercel

2. **Cabeçalhos de Segurança**
   - O arquivo `vercel.json` já inclui cabeçalhos de segurança recomendados
   - Inclui proteções contra XSS, clickjacking e outros ataques

3. **Políticas RLS no Supabase**
   - Configure políticas RLS (Row Level Security) para proteger dados
   - Use a chave de serviço apenas para operações do servidor

4. **Tratamento de Erros**
   - Implementamos tratamento robusto de erros para problemas de conexão
   - Mensagens de erro amigáveis sem expor detalhes técnicos aos usuários

## Melhores Práticas de Git

1. **Commits Frequentes**
   - Realize commits pequenos e frequentes (idealmente várias vezes ao dia)
   - Cada commit deve representar uma mudança lógica e coesa
   - Evite acumular muitas alterações em um único commit grande

2. **Mensagens de Commit Descritivas**
   - Use mensagens claras que descrevam o que foi alterado e por quê
   - Siga um formato consistente (ex: "feat: adiciona autenticação com Google")
   - Inclua números de issue/ticket quando aplicável

3. **Branches de Funcionalidade**
   - Crie branches separados para cada nova funcionalidade ou correção
   - Nomeie branches de forma descritiva (ex: `feature/login-google`, `fix/timeout-error`)
   - Faça merge frequente do branch principal para evitar conflitos grandes

4. **Evite Segredos no Histórico**
   - Nunca comite credenciais, chaves de API ou outros segredos
   - Se um segredo for acidentalmente commitado, altere-o imediatamente
   - Use o script `check-secrets.sh` antes de commits para verificar segredos

## Manutenção

- Regularmente verifique a página `/status` para garantir que todas as conexões estão funcionando
- Execute `node scripts/generate-integration-report.js` periodicamente para verificar a saúde da integração
- Monitore o uso de recursos no Supabase e Vercel
- Mantenha as dependências atualizadas com `npm update`
- Verifique regularmente os logs de erro no Vercel e Supabase

## Recursos Úteis

- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Vercel](https://vercel.com/docs)
- [Documentação do Supabase](https://supabase.io/docs)
- [Guia de Integração Vercel + Supabase](https://vercel.com/guides/nextjs-prisma-postgres)
- [Documentação de RLS do Supabase](https://supabase.com/docs/guides/auth/row-level-security)
