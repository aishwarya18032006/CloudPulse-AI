import pool from "./pool.js";
import { SCHEMA_REGISTRY } from "./schemaRegistry.js";

const columnExists = async (table, column) => {
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column]
  );
  return rows.length > 0;
};

const tableExists = async (table) => {
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );
  return rows.length > 0;
};

/**
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export const validateDatabaseSchema = async () => {
  const errors = [];
  const warnings = [];

  for (const [table, spec] of Object.entries(SCHEMA_REGISTRY)) {
    if (!(await tableExists(table))) {
      errors.push(`Missing table: ${table}`);
      continue;
    }

    for (const col of spec.requiredColumns) {
      if (!(await columnExists(table, col))) {
        errors.push(`Missing column: ${table}.${col}`);
      }
    }

    for (const col of spec.deprecatedColumns || []) {
      if (await columnExists(table, col)) {
        warnings.push(`Deprecated column still present: ${table}.${col} (run npm run db:migrate)`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
};

export const logSchemaValidation = async () => {
  const result = await validateDatabaseSchema();

  if (result.warnings.length) {
    result.warnings.forEach((w) => console.warn(`[Schema] WARN: ${w}`));
  }

  if (result.valid) {
    console.log("[Schema] Validation passed — otp_codes.code_hash present");
    return result;
  }

  result.errors.forEach((e) => console.error(`[Schema] ERROR: ${e}`));
  console.error("[Schema] Run: npm run db:migrate");
  return result;
};
