-- Schema para o módulo de Vendas do AgentVox
-- Este arquivo define as tabelas e relações para o sistema de Gestão de Vendas

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS "public"."customers" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" UUID REFERENCES "auth"."users"("id"),
  "company_name" TEXT,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postal_code" TEXT,
  "country" TEXT,
  "tax_id" TEXT,
  "customer_type" TEXT CHECK (customer_type IN ('individual', 'company')),
  "industry" TEXT,
  "customer_since" DATE DEFAULT CURRENT_DATE,
  "credit_limit" DECIMAL(10, 2),
  "payment_terms" TEXT,
  "notes" TEXT,
  "status" TEXT CHECK (status IN ('active', 'inactive', 'blocked')),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de contatos de clientes
CREATE TABLE IF NOT EXISTS "public"."customer_contacts" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "customer_id" UUID REFERENCES "public"."customers"("id") ON DELETE CASCADE,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "position" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "is_primary" BOOLEAN DEFAULT false,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de vendedores
CREATE TABLE IF NOT EXISTS "public"."sales_representatives" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "employee_id" UUID REFERENCES "public"."employees"("id") ON DELETE CASCADE,
  "commission_rate" DECIMAL(5, 2) DEFAULT 0,
  "sales_target" DECIMAL(10, 2),
  "territory" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de oportunidades de venda
CREATE TABLE IF NOT EXISTS "public"."sales_opportunities" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "customer_id" UUID REFERENCES "public"."customers"("id"),
  "sales_rep_id" UUID REFERENCES "public"."sales_representatives"("id"),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "stage" TEXT CHECK (stage IN ('prospecting', 'qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  "estimated_value" DECIMAL(10, 2),
  "probability" INTEGER CHECK (probability BETWEEN 0 AND 100),
  "expected_close_date" DATE,
  "source" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de atividades de vendas
CREATE TABLE IF NOT EXISTS "public"."sales_activities" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "opportunity_id" UUID REFERENCES "public"."sales_opportunities"("id") ON DELETE CASCADE,
  "type" TEXT CHECK (type IN ('call', 'meeting', 'email', 'task', 'note')),
  "subject" TEXT NOT NULL,
  "description" TEXT,
  "due_date" TIMESTAMP WITH TIME ZONE,
  "completed_date" TIMESTAMP WITH TIME ZONE,
  "status" TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  "assigned_to" UUID REFERENCES "public"."employees"("id"),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de cotações/orçamentos
CREATE TABLE IF NOT EXISTS "public"."quotes" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "quote_number" TEXT UNIQUE NOT NULL,
  "customer_id" UUID REFERENCES "public"."customers"("id"),
  "opportunity_id" UUID REFERENCES "public"."sales_opportunities"("id"),
  "sales_rep_id" UUID REFERENCES "public"."sales_representatives"("id"),
  "issue_date" DATE NOT NULL,
  "expiry_date" DATE NOT NULL,
  "subtotal" DECIMAL(10, 2) NOT NULL,
  "tax_amount" DECIMAL(10, 2) NOT NULL,
  "discount_amount" DECIMAL(10, 2) DEFAULT 0,
  "total_amount" DECIMAL(10, 2) NOT NULL,
  "notes" TEXT,
  "terms_conditions" TEXT,
  "status" TEXT CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de itens de cotação
CREATE TABLE IF NOT EXISTS "public"."quote_items" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "quote_id" UUID REFERENCES "public"."quotes"("id") ON DELETE CASCADE,
  "product_id" UUID REFERENCES "public"."products"("id"),
  "description" TEXT,
  "quantity" DECIMAL(10, 2) NOT NULL,
  "unit_price" DECIMAL(10, 2) NOT NULL,
  "tax_rate" DECIMAL(5, 2) DEFAULT 0,
  "discount_rate" DECIMAL(5, 2) DEFAULT 0,
  "subtotal" DECIMAL(10, 2) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de pedidos de venda
CREATE TABLE IF NOT EXISTS "public"."sales_orders" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "order_number" TEXT UNIQUE NOT NULL,
  "customer_id" UUID REFERENCES "public"."customers"("id"),
  "quote_id" UUID REFERENCES "public"."quotes"("id"),
  "sales_rep_id" UUID REFERENCES "public"."sales_representatives"("id"),
  "order_date" DATE NOT NULL,
  "expected_delivery_date" DATE,
  "shipping_address" TEXT,
  "shipping_city" TEXT,
  "shipping_state" TEXT,
  "shipping_postal_code" TEXT,
  "shipping_country" TEXT,
  "shipping_method" TEXT,
  "subtotal" DECIMAL(10, 2) NOT NULL,
  "tax_amount" DECIMAL(10, 2) NOT NULL,
  "shipping_amount" DECIMAL(10, 2) DEFAULT 0,
  "discount_amount" DECIMAL(10, 2) DEFAULT 0,
  "total_amount" DECIMAL(10, 2) NOT NULL,
  "payment_terms" TEXT,
  "notes" TEXT,
  "status" TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'on_hold')),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de itens de pedido
CREATE TABLE IF NOT EXISTS "public"."order_items" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "order_id" UUID REFERENCES "public"."sales_orders"("id") ON DELETE CASCADE,
  "product_id" UUID REFERENCES "public"."products"("id"),
  "description" TEXT,
  "quantity" DECIMAL(10, 2) NOT NULL,
  "unit_price" DECIMAL(10, 2) NOT NULL,
  "tax_rate" DECIMAL(5, 2) DEFAULT 0,
  "discount_rate" DECIMAL(5, 2) DEFAULT 0,
  "subtotal" DECIMAL(10, 2) NOT NULL,
  "status" TEXT CHECK (status IN ('pending', 'allocated', 'shipped', 'delivered', 'cancelled')),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de faturas
CREATE TABLE IF NOT EXISTS "public"."invoices" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "invoice_number" TEXT UNIQUE NOT NULL,
  "order_id" UUID REFERENCES "public"."sales_orders"("id"),
  "customer_id" UUID REFERENCES "public"."customers"("id"),
  "issue_date" DATE NOT NULL,
  "due_date" DATE NOT NULL,
  "subtotal" DECIMAL(10, 2) NOT NULL,
  "tax_amount" DECIMAL(10, 2) NOT NULL,
  "shipping_amount" DECIMAL(10, 2) DEFAULT 0,
  "discount_amount" DECIMAL(10, 2) DEFAULT 0,
  "total_amount" DECIMAL(10, 2) NOT NULL,
  "amount_paid" DECIMAL(10, 2) DEFAULT 0,
  "balance_due" DECIMAL(10, 2),
  "notes" TEXT,
  "status" TEXT CHECK (status IN ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled', 'void')),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS "public"."payments" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "invoice_id" UUID REFERENCES "public"."invoices"("id"),
  "payment_date" DATE NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "payment_method" TEXT CHECK (payment_method IN ('cash', 'check', 'credit_card', 'bank_transfer', 'online_payment', 'other')),
  "reference_number" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de créditos/devoluções
CREATE TABLE IF NOT EXISTS "public"."credit_memos" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "credit_number" TEXT UNIQUE NOT NULL,
  "invoice_id" UUID REFERENCES "public"."invoices"("id"),
  "customer_id" UUID REFERENCES "public"."customers"("id"),
  "issue_date" DATE NOT NULL,
  "total_amount" DECIMAL(10, 2) NOT NULL,
  "reason" TEXT,
  "notes" TEXT,
  "status" TEXT CHECK (status IN ('draft', 'issued', 'applied', 'void')),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de itens de crédito
CREATE TABLE IF NOT EXISTS "public"."credit_memo_items" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "credit_memo_id" UUID REFERENCES "public"."credit_memos"("id") ON DELETE CASCADE,
  "product_id" UUID REFERENCES "public"."products"("id"),
  "description" TEXT,
  "quantity" DECIMAL(10, 2) NOT NULL,
  "unit_price" DECIMAL(10, 2) NOT NULL,
  "tax_rate" DECIMAL(5, 2) DEFAULT 0,
  "subtotal" DECIMAL(10, 2) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE IF EXISTS "public"."customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."customer_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."sales_representatives" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."sales_opportunities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."sales_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."quotes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."quote_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."sales_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."credit_memos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."credit_memo_items" ENABLE ROW LEVEL SECURITY;

-- Criação de índices para melhorar performance
CREATE INDEX IF NOT EXISTS "idx_customers_name" ON "public"."customers"(first_name, last_name);
CREATE INDEX IF NOT EXISTS "idx_customers_email" ON "public"."customers"(email);
CREATE INDEX IF NOT EXISTS "idx_customer_contacts_customer" ON "public"."customer_contacts"(customer_id);
CREATE INDEX IF NOT EXISTS "idx_sales_representatives_employee" ON "public"."sales_representatives"(employee_id);
CREATE INDEX IF NOT EXISTS "idx_sales_opportunities_customer" ON "public"."sales_opportunities"(customer_id);
CREATE INDEX IF NOT EXISTS "idx_sales_opportunities_sales_rep" ON "public"."sales_opportunities"(sales_rep_id);
CREATE INDEX IF NOT EXISTS "idx_sales_activities_opportunity" ON "public"."sales_activities"(opportunity_id);
CREATE INDEX IF NOT EXISTS "idx_quotes_customer" ON "public"."quotes"(customer_id);
CREATE INDEX IF NOT EXISTS "idx_quotes_number" ON "public"."quotes"(quote_number);
CREATE INDEX IF NOT EXISTS "idx_quote_items_quote" ON "public"."quote_items"(quote_id);
CREATE INDEX IF NOT EXISTS "idx_sales_orders_customer" ON "public"."sales_orders"(customer_id);
CREATE INDEX IF NOT EXISTS "idx_sales_orders_number" ON "public"."sales_orders"(order_number);
CREATE INDEX IF NOT EXISTS "idx_order_items_order" ON "public"."order_items"(order_id);
CREATE INDEX IF NOT EXISTS "idx_invoices_customer" ON "public"."invoices"(customer_id);
CREATE INDEX IF NOT EXISTS "idx_invoices_order" ON "public"."invoices"(order_id);
CREATE INDEX IF NOT EXISTS "idx_invoices_number" ON "public"."invoices"(invoice_number);
CREATE INDEX IF NOT EXISTS "idx_payments_invoice" ON "public"."payments"(invoice_id);
CREATE INDEX IF NOT EXISTS "idx_credit_memos_customer" ON "public"."credit_memos"(customer_id);
CREATE INDEX IF NOT EXISTS "idx_credit_memo_items_memo" ON "public"."credit_memo_items"(credit_memo_id);

-- Trigger para atualizar o timestamp 'updated_at'
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON "public"."customers" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_customer_contacts_updated_at BEFORE UPDATE ON "public"."customer_contacts" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sales_representatives_updated_at BEFORE UPDATE ON "public"."sales_representatives" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sales_opportunities_updated_at BEFORE UPDATE ON "public"."sales_opportunities" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sales_activities_updated_at BEFORE UPDATE ON "public"."sales_activities" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON "public"."quotes" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_quote_items_updated_at BEFORE UPDATE ON "public"."quote_items" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON "public"."sales_orders" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON "public"."invoices" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_credit_memos_updated_at BEFORE UPDATE ON "public"."credit_memos" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_credit_memo_items_updated_at BEFORE UPDATE ON "public"."credit_memo_items" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
