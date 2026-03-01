// Email utility para enviar transactional emails
// Suporta Resend, SendGrid ou SMTP genérico via configuração

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Detectar e usar o provedor configurado
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const provider = process.env.EMAIL_PROVIDER || 'resend';
  const from = options.from || process.env.EMAIL_FROM || 'noreply@agencia.com';

  try {
    switch (provider) {
      case 'resend':
        return await sendViaResend({ ...options, from });
      case 'sendgrid':
        return await sendViaSendGrid({ ...options, from });
      default:
        console.warn('Email provider not configured. Email not sent:', options.subject);
        return { success: true, messageId: 'dry-run' };
    }
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

// === Resend ===
async function sendViaResend(options: EmailOptions & { from: string }): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set. Skipping email.');
    return { success: true, messageId: 'dry-run-resend' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, error: data.message || `HTTP ${res.status}` };
  }

  return { success: true, messageId: data.id };
}

// === SendGrid ===
async function sendViaSendGrid(options: EmailOptions & { from: string }): Promise<EmailResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('SENDGRID_API_KEY not set. Skipping email.');
    return { success: true, messageId: 'dry-run-sendgrid' };
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: options.to }] }],
      from: { email: options.from },
      subject: options.subject,
      content: [
        { type: 'text/html', value: options.html },
        ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
      ],
      reply_to: options.replyTo ? { email: options.replyTo } : undefined,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return { success: false, error: errorText || `HTTP ${res.status}` };
  }

  return { success: true, messageId: res.headers.get('x-message-id') || 'sent' };
}

// === Templates de Email ===

export function invitationEmailTemplate(params: {
  agencyName: string;
  inviterName: string;
  inviteUrl: string;
  role: string;
}): { subject: string; html: string; text: string } {
  const roleLabels: Record<string, string> = {
    agency_owner: 'Proprietário',
    agency_admin: 'Administrador',
    agency_member: 'Membro',
    agency_viewer: 'Visualizador',
  };

  const roleLabel = roleLabels[params.role] || 'Membro';

  return {
    subject: `Convite para ${params.agencyName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">${params.agencyName}</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#1a1a1a;margin:0 0 16px;">Você foi convidado!</h2>
      <p style="color:#4a4a4a;font-size:16px;line-height:1.6;margin:0 0 12px;">
        <strong>${params.inviterName}</strong> convidou você para se juntar à 
        <strong>${params.agencyName}</strong> como <strong>${roleLabel}</strong>.
      </p>
      <p style="color:#4a4a4a;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Clique no botão abaixo para aceitar o convite e criar sua conta.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${params.inviteUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;">
          Aceitar Convite
        </a>
      </div>
      <p style="color:#9a9a9a;font-size:12px;text-align:center;margin:24px 0 0;">
        Este convite expira em 7 dias. Se você não reconhece este convite, ignore este email.
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        Enviado por ${params.agencyName} via Plataforma de Mídia Digital
      </p>
    </div>
  </div>
</body>
</html>`,
    text: `${params.inviterName} convidou você para se juntar à ${params.agencyName} como ${roleLabel}.\n\nAceite o convite: ${params.inviteUrl}\n\nEste convite expira em 7 dias.`,
  };
}

export function notificationEmailTemplate(params: {
  userName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}): { subject: string; html: string; text: string } {
  const actionButton = params.actionUrl
    ? `<div style="text-align:center;margin:24px 0;">
        <a href="${params.actionUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
          ${params.actionLabel || 'Ver Detalhes'}
        </a>
      </div>`
    : '';

  return {
    subject: params.title,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <div style="background:#7c3aed;padding:20px 32px;">
      <h1 style="color:#fff;margin:0;font-size:18px;">Notificação</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#4a4a4a;font-size:14px;margin:0 0 8px;">Olá, <strong>${params.userName}</strong></p>
      <h2 style="color:#1a1a1a;margin:0 0 12px;font-size:18px;">${params.title}</h2>
      <p style="color:#4a4a4a;font-size:14px;line-height:1.6;margin:0 0 16px;">${params.message}</p>
      ${actionButton}
    </div>
  </div>
</body>
</html>`,
    text: `Olá ${params.userName},\n\n${params.title}\n${params.message}${params.actionUrl ? `\n\nVer: ${params.actionUrl}` : ''}`,
  };
}

export function postApprovalEmailTemplate(params: {
  clientName: string;
  postContent: string;
  approvalUrl: string;
  agencyName: string;
}): { subject: string; html: string; text: string } {
  const truncatedContent =
    params.postContent.length > 200 ? params.postContent.substring(0, 200) + '...' : params.postContent;

  return {
    subject: `Novo conteúdo para aprovação — ${params.agencyName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:20px;">${params.agencyName}</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">Aprovação de Conteúdo</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#4a4a4a;font-size:14px;margin:0 0 8px;">Olá, <strong>${params.clientName}</strong></p>
      <p style="color:#4a4a4a;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Um novo conteúdo foi enviado para sua aprovação:
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:0 0 24px;">
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">${truncatedContent}</p>
      </div>
      <div style="text-align:center;">
        <a href="${params.approvalUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;">
          Revisar e Aprovar
        </a>
      </div>
    </div>
    <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        Este email foi enviado por ${params.agencyName}
      </p>
    </div>
  </div>
</body>
</html>`,
    text: `Olá ${params.clientName},\n\nUm novo conteúdo foi enviado para sua aprovação:\n\n"${truncatedContent}"\n\nRevisar: ${params.approvalUrl}`,
  };
}
