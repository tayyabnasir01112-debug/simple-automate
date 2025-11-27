import { Resend } from 'resend';
import { env } from '../config/env';

const client = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export const sendSystemEmail = async ({ to, subject, html }: EmailPayload) => {
  if (!client) {
    console.warn('Skipping email send - RESEND_API_KEY not configured');
    return;
  }

  await client.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

export const renderEmailLayout = (title: string, body: string) => `
  <div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a;">
    <h2 style="color:#0f172a">${title}</h2>
    <div style="line-height:1.6;font-size:16px;color:#1e293b">${body}</div>
    <p style="margin-top:32px;color:#94a3b8;font-size:12px;">
      © ${new Date().getFullYear()} SimpleAutomate · simpleautomate.co.uk
    </p>
  </div>
`;

