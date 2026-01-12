import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Listar contas sociais do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Remover tokens sensíveis da resposta
    const safeAccounts = accounts?.map(acc => ({
      id: acc.id,
      platform: acc.platform,
      username: acc.username,
      displayName: acc.display_name,
      avatarUrl: acc.avatar_url,
      isActive: acc.is_active,
      createdAt: acc.created_at,
    }));

    return NextResponse.json({ accounts: safeAccounts });
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar contas' },
      { status: 500 }
    );
  }
}

// Desconectar conta social
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { accountId } = await request.json();

    const { error } = await supabase
      .from('social_accounts')
      .update({ is_active: false })
      .eq('id', accountId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error disconnecting account:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao desconectar conta' },
      { status: 500 }
    );
  }
}
