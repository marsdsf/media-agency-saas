import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mobile auth — JWT-based login for React Native / Expo
export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name, refreshToken } = await request.json();

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return NextResponse.json({ error: error.message }, { status: 401 });

      // Get agency info
      const { data: member } = await supabase
        .from('agency_members')
        .select('agency_id, role, permissions, agencies(name, slug, plan)')
        .eq('user_id', data.user.id)
        .eq('active', true)
        .single();

      // Get credit balance
      const { data: agency } = member?.agency_id
        ? await supabase.from('agencies').select('credits_balance').eq('id', member.agency_id).single()
        : { data: null };

      return NextResponse.json({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || email.split('@')[0],
        },
        agency: member ? {
          id: member.agency_id,
          name: (member as any).agencies?.name,
          slug: (member as any).agencies?.slug,
          plan: (member as any).agencies?.plan,
          role: member.role,
          permissions: member.permissions,
          credits: agency?.credits_balance || 0,
        } : null,
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
        },
      });
    }

    if (action === 'register') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name || email.split('@')[0] } },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      return NextResponse.json({
        user: { id: data.user?.id, email: data.user?.email, name },
        message: 'Conta criada. Verifique seu email para confirmar.',
      });
    }

    if (action === 'refresh') {
      if (!refreshToken) {
        return NextResponse.json({ error: 'Refresh token obrigatório' }, { status: 400 });
      }

      const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      if (error) return NextResponse.json({ error: error.message }, { status: 401 });

      return NextResponse.json({
        session: {
          accessToken: data.session!.access_token,
          refreshToken: data.session!.refresh_token,
          expiresAt: data.session!.expires_at,
        },
      });
    }

    if (action === 'logout') {
      // Client-side should just discard the tokens
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
