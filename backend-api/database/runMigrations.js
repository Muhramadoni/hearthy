/**
 * @fileoverview Skrip Migrasi Database (Migration Runner).
 * Mengotomatiskan penerapan (UP) dan pembatalan (DOWN) struktur skema tabel ke database PostgreSQL.
 * Penggunaan:
 *   node database/runMigrations.js up    ← Menjalankan semua migrasi yang belum dieksekusi
 *   node database/runMigrations.js down  ← Membatalkan *batch* migrasi terakhir
 *   node database/runMigrations.js down all  ← Membatalkan SELURUH migrasi
 */

const fs   = require('fs');
const path = require('path');
const { pool } = require('./pool');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// ── Ensure tracking table exists ──────────────────────────────
const ensureTrackingTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id          SERIAL PRIMARY KEY,
      filename    VARCHAR(255) UNIQUE NOT NULL,
      batch       INTEGER NOT NULL DEFAULT 1,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
};

// ── Get all .js migration files sorted ───────────────────────
/**
 * Membaca direktori `migrations` dan mengembalikan daftar file `.js` secara terurut.
 * @returns {string[]} Array berisi nama-nama file migrasi.
 */
const getMigrationFiles = () =>
  fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.js'))
    .sort();

// ── UP: Run all pending migrations ───────────────────────────
/**
 * Menjalankan proses migrasi maju (UP).
 * Hanya file migrasi yang belum ada di tabel `schema_migrations` yang akan dijalankan.
 * @returns {Promise<void>}
 */
const migrateUp = async () => {
  await ensureTrackingTable();

  const files = getMigrationFiles();
  const { rows: ran } = await pool.query('SELECT filename FROM schema_migrations');
  const ranSet = new Set(ran.map(r => r.filename));

  const pending = files.filter(f => !ranSet.has(f));

  if (pending.length === 0) {
    console.log('✅ Nothing to migrate — all migrations are up to date.');
    return;
  }

  // Get next batch number
  const { rows: batchRows } = await pool.query('SELECT MAX(batch) AS max_batch FROM schema_migrations');
  const nextBatch = (batchRows[0].max_batch || 0) + 1;

  console.log(`\n📂 Running ${pending.length} pending migration(s)  [batch ${nextBatch}]\n`);

  for (const file of pending) {
    const migration = require(path.join(MIGRATIONS_DIR, file));
    if (typeof migration.up !== 'function') {
      console.warn(`⚠️  Skip: ${file} — no "up" function exported.`);
      continue;
    }

    process.stdout.write(`  ⬆️  UP   ${file} ...`);
    await migration.up(pool);
    await pool.query(
      'INSERT INTO schema_migrations (filename, batch) VALUES ($1, $2)',
      [file, nextBatch]
    );
    console.log(' ✅');
  }

  console.log(`\n🎉 Migration UP completed! (batch ${nextBatch})\n`);
};

// ── DOWN: Rollback last batch (or all) ───────────────────────
/**
 * Menjalankan proses migrasi mundur (DOWN).
 * @param {string} [mode='batch'] - Mode pembatalan: 'batch' (hanya sesi terakhir) atau 'all' (semua).
 * @returns {Promise<void>}
 */
const migrateDown = async (mode = 'batch') => {
  await ensureTrackingTable();

  let toRollback;

  if (mode === 'all') {
    const { rows } = await pool.query(
      'SELECT filename FROM schema_migrations ORDER BY id DESC'
    );
    toRollback = rows.map(r => r.filename);
  } else {
    // Rollback only the latest batch
    const { rows: batchRows } = await pool.query('SELECT MAX(batch) AS max_batch FROM schema_migrations');
    const lastBatch = batchRows[0].max_batch;
    if (!lastBatch) {
      console.log('✅ Nothing to rollback — no migrations have been run.');
      return;
    }
    const { rows } = await pool.query(
      'SELECT filename FROM schema_migrations WHERE batch = $1 ORDER BY id DESC',
      [lastBatch]
    );
    toRollback = rows.map(r => r.filename);
    console.log(`\n📂 Rolling back batch ${lastBatch} (${toRollback.length} migration(s))\n`);
  }

  if (toRollback.length === 0) {
    console.log('✅ Nothing to rollback.');
    return;
  }

  for (const file of toRollback) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Skip: ${file} — file not found.`);
      continue;
    }

    const migration = require(filePath);
    if (typeof migration.down !== 'function') {
      console.warn(`⚠️  Skip: ${file} — no "down" function exported.`);
      continue;
    }

    process.stdout.write(`  ⬇️  DOWN ${file} ...`);
    await migration.down(pool);
    await pool.query('DELETE FROM schema_migrations WHERE filename = $1', [file]);
    console.log(' ✅');
  }

  console.log('\n🎉 Migration DOWN completed!\n');
};

// ── Entry point ───────────────────────────────────────────────
const [,, command, flag] = process.argv;

const run = async () => {
  try {
    if (!command || command === 'up') {
      await migrateUp();
    } else if (command === 'down') {
      await migrateDown(flag === 'all' ? 'all' : 'batch');
    } else {
      console.error(`❌ Unknown command: "${command}". Use "up" or "down".`);
      process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ Migration error:', err.message);
    if (process.env.NODE_ENV === 'development') console.error(err.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

run();
