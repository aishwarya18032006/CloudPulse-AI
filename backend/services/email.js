// OTP disabled for hackathon deployment

import nodemailer from "nodemailer";
import { getSmtpSettings, isSmtpConfigured } from "../config/env.js";
import { OTP_EMAIL_SUBJECT, buildOtpEmailHtml, buildOtpEmailText } from "./emailTemplates.js";

export { isSmtpConfigured };

const isProduction = process.env.NODE_ENV === "production";

const logSmtp = (level, message, meta = {}) => {
  const ts = new Date().toISOString();
  const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  const line = `[${ts}] [SMTP] [${level}] ${message}${extra}`;
  if (level === "ERROR") console.error(line);
  else if (level === "WARN") console.warn(line);
  else console.log(line);
};

const createTransporter = () => {
  const { host, port, secure, user, pass } = getSmtpSettings();

  logSmtp("INFO", "Creating mail transporter", {
    host,
    port,
    secure,
    authConfigured: Boolean(user && pass),
  });

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      minVersion: "TLSv1.2",
    },
  });
};

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

export class EmailDeliveryError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "EmailDeliveryError";
    this.code = "EMAIL_SEND_FAILED";
    this.cause = cause;
  }
}

/**
 * Send OTP to the registrant's email. Never logs OTP in production.
 */
export const sendOtpEmail = async (toEmail, otp, recipientName = "User") => {
  const to = toEmail?.trim().toLowerCase();
  if (!to) {
    throw new EmailDeliveryError("Recipient email address is required.");
  }

  if (!isSmtpConfigured()) {
    if (isProduction) {
      throw new EmailDeliveryError(
        "Email service is not configured. Contact support or try again later."
      );
    }
    logSmtp("WARN", "DEV FALLBACK: OTP not sent via email (SMTP not configured)", {
      to,
      hint: "Set SMTP_USER and SMTP_PASS for Gmail delivery",
    });
    console.log(`[DEV ONLY] OTP for ${to}: ${otp}`);
    return { sent: false, devFallback: true };
  }

  const { user, from: fromEnv } = getSmtpSettings();
  const from = fromEnv || `"CloudPulse AI" <${user}>`;
  const html = buildOtpEmailHtml(otp).replace(/Hello User/g, `Hello ${recipientName}`);
  const text = buildOtpEmailText(otp).replace(/Hello User/g, `Hello ${recipientName}`);

  const mailOptions = {
    from,
    to,
    subject: OTP_EMAIL_SUBJECT,
    html,
    text,
  };

  logSmtp("INFO", "Sending verification email", { to, subject: OTP_EMAIL_SUBJECT });

  try {
    const info = await getTransporter().sendMail(mailOptions);
    logSmtp("INFO", "Verification email sent", {
      to,
      messageId: info.messageId,
      response: info.response,
    });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    logSmtp("ERROR", "Failed to send verification email", {
      to,
      message: err.message,
      code: err.code,
      command: err.command,
    });

    let userMessage =
      "We could not send the verification email. Please check your email address and try again.";

    if (err.code === "EAUTH") {
      userMessage =
        "Email server authentication failed. Verify SMTP_USER and SMTP App Password in server configuration.";
    } else if (err.code === "ESOCKET" || err.code === "ECONNECTION") {
      userMessage =
        "Could not connect to the email server. Please try again in a few minutes.";
    } else if (err.responseCode === 550 || err.responseCode === 553) {
      userMessage = "The email address could not receive messages. Please use a valid email.";
    }

    throw new EmailDeliveryError(userMessage, err);
  }
};

/** Future: alert emails */
export const sendAlertEmail = async (to, subject, body) => {
  if (!isSmtpConfigured()) {
    if (!isProduction) {
      logSmtp("WARN", "DEV ALERT (not sent)", { to, subject });
    }
    return { sent: false, devFallback: true };
  }

  await getTransporter().sendMail({
    from: getSmtpSettings().from || `"CloudPulse AI" <${getSmtpSettings().user}>`,
    to,
    subject,
    html: body,
  });
  return { sent: true };
};
