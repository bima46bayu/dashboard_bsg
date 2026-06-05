-- Atlas / Project Monitoring — initial schema

CREATE TABLE IF NOT EXISTS partners (
  id          VARCHAR(32) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  type        VARCHAR(64) NOT NULL,
  email       VARCHAR(255) NOT NULL DEFAULT '',
  phone       VARCHAR(64) NOT NULL DEFAULT '',
  tab         VARCHAR(32) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_tab ON partners (tab);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners (type);

CREATE TABLE IF NOT EXISTS projects (
  id          VARCHAR(32) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  customer    VARCHAR(255) NOT NULL DEFAULT '',
  pm          TEXT NOT NULL DEFAULT '',
  value       NUMERIC(14, 2) NOT NULL DEFAULT 0,
  project_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status      VARCHAR(32) NOT NULL DEFAULT 'Draft',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_items (
  id          VARCHAR(32) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  satuan      VARCHAR(64) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category    VARCHAR(64) NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_indirect_costs (
  id          VARCHAR(32) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  satuan      VARCHAR(64) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category    VARCHAR(64) NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
