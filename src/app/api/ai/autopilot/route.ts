import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { loadBrandMemory, analyzeBestPostingTimes } from '@/lib/ai-memory';

// GET - buscar configuração do autopilot
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const clientId = request.nextUrl.searchParams.get('clientId');
    const supabase = await createClient();

    const query = supabase
      .from('ai_autopilot_configs')
      .select('*')
      .eq('agency_id', ctx.agencyId);

    if (clientId) {
      query.eq('client_id', clientId);
    }

    const { data } = clientId
      ? await query.maybeSingle()
      : await query.order('created_at', { ascending: false });

    // Buscar stats de posts gerados pelo autopilot
    const { data: stats } = await supabase
      .from('posts')
      .select('id, status, platform')
      .eq('agency_id', ctx.agencyId)
      .eq('metadata->>pipeline', 'true')
      .order('created_at', { ascending: false })
      .limit(100);

    const summary = {
      totalGenerated: stats?.length || 0,
      published: stats?.filter(s => s.status === 'published').length || 0,
      scheduled: stats?.filter(s => s.status === 'scheduled').length || 0,
      drafts: stats?.filter(s => s.status === 'draft').length || 0,
    };

    return NextResponse.json({
      config: data,
      stats: summary,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - criar/atualizar configuração do autopilot
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const {
      clientId,
      enabled,
      platforms,
      frequency,         // posts per week per platform
      contentPillars,
      tone,
      autoApprove,
      autoPost,
      preferredTimes,
      imageGeneration,
      provider,
      description,       // Descrição geral do que o autopilot deve gerar
    } = await request.json();

    const supabase = await createClient();

    // Upsert config
    const { data: existing } = await supabase
      .from('ai_autopilot_configs')
      .select('id')
      .eq('agency_id', ctx.agencyId)
      .eq('client_id', clientId || '')
      .maybeSingle();

    const configData = {
      agency_id: ctx.agencyId,
      client_id: clientId || null,
      enabled: enabled !== false,
      platforms: platforms || ['instagram'],
      frequency: frequency || { instagram: 3 },
      content_pillars: contentPillars || [],
      tone: tone || 'profissional',
      auto_approve: autoApprove || false,
      auto_post: autoPost || false,
      preferred_times: preferredTimes || {},
      image_generation: imageGeneration !== false,
      provider: provider || 'auto',
      description: description || '',
      updated_by: ctx.userId,
    };

    let config;
    if (existing) {
      const { data } = await supabase
        .from('ai_autopilot_configs')
        .update(configData)
        .eq('id', existing.id)
        .select()
        .single();
      config = data;
    } else {
      const { data } = await supabase
        .from('ai_autopilot_configs')
        .insert(configData)
        .select()
        .single();
      config = data;
    }

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - desativar autopilot
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { clientId } = await request.json();
    const supabase = await createClient();

    await supabase
      .from('ai_autopilot_configs')
      .update({ enabled: false })
      .eq('agency_id', ctx.agencyId)
      .eq('client_id', clientId || '');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
