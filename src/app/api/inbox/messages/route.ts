import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// GET /api/inbox/messages?conversation_id=xxx - List messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const before = searchParams.get('before'); // cursor pagination

    if (!conversationId) {
      return NextResponse.json({ error: 'conversation_id is required' }, { status: 400 });
    }

    // Verify access
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('agency_id', ctx.agencyId)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;
    if (error) throw error;

    // Mark as read
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_type', 'agent');

    // Reset unread count
    await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId);

    return NextResponse.json({ messages: messages || [] });
  } catch (error: any) {
    console.error('Messages error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar mensagens' },
      { status: 500 }
    );
  }
}
