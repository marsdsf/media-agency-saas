import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// GET /api/business/calendar — Get content calendar
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
    const status = searchParams.get('status');

    let query = supabase
      .from('content_calendar')
      .select(`
        *,
        products (id, name, primary_image, category)
      `)
      .eq('agency_id', ctx.agencyId)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (startDate) query = query.gte('scheduled_date', startDate);
    if (endDate) query = query.lte('scheduled_date', endDate);
    if (status) query = query.eq('status', status);

    const { data: entries, error } = await query;
    if (error) throw error;

    // Stats
    const stats = {
      total: entries?.length || 0,
      planned: entries?.filter((e) => e.status === 'planned').length || 0,
      ready: entries?.filter((e) => e.status === 'ready').length || 0,
      published: entries?.filter((e) => e.status === 'published').length || 0,
    };

    return NextResponse.json({ entries: entries || [], stats });
  } catch (error: any) {
    console.error('Calendar error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar calendário' }, { status: 500 });
  }
}

// PATCH /api/business/calendar — Update calendar entry
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.contentType !== undefined) updateData.content_type = updates.contentType;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.scheduledDate !== undefined) updateData.scheduled_date = updates.scheduledDate;
    if (updates.scheduledTime !== undefined) updateData.scheduled_time = updates.scheduledTime;
    if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
    if (updates.mediaUrls !== undefined) updateData.media_urls = updates.mediaUrls;
    if (updates.platform !== undefined) updateData.platform = updates.platform;

    const { data: entry, error } = await supabase
      .from('content_calendar')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ entry });
  } catch (error: any) {
    console.error('Calendar update error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao atualizar' }, { status: 500 });
  }
}

// DELETE /api/business/calendar — Delete calendar entry
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
    console.error('Calendar delete error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao deletar' }, { status: 500 });
  }
}
