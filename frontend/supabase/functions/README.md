# Supabase Edge Functions para AgentVox

Este diretório contém as Edge Functions necessárias para o funcionamento do AgentVox.

## Pré-requisitos

1. Supabase CLI instalado
2. Projeto Supabase configurado
3. Deno instalado (usado pelo Supabase para Edge Functions)

## Instalação da Supabase CLI

```bash
# Usando Homebrew (macOS)
brew install supabase/tap/supabase

# Usando NPM
npm install -g supabase
```

## Configuração do Projeto

1. Faça login na sua conta Supabase:

```bash
supabase login
```

2. Inicialize o projeto Supabase na raiz do projeto (se ainda não estiver inicializado):

```bash
cd /Users/Amarilho/Documents/2_AgentVox
supabase init
```

3. Vincule seu projeto local ao projeto remoto:

```bash
supabase link --project-ref nwvxzlkhoobtotuixvpn
```

## Criando uma Edge Function

Para criar uma nova Edge Function:

```bash
supabase functions new nome-da-funcao
```

## Implementando Edge Functions

### 1. Função de Autenticação

Crie uma função para autenticação:

```bash
supabase functions new auth-handler
```

Edite o arquivo `supabase/functions/auth-handler/index.ts`:

```typescript
// Importar dependências
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Configurar o cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Função principal para lidar com requisições
serve(async (req) => {
  // Verificar método
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Obter dados da requisição
    const { action, email, password } = await req.json();

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Processar diferentes ações
    switch (action) {
      case 'signin':
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          return new Response(
            JSON.stringify({ error: signInError.message }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ user: signInData.user, session: signInData.session }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      case 'signup':
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password
        });

        if (signUpError) {
          return new Response(
            JSON.stringify({ error: signUpError.message }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ user: signUpData.user, session: signUpData.session }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Ação não suportada' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Erro interno: ${err.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### 2. Função para Verificar Conexão

Crie uma função para verificar a conexão:

```bash
supabase functions new check-connection
```

Edite o arquivo `supabase/functions/check-connection/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

serve(async (req) => {
  try {
    // Obter as credenciais do ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Tentar fazer uma operação simples para verificar a conexão
    const { data, error } = await supabase.from('user_roles').select('count', { count: 'exact', head: true });
    
    if (error) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: `Erro ao conectar com Supabase: ${error.message}`,
          details: {
            errorType: 'connection',
            errorMessage: error.message
          }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Conexão com Supabase estabelecida com sucesso',
        details: {
          connectionSuccessful: true
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: `Exceção ao tentar conectar com Supabase: ${err.message}`,
        details: {
          errorType: 'unknown',
          errorMessage: err.message
        }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### 3. Função para Verificar Políticas RLS

Crie uma função para verificar o status das políticas RLS:

```bash
supabase functions new check-rls
```

Edite o arquivo `supabase/functions/check-rls/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

serve(async (req) => {
  try {
    // Obter as credenciais do ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Criar cliente Supabase com a chave de serviço para ter acesso administrativo
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Lista de tabelas para verificar
    const tablesToCheck = [
      'user_roles',
      'user_profiles',
      'agents',
      'conversations',
      'messages',
      'memories',
      'voice_settings'
    ];
    
    const results = {};
    
    // Verificar cada tabela
    for (const tableName of tablesToCheck) {
      // Verificar se a tabela existe, se RLS está habilitado e quais políticas estão configuradas
      // Código completo na implementação
    }
    
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Verificação de RLS concluída',
        tables: results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: `Exceção ao verificar políticas RLS: ${err.message}`
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### 4. Função para Aplicar Políticas RLS

Crie uma função para aplicar políticas RLS:

```bash
supabase functions new apply-rls
```

Edite o arquivo `supabase/functions/apply-rls/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

serve(async (req) => {
  try {
    // Obter as credenciais do ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Criar cliente Supabase com a chave de serviço para ter acesso administrativo
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Obter parâmetros da requisição
    const { tables } = await req.json();
    
    // Aplicar políticas RLS para cada tabela
    // Código completo na implementação
    
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Aplicação de políticas RLS concluída',
        results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: `Exceção ao aplicar políticas RLS: ${err.message}`
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### 5. Função para Documentação do Banco de Dados e RLS

Crie uma função para gerar documentação detalhada do banco de dados e políticas RLS:

```bash
supabase functions new rls-documentation
```

Edite o arquivo `supabase/functions/rls-documentation/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

serve(async (req) => {
  try {
    // Obter as credenciais do ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Criar cliente Supabase com a chave de serviço para ter acesso administrativo
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Obter lista de tabelas no schema public
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    // Para cada tabela, obter schema e políticas RLS
    // Código completo na implementação
    
    // Gerar documentação em Markdown
    let markdownDoc = `# Documentação de Segurança do Banco de Dados\n\n`;
    markdownDoc += `*Gerado automaticamente em ${new Date().toISOString()}*\n\n`;
    
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Documentação gerada com sucesso',
        markdown: markdownDoc,
        schema: tableSchemas
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: `Exceção ao gerar documentação: ${err.message}`
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

## Implantando Edge Functions

Para implantar todas as Edge Functions:

```bash
supabase functions deploy --project-ref nwvxzlkhoobtotuixvpn
```

Para implantar uma função específica:

```bash
supabase functions deploy auth-handler --project-ref nwvxzlkhoobtotuixvpn
supabase functions deploy check-connection --project-ref nwvxzlkhoobtotuixvpn
supabase functions deploy check-rls --project-ref nwvxzlkhoobtotuixvpn
supabase functions deploy apply-rls --project-ref nwvxzlkhoobtotuixvpn
supabase functions deploy rls-documentation --project-ref nwvxzlkhoobtotuixvpn
```

## Testando Edge Functions

Você pode testar as Edge Functions localmente antes de implantá-las:

```bash
supabase functions serve --env-file .env.local
```

## Configurando Secrets para as Edge Functions

Para configurar variáveis de ambiente seguras:

```bash
supabase secrets set SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co
supabase secrets set SUPABASE_ANON_KEY=sua-chave-anon-publica
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

## Políticas RLS (Row Level Security)

O AgentVox utiliza políticas RLS para garantir a segurança dos dados. As políticas são definidas no arquivo `supabase/migrations/20250305_rls_policies.sql`.

Para aplicar as políticas RLS:

1. Usando o script de configuração:
```bash
./check-rls.sh
```

2. Ou diretamente via Edge Function:
```bash
curl -X POST "https://nwvxzlkhoobtotuixvpn.supabase.co/functions/v1/apply-rls" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Documentação do Banco de Dados

O AgentVox inclui uma função para gerar documentação detalhada do banco de dados, incluindo esquemas de tabelas e políticas RLS.

Para gerar a documentação:

1. Usando o script de verificação de banco de dados:
```bash
./verify-database.sh
# Selecione a opção 3 para gerar documentação
```

2. Ou diretamente via Edge Function:
```bash
curl -X GET "https://nwvxzlkhoobtotuixvpn.supabase.co/functions/v1/rls-documentation" \
  -H "Content-Type: application/json"
```

A documentação gerada inclui:
- Lista completa de tabelas e seus esquemas
- Status de RLS para cada tabela
- Detalhes de todas as políticas RLS configuradas
- Recomendações de segurança para tabelas sem proteção adequada

## Solução de Problemas

1. **Erro de CORS**: Certifique-se de que sua aplicação está na lista de domínios permitidos no painel do Supabase.

2. **Erro de Autenticação**: Verifique se as chaves de API estão corretas e se você está usando a chave de serviço quando necessário.

3. **Erro de Implantação**: Certifique-se de que o Deno está instalado e que você está autenticado na CLI do Supabase.

4. **Erro de Função**: Verifique os logs da função para identificar o problema:

```bash
supabase functions logs --project-ref nwvxzlkhoobtotuixvpn
```

5. **Erro de RLS**: Se as políticas RLS não estiverem funcionando corretamente, verifique:
   - Se RLS está habilitado para a tabela
   - Se as políticas estão definidas corretamente
   - Se o usuário tem as permissões necessárias
