import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// GET /api/business/autopilot — Get autopilot settings
export async function GET() {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: settings } = await supabase
      .from('autopilot_settings')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .maybeSingle();

    return NextResponse.json({
      settings: settings || {
        is_enabled: false,
        posts_per_day: 1,
        post_times: ['09:00', '18:00'],
        platforms: ['instagram'],
        auto_hashtags: true,
        auto_caption: true,
        include_products: true,
        include_tips: true,
        include_promotions: true,
        require_approval: true,
        active_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
        content_mix: { product: 40, tips: 25, engagement: 20, promotional: 15 },
        creativity_level: 0.7,
        use_trends: true,
      },
    });
  } catch (error: any) {
    console.error('Autopilot error:', error);
    return NextResponse.json({ error: error.message || 'Erro' }, { status: 500 });
  }
}

// POST /api/business/autopilot — Save autopilot settings
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const settingsData = {
      agency_id: ctx.agencyId,
      is_enabled: body.isEnabled ?? false,
      posts_per_day: body.postsPerDay ?? 1,
      post_times: body.postTimes ?? ['09:00', '18:00'],
      platforms: body.platforms ?? ['instagram'],
      auto_hashtags: body.autoHashtags ?? true,
      auto_caption: body.autoCaption ?? true,
      include_products: body.includeProducts ?? true,
      include_tips: body.includeTips ?? true,
      include_promotions: body.includePromotions ?? true,
      require_approval: body.requireApproval ?? true,
      auto_approve_after_hours: body.autoApproveAfterHours ?? null,
      active_days: body.activeDays ?? ['mon', 'tue', 'wed', 'thu', 'fri'],
      content_mix: body.contentMix ?? { product: 40, tips: 25, engagement: 20, promotional: 15 },
      creativity_level: body.creativityLevel ?? 0.7,
      use_trends: body.useTrends ?? true,
      updated_at: new Date().toISOString(),
    };

    // Upsert
    const { data: existing } = await supabase
      .from('autopilot_settings')
      .select('id')
      .eq('agency_id', ctx.agencyId)
      .maybeSingle();

    let settings;
    if (existing) {
      const { data, error } = await supabase
        .from('autopilot_settings')
        .update(settingsData)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      settings = data;
    } else {
      const { data, error } = await supabase
        .from('autopilot_settings')
        .insert(settingsData)
        .select()
        .single();
      if (error) throw error;
      settings = data;
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Autopilot save error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao salvar' }, { status: 500 });
  }
}
