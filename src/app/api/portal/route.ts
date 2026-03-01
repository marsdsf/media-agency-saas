import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Client portal API - serves data for client-facing portal
// Auth is via portal token (separate from agency auth)

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section'); // posts, reports, info

    // Find client record linked to this user
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, company, agency_id')
      .eq('email', user.email)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    if (section === 'posts') {
      // Get posts pending approval for this client
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('agency_id', client.agency_id)
        .eq('client_id', client.id)
        .in('status', ['pending_approval', 'approved', 'rejected', 'scheduled'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return NextResponse.json({ posts: posts || [] });
    }

    if (section === 'reports') {
      const { data: reports, error } = await supabase
        .from('analytics_reports')
        .select('*')
        .eq('agency_id', client.agency_id)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return NextResponse.json({ reports: reports || [] });
    }

    // Default: return client info + summary
    const { data: pendingCount } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', client.agency_id)
      .eq('client_id', client.id)
      .eq('status', 'pending_approval');

    const { data: agency } = await supabase
      .from('agencies')
      .select('name')
      .eq('id', client.agency_id)
      .single();

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        company: client.company,
      },
      agency: {
        name: agency?.name || 'Agência',
      },
      pendingApprovals: pendingCount || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}

// Approve or reject a post
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, action, feedback } = body; // action: 'approve' | 'reject'

    if (!postId || !action) {
      return NextResponse.json({ error: 'postId e action são obrigatórios' }, { status: 400 });
    }

    // Verify the client owns this post
    const { data: client } = await supabase
      .from('clients')
      .select('id, agency_id')
      .eq('email', user.email)
      .single();

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: post, error } = await supabase
      .from('posts')
      .update({
        status: newStatus,
        metadata: {
          client_feedback: feedback || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.email,
        },
      })
      .eq('id', postId)
      .eq('client_id', client.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar post' }, { status: 500 });
  }
}
