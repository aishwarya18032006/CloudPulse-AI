import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

/**
 * Tracks applied migrations in schema_migrations table.
 */
async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations() {
  const { rows } = await pool.query("SELECT filename FROM schema_migrations ORDER BY filename");
  return new Set(rows.map((r) => r.filename));
}

export async function runMigrations({ log = true } = {}) {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    if (log) console.log("[Migrate] No migrations directory found");
    return { applied: [] };
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const newlyApplied = [];

  for (const file of files) {
    if (applied.has(file)) {
      if (log) console.log(`[Migrate] Skip (already applied): ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    if (log) console.log(`[Migrate] Applying: ${file}`);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      newlyApplied.push(file);
      if (log) console.log(`[Migrate] OK: ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(`Migration ${file} failed: ${err.message}`);
    } finally {
      client.release();
    }
  }

  return { applied: newlyApplied };
}
