-- ============================================================================
-- MIGRACIÓN: Geolocalización y Sucursales
-- Fecha: 2026-04-19
-- Descripción: Agrega tabla de sucursales y columnas de lat/lon en asistencia
-- ============================================================================

-- ============================================================================
-- TABLA: branches (Sucursales / Sedes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  country_code VARCHAR(3) DEFAULT 'AR',
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  allowed_radius_meters INTEGER DEFAULT 100,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, name)
);

-- Índice geoespacial para búsquedas por coordenadas
CREATE INDEX IF NOT EXISTS idx_branches_tenant ON branches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_branches_status ON branches(tenant_id, status);

-- ============================================================================
-- COLUMNAS: Coordenadas GPS en asistencia
-- ============================================================================
ALTER TABLE attendance
  ADD COLUMN IF NOT EXISTS check_in_latitude  DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS check_in_longitude DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS check_out_latitude  DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS check_out_longitude DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- ============================================================================
-- TRIGGER: updated_at en branches
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_branches_updated_at ON branches;
CREATE TRIGGER set_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS: Row Level Security para branches
-- ============================================================================
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo ven las sucursales de su tenant
CREATE POLICY "branches_tenant_isolation"
  ON branches FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );
