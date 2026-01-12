import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Buscar perfil do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        plan: profile.plan,
        credits: profile.credits,
        creditsUsed: profile.credits_used,
        subscriptionStatus: profile.subscription_status,
        createdAt: profile.created_at,
      }
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const updates = await request.json();

    // Campos permitidos para atualização
    const allowedFields = ['full_name', 'avatar_url'];
    const filteredUpdates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(filteredUpdates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}
