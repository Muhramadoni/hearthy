const fs   = require('fs');
const path = require('path');
const { pool } = require('./pool');

const runMigrations = async () => {
  const migrationsDir = path.join(__dirname, 'migrations');

  try {
    // Tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id          SERIAL PRIMARY KEY,
        filename    VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`\n📂 Found ${files.length} migration file(s)\n`);

    for (const file of files) {
      const { rows } = await pool.query(
        'SELECT id FROM schema_migrations WHERE filename = $1', [file]
      );

      if (rows.length > 0) {
        console.log(`⏭️  Skip: ${file} (already executed)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await pool.query(sql);
      await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      console.log(`✅ Ran : ${file}`);
    }

    console.log('\n🎉 Migrations completed!\n');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrations();
