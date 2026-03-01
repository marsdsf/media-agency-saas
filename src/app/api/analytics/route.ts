import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// GET /api/analytics - Get analytics data from DB + posts metrics
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const period = searchParams.get('period') || '30d';
    const platform = searchParams.get('platform');

    // Calculate date range
    const now = new Date();
    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[period] || 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get posts in period
    let postsQuery = supabase
      .from('posts')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .gte('created_at', startDate);

    if (clientId) postsQuery = postsQuery.eq('client_id', clientId);
    if (platform) postsQuery = postsQuery.eq('platform', platform);

    const { data: posts } = await postsQuery;
    const allPosts = posts || [];

    // Get analytics snapshots
    let snapshotsQuery = supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .gte('date', startDate.split('T')[0])
      .order('date', { ascending: true });

    if (clientId) snapshotsQuery = snapshotsQuery.eq('client_id', clientId);
    if (platform) snapshotsQuery = snapshotsQuery.eq('platform', platform);

    const { data: snapshots } = await snapshotsQuery;

    // Get social accounts for follower counts
    let accountsQuery = supabase
      .from('social_accounts')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .eq('status', 'active');

    if (clientId) accountsQuery = accountsQuery.eq('client_id', clientId);

    const { data: accounts } = await accountsQuery;

    // Calculate aggregate metrics from snapshots
    const totalReach = snapshots?.reduce((sum, s) => sum + (s.metrics?.reach || 0), 0) || 0;
    const totalEngagement = snapshots?.reduce((sum, s) => sum + (s.metrics?.engagement || 0), 0) || 0;
    const totalImpressions = snapshots?.reduce((sum, s) => sum + (s.metrics?.impressions || 0), 0) || 0;
    const totalClicks = snapshots?.reduce((sum, s) => sum + (s.metrics?.clicks || 0), 0) || 0;

    // Calculate post-based metrics
    const publishedPosts = allPosts.filter(p => p.status === 'published');
    const postMetrics = publishedPosts.reduce((acc, post) => {
      const m = post.metrics || {};
      return {
        likes: acc.likes + (m.likes || 0),
        comments: acc.comments + (m.comments || 0),
        shares: acc.shares + (m.shares || 0),
        reach: acc.reach + (m.reach || 0),
      };
    }, { likes: 0, comments: 0, shares: 0, reach: 0 });

    // Platform breakdown
    const platformStats: Record<string, any> = {};
    allPosts.forEach(post => {
      const p = post.platform || 'other';
      if (!platformStats[p]) {
        platformStats[p] = { platform: p, posts: 0, published: 0, reach: 0, engagement: 0 };
      }
      platformStats[p].posts++;
      if (post.status === 'published') platformStats[p].published++;
      const m = post.metrics || {};
      platformStats[p].reach += m.reach || 0;
      platformStats[p].engagement += (m.likes || 0) + (m.comments || 0) + (m.shares || 0);
    });

    // Add follower data from social accounts
    (accounts || []).forEach(acc => {
      if (platformStats[acc.platform]) {
        platformStats[acc.platform].followers = acc.followers_count;
      } else {
        platformStats[acc.platform] = {
          platform: acc.platform,
          posts: 0, published: 0, reach: 0, engagement: 0,
          followers: acc.followers_count,
        };
      }
    });

    // Daily breakdown for charts (from snapshots or posts)
    const dailyData: Record<string, any> = {};
    snapshots?.forEach(s => {
      const dateKey = s.date;
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, reach: 0, engagement: 0, impressions: 0 };
      }
      dailyData[dateKey].reach += s.metrics?.reach || 0;
      dailyData[dateKey].engagement += s.metrics?.engagement || 0;
      dailyData[dateKey].impressions += s.metrics?.impressions || 0;
    });

    // If no snapshots, build daily data from posts
    if (!snapshots?.length) {
      allPosts.forEach(post => {
        const dateKey = post.created_at?.split('T')[0];
        if (!dateKey) return;
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { date: dateKey, reach: 0, engagement: 0, posts: 0 };
        }
        dailyData[dateKey].posts = (dailyData[dateKey].posts || 0) + 1;
        const m = post.metrics || {};
        dailyData[dateKey].reach += m.reach || 0;
        dailyData[dateKey].engagement += (m.likes || 0) + (m.comments || 0);
      });
    }

    // Status breakdown  
    const statusBreakdown = {
      draft: allPosts.filter(p => p.status === 'draft').length,
      pending_approval: allPosts.filter(p => p.status === 'pending_approval').length,
      approved: allPosts.filter(p => p.status === 'approved').length,
      scheduled: allPosts.filter(p => p.status === 'scheduled').length,
      published: allPosts.filter(p => p.status === 'published').length,
      rejected: allPosts.filter(p => p.status === 'rejected').length,
      failed: allPosts.filter(p => p.status === 'failed').length,
    };

    // Top performing posts
    const topPosts = publishedPosts
      .map(p => ({
        id: p.id,
        content: p.content?.substring(0, 100) || '',
        platform: p.platform,
        published_at: p.published_at,
        metrics: p.metrics || {},
        engagement: (p.metrics?.likes || 0) + (p.metrics?.comments || 0) + (p.metrics?.shares || 0),
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);

    // Calculate engagement rate
    const totalFollowers = (accounts || []).reduce((sum, a) => sum + (a.followers_count || 0), 0);
    const engagementRate = totalFollowers > 0
      ? ((totalEngagement || postMetrics.likes + postMetrics.comments) / totalFollowers * 100).toFixed(2)
      : '0';

    return NextResponse.json({
      overview: {
        totalPosts: allPosts.length,
        publishedPosts: publishedPosts.length,
        totalReach: totalReach || postMetrics.reach,
        totalEngagement: totalEngagement || (postMetrics.likes + postMetrics.comments + postMetrics.shares),
        totalImpressions,
        totalClicks,
        engagementRate: parseFloat(engagementRate),
        totalFollowers,
      },
      platformStats: Object.values(platformStats),
      dailyData: Object.values(dailyData).sort((a: any, b: any) => a.date.localeCompare(b.date)),
      topPosts,
      statusBreakdown,
      postMetrics,
      period,
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar analytics' },
      { status: 500 }
    );
  }
}
