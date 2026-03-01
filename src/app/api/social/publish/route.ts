import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { useCredits } from '@/lib/credits';

// Publicar em qualquer plataforma social
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const {
      postId,
      accountId,
      content,
      mediaUrls,
      hashtags,
      mediaType = 'IMAGE',
    } = await request.json();

    // Verificar créditos
    const creditResult = await useCredits(ctx.userId, 'publish_now', 'Publicação em rede social');
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 402 });
    }

    // Buscar conta social
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('agency_id', ctx.agencyId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    if (!account.access_token) {
      return NextResponse.json(
        { error: 'Token de acesso expirado. Reconecte a conta.' },
        { status: 401 }
      );
    }

    let result: { success: boolean; externalId?: string; error?: string };

    // Publicar na plataforma
    switch (account.platform) {
      case 'instagram':
        result = await publishInstagram(account, { content, mediaUrls, hashtags, mediaType });
        break;
      case 'facebook':
        result = await publishFacebook(account, { content, mediaUrls, hashtags });
        break;
      case 'linkedin':
        result = await publishLinkedIn(account, { content, mediaUrls, hashtags });
        break;
      case 'twitter':
      case 'x':
        result = await publishTwitter(account, { content, mediaUrls });
        break;
      default:
        result = { success: false, error: `Plataforma ${account.platform} não suportada` };
    }

    // Atualizar post no banco se postId fornecido
    if (postId) {
      await supabase
        .from('posts')
        .update({
          status: result.success ? 'published' : 'failed',
          published_at: result.success ? new Date().toISOString() : null,
          metadata: {
            external_id: result.externalId,
            error: result.error,
            published_via: 'manual',
            platform: account.platform,
          },
        })
        .eq('id', postId)
        .eq('agency_id', ctx.agencyId);
    }

    // Log de atividade
    await supabase.from('activity_log').insert({
      agency_id: ctx.agencyId,
      user_id: ctx.userId,
      action: result.success ? 'post_published' : 'post_failed',
      entity_type: 'post',
      entity_id: postId || null,
      details: {
        platform: account.platform,
        username: account.username,
        externalId: result.externalId,
        error: result.error,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Falha ao publicar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      externalId: result.externalId,
      platform: account.platform,
      creditsRemaining: creditResult.creditsRemaining,
    });
  } catch (error: any) {
    console.error('Social publish error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao publicar' },
      { status: 500 }
    );
  }
}

// === Instagram ===
async function publishInstagram(
  account: Record<string, any>,
  data: { content: string; mediaUrls?: string[]; hashtags?: string[]; mediaType?: string }
) {
  const caption = [
    data.content,
    data.hashtags?.length ? data.hashtags.map((h: string) => `#${h}`).join(' ') : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const mediaUrl = data.mediaUrls?.[0];
  if (!mediaUrl) {
    return { success: false, error: 'Instagram requer pelo menos uma imagem ou vídeo' };
  }

  try {
    // Container de mídia
    const containerBody: Record<string, string> = {
      caption,
      access_token: account.access_token,
    };

    if (data.mediaType === 'VIDEO' || data.mediaType === 'REELS') {
      containerBody.video_url = mediaUrl;
      containerBody.media_type = data.mediaType;
    } else {
      containerBody.image_url = mediaUrl;
    }

    // Se múltiplas imagens → Carrossel
    if (data.mediaUrls && data.mediaUrls.length > 1) {
      const childIds: string[] = [];

      for (const url of data.mediaUrls) {
        const childRes = await fetch(
          `https://graph.facebook.com/v18.0/${account.platform_user_id}/media`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_url: url,
              is_carousel_item: true,
              access_token: account.access_token,
            }),
          }
        );
        const childData = await childRes.json();
        if (childData.error) return { success: false, error: childData.error.message };
        childIds.push(childData.id);
      }

      // Criar carrossel
      const carouselRes = await fetch(
        `https://graph.facebook.com/v18.0/${account.platform_user_id}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            media_type: 'CAROUSEL',
            children: childIds.join(','),
            caption,
            access_token: account.access_token,
          }),
        }
      );
      const carouselData = await carouselRes.json();
      if (carouselData.error) return { success: false, error: carouselData.error.message };

      const publishRes = await fetch(
        `https://graph.facebook.com/v18.0/${account.platform_user_id}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: carouselData.id,
            access_token: account.access_token,
          }),
        }
      );
      const publishData = await publishRes.json();
      if (publishData.error) return { success: false, error: publishData.error.message };
      return { success: true, externalId: publishData.id };
    }

    // Post simples
    const containerRes = await fetch(
      `https://graph.facebook.com/v18.0/${account.platform_user_id}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(containerBody),
      }
    );
    const containerData = await containerRes.json();
    if (containerData.error) return { success: false, error: containerData.error.message };

    const publishRes = await fetch(
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
    const publishData = await publishRes.json();
    if (publishData.error) return { success: false, error: publishData.error.message };

    return { success: true, externalId: publishData.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// === Facebook ===
async function publishFacebook(
  account: Record<string, any>,
  data: { content: string; mediaUrls?: string[]; hashtags?: string[] }
) {
  const message = [
    data.content,
    data.hashtags?.length ? data.hashtags.map((h: string) => `#${h}`).join(' ') : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const mediaUrl = data.mediaUrls?.[0];
    let endpoint: string;
    let body: Record<string, string>;

    if (mediaUrl) {
      endpoint = `https://graph.facebook.com/v18.0/${account.platform_user_id}/photos`;
      body = { url: mediaUrl, message, access_token: account.access_token };
    } else {
      endpoint = `https://graph.facebook.com/v18.0/${account.platform_user_id}/feed`;
      body = { message, access_token: account.access_token };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const resData = await res.json();
    if (resData.error) return { success: false, error: resData.error.message };

    return { success: true, externalId: resData.id || resData.post_id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// === LinkedIn ===
async function publishLinkedIn(
  account: Record<string, any>,
  data: { content: string; mediaUrls?: string[]; hashtags?: string[] }
) {
  const text = [
    data.content,
    data.hashtags?.length ? data.hashtags.map((h: string) => `#${h}`).join(' ') : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const requestBody: Record<string, any> = {
      author: `urn:li:person:${account.platform_user_id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: data.mediaUrls?.length ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    if (data.mediaUrls?.length) {
      requestBody.specificContent['com.linkedin.ugc.ShareContent'].media = data.mediaUrls.map(
        (url: string) => ({ status: 'READY', originalUrl: url })
      );
    }

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(requestBody),
    });

    const resData = await res.json();
    if (res.status >= 400) return { success: false, error: resData.message || `HTTP ${res.status}` };

    return { success: true, externalId: resData.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// === Twitter/X ===
async function publishTwitter(
  account: Record<string, any>,
  data: { content: string; mediaUrls?: string[] }
) {
  try {
    // Twitter API v2 requer OAuth 1.0a ou OAuth 2.0
    // Usando o access_token armazenado (OAuth 2.0 Bearer)
    const tweetBody: Record<string, any> = {
      text: data.content.substring(0, 280), // Twitter limit
    };

    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetBody),
    });

    const resData = await res.json();
    if (res.status >= 400) {
      return { success: false, error: resData.detail || resData.title || `HTTP ${res.status}` };
    }

    return { success: true, externalId: resData.data?.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
