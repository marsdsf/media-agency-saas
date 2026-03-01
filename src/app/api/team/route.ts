import { NextRequest, NextResponse } from 'next/server';
import { getUserContext, hasPermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, invitationEmailTemplate } from '@/lib/email';

// Listar membros do time
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch team members (profiles with same agency_id)
    const { data: members, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, permissions, created_at')
      .eq('agency_id', ctx.agencyId)
      .order('created_at');

    if (error) throw error;

    // Fetch pending invitations
    const { data: invitations } = await supabase
      .from('invitations')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      members: members?.map(m => ({
        id: m.id,
        email: m.email,
        fullName: m.full_name,
        avatarUrl: m.avatar_url,
        role: m.role,
        permissions: m.permissions,
        createdAt: m.created_at,
      })),
      invitations: invitations || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar time' }, { status: 500 });
  }
}

// Convidar membro
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!hasPermission(ctx, 'team.invite')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const supabase = await createClient();
    const body = await request.json();

    // Check team limit
    const { count: memberCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', ctx.agencyId);

    const { data: agency } = await supabase
      .from('agencies')
      .select('max_team_members')
      .eq('id', ctx.agencyId)
      .single();

    if (agency && agency.max_team_members !== -1 && (memberCount || 0) >= agency.max_team_members) {
      return NextResponse.json(
        { error: 'Limite de membros atingido. Faça upgrade do plano.' },
        { status: 403 }
      );
    }

    // Create invitation
    const token = crypto.randomUUID();
    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert({
        agency_id: ctx.agencyId,
        email: body.email,
        role: body.role || 'agency_member',
        permissions: body.permissions || [],
        invited_by: ctx.userId,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single();

    if (error) throw error;

    // Enviar email de convite
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?invite=${token}`;

    const { data: agencyData } = await supabase
      .from('agencies')
      .select('name')
      .eq('id', ctx.agencyId)
      .single();

    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', ctx.userId)
      .single();

    const emailTemplate = invitationEmailTemplate({
      agencyName: agencyData?.name || 'Agência',
      inviterName: inviterProfile?.full_name || inviterProfile?.email || 'Um membro',
      inviteUrl,
      role: body.role || 'agency_member',
    });

    // Fire-and-forget email (não bloquear resposta)
    sendEmail({
      to: body.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    }).catch((err) => console.error('Failed to send invitation email:', err));

    return NextResponse.json({
      success: true,
      invitation,
      inviteUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao convidar' }, { status: 500 });
  }
}

// Atualizar membro (role/permissions)
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!hasPermission(ctx, 'team.manage')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const supabase = await createClient();
    const { memberId, role, permissions } = await request.json();

    // Prevent changing own role
    if (memberId === ctx.userId) {
      return NextResponse.json({ error: 'Não é possível alterar seu próprio perfil' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', memberId)
      .eq('agency_id', ctx.agencyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar membro' }, { status: 500 });
  }
}

// Remover membro do time
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!hasPermission(ctx, 'team.remove')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const supabase = await createClient();
    const { memberId, invitationId } = await request.json();

    if (invitationId) {
      // Cancel invitation
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId)
        .eq('agency_id', ctx.agencyId);

      if (error) throw error;
    } else if (memberId) {
      // Remove member from agency
      if (memberId === ctx.userId) {
        return NextResponse.json({ error: 'Não é possível se remover' }, { status: 400 });
      }

      const { error } = await supabase
        .from('profiles')
        .update({ agency_id: null, role: null, permissions: [] })
        .eq('id', memberId)
        .eq('agency_id', ctx.agencyId);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao remover' }, { status: 500 });
  }
}
