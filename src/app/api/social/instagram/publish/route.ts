import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { useCredits } from '@/lib/credits';

// Publicar no Instagram
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { accountId, caption, mediaUrl, mediaType = 'IMAGE' } = await request.json();

    // Verificar créditos
    const creditResult = await useCredits(user.id, 'publish_now', 'Publicação no Instagram');
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 402 });
    }

    // Buscar conta social
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    // Passo 1: Criar container de mídia
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${account.platform_user_id}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: mediaUrl,
          caption,
          access_token: account.access_token,
        }),
      }
    );

    const containerData = await containerResponse.json();

    if (containerData.error) {
      throw new Error(containerData.error.message);
    }

    // Passo 2: Publicar o container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${account.platform_user_id}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: account.access_token,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (publishData.error) {
      throw new Error(publishData.error.message);
    }

    return NextResponse.json({
      success: true,
      postId: publishData.id,
      creditsRemaining: creditResult.creditsRemaining,
    });
  } catch (error: any) {
    console.error('Instagram publish error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao publicar' },
      { status: 500 }
    );
  }
}
