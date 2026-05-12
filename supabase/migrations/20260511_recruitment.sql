-- ============================================================
-- ConectAr HR — Recruitment Module
-- Migration: 20260511_recruitment
-- ============================================================

-- ─── Recruitment Positions (Vacantes) ───────────────────────

CREATE TABLE IF NOT EXISTS recruitment_positions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  department_id UUID        REFERENCES departments(id) ON DELETE SET NULL,
  description   TEXT,
  requirements  TEXT,
  salary_min    NUMERIC(12,2),
  salary_max    NUMERIC(12,2),
  work_mode     TEXT        NOT NULL DEFAULT 'Presencial',
  location      TEXT,
  status        TEXT        NOT NULL DEFAULT 'open',    -- open | on_hold | closed
  priority      TEXT        NOT NULL DEFAULT 'normal',  -- low | normal | high | urgent
  openings      INTEGER     NOT NULL DEFAULT 1,
  created_by    UUID        REFERENCES users(id) ON DELETE SET NULL,
  deadline      DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT recruitment_positions_status_check CHECK (status IN ('open','on_hold','closed')),
  CONSTRAINT recruitment_positions_priority_check CHECK (priority IN ('low','normal','high','urgent'))
);

CREATE INDEX idx_recr_pos_tenant   ON recruitment_positions(tenant_id);
CREATE INDEX idx_recr_pos_status   ON recruitment_positions(status);
CREATE INDEX idx_recr_pos_dept     ON recruitment_positions(department_id);

-- ─── Candidates ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS candidates (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  position_id     UUID        NOT NULL REFERENCES recruitment_positions(id) ON DELETE CASCADE,
  full_name       TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  phone           TEXT,
  linkedin_url    TEXT,
  cv_url          TEXT,
  source          TEXT        DEFAULT 'portal',  -- linkedin | referral | portal | direct | agency
  stage           TEXT        NOT NULL DEFAULT 'new',
  -- Stages: new → screening → interview → technical → offer → hired | rejected
  rating          INTEGER     CHECK (rating BETWEEN 1 AND 5),
  notes           TEXT,
  assigned_to     UUID        REFERENCES users(id) ON DELETE SET NULL,
  applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT candidates_stage_check CHECK (
    stage IN ('new','screening','interview','technical','offer','hired','rejected')
  )
);

CREATE INDEX idx_candidates_tenant   ON candidates(tenant_id);
CREATE INDEX idx_candidates_position ON candidates(position_id);
CREATE INDEX idx_candidates_stage    ON candidates(stage);
CREATE INDEX idx_candidates_email    ON candidates(email);

-- ─── Interviews ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS candidate_interviews (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  candidate_id     UUID        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interviewer_id   UUID        REFERENCES users(id) ON DELETE SET NULL,
  interview_type   TEXT        NOT NULL DEFAULT 'hr',  -- hr | technical | managerial | cultural
  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER     NOT NULL DEFAULT 60,
  location         TEXT,
  meeting_url      TEXT,
  notes            TEXT,
  outcome          TEXT        NOT NULL DEFAULT 'pending',  -- pending | passed | failed | cancelled
  score            INTEGER     CHECK (score BETWEEN 1 AND 10),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT interviews_type_check CHECK (interview_type IN ('hr','technical','managerial','cultural')),
  CONSTRAINT interviews_outcome_check CHECK (outcome IN ('pending','passed','failed','cancelled'))
);

CREATE INDEX idx_interviews_candidate ON candidate_interviews(candidate_id);
CREATE INDEX idx_interviews_tenant    ON candidate_interviews(tenant_id);

-- ─── Updated-at trigger ─────────────────────────────────────

CREATE OR REPLACE FUNCTION trg_recruitment_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_recr_pos_updated_at
  BEFORE UPDATE ON recruitment_positions
  FOR EACH ROW EXECUTE FUNCTION trg_recruitment_updated_at();

CREATE TRIGGER trg_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION trg_recruitment_updated_at();

-- ─── RLS ────────────────────────────────────────────────────

ALTER TABLE recruitment_positions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates             ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_interviews   ENABLE ROW LEVEL SECURITY;

-- Tenant isolation — all authenticated users of the tenant can read
CREATE POLICY recr_pos_tenant_read ON recruitment_positions
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY recr_pos_admin_write ON recruitment_positions
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY candidates_tenant_read ON candidates
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY candidates_admin_write ON candidates
  FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY interviews_tenant_read ON candidate_interviews
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY interviews_admin_write ON candidate_interviews
  FOR ALL USING (tenant_id = get_current_tenant_id());
