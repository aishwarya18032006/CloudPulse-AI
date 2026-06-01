/** @deprecated Use: npm run db:migrate */
import "../config/env.js";
import pool from "./pool.js";
import { runMigrations } from "./runMigrations.js";
import { logSchemaValidation } from "./validateSchema.js";

console.log("Note: db:upgrade-otp is deprecated. Running full migration pipeline…\n");

runMigrations({ log: true })
  .then(() => logSchemaValidation())
  .then((v) => {
    if (!v.valid) process.exit(1);
    return pool.end();
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
