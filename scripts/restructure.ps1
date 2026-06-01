$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

# Backend layout
New-Item -ItemType Directory -Force -Path backend/server, backend/database/migrations, backend/routes, backend/services, backend/middleware, backend/config, backend/controllers | Out-Null

Copy-Item -Recurse -Force server/db/migrations/* backend/database/migrations/
Copy-Item -Force server/db/*.js backend/database/ -ErrorAction SilentlyContinue
Copy-Item -Force server/db/*.sql backend/database/ -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force server/routes/* backend/routes/
Copy-Item -Recurse -Force server/services/* backend/services/
Copy-Item -Recurse -Force server/middleware/* backend/middleware/
Copy-Item -Recurse -Force server/config/* backend/config/
Copy-Item -Recurse -Force server/controllers/* backend/controllers/ -ErrorAction SilentlyContinue
Copy-Item -Force server/index.js backend/server/index.js

# Frontend layout
New-Item -ItemType Directory -Force -Path frontend | Out-Null
if (Test-Path src) { Move-Item -Force src frontend/ }
if (Test-Path public) { Move-Item -Force public frontend/ }
if (Test-Path index.html) { Move-Item -Force index.html frontend/ }
if (Test-Path vite.config.js) { Move-Item -Force vite.config.js frontend/ }
if (Test-Path eslint.config.js) { Move-Item -Force eslint.config.js frontend/ }

Write-Host "Restructure copy complete."
