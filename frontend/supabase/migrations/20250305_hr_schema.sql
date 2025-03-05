-- Schema para o módulo de RH do AgentVox
-- Este arquivo define as tabelas e relações para o sistema de Recursos Humanos

-- Tabela de departamentos
CREATE TABLE IF NOT EXISTS "public"."departments" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "manager_id" UUID REFERENCES "auth"."users"("id"),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de posições/cargos
CREATE TABLE IF NOT EXISTS "public"."positions" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title" TEXT NOT NULL,
  "department_id" UUID REFERENCES "public"."departments"("id") ON DELETE CASCADE,
  "salary_range_min" DECIMAL(10, 2),
  "salary_range_max" DECIMAL(10, 2),
  "responsibilities" TEXT,
  "requirements" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de funcionários (estende os usuários)
CREATE TABLE IF NOT EXISTS "public"."employees" (
  "id" UUID PRIMARY KEY REFERENCES "auth"."users"("id"),
  "user_id" UUID REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "department_id" UUID REFERENCES "public"."departments"("id"),
  "position_id" UUID REFERENCES "public"."positions"("id"),
  "manager_id" UUID REFERENCES "public"."employees"("id"),
  "hire_date" DATE NOT NULL,
  "employment_status" TEXT CHECK (employment_status IN ('active', 'terminated', 'on_leave', 'retired')),
  "employment_type" TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
  "birthday" DATE,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postal_code" TEXT,
  "country" TEXT,
  "phone" TEXT,
  "emergency_contact_name" TEXT,
  "emergency_contact_phone" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de registros de desempenho
CREATE TABLE IF NOT EXISTS "public"."performance_reviews" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "employee_id" UUID REFERENCES "public"."employees"("id") ON DELETE CASCADE,
  "reviewer_id" UUID REFERENCES "public"."employees"("id"),
  "review_date" DATE NOT NULL,
  "performance_score" INTEGER CHECK (performance_score BETWEEN 1 AND 5),
  "strengths" TEXT,
  "areas_for_improvement" TEXT,
  "goals" TEXT,
  "comments" TEXT,
  "status" TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'acknowledged')),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de ausências e licenças
CREATE TABLE IF NOT EXISTS "public"."time_off" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "employee_id" UUID REFERENCES "public"."employees"("id") ON DELETE CASCADE,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "type" TEXT CHECK (type IN ('vacation', 'sick', 'personal', 'bereavement', 'maternity', 'paternity', 'other')),
  "status" TEXT CHECK (status IN ('requested', 'approved', 'denied', 'cancelled')),
  "approver_id" UUID REFERENCES "public"."employees"("id"),
  "reason" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de treinamentos
CREATE TABLE IF NOT EXISTS "public"."trainings" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT,
  "required_for_positions" UUID[] REFERENCES "public"."positions"("id"),
  "duration_hours" DECIMAL(5, 2),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de registros de treinamento dos funcionários
CREATE TABLE IF NOT EXISTS "public"."employee_trainings" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "employee_id" UUID REFERENCES "public"."employees"("id") ON DELETE CASCADE,
  "training_id" UUID REFERENCES "public"."trainings"("id") ON DELETE CASCADE,
  "completion_date" DATE,
  "status" TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'expired')),
  "score" DECIMAL(5, 2),
  "certificate_url" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE IF EXISTS "public"."departments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."positions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."performance_reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."time_off" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."trainings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."employee_trainings" ENABLE ROW LEVEL SECURITY;

-- Criação de índices para melhorar performance
CREATE INDEX IF NOT EXISTS "idx_employees_department" ON "public"."employees"("department_id");
CREATE INDEX IF NOT EXISTS "idx_employees_position" ON "public"."employees"("position_id");
CREATE INDEX IF NOT EXISTS "idx_employees_manager" ON "public"."employees"("manager_id");
CREATE INDEX IF NOT EXISTS "idx_performance_reviews_employee" ON "public"."performance_reviews"("employee_id");
CREATE INDEX IF NOT EXISTS "idx_time_off_employee" ON "public"."time_off"("employee_id");
CREATE INDEX IF NOT EXISTS "idx_employee_trainings_employee" ON "public"."employee_trainings"("employee_id");
CREATE INDEX IF NOT EXISTS "idx_employee_trainings_training" ON "public"."employee_trainings"("training_id");

-- Trigger para atualizar o timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON "public"."departments" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON "public"."positions" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON "public"."employees" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON "public"."performance_reviews" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_time_off_updated_at BEFORE UPDATE ON "public"."time_off" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON "public"."trainings" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_employee_trainings_updated_at BEFORE UPDATE ON "public"."employee_trainings" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
