// =============================================
// NOTIFICATION SERVICE - WhatsApp + Email
// =============================================

import nodemailer from 'nodemailer';
import { getSupabaseAdmin } from '@/lib/auth';

// =============================================
// EMAIL SERVICE
// =============================================
function getEmailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('SMTP not configured — emails will be logged only');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

// =============================================
// WHATSAPP SERVICE (Evolution API / Z-API compatible)
// =============================================
async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  const apiUrl = process.env.WHATSAPP_API_URL; // e.g. https://api.z-api.io/instances/xxx/token/xxx
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const provider = process.env.WHATSAPP_PROVIDER || 'evolution'; // 'evolution' | 'z-api' | 'twilio'

  if (!apiUrl || !apiToken) {
    console.log(`[WhatsApp MOCK] To: ${phone}\n${message}`);
    return false;
  }

  try {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (provider === 'z-api') {
      await fetch(`${apiUrl}/send-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Client-Token': apiToken },
        body: JSON.stringify({ phone: cleanPhone, message }),
      });
    } else if (provider === 'twilio') {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioPhone = process.env.TWILIO_WHATSAPP_NUMBER;
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${accountSid}:${apiToken}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: `whatsapp:${twilioPhone}`,
          To: `whatsapp:+${cleanPhone}`,
          Body: message,
        }),
      });
    } else {
      // Evolution API (default)
      await fetch(`${apiUrl}/message/sendText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: apiToken },
        body: JSON.stringify({
          number: cleanPhone,
          text: message,
        }),
      });
    }

    console.log(`[WhatsApp] Sent to ${phone}`);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Error:', error);
    return false;
  }
}

// =============================================
// GENERATE APPROVAL TOKEN
// =============================================
export async function generateApprovalToken(postId: string, clientId: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');

  await supabase.from('approval_tokens').insert({
    token,
    post_id: postId,
    client_id: clientId,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  });

  return token;
}

// =============================================
// SEND APPROVAL REQUEST
// =============================================
export async function sendApprovalRequest(params: {
  postId: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  agencyName: string;
  postContent: string;
  postPlatform: string;
  postMediaUrls?: string[];
  scheduledFor?: string;
}) {
  const { postId, clientId, clientName, clientEmail, clientPhone, agencyName, postContent, postPlatform, postMediaUrls, scheduledFor } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Generate unique approval token
  const token = await generateApprovalToken(postId, clientId);
  const approveUrl = `${appUrl}/api/approve?token=${token}&action=approve`;
  const rejectUrl = `${appUrl}/api/approve?token=${token}&action=reject`;
  const reviewUrl = `${appUrl}/api/approve?token=${token}&action=review`;

  const platformNames: Record<string, string> = {
    instagram: 'Instagram', facebook: 'Facebook', twitter: 'Twitter/X',
    linkedin: 'LinkedIn', tiktok: 'TikTok', youtube: 'YouTube', pinterest: 'Pinterest',
  };

  const platformName = platformNames[postPlatform] || postPlatform;
  const contentPreview = postContent.length > 200 ? postContent.substring(0, 200) + '...' : postContent;
  const scheduledText = scheduledFor ? new Date(scheduledFor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'A definir';

  const results = { email: false, whatsapp: false };

  // ---- SEND EMAIL ----
  if (clientEmail) {
    try {
      const transporter = getEmailTransporter();
      const html = generateApprovalEmail({
        clientName, agencyName, contentPreview, platformName,
        scheduledText, approveUrl, rejectUrl, reviewUrl,
        mediaUrls: postMediaUrls,
      });

      if (transporter) {
        await transporter.sendMail({
          from: `"${agencyName}" <${process.env.SMTP_USER}>`,
          to: clientEmail,
          subject: `📋 Post para aprovação — ${platformName}`,
          html,
        });
        results.email = true;
      } else {
        console.log(`[Email MOCK] To: ${clientEmail}\nSubject: Post para aprovação\n${contentPreview}`);
      }
    } catch (error) {
      console.error('[Email] Error:', error);
    }
  }

  // ---- SEND WHATSAPP ----
  if (clientPhone) {
    const whatsappMsg = `🔔 *${agencyName}* — Novo post para aprovação!\n\n` +
      `📱 *Plataforma:* ${platformName}\n` +
      `📅 *Agendado:* ${scheduledText}\n\n` +
      `📝 *Conteúdo:*\n${contentPreview}\n\n` +
      `✅ Aprovar: ${approveUrl}\n` +
      `❌ Rejeitar: ${rejectUrl}\n` +
      `👁️ Revisar: ${reviewUrl}`;

    results.whatsapp = await sendWhatsApp(clientPhone, whatsappMsg);
  }

  // Log the notification
  const supabase = getSupabaseAdmin();
  await supabase.from('activity_log').insert({
    agency_id: (await supabase.from('clients').select('agency_id').eq('id', clientId).single()).data?.agency_id,
    action: 'approval_requested',
    entity_type: 'post',
    entity_id: postId,
    details: {
      client_name: clientName,
      platform: postPlatform,
      channels: results,
    },
  });

  return results;
}

// =============================================
// SEND APPROVAL STATUS NOTIFICATION
// =============================================
export async function sendStatusNotification(params: {
  postId: string;
  agencyEmail?: string;
  agencyName: string;
  clientName: string;
  action: 'approved' | 'rejected';
  feedback?: string;
  postContent: string;
  postPlatform: string;
}) {
  const { agencyEmail, agencyName, clientName, action, feedback, postContent, postPlatform } = params;
  const actionText = action === 'approved' ? '✅ APROVADO' : '❌ REJEITADO';
  const contentPreview = postContent.length > 100 ? postContent.substring(0, 100) + '...' : postContent;

  // Email notification to agency
  if (agencyEmail) {
    try {
      const transporter = getEmailTransporter();
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 30px; border-radius: 12px;">
          <h2 style="color: ${action === 'approved' ? '#22c55e' : '#ef4444'};">${actionText}</h2>
          <p><strong>Cliente:</strong> ${clientName}</p>
          <p><strong>Plataforma:</strong> ${postPlatform}</p>
          <p><strong>Conteúdo:</strong> ${contentPreview}</p>
          ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
          <hr style="border-color: #333; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">${agencyName} — Sistema de aprovação automática</p>
        </div>
      `;

      if (transporter) {
        await transporter.sendMail({
          from: `"${agencyName}" <${process.env.SMTP_USER}>`,
          to: agencyEmail,
          subject: `${actionText} — Post ${postPlatform} por ${clientName}`,
          html,
        });
      } else {
        console.log(`[Email MOCK] To: ${agencyEmail}\n${actionText} por ${clientName}`);
      }
    } catch (error) {
      console.error('[Email] Status notification error:', error);
    }
  }
}

// =============================================
// EMAIL TEMPLATE
// =============================================
function generateApprovalEmail(params: {
  clientName: string;
  agencyName: string;
  contentPreview: string;
  platformName: string;
  scheduledText: string;
  approveUrl: string;
  rejectUrl: string;
  reviewUrl: string;
  mediaUrls?: string[];
}) {
  const { clientName, agencyName, contentPreview, platformName, scheduledText, approveUrl, rejectUrl, reviewUrl, mediaUrls } = params;

  const mediaHtml = mediaUrls?.length
    ? `<div style="margin: 15px 0;">${mediaUrls.slice(0, 3).map(url =>
        `<img src="${url}" alt="Media" style="max-width: 200px; border-radius: 8px; margin: 5px;" />`
      ).join('')}</div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #7c3aed, #6366f1); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 22px;">📋 Post para Aprovação</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">${agencyName}</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="color: #333; font-size: 16px;">Olá <strong>${clientName}</strong>,</p>
      <p style="color: #666; font-size: 14px; line-height: 1.6;">
        Um novo post foi criado para sua aprovação. Revise o conteúdo abaixo e clique em um dos botões para aprovar ou rejeitar.
      </p>

      <!-- Post Preview -->
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #7c3aed;">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="background: #7c3aed; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${platformName}</span>
          <span style="color: #999; font-size: 12px; margin-left: 10px;">📅 ${scheduledText}</span>
        </div>
        <p style="color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 0;">${contentPreview}</p>
        ${mediaHtml}
      </div>

      <!-- Action Buttons -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${approveUrl}" style="display: inline-block; background: #22c55e; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 5px;">
          ✅ Aprovar
        </a>
        <a href="${rejectUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 5px;">
          ❌ Rejeitar
        </a>
      </div>
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="${reviewUrl}" style="color: #7c3aed; font-size: 14px; text-decoration: underline;">
          👁️ Ver detalhes e comentar no portal
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        Este email foi enviado automaticamente por ${agencyName}.<br>
        Se você não reconhece este email, pode ignorá-lo com segurança.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
