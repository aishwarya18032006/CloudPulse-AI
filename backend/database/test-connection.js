import "../config/env.js";
import pg from "pg";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL is missing in .env");
  process.exit(1);
}

// Show host/port/db without exposing password
try {
  const parsed = new URL(url.replace(/^postgresql:/, "http:"));
  console.log("Trying connection to:");
  console.log(`  Host: ${parsed.hostname}`);
  console.log(`  Port: ${parsed.port || 5432}`);
  console.log(`  User: ${parsed.username}`);
  console.log(`  Database: ${parsed.pathname?.slice(1) || "(default)"}`);
  console.log("");
} catch {
  console.log("DATABASE_URL format check failed — use:");
  console.log("  postgresql://postgres:YOUR_PASSWORD@localhost:5432/cloudpulse");
}

const client = new pg.Client({
  connectionString: url,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

client
  .connect()
  .then(() => {
    console.log("Connection successful.");
    return client.end();
  })
  .catch((err) => {
    if (err.code === "28P01") {
      console.error("\nPassword authentication failed.");
      console.error("Edit .env and set the password you chose when installing PostgreSQL:");
      console.error("  DATABASE_URL=postgresql://postgres:YOUR_REAL_PASSWORD@localhost:5432/cloudpulse");
      console.error("\nIf you forgot it, reset via pgAdmin or see DATABASE_SETUP.md");
    } else if (err.code === "3D000") {
      console.error("\nDatabase does not exist. Create it in psql:");
      console.error("  CREATE DATABASE cloudpulse;");
    } else {
      console.error("\n", err.message);
    }
    process.exit(1);
  });
