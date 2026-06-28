import { Resend } from "resend";

// Sends the password setup / reset link to the admin. If RESEND_API_KEY is not
// configured (e.g. local dev before you've signed up), the link is logged to
// the server console instead so the flow is still testable.
export async function sendResetEmail(to: string, link: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      `\n[email] RESEND_API_KEY not set — password link (open it manually):\n  ${link}\n`,
    );
    return;
  }

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM || "Toshani <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Set your Toshani admin password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#0f172a">
        <h2 style="color:#2563eb">Toshani admin</h2>
        <p>Use the link below to set a new password for your admin account.
           It expires in 1 hour and can only be used once.</p>
        <p style="margin:24px 0">
          <a href="${link}"
             style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
            Set my password
          </a>
        </p>
        <p style="color:#475569;font-size:14px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[email] Resend error:", error);
    throw new Error("Failed to send email");
  }
}
