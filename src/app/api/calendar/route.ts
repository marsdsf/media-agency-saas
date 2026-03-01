import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Listar eventos do calendário
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const clientId = searchParams.get('client_id');

    let query = supabase
      .from('content_calendar')
      .select('*, clients(id, name, brand_color)')
      .eq('agency_id', ctx.agencyId)
      .order('scheduled_date');

    if (startDate) query = query.gte('scheduled_date', startDate);
    if (endDate) query = query.lte('scheduled_date', endDate);
    if (clientId) query = query.eq('client_id', clientId);

    const { data: events, error } = await query;
    if (error) throw error;

    // Also fetch posts with scheduled_at for the calendar view
    let postsQuery = supabase
      .from('posts')
      .select('id, content, status, scheduled_at, platform, client_id, clients(id, name, brand_color)')
      .eq('agency_id', ctx.agencyId)
      .not('scheduled_at', 'is', null);

    if (startDate) postsQuery = postsQuery.gte('scheduled_at', startDate);
    if (endDate) postsQuery = postsQuery.lte('scheduled_at', endDate);
    if (clientId) postsQuery = postsQuery.eq('client_id', clientId);

    const { data: scheduledPosts } = await postsQuery;

    return NextResponse.json({ events, scheduledPosts: scheduledPosts || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar calendário' }, { status: 500 });
  }
}

// Criar evento no calendário
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const { data: event, error } = await supabase
      .from('content_calendar')
      .insert({
        agency_id: ctx.agencyId,
        client_id: body.clientId || null,
        title: body.title,
        description: body.description || null,
        scheduled_date: body.scheduledDate,
        scheduled_time: body.scheduledTime || null,
        content_type: body.contentType || 'post',
        platform: body.platform || null,
        status: body.status || 'planned',
        color: body.color || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar evento' }, { status: 500 });
  }
}

// Atualizar evento
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const fieldMap: Record<string, string> = {
      clientId: 'client_id', scheduledDate: 'scheduled_date',
      scheduledTime: 'scheduled_time', contentType: 'content_type',
    };

    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      updateData[fieldMap[key] || key] = value;
    }

    const { data: event, error } = await supabase
      .from('content_calendar')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar evento' }, { status: 500 });
  }
}

// Deletar evento
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await request.json();

    const { error } = await supabase
      .from('content_calendar')
      .delete()
      .eq('id', id)
      .eq('agency_id', ctx.agencyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao deletar evento' }, { status: 500 });
  }
}
