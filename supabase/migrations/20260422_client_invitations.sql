-- ============================================================
-- ConectAr HR — Client Invitations & Tenant Provisioning
-- Migration: 20260422_client_invitations
-- ============================================================

-- ─── Client invitation tokens ────────────────────────────────────────────────

CREATE TYPE invitation_status AS ENUM ('pending', 'activated', 'expired', 'cancelled');

CREATE TABLE IF NOT EXISTS client_invitations (
  id            UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  token         TEXT              NOT NULL UNIQUE,
  company_name  TEXT              NOT NULL,
  admin_email   TEXT              NOT NULL,
  plan          TEXT              NOT NULL DEFAULT 'starter',
  modules       TEXT[]            NOT NULL DEFAULT '{}',
  status        invitation_status NOT NULL DEFAULT 'pending',
  expires_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW() + INTERVAL '48 hours',
  activated_at  TIMESTAMPTZ,
  cancelled_at  TIMESTAMPTZ,
  tenant_id     UUID              REFERENCES tenants(id) ON DELETE SET NULL,
  created_by    UUID,             -- owner user id
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitations_token      ON client_invitations(token);
CREATE INDEX idx_invitations_email      ON client_invitations(admin_email);
CREATE INDEX idx_invitations_status     ON client_invitations(status);
CREATE INDEX idx_invitations_expires    ON client_invitations(expires_at);

-- Auto-expire: job/cron can call this function periodically
CREATE OR REPLACE FUNCTION expire_invitations()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE client_invitations
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$;

-- ─── Tenant provisioning log ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tenant_provisioning_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invitation_id UUID        REFERENCES client_invitations(id) ON DELETE SET NULL,
  step          TEXT        NOT NULL,   -- 'tenant_created', 'admin_created', 'modules_assigned', etc.
  status        TEXT        NOT NULL DEFAULT 'completed', -- 'completed' | 'failed'
  details       JSONB       DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE client_invitations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_provisioning_log  ENABLE ROW LEVEL SECURITY;

-- Invitations: only service role (owner API uses service role key)
-- Provisioning log: same

-- ─── Helper: provision a new tenant from an invitation ───────────────────────
-- Called by the activation API after password validation.

CREATE OR REPLACE FUNCTION provision_tenant_from_invitation(
  p_invitation_id UUID,
  p_password_hash TEXT
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_inv    client_invitations%ROWTYPE;
  v_tenant UUID;
  v_user   UUID;
  v_module TEXT;
BEGIN
  -- 1. Lock and validate invitation
  SELECT * INTO v_inv FROM client_invitations WHERE id = p_invitation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF v_inv.status <> 'pending' THEN RAISE EXCEPTION 'Invitation already %', v_inv.status; END IF;
  IF v_inv.expires_at < NOW() THEN
    UPDATE client_invitations SET status = 'expired' WHERE id = p_invitation_id;
    RAISE EXCEPTION 'Invitation expired';
  END IF;

  -- 2. Create tenant
  INSERT INTO tenants (name, plan, status)
  VALUES (v_inv.company_name, v_inv.plan, 'active')
  RETURNING id INTO v_tenant;

  -- 3. Create admin user
  INSERT INTO users (email, password_hash, role, tenant_id, full_name)
  VALUES (v_inv.admin_email, p_password_hash, 'admin', v_tenant, v_inv.company_name)
  RETURNING id INTO v_user;

  -- 4. Assign modules
  FOREACH v_module IN ARRAY v_inv.modules LOOP
    INSERT INTO tenant_modules (tenant_id, module_key, enabled, licensed_at)
    VALUES (v_tenant, v_module, TRUE, NOW())
    ON CONFLICT (tenant_id, module_key) DO UPDATE SET enabled = TRUE;
  END LOOP;

  -- 5. Always enable dashboard
  INSERT INTO tenant_modules (tenant_id, module_key, enabled, licensed_at)
  VALUES (v_tenant, 'dashboard', TRUE, NOW())
  ON CONFLICT (tenant_id, module_key) DO UPDATE SET enabled = TRUE;

  -- 6. Mark invitation activated
  UPDATE client_invitations
  SET status = 'activated', activated_at = NOW(), tenant_id = v_tenant
  WHERE id = p_invitation_id;

  -- 7. Log provisioning
  INSERT INTO tenant_provisioning_log (tenant_id, invitation_id, step, details)
  VALUES (v_tenant, p_invitation_id, 'tenant_provisioned', jsonb_build_object(
    'admin_email', v_inv.admin_email,
    'plan',        v_inv.plan,
    'modules',     v_inv.modules
  ));

  RETURN v_tenant;
END;
$$;
