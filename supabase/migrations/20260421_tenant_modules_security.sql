-- ============================================================
-- ConectAr HR — Tenant Modules, HotFixes & Security Events
-- Migration: 20260421_tenant_modules_security
-- ============================================================

-- ─── 1. System modules catalog (owner-managed) ──────────────────────────────

CREATE TABLE IF NOT EXISTS system_modules (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key           TEXT        NOT NULL UNIQUE,          -- e.g. 'attendance', 'recruitment'
  label         TEXT        NOT NULL,
  description   TEXT,
  icon          TEXT,                                 -- Lucide icon name
  version       TEXT        NOT NULL DEFAULT '1.0.0',
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,    -- globally available
  requires      TEXT[]      DEFAULT '{}',             -- module keys this depends on
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Per-tenant module licensing ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tenant_modules (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module_key    TEXT        NOT NULL REFERENCES system_modules(key) ON DELETE CASCADE,
  enabled       BOOLEAN     NOT NULL DEFAULT FALSE,
  licensed_at   TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,                          -- NULL = perpetual
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, module_key)
);

-- ─── 3. HotFixes / update distribution ──────────────────────────────────────

CREATE TYPE hotfix_type   AS ENUM ('bugfix', 'feature', 'security', 'performance');
CREATE TYPE hotfix_scope  AS ENUM ('global', 'specific');
CREATE TYPE hotfix_status AS ENUM ('draft', 'published', 'rolled_back');

CREATE TABLE IF NOT EXISTS hotfixes (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT          NOT NULL,
  description     TEXT          NOT NULL,
  type            hotfix_type   NOT NULL DEFAULT 'feature',
  scope           hotfix_scope  NOT NULL DEFAULT 'global',
  status          hotfix_status NOT NULL DEFAULT 'draft',
  version         TEXT          NOT NULL,
  changelog       TEXT,
  target_tenants  UUID[]        DEFAULT '{}',    -- empty = all (when scope=global)
  target_modules  TEXT[]        DEFAULT '{}',    -- empty = system-wide
  published_at    TIMESTAMPTZ,
  published_by    UUID,                          -- owner user id
  rolled_back_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Tenants that received a specific hotfix (acknowledgement log)
CREATE TABLE IF NOT EXISTS hotfix_deliveries (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hotfix_id   UUID        NOT NULL REFERENCES hotfixes(id) ON DELETE CASCADE,
  tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at  TIMESTAMPTZ,
  UNIQUE(hotfix_id, tenant_id)
);

-- ─── 4. Security events log ─────────────────────────────────────────────────

CREATE TYPE security_event_type AS ENUM (
  'rate_limit_exceeded',
  'failed_login',
  'invalid_session',
  'sql_injection_attempt',
  'xss_attempt',
  'path_traversal_attempt',
  'unauthorized_access',
  'suspicious_ip',
  'csrf_violation',
  'session_hijack_attempt'
);

CREATE TABLE IF NOT EXISTS security_events (
  id          UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  security_event_type NOT NULL,
  ip          INET,
  user_agent  TEXT,
  pathname    TEXT,
  user_id     UUID,
  tenant_id   UUID,
  payload     JSONB               DEFAULT '{}',  -- sanitized request details
  severity    SMALLINT            NOT NULL DEFAULT 1 CHECK (severity BETWEEN 1 AND 5),
  resolved    BOOLEAN             NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_events_type       ON security_events(event_type);
CREATE INDEX idx_security_events_ip         ON security_events(ip);
CREATE INDEX idx_security_events_tenant     ON security_events(tenant_id);
CREATE INDEX idx_security_events_created    ON security_events(created_at DESC);
CREATE INDEX idx_security_events_unresolved ON security_events(resolved) WHERE resolved = FALSE;

-- ─── 5. Audit log (all sensitive owner/admin actions) ───────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID        NOT NULL,   -- user who performed the action
  actor_role  TEXT        NOT NULL,
  tenant_id   UUID,
  action      TEXT        NOT NULL,   -- e.g. 'tenant.module.enabled', 'hotfix.published'
  entity_type TEXT,                   -- e.g. 'tenant', 'hotfix', 'employee'
  entity_id   TEXT,
  before      JSONB,
  after       JSONB,
  ip          INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor   ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_tenant  ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_action  ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ─── 6. IP blocklist (manual + auto-escalation) ─────────────────────────────

CREATE TABLE IF NOT EXISTS blocked_ips (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ip          INET        NOT NULL UNIQUE,
  reason      TEXT,
  blocked_by  UUID,                   -- NULL = auto (rate limiter escalation)
  expires_at  TIMESTAMPTZ,            -- NULL = permanent
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blocked_ips_ip ON blocked_ips(ip);

-- ─── 7. RLS policies ────────────────────────────────────────────────────────

ALTER TABLE system_modules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_modules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotfixes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotfix_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips      ENABLE ROW LEVEL SECURITY;

-- system_modules: readable by everyone, writable only by service role
CREATE POLICY "system_modules_read_all"
  ON system_modules FOR SELECT USING (TRUE);

-- tenant_modules: tenant sees own rows; owner sees all (via service role in API)
CREATE POLICY "tenant_modules_read_own"
  ON tenant_modules FOR SELECT
  USING (tenant_id = auth_tenant_id());

-- security_events / audit_logs / blocked_ips: owner-only via service role
-- (no public RLS policy — API routes use service role key)

-- ─── 8. Helper: updated_at auto-trigger ─────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_system_modules_updated_at
  BEFORE UPDATE ON system_modules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tenant_modules_updated_at
  BEFORE UPDATE ON tenant_modules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hotfixes_updated_at
  BEFORE UPDATE ON hotfixes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 9. Seed: initial system modules ────────────────────────────────────────

INSERT INTO system_modules (key, label, description, icon, version) VALUES
  ('dashboard',          'Dashboard',              'Panel principal de indicadores',          'LayoutDashboard', '1.0.0'),
  ('employees',          'Directorio de Empleados','Gestión completa de empleados',           'Users',           '1.0.0'),
  ('attendance',         'Asistencia',             'Control de asistencia con geolocalización','Clock',          '1.0.0'),
  ('leave',              'Licencias y Ausencias',  'Gestión de vacaciones y licencias',       'CalendarOff',     '1.0.0'),
  ('payslips',           'Recibos de Sueldo',      'Generación y consulta de recibos',        'FileText',        '1.0.0'),
  ('recruitment',        'Reclutamiento',          'Pipeline de candidatos y ofertas',        'UserPlus',        '1.0.0'),
  ('organization-chart', 'Organigrama',            'Estructura organizacional visual',        'GitBranch',       '1.0.0'),
  ('communications',     'Comunicaciones',         'Comunicados y mensajería interna',        'MessageSquare',   '1.0.0'),
  ('my-portal',          'Portal del Empleado',    'Portal de autoservicio del empleado',     'User',            '1.0.0'),
  ('community',          'Comunidad',              'Feed de novedades e interacción',         'Globe',           '1.0.0')
ON CONFLICT (key) DO NOTHING;

-- ─── 10. Seed: enable all modules for the demo tenant ───────────────────────

INSERT INTO tenant_modules (tenant_id, module_key, enabled, licensed_at)
SELECT
  'c0nec7ar-0001-0001-0001-000000000001'::UUID,
  key,
  TRUE,
  NOW()
FROM system_modules
ON CONFLICT (tenant_id, module_key) DO NOTHING;
