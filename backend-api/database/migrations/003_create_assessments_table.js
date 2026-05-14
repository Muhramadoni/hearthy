/**
 * Migration: 003_create_assessments_table
 * Creates: assessments table (linked to users)
 */

module.exports = {
  up: async (pool) => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type            VARCHAR(50) NOT NULL,
        answers         JSONB        NOT NULL DEFAULT '{}',
        score           INTEGER      NOT NULL DEFAULT 0,
        max_score       INTEGER      NOT NULL DEFAULT 0,
        severity        VARCHAR(30),
        recommendations JSONB        DEFAULT '[]',
        ai_insights     TEXT,
        created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_assessments_type    ON assessments(type);`);

    await pool.query(`
      DROP TRIGGER IF EXISTS trg_assessments_updated_at ON assessments;
      CREATE TRIGGER trg_assessments_updated_at
        BEFORE UPDATE ON assessments
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  down: async (pool) => {
    await pool.query(`DROP TRIGGER IF EXISTS trg_assessments_updated_at ON assessments;`);
    await pool.query(`DROP TABLE IF EXISTS assessments CASCADE;`);
  },
};
