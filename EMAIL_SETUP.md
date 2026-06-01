# Gmail SMTP setup for CloudPulse AI OTP

## 1. Enable 2-Step Verification

Google Account → Security → 2-Step Verification → ON

## 2. Create App Password

1. Go to https://myaccount.google.com/apppasswords
2. App: **Mail**, Device: **Other** → name it `CloudPulse AI`
3. Copy the **16-character** password (no spaces)

## 3. Configure `.env`

```env
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=CloudPulse AI <your.email@gmail.com>
```

Spaces in the app password are stripped automatically; you may also paste without spaces.

**Save `.env` in the project root** (`CloudPulse-AI/.env`, same folder as `package.json`) and restart the API. If the editor shows credentials but startup logs `SMTP_USER loaded = false`, the file on disk is still empty — press Save and restart.

Quote values that contain spaces:

```env
SMTP_PASS="xxxx xxxx xxxx xxxx"
SMTP_FROM="CloudPulse AI <your.email@gmail.com>"
```

## 4. Upgrade database (if you migrated before OTP hashing)

```bash
npm run db:upgrade-otp
```

## 5. Restart API

```bash
npm run dev:server
```

You should see:

```
[Env] SMTP_USER loaded = true
[Env] SMTP_PASS loaded = true
[Env] SMTP fully configured = true
```

And:

```
[SMTP] [INFO] SMTP connection verified successfully
[Server] Gmail SMTP ready for OTP delivery
```

## Development vs production

| Mode | `NODE_ENV` | SMTP missing | OTP behavior |
|------|------------|--------------|--------------|
| Dev | `development` | Allowed | Logs to console |
| Prod | `production` | **Blocked** | Must send via Gmail |

## Troubleshooting

- **EAUTH**: Wrong app password or `SMTP_USER` not the Gmail address
- **Connection failed**: Check firewall; port 587 outbound allowed
- **Email not received**: Check spam; verify registrant email is correct
