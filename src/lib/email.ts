import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Equinox <onboarding@resend.dev>';

const resend = apiKey && apiKey !== 'placeholder' ? new Resend(apiKey) : null;

export interface SendMagicLinkOptions {
  to: string;
  teamName: string;
  magicLinkUrl: string;
}

/**
 * Reusable wrapper to send Equinox magic-link login emails via Resend.
 */
export async function sendMagicLinkEmail({
  to,
  teamName,
  magicLinkUrl,
}: SendMagicLinkOptions): Promise<{ success: boolean; error?: string }> {
  // If Resend API key is not configured, log to console for local development testing.
  if (!resend) {
    console.log('\n================ MAGIC LINK EMAIL (DEV MODE) ================');
    console.log(`To: ${to} (Team: ${teamName})`);
    console.log(`Magic Link URL: ${magicLinkUrl}`);
    console.log('=============================================================\n');
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Equinox — Round 2 Login Link for ${teamName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #f3f4f6; padding: 24px; }
              .container { max-width: 500px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 32px; text-align: center; }
              .h1 { font-size: 24px; font-weight: bold; margin-bottom: 12px; color: #38bdf8; }
              .btn { display: inline-block; background-color: #0284c7; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
              .footer { font-size: 12px; color: #9ca3af; margin-top: 24px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="h1">Equinox Portal Login</div>
              <p>Hello Team <strong>${teamName}</strong>,</p>
              <p>Click the button below to log into your Equinox Round 2 contest session. This link expires in 15 minutes.</p>
              <a href="${magicLinkUrl}" class="btn">Log In to Equinox</a>
              <p class="footer">If you did not request this email, please contact an event administrator immediately.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error sending email';
    console.error('Failed to send magic link email:', err);
    return { success: false, error: message };
  }
}
