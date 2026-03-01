import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { useCredits } from '@/lib/credits';
import { fullModeration, validateForPlatform, type ModerationResult } from '@/lib/content-moderation';

/**
 * Batch Publish API
 * 
 * Supports:
 * - Publishing same content to multiple platforms at once
 * - Publishing multiple posts in batch (queue)
 * - Content moderation before publishing
 * - Platform-specific validation
 * - Partial success (some platforms succeed, others fail)
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    // Two modes:
    // 1. multiPlatform: same content → multiple accounts
    // 2. batchQueue: array of posts to publish sequentially
    const { mode = 'multiPlatform' } = body;

    if (mode === 'multiPlatform') {
      return handleMultiPlatform(supabase, ctx, body);
    } else if (mode === 'batchQueue') {
      return handleBatchQueue(supabase, ctx, body);
    }

    return NextResponse.json({ error: 'Modo inválido' }, { status: 400 });
  } catch (error: any) {
    console.error('Batch publish error:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}

// === Mode 1: Same content → multiple platforms ===
async function handleMultiPlatform(
  supabase: any,
  ctx: { userId: string; agencyId: string },
  body: {
    content: string;
    mediaUrls?: string[];
    hashtags?: string[];
    accountIds: string[];
    scheduledAt?: string;
    skipModeration?: boolean;
    mediaType?: string;
  }
) {
  const { content, mediaUrls, hashtags, accountIds, scheduledAt, skipModeration, mediaType } = body;

  if (!content || !accountIds?.length) {
    return NextResponse.json({ error: 'Conteúdo e pelo menos 1 conta são obrigatórios' }, { status: 400 });
  }

  if (accountIds.length > 10) {
    return NextResponse.json({ error: 'Máximo 10 contas por vez' }, { status: 400 });
  }

  // 1. Content moderation
  if (!skipModeration) {
    const moderation = await fullModeration(content, { skipAI: false });
    if (!moderation.approved) {
      return NextResponse.json({
        error: 'Conteúdo bloqueado pela moderação',
        moderation: {
          score: moderation.score,
          flags: moderation.flags,
          suggestions: moderation.suggestions,
        },
      }, { status: 422 });
    }
  }

  // 2. Fetch all accounts
  const { data: accounts, error: accError } = await supabase
    .from('social_accounts')
    .select('*')
    .in('id', accountIds)
    .eq('agency_id', ctx.agencyId)
    .eq('is_active', true);

  if (accError || !accounts?.length) {
    return NextResponse.json({ error: 'Nenhuma conta encontrada' }, { status: 404 });
  }

  // 3. Validate per platform
  const validationErrors: { accountId: string; platform: string; errors: string[] }[] = [];
  for (const account of accounts) {
    const validation = validateForPlatform(content, account.platform, mediaUrls);
    if (!validation.valid) {
      validationErrors.push({
        accountId: account.id,
        platform: account.platform,
        errors: validation.errors,
      });
    }
  }

  if (validationErrors.length > 0) {
    return NextResponse.json({
      error: 'Conteúdo incompatível com algumas plataformas',
      validationErrors,
    }, { status: 422 });
  }

  // 4. Check credits (1 credit per platform)
  const totalCredits = accounts.length;
  const creditResult = await useCredits(ctx.userId, 'publish_now', `Publicação em lote (${accounts.length} plataformas)`);
  if (!creditResult.success) {
    return NextResponse.json({ error: creditResult.error }, { status: 402 });
  }

  // 5. If scheduling, create posts for each account and return
  if (scheduledAt) {
    const posts = [];
    for (const account of accounts) {
      const { data: post } = await supabase
        .from('posts')
        .insert({
          agency_id: ctx.agencyId,
          created_by: ctx.userId,
          social_account_id: account.id,
          content,
          media_urls: mediaUrls || [],
          hashtags: hashtags || [],
          scheduled_at: scheduledAt,
          status: 'scheduled',
          platform: account.platform,
          metadata: { batch: true, batch_size: accounts.length },
        })
        .select()
        .single();
      if (post) posts.push(post);
    }

    return NextResponse.json({
      success: true,
      scheduled: true,
      postsCreated: posts.length,
      scheduledAt,
      posts,
    });
  }

  // 6. Publish immediately to each platform
  const results: {
    accountId: string;
    platform: string;
    username: string;
    success: boolean;
    externalId?: string;
    error?: string;
  }[] = [];

  for (const account of accounts) {
    try {
      const result = await publishToPlatform(account, { content, mediaUrls, hashtags, mediaType });

      // Create post record
      await supabase.from('posts').insert({
        agency_id: ctx.agencyId,
        created_by: ctx.userId,
        social_account_id: account.id,
        content,
        media_urls: mediaUrls || [],
        hashtags: hashtags || [],
        status: result.success ? 'published' : 'failed',
        published_at: result.success ? new Date().toISOString() : null,
        platform: account.platform,
        platform_post_id: result.externalId || null,
        error_message: result.error || null,
        metadata: { batch: true, published_via: 'batch' },
      });

      results.push({
        accountId: account.id,
        platform: account.platform,
        username: account.username,
        success: result.success,
        externalId: result.externalId,
        error: result.error,
      });
    } catch (err: any) {
      results.push({
        accountId: account.id,
        platform: account.platform,
        username: account.username,
        success: false,
        error: err.message,
      });
    }
  }

  // Activity log
  await supabase.from('activity_log').insert({
    agency_id: ctx.agencyId,
    user_id: ctx.userId,
    action: 'batch_published',
    entity_type: 'post',
    details: {
      totalPlatforms: accounts.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      platforms: results.map(r => r.platform),
    },
  });

  return NextResponse.json({
    success: true,
    total: results.length,
    succeeded: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  });
}

// === Mode 2: Batch queue (multiple different posts) ===
async function handleBatchQueue(
  supabase: any,
  ctx: { userId: string; agencyId: string },
  body: {
    posts: Array<{
      content: string;
      mediaUrls?: string[];
      hashtags?: string[];
      accountId: string;
      scheduledAt?: string;
      mediaType?: string;
    }>;
    skipModeration?: boolean;
  }
) {
  const { posts, skipModeration } = body;

  if (!posts?.length) {
    return NextResponse.json({ error: 'Lista de posts vazia' }, { status: 400 });
  }

  if (posts.length > 50) {
    return NextResponse.json({ error: 'Máximo 50 posts por lote' }, { status: 400 });
  }

  // 1. Moderate all content first
  const moderationResults: { index: number; moderation: ModerationResult }[] = [];
  if (!skipModeration) {
    for (let i = 0; i < posts.length; i++) {
      const moderation = await fullModeration(posts[i].content, { skipAI: true }); // skip AI for batch perf
      if (!moderation.approved) {
        moderationResults.push({ index: i, moderation });
      }
    }
  }

  if (moderationResults.length > 0) {
    return NextResponse.json({
      error: `${moderationResults.length} post(s) bloqueados pela moderação`,
      blocked: moderationResults.map(r => ({
        postIndex: r.index,
        flags: r.moderation.flags,
        suggestions: r.moderation.suggestions,
      })),
    }, { status: 422 });
  }

  // 2. Fetch all unique account IDs
  const uniqueAccountIds = [...new Set(posts.map(p => p.accountId))];
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .in('id', uniqueAccountIds)
    .eq('agency_id', ctx.agencyId)
    .eq('is_active', true);

  const accountMap = new Map<string, any>((accounts || []).map((a: any) => [a.id, a]));

  // 3. Process each post
  const results: {
    index: number;
    success: boolean;
    scheduled?: boolean;
    postId?: string;
    error?: string;
  }[] = [];

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const account = accountMap.get(p.accountId);

    if (!account) {
      results.push({ index: i, success: false, error: 'Conta não encontrada' });
      continue;
    }

    try {
      if (p.scheduledAt) {
        // Schedule for later
        const { data: post } = await supabase
          .from('posts')
          .insert({
            agency_id: ctx.agencyId,
            created_by: ctx.userId,
            social_account_id: account.id,
            content: p.content,
            media_urls: p.mediaUrls || [],
            hashtags: p.hashtags || [],
            scheduled_at: p.scheduledAt,
            status: 'scheduled',
            platform: account.platform,
            metadata: { batch: true },
          })
          .select('id')
          .single();

        results.push({ index: i, success: true, scheduled: true, postId: post?.id });
      } else {
        // Publish now
        const creditResult = await useCredits(ctx.userId, 'publish_now', `Publicação em lote #${i + 1}`);
        if (!creditResult.success) {
          results.push({ index: i, success: false, error: 'Créditos insuficientes' });
          continue;
        }

        const result = await publishToPlatform(account, {
          content: p.content,
          mediaUrls: p.mediaUrls,
          hashtags: p.hashtags,
          mediaType: p.mediaType,
        });

        const { data: post } = await supabase
          .from('posts')
          .insert({
            agency_id: ctx.agencyId,
            created_by: ctx.userId,
            social_account_id: account.id,
            content: p.content,
            media_urls: p.mediaUrls || [],
            hashtags: p.hashtags || [],
            status: result.success ? 'published' : 'failed',
            published_at: result.success ? new Date().toISOString() : null,
            platform: account.platform,
            platform_post_id: result.externalId || null,
            error_message: result.error || null,
            metadata: { batch: true },
          })
          .select('id')
          .single();

        results.push({ index: i, success: result.success, postId: post?.id, error: result.error });
      }
    } catch (err: any) {
      results.push({ index: i, success: false, error: err.message });
    }
  }

  return NextResponse.json({
    success: true,
    total: results.length,
    succeeded: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    scheduled: results.filter(r => r.scheduled).length,
    results,
  });
}

// === Platform dispatcher (reuse existing logic) ===
async function publishToPlatform(
  account: any,
  data: { content: string; mediaUrls?: string[]; hashtags?: string[]; mediaType?: string }
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  if (!account.access_token) {
    return { success: false, error: 'Token expirado. Reconecte a conta.' };
  }

  const caption = [
    data.content,
    data.hashtags?.length ? data.hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' ') : '',
  ].filter(Boolean).join('\n\n');

  switch (account.platform) {
    case 'instagram':
      return publishInstagram(account, caption, data.mediaUrls, data.mediaType);
    case 'facebook':
      return publishFacebook(account, caption, data.mediaUrls);
    case 'linkedin':
      return publishLinkedIn(account, caption, data.mediaUrls);
    case 'twitter':
    case 'x':
      return publishTwitter(account, data.content);
    default:
      return { success: false, error: `Plataforma ${account.platform} não suportada para publicação automática` };
  }
}

async function publishInstagram(
  account: any, caption: string, mediaUrls?: string[], mediaType?: string
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  const mediaUrl = mediaUrls?.[0];
  if (!mediaUrl) return { success: false, error: 'Instagram requer mídia' };

  try {
    // Carousel
    if (mediaUrls && mediaUrls.length > 1) {
      const childIds: string[] = [];
      for (const url of mediaUrls) {
        const res = await fetch(`https://graph.facebook.com/v18.0/${account.platform_user_id}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: account.access_token }),
        });
        const d = await res.json();
        if (d.error) return { success: false, error: d.error.message };
        childIds.push(d.id);
      }
      const cRes = await fetch(`https://graph.facebook.com/v18.0/${account.platform_user_id}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_type: 'CAROUSEL', children: childIds.join(','), caption, access_token: account.access_token }),
      });
      const cData = await cRes.json();
      if (cData.error) return { success: false, error: cData.error.message };
      const pRes = await fetch(`https://graph.facebook.com/v18.0/${account.platform_user_id}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: cData.id, access_token: account.access_token }),
      });
      const pData = await pRes.json();
      return pData.error ? { success: false, error: pData.error.message } : { success: true, externalId: pData.id };
    }

    // Single post or video/reels
    const containerBody: Record<string, string> = { caption, access_token: account.access_token };
    if (mediaType === 'VIDEO' || mediaType === 'REELS') {
      containerBody.video_url = mediaUrl;
      containerBody.media_type = mediaType;
    } else {
      containerBody.image_url = mediaUrl;
    }

    const cRes = await fetch(`https://graph.facebook.com/v18.0/${account.platform_user_id}/media`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(containerBody),
    });
    const cData = await cRes.json();
    if (cData.error) return { success: false, error: cData.error.message };

    const pRes = await fetch(`https://graph.facebook.com/v18.0/${account.platform_user_id}/media_publish`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: cData.id, access_token: account.access_token }),
    });
    const pData = await pRes.json();
    return pData.error ? { success: false, error: pData.error.message } : { success: true, externalId: pData.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function publishFacebook(
  account: any, message: string, mediaUrls?: string[]
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    const mediaUrl = mediaUrls?.[0];
    const endpoint = mediaUrl
      ? `https://graph.facebook.com/v18.0/${account.platform_user_id}/photos`
      : `https://graph.facebook.com/v18.0/${account.platform_user_id}/feed`;
    const body = mediaUrl
      ? { url: mediaUrl, message, access_token: account.access_token }
      : { message, access_token: account.access_token };

    const res = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const d = await res.json();
    return d.error ? { success: false, error: d.error.message } : { success: true, externalId: d.id || d.post_id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function publishLinkedIn(
  account: any, text: string, mediaUrls?: string[]
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    const requestBody: any = {
      author: `urn:li:person:${account.platform_user_id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: mediaUrls?.length ? 'IMAGE' : 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };
    if (mediaUrls?.length) {
      requestBody.specificContent['com.linkedin.ugc.ShareContent'].media =
        mediaUrls.map(url => ({ status: 'READY', originalUrl: url }));
    }
    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${account.access_token}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
      body: JSON.stringify(requestBody),
    });
    const d = await res.json();
    return res.status >= 400 ? { success: false, error: d.message || `HTTP ${res.status}` } : { success: true, externalId: d.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function publishTwitter(
  account: any, content: string
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${account.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: content.substring(0, 280) }),
    });
    const d = await res.json();
    return res.status >= 400
      ? { success: false, error: d.detail || d.title || `HTTP ${res.status}` }
      : { success: true, externalId: d.data?.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// === Content moderation check endpoint ===
export async function PUT(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { content, platforms } = await request.json();
    if (!content) return NextResponse.json({ error: 'Conteúdo obrigatório' }, { status: 400 });

    // Run moderation
    const moderation = await fullModeration(content);

    // Platform validation
    const platformValidations: Record<string, any> = {};
    if (platforms?.length) {
      for (const platform of platforms) {
        platformValidations[platform] = validateForPlatform(content, platform);
      }
    }

    return NextResponse.json({
      moderation,
      platformValidations,
      characterCount: content.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
