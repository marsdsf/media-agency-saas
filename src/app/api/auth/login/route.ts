import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let errorMessage = 'Erro ao fazer login';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos.';
      } else if (error.message.includes('User not found')) {
        errorMessage = 'Usuário não encontrado';
      }
      
      return NextResponse.json(
        { error: errorMessage, details: error.message },
        { status: 400 }
      );
    }

    // Fetch profile + agency data for the logged-in user
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role, agency_id, permissions')
      .eq('id', data.user.id)
      .single();

    let agency = null;
    if (profile?.agency_id) {
      const { data: agencyData } = await supabase
        .from('agencies')
        .select('id, name, slug, plan, ai_credits_limit, ai_credits_used, subscription_status, max_clients, max_team_members, trial_ends_at')
        .eq('id', profile.agency_id)
        .single();
      agency = agencyData;
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      profile: profile ? {
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        role: profile.role,
        agencyId: profile.agency_id,
        permissions: profile.permissions,
      } : null,
      agency: agency ? {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        plan: agency.plan,
        aiCreditsLimit: agency.ai_credits_limit,
        aiCreditsUsed: agency.ai_credits_used,
        subscriptionStatus: agency.subscription_status,
        maxClients: agency.max_clients,
        maxTeamMembers: agency.max_team_members,
        trialEndsAt: agency.trial_ends_at,
      } : null,
    });
  } catch (error) {
    console.error('Login server error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
