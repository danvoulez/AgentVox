-- Configuração de políticas RLS (Row Level Security) para o projeto AgentVox
-- Este arquivo define as políticas de segurança para todas as tabelas do projeto

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE IF EXISTS "public"."user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."agents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."memories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."voice_settings" ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela user_roles
-- Permite que usuários vejam apenas seus próprios papéis
DROP POLICY IF EXISTS "Users can view own roles" ON "public"."user_roles";
CREATE POLICY "Users can view own roles" ON "public"."user_roles"
FOR SELECT
USING (auth.uid() = user_id);

-- Apenas administradores podem criar/atualizar papéis de usuário
DROP POLICY IF EXISTS "Admins can manage all roles" ON "public"."user_roles";
CREATE POLICY "Admins can manage all roles" ON "public"."user_roles"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Políticas para tabela user_profiles
-- Usuários podem ver seus próprios perfis
DROP POLICY IF EXISTS "Users can view own profiles" ON "public"."user_profiles";
CREATE POLICY "Users can view own profiles" ON "public"."user_profiles"
FOR SELECT
USING (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios perfis
DROP POLICY IF EXISTS "Users can update own profiles" ON "public"."user_profiles";
CREATE POLICY "Users can update own profiles" ON "public"."user_profiles"
FOR UPDATE
USING (auth.uid() = user_id);

-- Administradores podem ver todos os perfis
DROP POLICY IF EXISTS "Admins can view all profiles" ON "public"."user_profiles";
CREATE POLICY "Admins can view all profiles" ON "public"."user_profiles"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Políticas para tabela agents
-- Usuários podem ver seus próprios agentes
DROP POLICY IF EXISTS "Users can view own agents" ON "public"."agents";
CREATE POLICY "Users can view own agents" ON "public"."agents"
FOR SELECT
USING (auth.uid() = owner_id);

-- Usuários podem gerenciar seus próprios agentes
DROP POLICY IF EXISTS "Users can manage own agents" ON "public"."agents";
CREATE POLICY "Users can manage own agents" ON "public"."agents"
FOR ALL
USING (auth.uid() = owner_id);

-- Usuários podem ver agentes públicos
DROP POLICY IF EXISTS "Users can view public agents" ON "public"."agents";
CREATE POLICY "Users can view public agents" ON "public"."agents"
FOR SELECT
USING (is_public = true);

-- Políticas para tabela conversations
-- Usuários podem ver suas próprias conversas
DROP POLICY IF EXISTS "Users can view own conversations" ON "public"."conversations";
CREATE POLICY "Users can view own conversations" ON "public"."conversations"
FOR SELECT
USING (auth.uid() = user_id);

-- Usuários podem gerenciar suas próprias conversas
DROP POLICY IF EXISTS "Users can manage own conversations" ON "public"."conversations";
CREATE POLICY "Users can manage own conversations" ON "public"."conversations"
FOR ALL
USING (auth.uid() = user_id);

-- Políticas para tabela messages
-- Usuários podem ver mensagens de suas próprias conversas
DROP POLICY IF EXISTS "Users can view messages from own conversations" ON "public"."messages";
CREATE POLICY "Users can view messages from own conversations" ON "public"."messages"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

-- Usuários podem adicionar mensagens às suas próprias conversas
DROP POLICY IF EXISTS "Users can add messages to own conversations" ON "public"."messages";
CREATE POLICY "Users can add messages to own conversations" ON "public"."messages"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

-- Políticas para tabela memories
-- Usuários podem ver suas próprias memórias
DROP POLICY IF EXISTS "Users can view own memories" ON "public"."memories";
CREATE POLICY "Users can view own memories" ON "public"."memories"
FOR SELECT
USING (auth.uid() = user_id);

-- Usuários podem gerenciar suas próprias memórias
DROP POLICY IF EXISTS "Users can manage own memories" ON "public"."memories";
CREATE POLICY "Users can manage own memories" ON "public"."memories"
FOR ALL
USING (auth.uid() = user_id);

-- Políticas para tabela voice_settings
-- Usuários podem ver suas próprias configurações de voz
DROP POLICY IF EXISTS "Users can view own voice settings" ON "public"."voice_settings";
CREATE POLICY "Users can view own voice settings" ON "public"."voice_settings"
FOR SELECT
USING (auth.uid() = user_id);

-- Usuários podem gerenciar suas próprias configurações de voz
DROP POLICY IF EXISTS "Users can manage own voice settings" ON "public"."voice_settings";
CREATE POLICY "Users can manage own voice settings" ON "public"."voice_settings"
FOR ALL
USING (auth.uid() = user_id);
