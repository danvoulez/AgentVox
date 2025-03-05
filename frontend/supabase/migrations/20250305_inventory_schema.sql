-- Schema para o módulo de Estoque do AgentVox
-- Este arquivo define as tabelas e relações para o sistema de Gestão de Estoque

-- Tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS "public"."product_categories" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "parent_id" UUID REFERENCES "public"."product_categories"("id"),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de unidades de medida
CREATE TABLE IF NOT EXISTS "public"."measurement_units" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "abbreviation" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de fornecedores
CREATE TABLE IF NOT EXISTS "public"."suppliers" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "contact_name" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postal_code" TEXT,
  "country" TEXT,
  "tax_id" TEXT,
  "payment_terms" TEXT,
  "notes" TEXT,
  "status" TEXT CHECK (status IN ('active', 'inactive', 'blacklisted')),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS "public"."products" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "sku" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category_id" UUID REFERENCES "public"."product_categories"("id"),
  "unit_id" UUID REFERENCES "public"."measurement_units"("id"),
  "barcode" TEXT,
  "cost_price" DECIMAL(10, 2) NOT NULL,
  "selling_price" DECIMAL(10, 2) NOT NULL,
  "tax_rate" DECIMAL(5, 2) DEFAULT 0,
  "min_stock_level" INTEGER DEFAULT 0,
  "max_stock_level" INTEGER,
  "reorder_point" INTEGER,
  "lead_time_days" INTEGER,
  "is_active" BOOLEAN DEFAULT true,
  "weight" DECIMAL(10, 2),
  "dimensions" TEXT,
  "image_url" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de localizações de estoque (armazéns, prateleiras, etc.)
CREATE TABLE IF NOT EXISTS "public"."inventory_locations" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "type" TEXT CHECK (type IN ('warehouse', 'shelf', 'bin', 'zone', 'other')),
  "parent_id" UUID REFERENCES "public"."inventory_locations"("id"),
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postal_code" TEXT,
  "country" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de estoque (quantidade de produtos em cada localização)
CREATE TABLE IF NOT EXISTS "public"."inventory_items" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "product_id" UUID REFERENCES "public"."products"("id") ON DELETE CASCADE,
  "location_id" UUID REFERENCES "public"."inventory_locations"("id") ON DELETE CASCADE,
  "quantity" DECIMAL(10, 2) NOT NULL,
  "batch_number" TEXT,
  "expiry_date" DATE,
  "manufacturing_date" DATE,
  "status" TEXT CHECK (status IN ('available', 'reserved', 'damaged', 'expired', 'in_transit')),
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, location_id, batch_number)
);

-- Tabela de movimentações de estoque (entradas, saídas, transferências)
CREATE TABLE IF NOT EXISTS "public"."inventory_transactions" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "product_id" UUID REFERENCES "public"."products"("id"),
  "from_location_id" UUID REFERENCES "public"."inventory_locations"("id"),
  "to_location_id" UUID REFERENCES "public"."inventory_locations"("id"),
  "quantity" DECIMAL(10, 2) NOT NULL,
  "transaction_type" TEXT CHECK (transaction_type IN ('purchase', 'sale', 'transfer', 'adjustment', 'return')),
  "reference_id" TEXT,
  "reference_type" TEXT,
  "batch_number" TEXT,
  "unit_cost" DECIMAL(10, 2),
  "total_cost" DECIMAL(10, 2),
  "notes" TEXT,
  "performed_by" UUID REFERENCES "public"."employees"("id"),
  "transaction_date" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de contagens de inventário
CREATE TABLE IF NOT EXISTS "public"."inventory_counts" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "location_id" UUID REFERENCES "public"."inventory_locations"("id"),
  "start_date" TIMESTAMP WITH TIME ZONE,
  "end_date" TIMESTAMP WITH TIME ZONE,
  "status" TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  "notes" TEXT,
  "initiated_by" UUID REFERENCES "public"."employees"("id"),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de itens de contagem de inventário
CREATE TABLE IF NOT EXISTS "public"."inventory_count_items" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "count_id" UUID REFERENCES "public"."inventory_counts"("id") ON DELETE CASCADE,
  "product_id" UUID REFERENCES "public"."products"("id"),
  "expected_quantity" DECIMAL(10, 2),
  "counted_quantity" DECIMAL(10, 2),
  "variance" DECIMAL(10, 2),
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de relação entre fornecedores e produtos
CREATE TABLE IF NOT EXISTS "public"."supplier_products" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "supplier_id" UUID REFERENCES "public"."suppliers"("id") ON DELETE CASCADE,
  "product_id" UUID REFERENCES "public"."products"("id") ON DELETE CASCADE,
  "supplier_product_code" TEXT,
  "lead_time_days" INTEGER,
  "minimum_order_quantity" INTEGER,
  "price" DECIMAL(10, 2),
  "is_preferred_supplier" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(supplier_id, product_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE IF EXISTS "public"."product_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."measurement_units" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."suppliers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."inventory_locations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."inventory_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."inventory_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."inventory_counts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."inventory_count_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."supplier_products" ENABLE ROW LEVEL SECURITY;

-- Criação de índices para melhorar performance
CREATE INDEX IF NOT EXISTS "idx_products_category" ON "public"."products"("category_id");
CREATE INDEX IF NOT EXISTS "idx_products_sku" ON "public"."products"("sku");
CREATE INDEX IF NOT EXISTS "idx_inventory_items_product" ON "public"."inventory_items"("product_id");
CREATE INDEX IF NOT EXISTS "idx_inventory_items_location" ON "public"."inventory_items"("location_id");
CREATE INDEX IF NOT EXISTS "idx_inventory_transactions_product" ON "public"."inventory_transactions"("product_id");
CREATE INDEX IF NOT EXISTS "idx_inventory_transactions_date" ON "public"."inventory_transactions"("transaction_date");
CREATE INDEX IF NOT EXISTS "idx_supplier_products_supplier" ON "public"."supplier_products"("supplier_id");
CREATE INDEX IF NOT EXISTS "idx_supplier_products_product" ON "public"."supplier_products"("product_id");

-- Trigger para atualizar o timestamp 'updated_at'
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON "public"."product_categories" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_measurement_units_updated_at BEFORE UPDATE ON "public"."measurement_units" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON "public"."suppliers" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_locations_updated_at BEFORE UPDATE ON "public"."inventory_locations" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON "public"."inventory_items" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_transactions_updated_at BEFORE UPDATE ON "public"."inventory_transactions" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_counts_updated_at BEFORE UPDATE ON "public"."inventory_counts" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_count_items_updated_at BEFORE UPDATE ON "public"."inventory_count_items" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_supplier_products_updated_at BEFORE UPDATE ON "public"."supplier_products" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
