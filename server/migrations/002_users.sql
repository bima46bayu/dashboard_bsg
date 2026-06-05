-- Users for dashboard login

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) NOT NULL UNIQUE,
  name        VARCHAR(255) NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role        VARCHAR(32) NOT NULL DEFAULT 'admin',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Default admin (password: admin123) — change after first login in production
INSERT INTO users (email, name, password_hash, role)
VALUES (
  'admin@atlas.local',
  'Admin',
  '$2b$10$c3mPGteZqMOFxw3u4r5JI.jd5RDUzcxs8hLpRrP/vRpZXx8D.5iDK',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
