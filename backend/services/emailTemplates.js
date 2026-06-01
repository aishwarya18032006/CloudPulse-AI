export const OTP_EMAIL_SUBJECT = "CloudPulse AI - Email Verification";

export const buildOtpEmailHtml = (otp) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${OTP_EMAIL_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6fb;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6fb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(12,13,18,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#0891b2 100%);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">CloudPulse AI</h1>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.9);">Enterprise Cloud Intelligence</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#0c0d12;">Hello User,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5c6370;">
                Your CloudPulse AI verification code is:
              </p>
              <div style="text-align:center;margin:0 0 28px;padding:20px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;">
                <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#2563eb;font-family:ui-monospace,Consolas,monospace;">${otp}</span>
              </div>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#5c6370;">
                This code expires in <strong style="color:#0c0d12;">5 minutes</strong>.
              </p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#94a3b8;">
                If you did not request this verification, ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e8ecf4;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">&copy; ${new Date().getFullYear()} CloudPulse AI. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const buildOtpEmailText = (otp) => `Hello User,

Your CloudPulse AI verification code is:

${otp}

This code expires in 5 minutes.

If you did not request this verification, ignore this email.

— CloudPulse AI`;
