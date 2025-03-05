# Solução para o Problema "Invalid API Key" no Supabase

## Problema Identificado

O problema principal era que as variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` não estavam sendo carregadas corretamente pelo Next.js, resultando no erro "Invalid API key" durante o processo de login.

## Soluções Implementadas

### 1. Correção das Variáveis de Ambiente

- Verificamos e atualizamos o arquivo `.env.local` com as credenciais corretas do Supabase:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ
  ```

### 2. Scripts de Diagnóstico e Correção

Criamos vários scripts para diagnosticar e corrigir o problema:

- `fix-supabase-login.sh`: Script completo que verifica e corrige todas as possíveis causas do problema.
- `verify-env.mjs`: Verifica se as variáveis de ambiente estão sendo carregadas corretamente pelo Node.js.
- `check-supabase-connection.mjs`: Testa a conexão com o Supabase para verificar se as credenciais estão funcionando.

### 3. Páginas de Diagnóstico

Criamos páginas de diagnóstico para facilitar a verificação do status da conexão com o Supabase:

- `/diagnose`: Página que verifica o status da conexão com o Supabase e exibe informações detalhadas sobre as variáveis de ambiente.
- `/api/supabase-status`: Endpoint que verifica o status da conexão com o Supabase.
- `/api/env-check`: Endpoint que verifica as variáveis de ambiente carregadas pelo Next.js.

### 4. Melhorias no Redirecionamento

- Corrigimos a página `/login.tsx` para redirecionar corretamente para `/auth/login`.

## Como Usar

### Verificar o Status da Conexão

1. Acesse a página de diagnóstico: http://localhost:3000/diagnose

### Corrigir Problemas de Conexão

Se você encontrar problemas de conexão com o Supabase, execute o script de correção:

```bash
cd /caminho/para/frontend
./fix-supabase-login.sh
```

### Testar o Login

Após aplicar as correções, você pode testar o login acessando:

1. http://localhost:3000/auth/login

## Observações Importantes

- As variáveis de ambiente devem estar presentes no arquivo `.env.local` na raiz do projeto.
- O servidor Next.js deve ser reiniciado após qualquer alteração nas variáveis de ambiente.
- O cache do Next.js (pasta `.next`) deve ser limpo se as alterações nas variáveis de ambiente não forem aplicadas.

## Solução de Problemas Adicionais

Se o problema persistir após aplicar as correções acima, verifique:

1. Se o projeto Supabase está ativo e acessível.
2. Se as credenciais do Supabase estão corretas e não expiraram.
3. Se há problemas de rede que possam estar impedindo a conexão com o Supabase.

## Conclusão

Esta solução garante que a aplicação possa se conectar corretamente ao Supabase para autenticação e operações de banco de dados, eliminando o erro "Invalid API key" durante o processo de login.
