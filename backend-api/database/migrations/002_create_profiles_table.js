/**
 * Migration: 002_create_profiles_table
 * Creates: profiles table (linked to users)
 */

module.exports = {
  up: async (pool) => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id            UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        age                INTEGER,
        gender             VARCHAR(20)  CHECK (gender IN ('male', 'female', 'other')),
        height             NUMERIC(5,2),
        weight             NUMERIC(5,2),
        blood_type         VARCHAR(5),
        activity_level     VARCHAR(30)  CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
        health_goals       JSONB        DEFAULT '[]',
        medical_conditions JSONB        DEFAULT '[]',
        medications        JSONB        DEFAULT '[]',
        avatar_url         TEXT,
        bio                TEXT,
        created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);`);

    await pool.query(`
      DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
      CREATE TRIGGER trg_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  down: async (pool) => {
    await pool.query(`DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;`);
    await pool.query(`DROP TABLE IF EXISTS profiles CASCADE;`);
  },
};
