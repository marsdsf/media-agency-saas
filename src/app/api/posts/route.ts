import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Listar posts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
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
        projects (
          id,
          name,
          color
        )
      `)
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const postData = await request.json();

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        social_account_id: postData.socialAccountId,
        project_id: postData.projectId || null,
        content: postData.content,
        media_urls: postData.mediaUrls || [],
        hashtags: postData.hashtags || [],
        scheduled_at: postData.scheduledAt || null,
        status: postData.scheduledAt ? 'scheduled' : 'draft',
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id, ...updates } = await request.json();

    const { data: post, error } = await supabase
      .from('posts')
      .update({
        content: updates.content,
        media_urls: updates.mediaUrls,
        hashtags: updates.hashtags,
        scheduled_at: updates.scheduledAt,
        status: updates.status,
      })
      .eq('id', id)
      .eq('user_id', user.id)
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await request.json();

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

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
