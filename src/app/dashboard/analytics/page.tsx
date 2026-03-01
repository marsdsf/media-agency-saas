'use client';

import { useState } from 'react';
import { 
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Target,
  Zap,
  BarChart3,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Card, Badge, Button } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useApiData } from '@/hooks/useApiData';

const FaTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const platformIcons: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: FaTiktok,
};

const platformColors: Record<string, string> = {
  instagram: 'text-white',
  facebook: 'text-white',
  twitter: 'text-white',
  linkedin: 'text-white',
  tiktok: 'text-white',
};

interface AnalyticsResponse {
  overview: {
    totalPosts: number;
    publishedPosts: number;
    totalReach: number;
    totalEngagement: number;
    totalImpressions: number;
    totalClicks: number;
    engagementRate: number;
    totalFollowers: number;
  };
  platformStats: {
    platform: string;
    posts: number;
    published: number;
    reach: number;
    engagement: number;
    followers?: number;
  }[];
  dailyData: {
    date: string;
    reach: number;
    engagement: number;
    impressions?: number;
    posts?: number;
  }[];
  topPosts: {
    id: string;
    content: string;
    platform: string;
    published_at: string;
    metrics: Record<string, number>;
    engagement: number;
  }[];
  statusBreakdown: Record<string, number>;
  postMetrics: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  period: string;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const { data, loading, error, refetch } = useApiData<AnalyticsResponse>(`/api/analytics?period=${period}`);

  const overview = data?.overview;
  const dailyData = data?.dailyData || [];
  const platformStats = data?.platformStats || [];
  const topPosts = data?.topPosts || [];
  const statusBreakdown = data?.statusBreakdown;
  const postMetrics = data?.postMetrics;

  const maxReach = dailyData.length > 0 
    ? Math.max(...dailyData.map(d => d.reach || 0), 1) 
    : 1;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()] || dateStr.slice(5, 10);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-400">{error}</p>
        <Button variant="secondary" onClick={refetch} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">Performance dos seus posts</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="group p-6 hover:shadow-xl hover:shadow-white/5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-white to-gray-200 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Eye className="w-5 h-5 text-black" />
            </div>
            <Badge variant="info">{overview?.totalPosts || 0} posts</Badge>
          </div>
          <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{(overview?.totalReach || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-400">Alcance total</p>
        </Card>

        <Card className="group p-6 hover:shadow-xl hover:shadow-white/5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-300 to-gray-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Heart className="w-5 h-5 text-black" />
            </div>
            <Badge variant="info">{overview?.publishedPosts || 0} publicados</Badge>
          </div>
          <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{(overview?.totalEngagement || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-400">Engajamento</p>
        </Card>

        <Card className="group p-6 hover:shadow-xl hover:shadow-white/5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Target className="w-5 h-5 text-white" />
            </div>
            <Badge variant="info">{(overview?.totalFollowers || 0).toLocaleString()} seg.</Badge>
          </div>
          <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{(overview?.totalClicks || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-400">Cliques no link</p>
        </Card>

        <Card className="group p-6 hover:shadow-xl hover:shadow-white/5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{overview?.engagementRate || 0}%</p>
          <p className="text-sm text-gray-400">Taxa de engajamento</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Daily Performance Chart */}
        <Card className="p-6 md:col-span-2 hover:shadow-xl hover:shadow-white/5 transition-all duration-300">
          <h3 className="text-lg font-semibold text-white mb-6">
            Performance {period === '7d' ? 'Semanal' : period === '30d' ? 'Mensal' : 'Trimestral'}
          </h3>
          {dailyData.length > 0 ? (
            <>
              <div className="flex items-end gap-1 h-48">
                {dailyData.slice(-14).map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="relative w-full flex items-end justify-center" style={{ height: '100%' }}>
                      <div 
                        className="w-full bg-gradient-to-t from-gray-600 to-white rounded-t-lg transition-all duration-300 hover:from-white hover:to-gray-200 hover:shadow-lg hover:shadow-white/20 group-hover:scale-105 min-h-[4px]"
                        style={{ height: `${Math.max((day.reach / maxReach) * 100, 2)}%` }}
                        title={`Alcance: ${day.reach?.toLocaleString() || 0}`}
                      />
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-white transition-colors truncate w-full text-center">
                      {formatDate(day.date)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[#1a1a1a]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-600 to-white" />
                  <span className="text-sm text-gray-400">Alcance</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
              <p>Nenhum dado disponível para o período</p>
              <p className="text-sm text-gray-600 mt-1">Publique posts para gerar métricas</p>
            </div>
          )}
        </Card>

        {/* Status Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Status dos Posts</h3>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {statusBreakdown && Object.entries(statusBreakdown)
              .filter(([, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count], i) => {
                const total = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const statusLabels: Record<string, string> = {
                  draft: 'Rascunho',
                  pending_approval: 'Aguardando Aprovação',
                  approved: 'Aprovado',
                  scheduled: 'Agendado',
                  published: 'Publicado',
                  rejected: 'Rejeitado',
                  failed: 'Falhou',
                };
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'text-lg font-bold',
                        i === 0 ? 'text-white' : 
                        i === 1 ? 'text-gray-300' : 
                        i === 2 ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        {count}
                      </span>
                      <p className="text-white font-medium text-sm">{statusLabels[status] || status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-8">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            {(!statusBreakdown || Object.values(statusBreakdown).every(v => v === 0)) && (
              <p className="text-gray-500 text-sm text-center py-4">Nenhum post encontrado</p>
            )}
          </div>
        </Card>
      </div>

      {/* Platform Stats */}
      {platformStats.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Performance por Plataforma</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-[#1a1a1a]">
                  <th className="pb-4 font-medium">Plataforma</th>
                  <th className="pb-4 font-medium">Posts</th>
                  <th className="pb-4 font-medium">Publicados</th>
                  <th className="pb-4 font-medium">Alcance</th>
                  <th className="pb-4 font-medium">Engajamento</th>
                  <th className="pb-4 font-medium">Seguidores</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {platformStats.map((stat) => {
                  const Icon = platformIcons[stat.platform] || BarChart3;
                  return (
                    <tr key={stat.platform} className="hover:bg-white/5">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('p-2 rounded-lg bg-white/10', platformColors[stat.platform] || 'text-white')}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-white font-medium capitalize">{stat.platform}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-300">{stat.posts}</td>
                      <td className="py-4 text-gray-300">{stat.published || 0}</td>
                      <td className="py-4 text-gray-300">{(stat.reach || 0).toLocaleString()}</td>
                      <td className="py-4 text-gray-300">{(stat.engagement || 0).toLocaleString()}</td>
                      <td className="py-4 text-gray-300">{stat.followers ? stat.followers.toLocaleString() : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Engagement Metrics */}
      {postMetrics && (postMetrics.likes > 0 || postMetrics.comments > 0 || postMetrics.shares > 0) && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-white">{postMetrics.likes.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Curtidas</p>
          </Card>
          <Card className="p-6 text-center">
            <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-white">{postMetrics.comments.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Comentários</p>
          </Card>
          <Card className="p-6 text-center">
            <Share2 className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-white">{postMetrics.shares.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Compartilhamentos</p>
          </Card>
        </div>
      )}

      {/* Top Performing Posts */}
      {topPosts.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Top Posts</h3>
          <div className="space-y-4">
            {topPosts.map((post) => {
              const Icon = platformIcons[post.platform] || BarChart3;
              return (
                <div key={post.id} className="p-4 rounded-xl bg-[#1a1a1a] flex items-center gap-6">
                  <div className={cn('p-2 rounded-lg bg-white/10', platformColors[post.platform] || 'text-white')}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate">{post.content || 'Post sem conteúdo'}</p>
                    <p className="text-sm text-gray-500">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('pt-BR') : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-white font-medium">{(post.metrics?.reach || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Alcance</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {post.metrics?.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" /> {post.metrics?.comments || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" /> {post.metrics?.shares || 0}
                      </span>
                    </div>
                    <Badge variant={post.engagement > 100 ? 'success' : 'info'}>
                      {post.engagement} eng.
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && overview?.totalPosts === 0 && (
        <Card className="p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum dado de analytics</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Crie e publique posts para começar a ver métricas de performance. As estatísticas serão atualizadas automaticamente.
          </p>
        </Card>
      )}
    </div>
  );
}
