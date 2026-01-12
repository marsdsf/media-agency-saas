'use client';

import { useState } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Users,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Target,
  Zap
} from 'lucide-react';
import { Card, Badge, Button, Tabs } from '@/lib/ui';
import { cn } from '@/lib/utils';

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

interface AnalyticsData {
  totalReach: number;
  reachChange: number;
  totalEngagement: number;
  engagementChange: number;
  totalClicks: number;
  clicksChange: number;
  avgEngagementRate: number;
  rateChange: number;
  bestTimes: { day: string; hour: string; engagement: number }[];
  platformStats: {
    platform: string;
    posts: number;
    reach: number;
    engagement: number;
    followers: number;
    growth: number;
  }[];
  recentPosts: {
    id: string;
    content: string;
    platform: string;
    publishedAt: string;
    reach: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  }[];
  weeklyData: {
    day: string;
    reach: number;
    engagement: number;
  }[];
}

const mockAnalytics: AnalyticsData = {
  totalReach: 125840,
  reachChange: 12.5,
  totalEngagement: 8420,
  engagementChange: 8.3,
  totalClicks: 2150,
  clicksChange: -2.1,
  avgEngagementRate: 6.7,
  rateChange: 1.2,
  bestTimes: [
    { day: 'Segunda', hour: '19:00', engagement: 89 },
    { day: 'Quarta', hour: '12:00', engagement: 85 },
    { day: 'Sexta', hour: '20:00', engagement: 82 },
    { day: 'Terça', hour: '18:00', engagement: 78 },
    { day: 'Domingo', hour: '10:00', engagement: 75 },
  ],
  platformStats: [
    { platform: 'instagram', posts: 45, reach: 68500, engagement: 4200, followers: 12500, growth: 5.2 },
    { platform: 'facebook', posts: 32, reach: 32000, engagement: 1800, followers: 8900, growth: 2.1 },
    { platform: 'linkedin', posts: 18, reach: 18340, engagement: 1650, followers: 5600, growth: 8.4 },
    { platform: 'twitter', posts: 28, reach: 7000, engagement: 770, followers: 3200, growth: -1.2 },
  ],
  recentPosts: [
    { id: '1', content: 'Novo produto revolucionário! 🚀 Confira...', platform: 'instagram', publishedAt: '2026-01-11 19:00', reach: 4520, likes: 312, comments: 45, shares: 28, engagementRate: 8.5 },
    { id: '2', content: 'Dicas para aumentar sua produtividade...', platform: 'linkedin', publishedAt: '2026-01-11 12:00', reach: 2890, likes: 156, comments: 23, shares: 42, engagementRate: 7.6 },
    { id: '3', content: 'Bastidores do nosso escritório 🎬', platform: 'instagram', publishedAt: '2026-01-10 18:00', reach: 3200, likes: 278, comments: 56, shares: 12, engagementRate: 10.8 },
    { id: '4', content: 'Novidade: Lançamento exclusivo...', platform: 'facebook', publishedAt: '2026-01-10 14:00', reach: 1850, likes: 89, comments: 12, shares: 8, engagementRate: 5.9 },
  ],
  weeklyData: [
    { day: 'Seg', reach: 12500, engagement: 890 },
    { day: 'Ter', reach: 15200, engagement: 1100 },
    { day: 'Qua', reach: 18900, engagement: 1450 },
    { day: 'Qui', reach: 14300, engagement: 980 },
    { day: 'Sex', reach: 22100, engagement: 1820 },
    { day: 'Sáb', reach: 19800, engagement: 1350 },
    { day: 'Dom', reach: 23040, engagement: 1830 },
  ],
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const data = mockAnalytics;

  const maxReach = Math.max(...data.weeklyData.map(d => d.reach));

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
            <Badge variant={data.reachChange > 0 ? 'success' : 'danger'}>
              {data.reachChange > 0 ? '+' : ''}{data.reachChange}%
            </Badge>
          </div>
          <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{data.totalReach.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Alcance total</p>
        </Card>

        <Card className="group p-6 hover:shadow-xl hover:shadow-white/5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-300 to-gray-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Heart className="w-5 h-5 text-black" />
            </div>
            <Badge variant={data.engagementChange > 0 ? 'success' : 'danger'}>
              {data.engagementChange > 0 ? '+' : ''}{data.engagementChange}%
            </Badge>
          </div>
          <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{data.totalEngagement.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Engajamento</p>
        </Card>

        <Card className="group p-6 hover:shadow-xl hover:shadow-white/5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Target className="w-5 h-5 text-white" />
            </div>
            <Badge variant={data.clicksChange > 0 ? 'success' : 'danger'}>
              {data.clicksChange > 0 ? '+' : ''}{data.clicksChange}%
            </Badge>
          </div>
          <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{data.totalClicks.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Cliques no link</p>
        </Card>

        <Card className="group p-6 hover:shadow-xl hover:shadow-white/5 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <Badge variant={data.rateChange > 0 ? 'success' : 'danger'}>
              {data.rateChange > 0 ? '+' : ''}{data.rateChange}%
            </Badge>
          </div>
          <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{data.avgEngagementRate}%</p>
          <p className="text-sm text-gray-400">Taxa de engajamento</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Weekly Performance */}
        <Card className="p-6 md:col-span-2 hover:shadow-xl hover:shadow-white/5 transition-all duration-300">
          <h3 className="text-lg font-semibold text-white mb-6">Performance Semanal</h3>
          <div className="flex items-end gap-3 h-48">
            {data.weeklyData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div 
                  className="w-full bg-gradient-to-t from-gray-600 to-white rounded-t-lg transition-all duration-300 hover:from-white hover:to-gray-200 hover:shadow-lg hover:shadow-white/20 group-hover:scale-105"
                  style={{ height: `${(day.reach / maxReach) * 100}%` }}
                />
                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-600 to-white" />
              <span className="text-sm text-gray-400">Alcance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-sm text-gray-400">Engajamento</span>
            </div>
          </div>
        </Card>

        {/* Best Times */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Melhores Horários</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {data.bestTimes.slice(0, 5).map((time, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'text-lg font-bold',
                    i === 0 ? 'text-white' : 
                    i === 1 ? 'text-gray-300' : 
                    i === 2 ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    {i + 1}º
                  </span>
                  <div>
                    <p className="text-white font-medium">{time.day}</p>
                    <p className="text-sm text-gray-500">{time.hour}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full"
                      style={{ width: `${time.engagement}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-8">{time.engagement}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Platform Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Performance por Plataforma</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-[#1a1a1a]">
                <th className="pb-4 font-medium">Plataforma</th>
                <th className="pb-4 font-medium">Posts</th>
                <th className="pb-4 font-medium">Alcance</th>
                <th className="pb-4 font-medium">Engajamento</th>
                <th className="pb-4 font-medium">Seguidores</th>
                <th className="pb-4 font-medium">Crescimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {data.platformStats.map((stat) => {
                const Icon = platformIcons[stat.platform];
                return (
                  <tr key={stat.platform} className="hover:bg-white/5">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg bg-white/10', platformColors[stat.platform])}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-white font-medium capitalize">{stat.platform}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-300">{stat.posts}</td>
                    <td className="py-4 text-gray-300">{stat.reach.toLocaleString()}</td>
                    <td className="py-4 text-gray-300">{stat.engagement.toLocaleString()}</td>
                    <td className="py-4 text-gray-300">{stat.followers.toLocaleString()}</td>
                    <td className="py-4">
                      <div className={cn(
                        'flex items-center gap-1 text-sm',
                        stat.growth > 0 ? 'text-white' : 'text-gray-400'
                      )}>
                        {stat.growth > 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {Math.abs(stat.growth)}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Posts Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Posts Recentes</h3>
        <div className="space-y-4">
          {data.recentPosts.map((post) => {
            const Icon = platformIcons[post.platform];
            return (
              <div key={post.id} className="p-4 rounded-xl bg-[#1a1a1a] flex items-center gap-6">
                <div className={cn('p-2 rounded-lg bg-white/10', platformColors[post.platform])}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{post.content}</p>
                  <p className="text-sm text-gray-500">{post.publishedAt}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-white font-medium">{post.reach.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Alcance</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" /> {post.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" /> {post.shares}
                    </span>
                  </div>
                  <Badge variant={post.engagementRate > 7 ? 'success' : 'info'}>
                    {post.engagementRate}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
