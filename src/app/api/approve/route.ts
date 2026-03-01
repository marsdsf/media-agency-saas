import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/auth';
import { sendStatusNotification } from '@/lib/notifications';

// Token-based approval endpoint (no login required)
// GET /api/approve?token=xxx&action=approve|reject|review
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action');
    const feedback = searchParams.get('feedback');

    if (!token) {
      return renderPage('error', 'Token não fornecido');
    }

    if (!action || !['approve', 'reject', 'review'].includes(action)) {
      return renderPage('error', 'Ação inválida');
    }

    const supabase = getSupabaseAdmin();

    // Validate token
    const { data: tokenData, error: tokenError } = await supabase
      .from('approval_tokens')
      .select('*, posts(*), clients(*)')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return renderPage('error', 'Token inválido ou expirado');
    }

    // Check expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      return renderPage('error', 'Este link de aprovação expirou. Solicite um novo link.');
    }

    // Check if already used
    if (tokenData.used_at) {
      return renderPage('info', `Este post já foi ${tokenData.action === 'approve' ? 'aprovado' : 'rejeitado'} anteriormente.`);
    }

    // If review, redirect to portal
    if (action === 'review') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${appUrl}/portal?post=${tokenData.post_id}`);
    }

    // Apply action
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        status: newStatus,
        approved_at: action === 'approve' ? new Date().toISOString() : null,
        rejection_reason: action === 'reject' ? (feedback || 'Rejeitado via link') : null,
      })
      .eq('id', tokenData.post_id);

    if (updateError) {
      console.error('Error updating post:', updateError);
      return renderPage('error', 'Erro ao processar aprovação');
    }

    // Mark token as used
    await supabase
      .from('approval_tokens')
      .update({ used_at: new Date().toISOString(), action })
      .eq('token', token);

    // Log activity
    await supabase.from('activity_log').insert({
      agency_id: tokenData.posts?.agency_id,
      client_id: tokenData.client_id,
      action: `post_${newStatus}`,
      entity_type: 'post',
      entity_id: tokenData.post_id,
      details: { via: 'approval_link', client_name: tokenData.clients?.name },
    });

    // Create notification
    if (tokenData.posts?.agency_id) {
      const { data: agency } = await supabase
        .from('agencies')
        .select('owner_id, name')
        .eq('id', tokenData.posts.agency_id)
        .single();

      if (agency) {
        await supabase.from('notifications').insert({
          user_id: agency.owner_id,
          type: `post_${newStatus}`,
          title: action === 'approve' ? '✅ Post Aprovado' : '❌ Post Rejeitado',
          message: `${tokenData.clients?.name || 'Cliente'} ${action === 'approve' ? 'aprovou' : 'rejeitou'} o post para ${tokenData.posts?.platform || 'rede social'}`,
          action_url: '/dashboard/approvals',
        });

        // Send email notification to agency owner
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', agency.owner_id)
          .single();

        if (ownerProfile) {
          await sendStatusNotification({
            postId: tokenData.post_id,
            agencyEmail: ownerProfile.email,
            agencyName: agency.name,
            clientName: tokenData.clients?.name || 'Cliente',
            action: action === 'approve' ? 'approved' : 'rejected',
            feedback: feedback || undefined,
            postContent: tokenData.posts?.content || '',
            postPlatform: tokenData.posts?.platform || '',
          });
        }
      }
    }

    // Render success page
    return renderPage(
      action === 'approve' ? 'approved' : 'rejected',
      action === 'approve'
        ? 'Post aprovado com sucesso! A agência foi notificada.'
        : 'Post rejeitado. A agência foi notificada para fazer ajustes.'
    );
  } catch (error: any) {
    console.error('Approval error:', error);
    return renderPage('error', 'Erro interno. Tente novamente.');
  }
}

// POST /api/approve - for rejections with feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action, feedback } = body;

    if (!token || !action) {
      return NextResponse.json({ error: 'Token e ação são obrigatórios' }, { status: 400 });
    }

    const url = new URL(request.url);
    url.searchParams.set('token', token);
    url.searchParams.set('action', action);
    if (feedback) url.searchParams.set('feedback', feedback);

    // Reuse GET logic
    const newReq = new NextRequest(url.toString(), { method: 'GET' });
    return GET(newReq);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function renderPage(type: 'approved' | 'rejected' | 'error' | 'info', message: string) {
  const config = {
    approved: { icon: '✅', title: 'Post Aprovado!', color: '#22c55e', bg: '#052e16' },
    rejected: { icon: '❌', title: 'Post Rejeitado', color: '#ef4444', bg: '#450a0a' },
    error: { icon: '⚠️', title: 'Erro', color: '#f59e0b', bg: '#451a03' },
    info: { icon: 'ℹ️', title: 'Informação', color: '#3b82f6', bg: '#172554' },
  };

  const c = config[type];

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${c.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0a; color: white; display: flex; align-items: center; 
      justify-content: center; min-height: 100vh; padding: 20px;
    }
    .card {
      background: #1a1a1a; border-radius: 20px; padding: 48px; text-align: center;
      max-width: 480px; width: 100%; border: 1px solid #333;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .icon { font-size: 64px; margin-bottom: 20px; }
    h1 { font-size: 28px; margin-bottom: 12px; color: ${c.color}; }
    p { color: #999; line-height: 1.6; font-size: 16px; }
    .badge {
      display: inline-block; margin-top: 24px; padding: 8px 20px;
      border-radius: 100px; background: ${c.bg}; color: ${c.color};
      font-size: 14px; font-weight: 600;
    }
    .close-btn {
      display: block; margin-top: 32px; padding: 14px 32px;
      background: #333; color: white; border: none; border-radius: 12px;
      font-size: 16px; cursor: pointer; transition: background 0.2s;
    }
    .close-btn:hover { background: #444; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${c.icon}</div>
    <h1>${c.title}</h1>
    <p>${message}</p>
    <div class="badge">${type === 'approved' ? 'Publicação liberada' : type === 'rejected' ? 'Aguardando revisão' : type === 'error' ? 'Ação necessária' : 'Nenhuma ação necessária'}</div>
    <button class="close-btn" onclick="window.close(); window.location.href='/';">Fechar</button>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
