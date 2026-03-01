import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// GET /api/business/profile — Get business profile
export async function GET() {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .maybeSingle();

    if (error) throw error;

    // Also get account type
    const { data: agency } = await supabase
      .from('agencies')
      .select('account_type, name')
      .eq('id', ctx.agencyId)
      .single();

    return NextResponse.json({
      profile: profile || null,
      accountType: agency?.account_type || 'agency',
      agencyName: agency?.name,
    });
  } catch (error: any) {
    console.error('Business profile error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar perfil' }, { status: 500 });
  }
}

// POST /api/business/profile — Create or update business profile
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    // Set agency to solo mode
    await supabase
      .from('agencies')
      .update({ account_type: 'solo' })
      .eq('id', ctx.agencyId);

    const profileData = {
      agency_id: ctx.agencyId,
      business_name: body.businessName,
      business_type: body.businessType,
      business_description: body.businessDescription || null,
      target_audience: body.targetAudience || null,
      audience_age_range: body.audienceAgeRange || null,
      audience_gender: body.audienceGender || 'all',
      audience_location: body.audienceLocation || null,
      audience_interests: body.audienceInterests || [],
      brand_voice: body.brandVoice || 'profissional',
      brand_colors: body.brandColors || [],
      logo_url: body.logoUrl || null,
      preferred_platforms: body.preferredPlatforms || ['instagram'],
      posting_frequency: body.postingFrequency || 'daily',
      preferred_post_times: body.preferredPostTimes || ['09:00', '18:00'],
      content_pillars: body.contentPillars || [],
      content_style: body.contentStyle || null,
      onboarding_step: body.onboardingStep || 0,
      onboarding_completed: body.onboardingCompleted || false,
      updated_at: new Date().toISOString(),
    };

    // Upsert — create or update
    const { data: existing } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('agency_id', ctx.agencyId)
      .maybeSingle();

    let profile;
    if (existing) {
      const { data, error } = await supabase
        .from('business_profiles')
        .update(profileData)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      profile = data;
    } else {
      const { data, error } = await supabase
        .from('business_profiles')
        .insert(profileData)
        .select()
        .single();
      if (error) throw error;
      profile = data;
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Business profile save error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao salvar perfil' }, { status: 500 });
  }
}
