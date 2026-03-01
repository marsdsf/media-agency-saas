import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Buscar perfil do usuário com dados da agência
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', ctx.userId)
      .single();

    if (profileError) throw profileError;

    // Fetch agency data
    const { data: agency } = await supabase
      .from('agencies')
      .select('id, name, slug, plan, ai_credits_limit, ai_credits_used, subscription_status, max_clients, max_team_members, trial_ends_at, website, logo_url')
      .eq('id', ctx.agencyId)
      .single();

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        role: profile.role,
        agencyId: profile.agency_id,
        permissions: profile.permissions,
        createdAt: profile.created_at,
      },
      agency: agency ? {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        plan: agency.plan,
        aiCreditsLimit: agency.ai_credits_limit,
        aiCreditsUsed: agency.ai_credits_used,
        creditsRemaining: agency.ai_credits_limit === -1 ? -1 : agency.ai_credits_limit - agency.ai_credits_used,
        subscriptionStatus: agency.subscription_status,
        maxClients: agency.max_clients,
        maxTeamMembers: agency.max_team_members,
        trialEndsAt: agency.trial_ends_at,
        website: agency.website,
        logoUrl: agency.logo_url,
      } : null,
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}

// Atualizar perfil
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const updates = await request.json();

    // Profile fields allowed
    const profileFields = ['full_name', 'avatar_url'];
    const profileUpdates: Record<string, any> = {};
    for (const field of profileFields) {
      if (updates[field] !== undefined) {
        profileUpdates[field] = updates[field];
      }
    }

    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', ctx.userId);

      if (error) throw error;
    }

    // Agency fields (only owner/admin can update)
    const agencyFields = ['name', 'website', 'logo_url'];
    const agencyUpdates: Record<string, any> = {};
    for (const field of agencyFields) {
      if (updates[`agency_${field}`] !== undefined) {
        agencyUpdates[field] = updates[`agency_${field}`];
      }
    }

    if (Object.keys(agencyUpdates).length > 0) {
      if (ctx.role !== 'agency_owner' && ctx.role !== 'agency_admin') {
        return NextResponse.json(
          { error: 'Sem permissão para atualizar dados da agência' },
          { status: 403 }
        );
      }

      const { error } = await supabase
        .from('agencies')
        .update(agencyUpdates)
        .eq('id', ctx.agencyId);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}
