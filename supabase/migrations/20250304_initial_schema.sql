-- Enable the pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create people table (for all people including those with Client function)
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  data_source TEXT NOT NULL DEFAULT 'agentvox',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create people_functions table (to assign functions like 'client', 'supplier', etc.)
CREATE TABLE IF NOT EXISTS people_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  function_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(person_id, function_type)
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  legacy_price DECIMAL(10,2),
  image_url TEXT,
  sku TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  stock INTEGER DEFAULT 0,
  data_source TEXT NOT NULL DEFAULT 'agentvox',
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT,
  client_id UUID REFERENCES people(id) ON DELETE SET NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  data_source TEXT NOT NULL DEFAULT 'agentvox',
  conversation_id UUID,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create whatsapp_conversations table
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES people(id) ON DELETE SET NULL,
  client_phone TEXT NOT NULL,
  client_name TEXT,
  start_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  end_timestamp TIMESTAMP WITH TIME ZONE,
  conversation_text TEXT,
  conversation_summary TEXT,
  has_sale BOOLEAN DEFAULT FALSE,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS policies for people
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "People are viewable by authenticated users." 
  ON people FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users with admin role can insert people." 
  ON people FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users with admin role can update people." 
  ON people FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS policies for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by authenticated users." 
  ON products FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users with admin role can insert products." 
  ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users with admin role can update products." 
  ON products FOR UPDATE USING (auth.role() = 'authenticated');

-- Create voice_commands table
CREATE TABLE IF NOT EXISTS voice_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  command TEXT NOT NULL,
  transcript TEXT NOT NULL,
  response TEXT,
  action JSONB,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for voice_commands
ALTER TABLE voice_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voice commands." 
  ON voice_commands FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice commands." 
  ON voice_commands FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create vox_memory table for persistent memory
CREATE TABLE IF NOT EXISTS vox_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  memory_type TEXT NOT NULL,
  content JSONB NOT NULL,
  importance INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies for vox_memory
ALTER TABLE vox_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memories." 
  ON vox_memory FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories." 
  ON vox_memory FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories." 
  ON vox_memory FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories." 
  ON vox_memory FOR DELETE USING (auth.uid() = user_id);

-- Create vox_evolution table for tracking Vox's growth
CREATE TABLE IF NOT EXISTS vox_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  intelligence_level INTEGER DEFAULT 1,
  learning_points INTEGER DEFAULT 0,
  skills JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{"accuracy": 0, "helpfulness": 0, "creativity": 0, "efficiency": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for vox_evolution
ALTER TABLE vox_evolution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own Vox evolution." 
  ON vox_evolution FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Vox evolution." 
  ON vox_evolution FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Vox evolution." 
  ON vox_evolution FOR UPDATE USING (auth.uid() = user_id);

-- Create vector table for semantic memory
CREATE TABLE IF NOT EXISTS vox_memory_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES vox_memory(id) ON DELETE CASCADE,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for vox_memory_embeddings
ALTER TABLE vox_memory_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memory embeddings." 
  ON vox_memory_embeddings FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM vox_memory 
    WHERE vox_memory.id = vox_memory_embeddings.memory_id 
    AND vox_memory.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own memory embeddings." 
  ON vox_memory_embeddings FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM vox_memory 
    WHERE vox_memory.id = vox_memory_embeddings.memory_id 
    AND vox_memory.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own memory embeddings." 
  ON vox_memory_embeddings FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM vox_memory 
    WHERE vox_memory.id = vox_memory_embeddings.memory_id 
    AND vox_memory.user_id = auth.uid()
  ));

-- Create functions for vector similarity search
CREATE OR REPLACE FUNCTION match_vox_memories(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  user_id UUID
)
RETURNS TABLE (
  id UUID,
  memory_id UUID,
  content JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vme.id,
    vme.memory_id,
    vm.content,
    1 - (vme.embedding <=> query_embedding) AS similarity
  FROM vox_memory_embeddings vme
  JOIN vox_memory vm ON vme.memory_id = vm.id
  WHERE vm.user_id = match_vox_memories.user_id
  AND 1 - (vme.embedding <=> query_embedding) > match_threshold
  ORDER BY vme.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vox_memory_updated_at
BEFORE UPDATE ON vox_memory
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vox_evolution_updated_at
BEFORE UPDATE ON vox_evolution
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to update last_accessed timestamp on memory retrieval
CREATE OR REPLACE FUNCTION update_memory_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vox_memory
  SET last_accessed = now()
  WHERE id = NEW.memory_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_memory_access_timestamp
AFTER INSERT ON vox_memory_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_memory_last_accessed();
