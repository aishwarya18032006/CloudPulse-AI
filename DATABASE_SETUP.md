# PostgreSQL setup for CloudPulse AI

`ECONNREFUSED` on port **5432** means PostgreSQL is **not running** on your machine (or not installed).

Your `.env` expects:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/cloudpulse
```

---

## Option A — Install PostgreSQL on Windows (local)

1. Download the installer: https://www.postgresql.org/download/windows/
2. Run the installer (default port **5432**).
3. Set a password for the `postgres` user — remember it.
4. Open **SQL Shell (psql)** from the Start menu and run:

```sql
CREATE DATABASE cloudpulse;
```

5. Edit `.env` and set your real password:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/cloudpulse
DATABASE_SSL=false
```

6. Ensure the service is running:
   - Win + R → `services.msc` → find **postgresql** → Start

7. Migrate:

```bash
npm run db:migrate
```

---

## Option B — Neon (free cloud, fastest if you skip local install)

1. Go to https://neon.tech and create a free account.
2. Create a project → open **Connection details**.
3. Copy the **connection string** (pooled or direct).
4. Paste into `.env`:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
DATABASE_SSL=true
```

5. Run:

```bash
npm run db:migrate
```

---

## After migration succeeds

```bash
npm run dev
```

Register a new account → OTP appears in the **API terminal** if SMTP is not configured.
