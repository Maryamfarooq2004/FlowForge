/**
 * Pluggable email provider.
 *
 * Transport priority (first one that is configured wins):
 *   1. SMTP via nodemailer   — set SMTP_HOST + SMTP_USER + SMTP_PASS (e.g. Gmail).  ← primary
 *   2. SendGrid REST API     — set SENDGRID_API_KEY.
 *   3. Console transport     — no config: the email (and its action link) is logged
 *                              so every flow works with zero external setup (dev/demo).
 *
 * `sendEmail` never throws to the caller — email delivery must not break the primary
 * operation; failures are logged and swallowed.
 *
 * In non-production, every send is also recorded in a small in-memory ring buffer
 * (see `recordEmail` / `getLastEmailFor`) so automated tests can read the verification
 * / reset link without needing access to a real inbox.
 */

import nodemailer, { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const SENDGRID_ENDPOINT = 'https://api.sendgrid.com/v3/mail/send';

// ── Config detection ──────────────────────────────────────────────

const isSmtpConfigured = (): boolean =>
  !!(process.env.SMTP_HOST?.trim() &&
     process.env.SMTP_USER?.trim() &&
     process.env.SMTP_PASS?.trim());

const isSendgridConfigured = (): boolean => {
  const key = process.env.SENDGRID_API_KEY?.trim();
  return !!key && key !== 'placeholder' && key.length > 20;
};

const getFromAddress = (): string =>
  process.env.SMTP_FROM?.trim() ||
  process.env.SENDGRID_FROM?.trim() ||
  process.env.SMTP_USER?.trim() ||
  'no-reply@flowforge.app';

/** Public base URL of the FRONTEND, used to build action links in emails. */
export const getFrontendUrl = (): string => {
  const explicit = process.env.FRONTEND_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const firstOrigin = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)[0];
  return (firstOrigin || 'http://localhost:5173').replace(/\/$/, '');
};

// ── Dev-only in-memory capture (for automated testing) ────────────

export interface CapturedEmail {
  to: string;
  subject: string;
  link?: string;
  sentAt: string;
  transport: 'smtp' | 'sendgrid' | 'console';
}

const CAPTURE_LIMIT = 50;
const capturedEmails: CapturedEmail[] = [];

/** Pull the first http(s) link out of an email body (the action link). */
const extractLink = (opts: EmailOptions): string | undefined => {
  const href = opts.html.match(/href=["']([^"']+)["']/i)?.[1];
  if (href) return href;
  return (opts.text || opts.html).match(/https?:\/\/[^\s"'<>]+/i)?.[0];
};

const recordEmail = (opts: EmailOptions, transport: CapturedEmail['transport']): void => {
  if (process.env.NODE_ENV === 'production') return;
  capturedEmails.push({
    to: opts.to.toLowerCase(),
    subject: opts.subject,
    link: extractLink(opts),
    sentAt: new Date().toISOString(),
    transport,
  });
  if (capturedEmails.length > CAPTURE_LIMIT) capturedEmails.shift();
};

/** Most recent captured email for an address (dev/test only). */
export const getLastEmailFor = (to: string): CapturedEmail | undefined => {
  const target = to.toLowerCase();
  for (let i = capturedEmails.length - 1; i >= 0; i--) {
    if (capturedEmails[i].to === target) return capturedEmails[i];
  }
  return undefined;
};

// ── Transports ────────────────────────────────────────────────────

let smtpTransporter: Transporter | null = null;

const getSmtpTransporter = (): Transporter => {
  if (smtpTransporter) return smtpTransporter;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  // `secure` true for 465 (implicit TLS), false for 587/others (STARTTLS) unless overridden.
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : port === 465;
  smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(),
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASS!.trim(),
    },
  });
  return smtpTransporter;
};

const smtpTransport = async (opts: EmailOptions): Promise<void> => {
  await getSmtpTransporter().sendMail({
    from: getFromAddress(),
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
};

const sendgridTransport = async (opts: EmailOptions): Promise<void> => {
  const res = await fetch(SENDGRID_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY!.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: opts.to }] }],
      from: { email: getFromAddress(), name: 'FlowForge' },
      subject: opts.subject,
      content: [
        ...(opts.text ? [{ type: 'text/plain', value: opts.text }] : []),
        { type: 'text/html', value: opts.html },
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`SendGrid send failed (${res.status}): ${detail}`);
  }
};

const consoleTransport = (opts: EmailOptions): void => {
  const link = extractLink(opts);
  console.log('\n──────── [EMAIL — console transport] ────────');
  console.log(`To:      ${opts.to}`);
  console.log(`Subject: ${opts.subject}`);
  if (link) console.log(`Link:    ${link}`);
  if (opts.text) console.log(`Text:    ${opts.text}`);
  console.log('(Set SMTP_* — or SENDGRID_API_KEY — to send real emails.)');
  console.log('─────────────────────────────────────────────\n');
};

/**
 * Send an email. Never throws — failures are logged. Chooses the best configured
 * transport; falls back to console so flows work with no credentials.
 */
export const sendEmail = async (opts: EmailOptions): Promise<void> => {
  let transport: CapturedEmail['transport'] = 'console';
  try {
    if (isSmtpConfigured()) {
      transport = 'smtp';
      await smtpTransport(opts);
    } else if (isSendgridConfigured()) {
      transport = 'sendgrid';
      await sendgridTransport(opts);
    } else {
      transport = 'console';
      consoleTransport(opts);
    }
    recordEmail(opts, transport);
  } catch (err: any) {
    console.error(`[email] failed to send via ${transport}:`, err?.message ?? err);
    // Fall back to console so the action link is still surfaced in dev, and record it.
    if (transport !== 'console') {
      consoleTransport(opts);
      recordEmail(opts, 'console');
    }
  }
};

// ── Templated emails ──────────────────────────────────────────────

export const sendPasswordResetEmail = async (to: string, resetUrl: string): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Reset your FlowForge password',
    text: `Reset your password using this link (valid for 15 minutes): ${resetUrl}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0F766E">Reset your password</h2>
        <p>We received a request to reset your FlowForge password. This link is valid for <strong>15 minutes</strong>.</p>
        <p><a href="${resetUrl}" style="display:inline-block;background:#0F766E;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Reset Password</a></p>
        <p style="color:#64748b;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
      </div>`,
  });
};

export const sendVerificationEmail = async (to: string, verifyUrl: string): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Verify your FlowForge email',
    text: `Verify your email using this link (valid for 24 hours): ${verifyUrl}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0F766E">Verify your email</h2>
        <p>Confirm your email address to finish setting up your FlowForge account. This link is valid for <strong>24 hours</strong>.</p>
        <p><a href="${verifyUrl}" style="display:inline-block;background:#0F766E;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Verify Email</a></p>
        <p style="color:#64748b;font-size:12px">If you didn't create a FlowForge account, you can safely ignore this email.</p>
      </div>`,
  });
};

/** Platform notification email (spec ready, build done, deploy live, ...). */
export const sendNotificationEmail = async (
  to: string,
  n: { title: string; body: string; actionUrl?: string }
): Promise<void> => {
  await sendEmail({
    to,
    subject: `FlowForge — ${n.title}`,
    text: `${n.title}\n\n${n.body}${n.actionUrl ? `\n\nOpen: ${n.actionUrl}` : ''}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0F766E">${n.title}</h2>
        <p style="color:#334155">${n.body}</p>
        ${n.actionUrl
          ? `<p><a href="${n.actionUrl}" style="display:inline-block;background:#0F766E;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Open FlowForge</a></p>`
          : ''}
        <p style="color:#94a3b8;font-size:12px">You're receiving this because you have a project on FlowForge.</p>
      </div>`,
  });
};
