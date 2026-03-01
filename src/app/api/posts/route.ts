import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Listar posts da agência
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('client_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('posts')
      .select(`
        *,
        social_accounts (
          id,
          platform,
          username,
          avatar_url
        ),
        clients (
          id,
          name,
          brand_color
        )
      `)
      .eq('agency_id', ctx.agencyId)
      .order('scheduled_at', { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data: posts, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar posts' },
      { status: 500 }
    );
  }
}

// Criar novo post
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const postData = await request.json();

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        agency_id: ctx.agencyId,
        created_by: ctx.userId,
        client_id: postData.clientId || null,
        social_account_id: postData.socialAccountId || null,
        content: postData.content,
        media_urls: postData.mediaUrls || [],
        hashtags: postData.hashtags || [],
        scheduled_at: postData.scheduledAt || null,
        status: postData.scheduledAt ? 'scheduled' : 'draft',
        platform: postData.platform || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar post' },
      { status: 500 }
    );
  }
}

// Atualizar post
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const updateData: Record<string, any> = {};
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.mediaUrls !== undefined) updateData.media_urls = updates.mediaUrls;
    if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
    if (updates.scheduledAt !== undefined) updateData.scheduled_at = updates.scheduledAt;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.platform !== undefined) updateData.platform = updates.platform;

    const { data: post, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar post' },
      { status: 500 }
    );
  }
}

// Deletar post
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await request.json();

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('agency_id', ctx.agencyId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar post' },
      { status: 500 }
    );
  }
}
