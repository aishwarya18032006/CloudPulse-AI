import "../config/env.js";
import pool from "./pool.js";
import { runMigrations } from "./runMigrations.js";
import { validateDatabaseSchema, logSchemaValidation } from "./validateSchema.js";

async function migrate() {
  console.log("Running database migrations…\n");
  const { applied } = await runMigrations({ log: true });

  if (applied.length === 0) {
    console.log("\nNo new migrations to apply.");
  } else {
    console.log(`\nApplied ${applied.length} migration(s).`);
  }

  const validation = await logSchemaValidation();
  if (!validation.valid) {
    await pool.end();
    process.exit(1);
  }

  console.log("\nDatabase migration completed successfully.");
  await pool.end();
}

migrate().catch((err) => {
  if (err.code === "ECONNREFUSED") {
    console.error("\nMigration failed: Cannot connect to PostgreSQL. See DATABASE_SETUP.md");
  } else if (err.code === "3D000") {
    console.error('\nMigration failed: Database does not exist. Run: CREATE DATABASE cloudpulse;');
  } else if (err.code === "28P01") {
    console.error("\nMigration failed: Wrong password in DATABASE_URL (.env)");
  } else {
    console.error("\nMigration failed:", err.message || err);
  }
  process.exit(1);
});
