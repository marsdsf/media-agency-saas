import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, agencyName, agencyWebsite, teamSize, plan, inviteToken } = await request.json();

    // === FLUXO DE CONVITE ===
    if (inviteToken) {
      return handleInviteRegistration({ name, email, password, inviteToken });
    }

    // === FLUXO NORMAL ===
    if (!name || !email || !password || !agencyName) {
      return NextResponse.json(
        { error: 'Nome, email, senha e nome da agência são obrigatórios' },
        { status: 400 }
      );
    }

    // Plan limits
    const planLimits: Record<string, { maxClients: number; maxMembers: number; aiCredits: number }> = {
      starter: { maxClients: 5, maxMembers: 2, aiCredits: 2000 },
      professional: { maxClients: 20, maxMembers: 5, aiCredits: 10000 },
      enterprise: { maxClients: 50, maxMembers: -1, aiCredits: -1 }, // -1 = unlimited
    };

    const limits = planLimits[plan] || planLimits.starter;

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'agency_owner',
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Este email já está registrado' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // 2. Create agency
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agencies')
      .insert({
        name: agencyName,
        slug: agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        website: agencyWebsite || null,
        owner_id: userId,
        plan,
        max_clients: limits.maxClients,
        max_team_members: limits.maxMembers,
        ai_credits_limit: limits.aiCredits,
        ai_credits_used: 0,
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        settings: {
          teamSize,
          onboardingCompleted: false,
        },
      })
      .select()
      .single();

    if (agencyError) {
      console.error('Agency error:', agencyError);
      // Rollback: delete user if agency creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Erro ao criar agência' },
        { status: 500 }
      );
    }

    // 3. Create profile for agency owner
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: name,
        role: 'agency_owner',
        agency_id: agency.id,
        permissions: ['*'], // Full permissions for owner
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      // Rollback
      await supabaseAdmin.from('agencies').delete().eq('id', agency.id);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Erro ao criar perfil' },
        { status: 500 }
      );
    }

    // 4. Create activity log entry
    await supabaseAdmin
      .from('activity_log')
      .insert({
        agency_id: agency.id,
        user_id: userId,
        action: 'agency_created',
        entity_type: 'agency',
        entity_id: agency.id,
        details: {
          plan,
          agencyName,
        },
      });

    // 5. Create welcome notification
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'welcome',
        title: 'Bem-vindo ao MediaAI! 🎉',
        message: `Sua agência "${agencyName}" foi criada com sucesso. Você tem 14 dias de trial grátis.`,
        action_url: '/dashboard?welcome=true',
      });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        name,
      },
      agency: {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        plan: agency.plan,
        trialEndsAt: agency.trial_ends_at,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Registrar via convite — entra em agência existente
async function handleInviteRegistration(params: {
  name: string;
  email: string;
  password: string;
  inviteToken: string;
}) {
  const { name, email, password, inviteToken } = params;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'Nome, email e senha são obrigatórios' },
      { status: 400 }
    );
  }

  // Buscar convite válido
  const { data: invitation, error: invError } = await supabaseAdmin
    .from('invitations')
    .select('*')
    .eq('token', inviteToken)
    .eq('status', 'pending')
    .single();

  if (invError || !invitation) {
    return NextResponse.json(
      { error: 'Convite inválido ou expirado' },
      { status: 400 }
    );
  }

  // Verificar se expirou
  if (new Date(invitation.expires_at) < new Date()) {
    await supabaseAdmin
      .from('invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id);

    return NextResponse.json(
      { error: 'Este convite expirou' },
      { status: 400 }
    );
  }

  // Verificar email (se o convite é para email específico)
  if (invitation.email && invitation.email !== email) {
    return NextResponse.json(
      { error: 'Este convite foi enviado para outro email' },
      { status: 400 }
    );
  }

  // Criar usuário
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role: invitation.role || 'agency_member',
    },
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      return NextResponse.json(
        { error: 'Este email já está registrado' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }

  const userId = authData.user.id;

  // Criar perfil vinculado à agência do convite
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: name,
      role: invitation.role || 'agency_member',
      agency_id: invitation.agency_id,
      permissions: invitation.permissions || [],
    });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: 'Erro ao criar perfil' },
      { status: 500 }
    );
  }

  // Atualizar convite como aceito
  await supabaseAdmin
    .from('invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', invitation.id);

  // Buscar nome da agência
  const { data: agency } = await supabaseAdmin
    .from('agencies')
    .select('name, slug')
    .eq('id', invitation.agency_id)
    .single();

  // Log de atividade
  await supabaseAdmin.from('activity_log').insert({
    agency_id: invitation.agency_id,
    user_id: userId,
    action: 'member_joined',
    entity_type: 'profile',
    entity_id: userId,
    details: {
      name,
      email,
      role: invitation.role,
      invitedBy: invitation.invited_by,
    },
  });

  // Notificação para quem convidou
  await supabaseAdmin.from('notifications').insert({
    user_id: invitation.invited_by,
    type: 'team',
    title: 'Novo membro no time!',
    message: `${name} aceitou o convite e entrou na equipe.`,
    action_url: '/dashboard/team',
  });

  // Notificação de boas-vindas
  await supabaseAdmin.from('notifications').insert({
    user_id: userId,
    type: 'welcome',
    title: `Bem-vindo à ${agency?.name || 'equipe'}! 🎉`,
    message: 'Você foi adicionado à equipe com sucesso.',
    action_url: '/dashboard',
  });

  return NextResponse.json({
    success: true,
    user: { id: userId, email, name },
    agency: {
      id: invitation.agency_id,
      name: agency?.name,
      slug: agency?.slug,
    },
  });
}
