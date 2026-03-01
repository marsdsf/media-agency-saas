import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/auth';

// Cron endpoint para publicar posts agendados
// Protegido por CRON_SECRET - chamado por Vercel Cron ou serviço externo
export async function GET(request: NextRequest) {
  try {
    // Verificar autorização via CRON_SECRET ou Authorization header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    // Buscar posts agendados que já passaram do horário
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select(`
        *,
        social_accounts (
          id,
          platform,
          platform_user_id,
          access_token,
          username
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(50);

    if (fetchError) {
      throw fetchError;
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: 'Nenhum post para publicar', published: 0 });
    }

    const results: { id: string; status: string; error?: string }[] = [];

    for (const post of posts) {
      try {
        const account = post.social_accounts;

        if (!account || !account.access_token) {
          // Sem conta social vinculada ou sem token — marcar como falha
          await supabase
            .from('posts')
            .update({
              status: 'failed',
              published_at: now,
              metadata: {
                ...(post.metadata || {}),
                error: 'Conta social não configurada ou token expirado',
              },
            })
            .eq('id', post.id);

          results.push({ id: post.id, status: 'failed', error: 'No social account' });
          continue;
        }

        let publishSuccess = false;
        let publishError = '';
        let externalId = '';

        // Publicar na plataforma correspondente
        switch (account.platform) {
          case 'instagram': {
            const result = await publishToInstagram(account, post);
            publishSuccess = result.success;
            publishError = result.error || '';
            externalId = result.externalId || '';
            break;
          }
          case 'facebook': {
            const result = await publishToFacebook(account, post);
            publishSuccess = result.success;
            publishError = result.error || '';
            externalId = result.externalId || '';
            break;
          }
          case 'linkedin': {
            const result = await publishToLinkedIn(account, post);
            publishSuccess = result.success;
            publishError = result.error || '';
            externalId = result.externalId || '';
            break;
          }
          case 'tiktok': {
            // TikTok requer fluxo diferente (upload direto)
            publishSuccess = false;
            publishError = 'Publicação no TikTok requer interação manual';
            break;
          }
          default: {
            publishSuccess = false;
            publishError = `Plataforma ${account.platform} não suportada para publicação automática`;
          }
        }

        // Atualizar status do post
        const newStatus = publishSuccess ? 'published' : 'failed';
        await supabase
          .from('posts')
          .update({
            status: newStatus,
            published_at: publishSuccess ? now : null,
            metadata: {
              ...(post.metadata || {}),
              external_id: externalId || undefined,
              error: publishError || undefined,
              published_via: 'cron',
            },
          })
          .eq('id', post.id);

        // Registrar no log de atividades
        await supabase.from('activity_log').insert({
          agency_id: post.agency_id,
          user_id: post.created_by,
          action: publishSuccess ? 'post_published' : 'post_failed',
          entity_type: 'post',
          entity_id: post.id,
          details: {
            platform: account.platform,
            username: account.username,
            error: publishError || undefined,
          },
        });

        results.push({
          id: post.id,
          status: newStatus,
          error: publishError || undefined,
        });
      } catch (postError: any) {
        console.error(`Error publishing post ${post.id}:`, postError);

        await supabase
          .from('posts')
          .update({
            status: 'failed',
            metadata: {
              ...(post.metadata || {}),
              error: postError.message,
            },
          })
          .eq('id', post.id);

        results.push({ id: post.id, status: 'failed', error: postError.message });
      }
    }

    const published = results.filter((r) => r.status === 'published').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    return NextResponse.json({
      message: `Processados ${results.length} posts: ${published} publicados, ${failed} falhas`,
      published,
      failed,
      results,
    });
  } catch (error: any) {
    console.error('Cron publish error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro no cron de publicação' },
      { status: 500 }
    );
  }
}

// === Funções de publicação por plataforma ===

interface PublishResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

async function publishToInstagram(
  account: { platform_user_id: string; access_token: string },
  post: { content: string; media_urls?: string[]; hashtags?: string[] }
): Promise<PublishResult> {
  try {
    const caption = [
      post.content,
      post.hashtags?.length ? post.hashtags.map((h) => `#${h}`).join(' ') : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const mediaUrl = post.media_urls?.[0];
    if (!mediaUrl) {
      return { success: false, error: 'Instagram requer pelo menos uma imagem' };
    }

    // Passo 1: Criar container de mídia
    const containerRes = await fetch(
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

    const containerData = await containerRes.json();
    if (containerData.error) {
      return { success: false, error: containerData.error.message };
    }

    // Passo 2: Publicar o container
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
    if (publishData.error) {
      return { success: false, error: publishData.error.message };
    }

    return { success: true, externalId: publishData.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function publishToFacebook(
  account: { platform_user_id: string; access_token: string },
  post: { content: string; media_urls?: string[]; hashtags?: string[] }
): Promise<PublishResult> {
  try {
    const message = [
      post.content,
      post.hashtags?.length ? post.hashtags.map((h) => `#${h}`).join(' ') : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const mediaUrl = post.media_urls?.[0];

    let endpoint: string;
    let body: Record<string, string>;

    if (mediaUrl) {
      // Post com foto
      endpoint = `https://graph.facebook.com/v18.0/${account.platform_user_id}/photos`;
      body = {
        url: mediaUrl,
        message,
        access_token: account.access_token,
      };
    } else {
      // Post somente texto
      endpoint = `https://graph.facebook.com/v18.0/${account.platform_user_id}/feed`;
      body = {
        message,
        access_token: account.access_token,
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.error) {
      return { success: false, error: data.error.message };
    }

    return { success: true, externalId: data.id || data.post_id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function publishToLinkedIn(
  account: { platform_user_id: string; access_token: string },
  post: { content: string; media_urls?: string[]; hashtags?: string[] }
): Promise<PublishResult> {
  try {
    const text = [
      post.content,
      post.hashtags?.length ? post.hashtags.map((h) => `#${h}`).join(' ') : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const requestBody: Record<string, any> = {
      author: `urn:li:person:${account.platform_user_id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: post.media_urls?.length ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    // Adicionar mídia se disponível
    if (post.media_urls?.length) {
      requestBody.specificContent['com.linkedin.ugc.ShareContent'].media = post.media_urls.map(
        (url) => ({
          status: 'READY',
          originalUrl: url,
        })
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

    const data = await res.json();
    if (res.status >= 400) {
      return { success: false, error: data.message || `HTTP ${res.status}` };
    }

    return { success: true, externalId: data.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
