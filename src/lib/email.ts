/**
 * Email sending utility — ConectAr HR
 *
 * In production connect to Resend (recommended) or SendGrid:
 *   npm install resend
 *   import { Resend } from 'resend';
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *
 * For now: logs the email and returns the data so the owner UI
 * can display the activation link during development/testing.
 */

export interface InvitationEmailPayload {
  to: string;
  companyName: string;
  activationUrl: string;
  expiresHours: number;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  /** Returned in dev mode so the owner can copy the link manually */
  devUrl?: string;
  error?: string;
}

export async function sendClientInvitationEmail(
  payload: InvitationEmailPayload,
): Promise<EmailResult> {
  const isDev = process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY;

  if (isDev) {
    // ── Dev mode: log & return link for manual testing ─────────────────────
    console.log('\n━━━ [EMAIL STUB] Invitation ━━━');
    console.log(`  To:      ${payload.to}`);
    console.log(`  Company: ${payload.companyName}`);
    console.log(`  Link:    ${payload.activationUrl}`);
    console.log(`  Expires: ${payload.expiresHours}h`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return { success: true, devUrl: payload.activationUrl };
  }

  // ── Production: install resend then uncomment ────────────────────────────
  // npm install resend
  // const { Resend } = await import('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // const { data, error } = await resend.emails.send({
  //   from: process.env.EMAIL_FROM ?? 'ConectAr <noreply@conectar.app>',
  //   to: payload.to,
  //   subject: `Activá tu cuenta en ConectAr — ${payload.companyName}`,
  //   html: buildInvitationHtml(payload),
  // });
  // if (error) return { success: false, error: error.message };
  // return { success: true, messageId: data?.id };

  // Until email provider is configured, fall back to dev stub
  console.log('\n━━━ [EMAIL] Invitation ━━━');
  console.log(`  To:   ${payload.to}`);
  console.log(`  Link: ${payload.activationUrl}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  return { success: true, devUrl: payload.activationUrl };
}

function buildInvitationHtml(p: InvitationEmailPayload): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:sans-serif;background:#f4f4f5;margin:0;padding:32px 0;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
    <div style="background:#2563eb;padding:28px 32px;">
      <h1 style="color:#fff;font-size:22px;margin:0;">ConectAr HR</h1>
      <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px;">Sistema de Gestión de Recursos Humanos</p>
    </div>
    <div style="padding:32px;">
      <h2 style="font-size:18px;color:#111827;margin:0 0 12px;">¡Bienvenido/a a ConectAr!</h2>
      <p style="color:#6b7280;line-height:1.6;margin:0 0 8px;">
        Fuiste invitado/a como <strong>Administrador</strong> de la empresa
        <strong style="color:#111827;">${p.companyName}</strong>.
      </p>
      <p style="color:#6b7280;line-height:1.6;margin:0 0 24px;">
        Hacé clic en el botón para activar tu cuenta y acceder al sistema.
        El enlace es válido por <strong>${p.expiresHours} horas</strong>.
      </p>
      <a href="${p.activationUrl}"
         style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
        Activar mi cuenta →
      </a>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 20px;">
      <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:0;">
        Si no esperabas este email podés ignorarlo.<br>
        El enlace expirará automáticamente.<br>
        También podés copiar este link: <br>
        <span style="word-break:break-all;color:#6b7280;">${p.activationUrl}</span>
      </p>
    </div>
  </div>
</body>
</html>`;
}
