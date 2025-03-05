# Guia de Configuração do Supabase Vault e Realtime

Este guia explica como configurar e utilizar os recursos avançados do Supabase no projeto AgentVox.

## Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Supabase Vault](#configuração-do-supabase-vault)
3. [Configuração do Supabase Realtime](#configuração-do-supabase-realtime)
4. [Exemplos de Uso](#exemplos-de-uso)
5. [Solução de Problemas](#solução-de-problemas)

## Pré-requisitos

- Projeto Supabase ativo
- Acesso às chaves de API do Supabase (URL e chaves anon e service_role)
- Variáveis de ambiente configuradas no projeto AgentVox

## Configuração do Supabase Vault

### 1. Habilitar a extensão Vault no Supabase

1. Acesse o painel de controle do Supabase
2. Vá para `Database` > `Extensions`
3. Procure por `vault` e clique em `Enable`

### 2. Configurar permissões para o Vault

Execute o seguinte SQL no Editor SQL do Supabase:

```sql
-- Conceder acesso à visualização de segredos descriptografados para a função de serviço
GRANT SELECT ON vault.decrypted_secrets TO service_role;

-- Conceder acesso às funções RPC do Vault para a função de serviço
GRANT EXECUTE ON FUNCTION vault.create_secret(text, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION vault.update_secret(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION vault.create_key(text, text) TO service_role;
```

### 3. Verificar a instalação

Execute o seguinte SQL para verificar se o Vault está funcionando corretamente:

```sql
-- Criar uma chave de teste
SELECT vault.create_key('test-key', 'Chave para testes');

-- Criar um segredo de teste
SELECT vault.create_secret('test-secret', 'valor-secreto', 'Segredo para testes');

-- Verificar se o segredo foi criado
SELECT * FROM vault.decrypted_secrets WHERE name = 'test-secret';
```

## Configuração do Supabase Realtime

### 1. Habilitar o Realtime para tabelas específicas

1. Acesse o painel de controle do Supabase
2. Vá para `Database` > `Replication`
3. Em `Supabase Realtime`, ative as tabelas que deseja monitorar

### 2. Configurar permissões para o Realtime

Execute o seguinte SQL para configurar as permissões de acesso ao Realtime:

```sql
-- Exemplo para uma tabela 'messages'
CREATE TABLE IF NOT EXISTS public.messages (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura por usuários autenticados
CREATE POLICY "Allow users to read all messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Criar política para permitir inserção por usuários autenticados
CREATE POLICY "Allow users to insert their own messages"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

### 3. Verificar a configuração do Realtime

Verifique se o Realtime está funcionando corretamente usando o cliente JavaScript:

```javascript
const channel = supabase
  .channel('test-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'messages'
  }, payload => {
    console.log('Mudança recebida:', payload)
  })
  .subscribe()
```

## Exemplos de Uso

### Exemplo de Uso do Vault

```typescript
import { vaultService } from '../utils/vault/supabase-vault';

// Armazenar um segredo
await vaultService.storeSecret(
  'api-key-openai',
  'sk-xxxxxxxxxxxx',
  'Chave de API da OpenAI'
);

// Recuperar um segredo
const apiKey = await vaultService.getSecret('api-key-openai');
```

### Exemplo de Uso do Realtime

```typescript
import { realtimeService } from '../utils/realtime/supabase-realtime';

// Monitorar alterações em uma tabela
realtimeService.subscribeToTableChanges(
  'users-channel',
  'public',
  'users',
  '*',
  (payload) => {
    console.log('Alteração detectada:', payload);
    // Atualizar a interface do usuário
  }
);

// Criar um canal de chat
const chatChannel = realtimeService.createBroadcastChannel(
  'room-123',
  'new-message',
  (payload) => {
    console.log('Nova mensagem:', payload);
    // Adicionar mensagem à interface
  }
);

// Enviar uma mensagem
await realtimeService.sendBroadcastMessage(
  'room-123',
  'new-message',
  {
    text: 'Olá, mundo!',
    sender: 'user123',
    timestamp: new Date().toISOString()
  }
);
```

## Solução de Problemas

### Problemas com o Vault

1. **Erro "permission denied for schema vault"**
   - Verifique se você está usando a chave `service_role` e não a chave `anon`
   - Verifique se as permissões foram concedidas corretamente

2. **Erro ao criar segredos**
   - Verifique se a extensão vault está habilitada
   - Verifique se você tem pelo menos uma chave de criptografia criada

### Problemas com o Realtime

1. **Não recebe eventos de alteração**
   - Verifique se a tabela está habilitada para replicação em `Database > Replication`
   - Verifique se você está inscrito no canal correto
   - Verifique se as políticas RLS permitem acesso à tabela

2. **Erro de conexão WebSocket**
   - Verifique se as URLs do Supabase estão corretas
   - Verifique se o usuário está autenticado (se necessário)
   - Verifique se há bloqueios de firewall ou proxy

---

Para mais informações, consulte a documentação oficial:
- [Supabase Vault](https://supabase.com/docs/guides/database/vault)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
