import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// GET /api/inbox - List conversations
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'open';
    const platform = searchParams.get('platform');
    const starred = searchParams.get('starred');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('conversations')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (status !== 'all') query = query.eq('status', status);
    if (platform) query = query.eq('platform', platform);
    if (starred === 'true') query = query.eq('is_starred', true);
    if (search) query = query.ilike('contact_name', `%${search}%`);

    const { data: conversations, error } = await query;
    if (error) throw error;

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', ctx.agencyId)
      .gt('unread_count', 0);

    return NextResponse.json({
      conversations: conversations || [],
      unreadCount: unreadCount || 0,
    });
  } catch (error: any) {
    console.error('Inbox error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar inbox' },
      { status: 500 }
    );
  }
}

// POST /api/inbox - Create new conversation or send message
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    // If conversationId is provided, add a message
    if (body.conversationId) {
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: body.conversationId,
          sender_type: 'agent',
          sender_id: ctx.userId,
          sender_name: body.senderName || 'Agência',
          content: body.content,
          content_type: body.contentType || 'text',
          media_url: body.mediaUrl || null,
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // Update conversation
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: body.content.substring(0, 100),
          message_count: (await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('conversation_id', body.conversationId)).count || 0,
        })
        .eq('id', body.conversationId);

      return NextResponse.json({ message });
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        agency_id: ctx.agencyId,
        contact_name: body.contactName,
        contact_avatar: body.contactAvatar || null,
        contact_platform_id: body.contactPlatformId || null,
        platform: body.platform || 'whatsapp',
        social_account_id: body.socialAccountId || null,
        tags: body.tags || [],
        assigned_to: ctx.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error: any) {
    console.error('Inbox POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}

// PATCH /api/inbox - Update conversation (star, archive, assign, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const updateData: Record<string, any> = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.isStarred !== undefined) updateData.is_starred = updates.isStarred;
    if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;
    if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.unreadCount !== undefined) updateData.unread_count = updates.unreadCount;

    const { data: conversation, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ conversation });
  } catch (error: any) {
    console.error('Inbox PATCH error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar conversa' },
      { status: 500 }
    );
  }
}
