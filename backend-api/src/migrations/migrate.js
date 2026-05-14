const fs = require("fs");
const path = require("path");
const pool = require("../config/database");

const MIGRATIONS_DIR = path.join(__dirname);
const MIGRATIONS_TABLE = "schema_migrations";

const ensureMigrationsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};

const getExecutedMigrations = async () => {
  const query = `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY id;`;
  const result = await pool.query(query);
  return result.rows.map((row) => row.name);
};

const markMigrationExecuted = async (name) => {
  const query = `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1);`;
  await pool.query(query, [name]);
};

const unmarkMigrationExecuted = async (name) => {
  const query = `DELETE FROM ${MIGRATIONS_TABLE} WHERE name = $1;`;
  await pool.query(query, [name]);
};

const getMigrationFiles = () => {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".js") && file !== "migrate.js")
    .sort();
};

const runMigrations = async (direction = "up") => {
  try {
    await ensureMigrationsTable();
    const executedMigrations = await getExecutedMigrations();
    const migrationFiles = getMigrationFiles();

    for (const file of migrationFiles) {
      const migrationName = path.parse(file).name;

      if (direction === "up" && executedMigrations.includes(migrationName)) {
        console.log(`Migration ${migrationName} already executed, skipping.`);
        continue;
      }

      if (direction === "down" && !executedMigrations.includes(migrationName)) {
        console.log(`Migration ${migrationName} not executed, skipping.`);
        continue;
      }

      const migration = require(path.join(MIGRATIONS_DIR, file));

      if (direction === "up") {
        console.log(`Running migration up: ${migrationName}`);
        await migration.up(pool);
        await markMigrationExecuted(migrationName);
      } else if (direction === "down") {
        console.log(`Running migration down: ${migrationName}`);
        await migration.down(pool);
        await unmarkMigrationExecuted(migrationName);
      }
    }

    console.log("Migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

const command = process.argv[2] || "up";
runMigrations(command);
