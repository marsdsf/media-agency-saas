import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { sendApprovalRequest } from '@/lib/notifications';

// POST /api/notifications/approval - Send approval request to client
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { postId } = await request.json();
    if (!postId) {
      return NextResponse.json({ error: 'postId é obrigatório' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get post with client info
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*, clients(id, name, contact_email, contact_phone)')
      .eq('id', postId)
      .eq('agency_id', ctx.agencyId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    if (!post.client_id || !post.clients) {
      return NextResponse.json({ error: 'Post sem cliente associado' }, { status: 400 });
    }

    // Update post status to pending_approval
    await supabase
      .from('posts')
      .update({ status: 'pending_approval' })
      .eq('id', postId);

    // Get agency info
    const { data: agency } = await supabase
      .from('agencies')
      .select('name')
      .eq('id', ctx.agencyId)
      .single();

    // Send approval notifications
    const results = await sendApprovalRequest({
      postId: post.id,
      clientId: post.client_id,
      clientName: post.clients.name,
      clientEmail: post.clients.contact_email || undefined,
      clientPhone: post.clients.contact_phone || undefined,
      agencyName: agency?.name || 'Agência',
      postContent: post.content || '',
      postPlatform: post.platform || 'other',
      postMediaUrls: post.media_urls,
      scheduledFor: post.scheduled_for || post.scheduled_at,
    });

    return NextResponse.json({ 
      success: true, 
      channels: results,
      message: 'Solicitação de aprovação enviada' 
    });
  } catch (error: any) {
    console.error('Error sending approval:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar aprovação' },
      { status: 500 }
    );
  }
}
