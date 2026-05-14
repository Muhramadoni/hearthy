-- ============================================================
-- Hearthy Database Migration: 001
-- Creates: users, profiles, assessments tables
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20)  DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active   BOOLEAN      DEFAULT true,
  last_login  TIMESTAMP WITH TIME ZONE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── PROFILES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age                 INTEGER CHECK (age >= 1 AND age <= 150),
  gender              VARCHAR(30) CHECK (gender IN ('male','female','non-binary','prefer_not_to_say')),
  height              DECIMAL(5,2),
  weight              DECIMAL(5,2),
  blood_type          VARCHAR(5)  CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  activity_level      VARCHAR(30) DEFAULT 'moderate' CHECK (activity_level IN ('sedentary','lightly_active','moderate','very_active','extra_active')),
  health_goals        JSONB DEFAULT '[]',
  medical_conditions  JSONB DEFAULT '[]',
  medications         JSONB DEFAULT '[]',
  avatar_url          TEXT,
  bio                 TEXT,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ── ASSESSMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type             VARCHAR(50) NOT NULL CHECK (type IN ('mental_health','physical','sleep','nutrition','stress')),
  answers          JSONB NOT NULL DEFAULT '{}',
  score            INTEGER,
  max_score        INTEGER,
  severity         VARCHAR(30),
  recommendations  JSONB DEFAULT '[]',
  ai_insights      TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id   ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_type       ON assessments(type);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);

-- ── TRIGGERS ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trg_users_updated_at    ON users;
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
