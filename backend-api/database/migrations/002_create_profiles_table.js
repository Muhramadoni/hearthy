/**
 * Migration: 002_create_profiles_table
 * Creates: profiles table (linked to users)
 * Columns: id, user_id, phone, address, created_at, updated_at
 */

module.exports = {
  up: async (pool) => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        phone      VARCHAR(20),
        address    TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
