import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/auth';

/**
 * Cron: Retry failed posts (runs every 6 hours)
 * 
 * Re-attempts publishing posts that failed, up to 3 retry attempts.
 * After 3 failures, marks post as 'permanently_failed'.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    // Fetch failed posts with retry_count < 3
    const { data: failedPosts, error } = await supabase
      .from('posts')
      .select(`
        *,
        social_accounts (
          id, platform, platform_user_id, access_token, username
        )
      `)
      .eq('status', 'failed')
      .lt('metadata->>retry_count', '3')
      .not('social_accounts', 'is', null)
      .order('updated_at', { ascending: true })
      .limit(20);

    if (error) throw error;

    if (!failedPosts?.length) {
      return NextResponse.json({ message: 'Nenhum post para retentar', retried: 0 });
    }

    const results: { id: string; status: string; attempt: number; error?: string }[] = [];

    for (const post of failedPosts) {
      const account = post.social_accounts;
      const retryCount = (post.metadata?.retry_count || 0) + 1;

      if (!account?.access_token) {
        // Mark as permanently failed - no valid account
        await supabase.from('posts').update({
          metadata: { ...(post.metadata || {}), retry_count: 3, last_error: 'Conta sem token' },
        }).eq('id', post.id);
        results.push({ id: post.id, status: 'skipped', attempt: retryCount, error: 'No token' });
        continue;
      }

      try {
        let publishResult = { success: false, externalId: '', error: '' };

        switch (account.platform) {
          case 'instagram':
            publishResult = await retryInstagram(account, post);
            break;
          case 'facebook':
            publishResult = await retryFacebook(account, post);
            break;
          case 'linkedin':
            publishResult = await retryLinkedIn(account, post);
            break;
          case 'twitter':
          case 'x':
            publishResult = await retryTwitter(account, post);
            break;
          default:
            publishResult = { success: false, externalId: '', error: `Plataforma ${account.platform} não suportada` };
        }

        if (publishResult.success) {
          await supabase.from('posts').update({
            status: 'published',
            published_at: now,
            metadata: {
              ...(post.metadata || {}),
              external_id: publishResult.externalId,
              retry_count: retryCount,
              published_via: 'retry_cron',
              retried_at: now,
            },
          }).eq('id', post.id);

          await supabase.from('activity_log').insert({
            agency_id: post.agency_id,
            user_id: post.created_by,
            action: 'post_published',
            entity_type: 'post',
            entity_id: post.id,
            details: { platform: account.platform, retry_attempt: retryCount, published_via: 'retry' },
          });

          results.push({ id: post.id, status: 'published', attempt: retryCount });
        } else {
          const newStatus = retryCount >= 3 ? 'permanently_failed' : 'failed';
          await supabase.from('posts').update({
            status: newStatus,
            metadata: {
              ...(post.metadata || {}),
              retry_count: retryCount,
              last_error: publishResult.error,
              last_retry_at: now,
            },
          }).eq('id', post.id);

          results.push({ id: post.id, status: newStatus, attempt: retryCount, error: publishResult.error });
        }
      } catch (err: any) {
        await supabase.from('posts').update({
          metadata: { ...(post.metadata || {}), retry_count: retryCount, last_error: err.message, last_retry_at: now },
        }).eq('id', post.id);
        results.push({ id: post.id, status: 'failed', attempt: retryCount, error: err.message });
      }
    }

    const published = results.filter(r => r.status === 'published').length;
    const stillFailed = results.filter(r => r.status === 'failed').length;
    const permanent = results.filter(r => r.status === 'permanently_failed').length;

    return NextResponse.json({
      message: `Retry: ${published} publicados, ${stillFailed} ainda falhando, ${permanent} permanentemente falhados`,
      retried: results.length,
      published,
      stillFailed,
      permanentlyFailed: permanent,
      results,
    });
  } catch (error: any) {
    console.error('Retry cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Platform retry functions (simplified — reuse same logic for consistency)
async function retryInstagram(account: any, post: any) {
  const caption = [post.content, post.hashtags?.length ? post.hashtags.map((h: string) => `#${h}`).join(' ') : ''].filter(Boolean).join('\n\n');
  const mediaUrl = post.media_urls?.[0];
  if (!mediaUrl) return { success: false, externalId: '', error: 'Instagram requer mídia' };

  try {
    const cRes = await fetch(`https://graph.facebook.com/v18.0/${account.platform_user_id}/media`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: mediaUrl, caption, access_token: account.access_token }),
    });
    const cData = await cRes.json();
    if (cData.error) return { success: false, externalId: '', error: cData.error.message };

    const pRes = await fetch(`https://graph.facebook.com/v18.0/${account.platform_user_id}/media_publish`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: cData.id, access_token: account.access_token }),
    });
    const pData = await pRes.json();
    return pData.error
      ? { success: false, externalId: '', error: pData.error.message }
      : { success: true, externalId: pData.id, error: '' };
  } catch (e: any) {
    return { success: false, externalId: '', error: e.message };
  }
}

async function retryFacebook(account: any, post: any) {
  const message = [post.content, post.hashtags?.length ? post.hashtags.map((h: string) => `#${h}`).join(' ') : ''].filter(Boolean).join('\n\n');
  const mediaUrl = post.media_urls?.[0];
  try {
    const endpoint = mediaUrl
      ? `https://graph.facebook.com/v18.0/${account.platform_user_id}/photos`
      : `https://graph.facebook.com/v18.0/${account.platform_user_id}/feed`;
    const body = mediaUrl ? { url: mediaUrl, message, access_token: account.access_token } : { message, access_token: account.access_token };
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await res.json();
    return d.error ? { success: false, externalId: '', error: d.error.message } : { success: true, externalId: d.id || d.post_id, error: '' };
  } catch (e: any) {
    return { success: false, externalId: '', error: e.message };
  }
}

async function retryLinkedIn(account: any, post: any) {
  const text = [post.content, post.hashtags?.length ? post.hashtags.map((h: string) => `#${h}`).join(' ') : ''].filter(Boolean).join('\n\n');
  try {
    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${account.access_token}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
      body: JSON.stringify({
        author: `urn:li:person:${account.platform_user_id}`,
        lifecycleState: 'PUBLISHED',
        specificContent: { 'com.linkedin.ugc.ShareContent': { shareCommentary: { text }, shareMediaCategory: 'NONE' } },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    });
    const d = await res.json();
    return res.status >= 400 ? { success: false, externalId: '', error: d.message || `HTTP ${res.status}` } : { success: true, externalId: d.id, error: '' };
  } catch (e: any) {
    return { success: false, externalId: '', error: e.message };
  }
}

async function retryTwitter(account: any, post: any) {
  try {
    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${account.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: (post.content || '').substring(0, 280) }),
    });
    const d = await res.json();
    return res.status >= 400
      ? { success: false, externalId: '', error: d.detail || d.title || `HTTP ${res.status}` }
      : { success: true, externalId: d.data?.id, error: '' };
  } catch (e: any) {
    return { success: false, externalId: '', error: e.message };
  }
}
