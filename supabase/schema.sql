-- ============================================================================
-- SCHEMA: ConectAr HR
-- Proyecto: Sistema Multi-Tenant de Gestión de Recursos Humanos
-- Base: PostgreSQL (Supabase)
-- Versión: 1.0
-- Fecha: 2026-04-13
-- ============================================================================

-- ============================================================================
-- TABLA: tenants (Empresas clientes - MULTI-TENANT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  country_code VARCHAR(3) DEFAULT 'AR',
  timezone VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires',
  currency VARCHAR(3) DEFAULT 'ARS',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'trial')),
  subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'professional', 'enterprise')),
  subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due')),
  max_employees INTEGER DEFAULT 10,
  max_users INTEGER DEFAULT 5,
  features JSONB DEFAULT '{}'::jsonb, -- {"payroll": true, "leave_management": true, ...}
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- TABLA: users (Usuarios del sistema)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  email_confirmed BOOLEAN DEFAULT FALSE,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login_at TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(tenant_id, email)
);

-- ============================================================================
-- TABLA: roles (Roles del sistema - RBAC)
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  role_type VARCHAR(50) DEFAULT 'custom' CHECK (role_type IN ('admin', 'manager', 'employee', 'custom')),
  permissions JSONB DEFAULT '{}'::jsonb, -- Caché de permisos para performance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(tenant_id, name)
);

-- ============================================================================
-- TABLA: permissions (Permisos del sistema)
-- ============================================================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  resource VARCHAR(50) NOT NULL, -- 'users', 'employees', 'payroll', etc.
  action VARCHAR(50) NOT NULL, -- 'read', 'create', 'update', 'delete'
  is_system_permission BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: role_permissions (Relación Roles-Permisos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

-- ============================================================================
-- TABLA: user_roles (Relación Usuarios-Roles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id),
  UNIQUE(user_id, role_id)
);

-- ============================================================================
-- TABLA: departments (Departamentos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  cost_center VARCHAR(100),
  budget_allocated DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(tenant_id, name)
);

-- ============================================================================
-- TABLA: positions (Puestos de trabajo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  salary_range_min DECIMAL(15,2),
  salary_range_max DECIMAL(15,2),
  level VARCHAR(50), -- 'junior', 'senior', 'lead', 'manager', etc.
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(tenant_id, name)
);

-- ============================================================================
-- TABLA: employees (Empleados)
-- ============================================================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  employee_code VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20), -- 'male', 'female', 'other', 'prefer_not_to_say'
  nationality VARCHAR(100),
  id_number VARCHAR(50) NOT NULL, -- Documento de identidad
  id_type VARCHAR(20) DEFAULT 'dni', -- 'dni', 'passport', 'cuit', etc.
  marital_status VARCHAR(50),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  -- Información laboral
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE RESTRICT,
  manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  employment_type VARCHAR(50) NOT NULL DEFAULT 'full_time', -- 'full_time', 'part_time', 'contractor', 'intern'
  hire_date DATE NOT NULL,
  contract_end_date DATE,
  salary DECIMAL(15,2),
  salary_frequency VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'bi_weekly', 'weekly'
  currency VARCHAR(3) DEFAULT 'ARS',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'suspended', 'terminated')),
  termination_date DATE,
  termination_reason VARCHAR(255),
  -- Documentos y ubicación
  address_line_1 VARCHAR(255),
  address_line_2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  -- Campos personalizados
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(tenant_id, employee_code),
  UNIQUE(tenant_id, id_number)
);

-- ============================================================================
-- TABLA: work_shifts (Turnos/Horarios de trabajo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS work_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER DEFAULT 0, -- Duración del descanso en minutos
  working_days VARCHAR(20) DEFAULT '1,2,3,4,5', -- Lunes a Viernes
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, name)
);

-- ============================================================================
-- TABLA: employee_shifts (Asignación de turnos a empleados)
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES work_shifts(id) ON DELETE RESTRICT,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: attendance (Asistencia)
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  check_in_method VARCHAR(50), -- 'manual', 'biometric', 'qr', 'geo'
  check_in_location VARCHAR(255),
  check_out_method VARCHAR(50),
  check_out_location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'early_out', 'on_leave', 'half_day')),
  late_minutes INTEGER DEFAULT 0,
  early_out_minutes INTEGER DEFAULT 0,
  working_hours DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, employee_id, date)
);

-- ============================================================================
-- TABLA: leave_types (Tipos de licencias)
-- ============================================================================
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  code VARCHAR(50) NOT NULL, -- 'annual', 'sick', 'unpaid', 'maternity', 'paternity', 'bereavement'
  default_days_per_year INTEGER DEFAULT 20,
  is_paid BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT TRUE,
  requires_medical_certificate BOOLEAN DEFAULT FALSE,
  max_consecutive_days INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(tenant_id, code)
);

-- ============================================================================
-- TABLA: leave_balances (Saldos de licencias por empleado)
-- ============================================================================
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_days DECIMAL(10,2) DEFAULT 0,
  used_days DECIMAL(10,2) DEFAULT 0,
  pending_approval_days DECIMAL(10,2) DEFAULT 0,
  approved_days DECIMAL(10,2) DEFAULT 0,
  rollover_days DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, employee_id, leave_type_id, year)
);

-- ============================================================================
-- TABLA: leaves (Solicitudes de licencia)
-- ============================================================================
CREATE TABLE IF NOT EXISTS leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'canceled')),
  reason TEXT,
  notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  rejected_by UUID REFERENCES users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- TABLA: payroll (Nómina / Recibos de sueldo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  payroll_period VARCHAR(20) NOT NULL, -- '2026-04' para abril 2026
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  base_salary DECIMAL(15,2) NOT NULL,
  gross_salary DECIMAL(15,2) NOT NULL,
  net_salary DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'paid', 'canceled')),
  issued_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50), -- 'bank_transfer', 'cash', 'check'
  reference_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, employee_id, payroll_period)
);

-- ============================================================================
-- TABLA: payroll_components (Componentes de nómina - Haberes y descuentos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payroll_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_id UUID NOT NULL REFERENCES payroll(id) ON DELETE CASCADE,
  component_type VARCHAR(50) NOT NULL, -- 'basic_salary', 'overtime', 'bonus', 'tax', 'insurance', 'loan', 'advance'
  component_name VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  calculation_method VARCHAR(50), -- 'fixed', 'percentage', 'formula'
  calculation_basis DECIMAL(15,2),
  is_deduction BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: documents (Documentos de empleados)
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- 'contract', 'offer_letter', 'certificate', 'payroll', 'id_document'
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(50),
  document_date DATE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
  uploaded_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- TABLA: announcements (Comunicados / Anuncios)
-- ============================================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  announcement_type VARCHAR(50) DEFAULT 'general', -- 'general', 'important', 'event', 'policy'
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  published_by UUID NOT NULL REFERENCES users(id),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'published', 'archived')),
  target_roles JSONB DEFAULT '[]'::jsonb, -- IDs de roles destino
  target_departments JSONB DEFAULT '[]'::jsonb, -- IDs de departamentos destino
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- TABLA: notifications (Notificaciones)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50), -- 'leave_request', 'payroll', 'announcement', 'task', 'system'
  related_resource_type VARCHAR(100),
  related_resource_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days'
);

-- ============================================================================
-- TABLA: audit_logs (Registro de auditoría)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'read', 'export'
  resource_type VARCHAR(100) NOT NULL, -- 'employee', 'payroll', 'leave', 'user', etc.
  resource_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  changes_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: company_settings (Configuración de empresa)
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  legal_entity_name VARCHAR(255),
  cuit VARCHAR(50), -- CUIT/CUIL (Argentina)
  industry VARCHAR(100),
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address_line_1 VARCHAR(255),
  address_line_2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  -- Configuración laboral
  work_week_days VARCHAR(20) DEFAULT '1,2,3,4,5', -- Lunes a Viernes
  working_hours_per_day DECIMAL(5,2) DEFAULT 8,
  start_financial_year INTEGER DEFAULT 1, -- Mes de inicio del año fiscal (1-12)
  currency VARCHAR(3) DEFAULT 'ARS',
  timezone VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires',
  -- Configuración de políticas
  leave_policies JSONB DEFAULT '{}'::jsonb,
  payroll_policies JSONB DEFAULT '{}'::jsonb,
  -- Archivo
  branding JSONB DEFAULT '{}'::jsonb, -- {logo, colors, fonts}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- TABLA: performance_reviews (Evaluaciones de desempeño)
-- ============================================================================
CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  overall_rating DECIMAL(3,2), -- 1.0 - 5.0
  performance_score DECIMAL(5,2),
  technical_skills_score DECIMAL(5,2),
  soft_skills_score DECIMAL(5,2),
  comments TEXT,
  recommendations TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'completed', 'archived')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: employee_documents (Documentos requeridos por empleado - Checklist)
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- 'medical_exam', 'contract', 'id_copy', 'bank_info'
  is_required BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: time_off_requests (Solicitudes genéricas de tiempo libre)
-- ============================================================================
CREATE TABLE IF NOT EXISTS time_off_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL, -- 'sick_leave', 'personal', 'emergency', 'work_from_home'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'canceled')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: skills (Habilidades/Competencias)
-- ============================================================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50), -- 'technical', 'soft', 'language'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, name)
);

-- ============================================================================
-- TABLA: employee_skills (Habilidades de empleados)
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20) DEFAULT 'beginner' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience DECIMAL(5,2),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, employee_id, skill_id)
);

-- ============================================================================
-- TABLA: training_programs (Programas de capacitación)
-- ============================================================================
CREATE TABLE IF NOT EXISTS training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  provider VARCHAR(255),
  duration_hours DECIMAL(5,2),
  start_date DATE,
  end_date DATE,
  max_participants INTEGER,
  cost DECIMAL(15,2),
  status VARCHAR(20) DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: employee_training (Participación de empleados en capacitaciones)
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  training_program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'completed', 'canceled')),
  completion_date DATE,
  score DECIMAL(5,2),
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, employee_id, training_program_id)
);

-- ============================================================================
-- TABLA: api_tokens (Tokens para integraciones/APIs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, name)
);

-- ============================================================================
-- TABLA: integrations (Integraciones externas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  integration_type VARCHAR(50) NOT NULL, -- 'slack', 'teams', 'google', 'zoom', 'banking'
  credentials JSONB NOT NULL, -- Encriptado en la app
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  configuration JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(tenant_id, integration_type)
);

-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE QUERIES
-- ============================================================================

-- Índices en users
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_is_super_admin ON users(is_super_admin);

-- Índices en employees
CREATE INDEX idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_position_id ON employees(position_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);
CREATE INDEX idx_employees_tenant_status ON employees(tenant_id, status);

-- Índices en departments
CREATE INDEX idx_departments_tenant_id ON departments(tenant_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_department_id);
CREATE INDEX idx_departments_manager_id ON departments(manager_id);

-- Índices en positions
CREATE INDEX idx_positions_tenant_id ON positions(tenant_id);
CREATE INDEX idx_positions_department_id ON positions(department_id);

-- Índices en attendance
CREATE INDEX idx_attendance_tenant_id ON attendance(tenant_id);
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_employee_date ON attendance(tenant_id, employee_id, date);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Índices en leaves
CREATE INDEX idx_leaves_tenant_id ON leaves(tenant_id);
CREATE INDEX idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_leaves_start_date ON leaves(start_date);
CREATE INDEX idx_leaves_employee_status ON leaves(tenant_id, employee_id, status);

-- Índices en leave_balances
CREATE INDEX idx_leave_balances_tenant_id ON leave_balances(tenant_id);
CREATE INDEX idx_leave_balances_employee_id ON leave_balances(employee_id);
CREATE INDEX idx_leave_balances_leave_type_id ON leave_balances(leave_type_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);

-- Índices en payroll
CREATE INDEX idx_payroll_tenant_id ON payroll(tenant_id);
CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX idx_payroll_status ON payroll(status);
CREATE INDEX idx_payroll_period ON payroll(payroll_period);
CREATE INDEX idx_payroll_employee_period ON payroll(tenant_id, employee_id, payroll_period);

-- Índices en documents
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_employee_id ON documents(employee_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_expiry_date ON documents(expiry_date);

-- Índices en audit_logs
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Índices en notifications
CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- Índices en roles
CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX idx_roles_name ON roles(name);

-- Índices en announcements
CREATE INDEX idx_announcements_tenant_id ON announcements(tenant_id);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_published_at ON announcements(published_at);

-- Índices en performance_reviews
CREATE INDEX idx_performance_reviews_tenant_id ON performance_reviews(tenant_id);
CREATE INDEX idx_performance_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_reviewer_id ON performance_reviews(reviewer_id);

-- Índices en skills
CREATE INDEX idx_skills_tenant_id ON skills(tenant_id);

-- Índices en employee_skills
CREATE INDEX idx_employee_skills_tenant_id ON employee_skills(tenant_id);
CREATE INDEX idx_employee_skills_employee_id ON employee_skills(employee_id);
CREATE INDEX idx_employee_skills_skill_id ON employee_skills(skill_id);

-- ============================================================================
-- COMENTARIOS EN TABLAS Y COLUMNAS (para documentación)
-- ============================================================================

COMMENT ON TABLE tenants IS 'Almacena información de las empresas clientes en la arquitectura multi-tenant';
COMMENT ON TABLE users IS 'Usuarios del sistema con soporte a multi-tenant';
COMMENT ON TABLE employees IS 'Registro de empleados con información personal y laboral completa';
COMMENT ON TABLE attendance IS 'Control de asistencia y entrada/salida de empleados';
COMMENT ON TABLE leaves IS 'Solicitudes y gestión de licencias/vacaciones';
COMMENT ON TABLE payroll IS 'Nómina y recibos de sueldo';
COMMENT ON TABLE documents IS 'Gestión de documentos de empleados (contratos, certificados, etc.)';
COMMENT ON TABLE audit_logs IS 'Registro de auditoría para compliance y seguridad';

-- ============================================================================
-- FIN DEL SCRIPT SQL
-- ============================================================================
