# Guia para Remoção de Placeholders no AgentVox

Este documento orienta como identificar e resolver placeholders no projeto AgentVox.

## Placeholders Identificados

O projeto contém vários placeholders que precisam ser substituídos por valores reais para o funcionamento correto da aplicação:

| Placeholder | Descrição | Onde Obter |
|-------------|-----------|------------|
| `nwvxzlkhoobtotuixvpn` | ID do projeto Supabase | Console do Supabase > Configurações > API |
| `sua-chave-anon-publica` | Chave anônima do Supabase | Console do Supabase > Configurações > API > Project API Keys |
| `sua-chave-service-role` | Chave de serviço do Supabase | Console do Supabase > Configurações > API > Project API Keys |
| `sua-chave-da-api-openai` | Chave da API OpenAI | [OpenAI Dashboard](https://platform.openai.com/api-keys) |

## Arquivos Críticos com Placeholders

Os seguintes arquivos contêm placeholders que devem ser substituídos:

1. `.env.local` - Variáveis de ambiente para desenvolvimento local
2. `.env.example` - Exemplo de configuração de variáveis de ambiente
3. `update-supabase-url.sh` - Script para atualizar URL do Supabase
4. `supabase/functions/README.md` - Documentação das Edge Functions
5. `check-rls.sh` - Script para verificar políticas RLS
6. `supabase-setup.sh` - Script de configuração do Supabase

## Como Resolver

### Método Automatizado

Execute o script de limpeza de placeholders:

```bash
./clean-placeholders.sh
```

Este script irá:
1. Identificar todos os placeholders no projeto
2. Mostrar onde eles estão localizados
3. Guiar você através do processo de substituição

### Substituição Manual

Se preferir substituir manualmente:

1. **Configure o arquivo `.env.local`**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto-real.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-real
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-real
   OPENAI_API_KEY=sua-chave-openai-real
   ```

2. **Atualize os scripts**:
   - Substitua todas as ocorrências de `nwvxzlkhoobtotuixvpn` pelo ID real do seu projeto
   - Substitua todas as referências a chaves de exemplo por chaves reais

3. **Verifique a configuração**:
   ```bash
   ./check-env.sh
   ```

## Verificação

Após fazer as substituições, execute:

```bash
./verify-database.sh
```

Este script irá verificar a conexão com o Supabase e confirmar que tudo está funcionando corretamente.

## Importante

- **Nunca compartilhe** suas chaves de API com outros ou as inclua em repositórios públicos
- Certifique-se de que `.env.local` está no seu `.gitignore`
- Use variáveis de ambiente para configurar chaves em ambientes de produção

---

Se você encontrar problemas durante a configuração, consulte a documentação oficial do [Supabase](https://supabase.io/docs) ou [OpenAI](https://platform.openai.com/docs).
