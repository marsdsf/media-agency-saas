import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper: verify mobile JWT and get user context
async function getMobileUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Token de autenticação obrigatório' };
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { error: 'Token inválido ou expirado' };

  const { data: member } = await supabase
    .from('agency_members')
    .select('agency_id, role, permissions')
    .eq('user_id', user.id)
    .eq('active', true)
    .single();

  if (!member) return { error: 'Usuário não pertence a nenhuma agência' };

  return {
    userId: user.id,
    email: user.email!,
    agencyId: member.agency_id,
    role: member.role,
    permissions: member.permissions,
  };
}

// Standard paginated response
function paginatedResponse(data: any[], total: number, page: number, perPage: number) {
  return NextResponse.json({
    data,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
      hasMore: page * perPage < total,
    },
  });
}

// GET: List data with pagination + filters
export async function GET(request: NextRequest) {
  const user = await getMobileUser(request);
  if ('error' in user) return NextResponse.json({ error: user.error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource'); // posts, clients, campaigns, media, notifications
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const perPage = Math.min(50, Math.max(1, Number(searchParams.get('per_page')) || 20));
  const status = searchParams.get('status');
  const clientId = searchParams.get('client_id');
  const platform = searchParams.get('platform');
  const search = searchParams.get('search');
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  try {
    switch (resource) {
      case 'posts': {
        let query = supabase
          .from('posts')
          .select('*', { count: 'exact' })
          .eq('agency_id', user.agencyId)
          .order('created_at', { ascending: false })
          .range(from, to);
        if (status) query = query.eq('status', status);
        if (clientId) query = query.eq('client_id', clientId);
        if (platform) query = query.eq('platform', platform);
        if (search) query = query.ilike('content', `%${search}%`);
        const { data, count, error } = await query;
        if (error) throw error;
        return paginatedResponse(data || [], count || 0, page, perPage);
      }

      case 'clients': {
        let query = supabase
          .from('clients')
          .select('id, name, email, company, avatar_url, social_accounts, created_at', { count: 'exact' })
          .eq('agency_id', user.agencyId)
          .eq('active', true)
          .order('name')
          .range(from, to);
        if (search) query = query.ilike('name', `%${search}%`);
        const { data, count, error } = await query;
        if (error) throw error;
        return paginatedResponse(data || [], count || 0, page, perPage);
      }

      case 'campaigns': {
        let query = supabase
          .from('campaigns')
          .select('*', { count: 'exact' })
          .eq('agency_id', user.agencyId)
          .order('created_at', { ascending: false })
          .range(from, to);
        if (status) query = query.eq('status', status);
        const { data, count, error } = await query;
        if (error) throw error;
        return paginatedResponse(data || [], count || 0, page, perPage);
      }

      case 'media': {
        let query = supabase
          .from('media_library')
          .select('*', { count: 'exact' })
          .eq('agency_id', user.agencyId)
          .order('created_at', { ascending: false })
          .range(from, to);
        if (search) query = query.ilike('name', `%${search}%`);
        const { data, count, error } = await query;
        if (error) throw error;
        return paginatedResponse(data || [], count || 0, page, perPage);
      }

      case 'notifications': {
        const { data, count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact' })
          .eq('user_id', user.userId)
          .order('created_at', { ascending: false })
          .range(from, to);
        if (error) throw error;
        return paginatedResponse(data || [], count || 0, page, perPage);
      }

      case 'dashboard': {
        // Aggregated dashboard data for mobile home screen
        const [posts, clients, scheduled, drafts] = await Promise.all([
          supabase.from('posts').select('id', { count: 'exact', head: true }).eq('agency_id', user.agencyId),
          supabase.from('clients').select('id', { count: 'exact', head: true }).eq('agency_id', user.agencyId).eq('active', true),
          supabase.from('posts').select('id', { count: 'exact', head: true }).eq('agency_id', user.agencyId).eq('status', 'scheduled'),
          supabase.from('posts').select('id', { count: 'exact', head: true }).eq('agency_id', user.agencyId).eq('status', 'draft'),
        ]);
        const { data: agency } = await supabase.from('agencies').select('credits_balance, plan').eq('id', user.agencyId).single();
        return NextResponse.json({
          data: {
            totalPosts: posts.count || 0,
            totalClients: clients.count || 0,
            scheduledPosts: scheduled.count || 0,
            draftPosts: drafts.count || 0,
            credits: agency?.credits_balance || 0,
            plan: agency?.plan || 'starter',
          },
        });
      }

      default:
        return NextResponse.json({ error: 'Recurso inválido. Use: posts, clients, campaigns, media, notifications, dashboard' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Quick actions for mobile
export async function POST(request: NextRequest) {
  const user = await getMobileUser(request);
  if ('error' in user) return NextResponse.json({ error: user.error }, { status: 401 });

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'quick_post': {
        // Generate + create post in one call
        const { description, platform, clientId, generateImage } = body;
        if (!description) return NextResponse.json({ error: 'Descrição obrigatória' }, { status: 400 });

        const pipelineRes = await fetch(new URL('/api/ai/pipeline', request.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            cookie: request.headers.get('cookie') || '',
          },
          body: JSON.stringify({
            description,
            platforms: [platform || 'instagram'],
            count: 1,
            generateImages: generateImage !== false,
            clientId,
          }),
        });
        return NextResponse.json(await pipelineRes.json(), { status: pipelineRes.status });
      }

      case 'approve_post': {
        const { postId } = body;
        if (!postId) return NextResponse.json({ error: 'Post ID obrigatório' }, { status: 400 });
        const { error } = await supabase
          .from('posts')
          .update({ status: 'scheduled', approved_by: user.userId, approved_at: new Date().toISOString() })
          .eq('id', postId)
          .eq('agency_id', user.agencyId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Post aprovado e agendado' });
      }

      case 'reject_post': {
        const { postId, reason } = body;
        if (!postId) return NextResponse.json({ error: 'Post ID obrigatório' }, { status: 400 });
        const { error } = await supabase
          .from('posts')
          .update({ status: 'rejected', metadata: { rejection_reason: reason } })
          .eq('id', postId)
          .eq('agency_id', user.agencyId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Post rejeitado' });
      }

      case 'mark_notification_read': {
        const { notificationId } = body;
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId)
          .eq('user_id', user.userId);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Ação inválida. Use: quick_post, approve_post, reject_post, mark_notification_read' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
