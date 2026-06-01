import "../config/env.js";
import pool from "./pool.js";
import { validateDatabaseSchema } from "./validateSchema.js";

const cols = await pool.query(
  `SELECT column_name, is_nullable FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'otp_codes'
   ORDER BY ordinal_position`
);
const users = await pool.query("SELECT COUNT(*)::int AS n FROM users");
const validation = await validateDatabaseSchema();

console.log("otp_codes columns:");
console.table(cols.rows);
console.log("Users preserved:", users.rows[0].n);
console.log("Schema valid:", validation.valid);
if (!validation.valid) console.log("Errors:", validation.errors);

await pool.end();
