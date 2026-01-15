'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Eye,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  BarChart3,
  Heart,
  MessageCircle,
  Share2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Bell,
  ExternalLink,
  RefreshCw,
  Filter,
  MoreVertical,
  Trash2,
  Zap,
  Target,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Sparkles,
  Copy,
  Download,
  AlertCircle,
  ChevronDown,
  Play
} from 'lucide-react';
import { Button, Card, Badge, Input } from '@/lib/ui';
import { cn } from '@/lib/utils';

const FaTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

interface Competitor {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  platforms: {
    name: string;
    handle: string;
    followers: number;
    followersGrowth: number;
    avgEngagement: number;
  }[];
  totalFollowers: number;
  avgEngagement: number;
  postsPerWeek: number;
  topContentTypes: string[];
  strengths: string[];
  weaknesses: string[];
  bestPostingTime: string;
  contentStrategy: string;
}

interface CompetitorPost {
  id: string;
  competitorId: string;
  competitorName: string;
  competitorAvatar: string;
  content: string;
  image?: string;
  platform: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  engagementRate: number;
  publishedAt: string;
  type: 'image' | 'video' | 'carousel' | 'reel' | 'story';
  isViral: boolean;
}

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'threat' | 'trend';
  impact: 'high' | 'medium' | 'low';
  date: string;
}

const competitors: Competitor[] = [
  { 
    id: '1', 
    name: 'Digital Pro Agency', 
    handle: '@digitalpro', 
    avatar: 'DP',
    platforms: [
      { name: 'instagram', handle: '@digitalpro', followers: 125000, followersGrowth: 5.2, avgEngagement: 4.8 },
      { name: 'tiktok', handle: '@digitalpro', followers: 89000, followersGrowth: 12.3, avgEngagement: 8.2 },
      { name: 'linkedin', handle: 'digitalpro', followers: 45000, followersGrowth: 2.1, avgEngagement: 3.1 },
    ],
    totalFollowers: 259000,
    avgEngagement: 5.4,
    postsPerWeek: 12,
    topContentTypes: ['Reels', 'Carrosséis', 'Stories'],
    strengths: ['Conteúdo educativo', 'Identidade visual forte', 'Engajamento alto'],
    weaknesses: ['Pouca presença no Twitter', 'Frequência irregular'],
    bestPostingTime: '18:00 - 20:00',
    contentStrategy: 'Foco em educação e cases de sucesso'
  },
  { 
    id: '2', 
    name: 'Marketing Masters', 
    handle: '@mktmasters', 
    avatar: 'MM',
    platforms: [
      { name: 'instagram', handle: '@mktmasters', followers: 89000, followersGrowth: 3.1, avgEngagement: 6.2 },
      { name: 'facebook', handle: 'mktmasters', followers: 156000, followersGrowth: 1.5, avgEngagement: 2.8 },
      { name: 'youtube', handle: 'mktmasters', followers: 67000, followersGrowth: 4.2, avgEngagement: 4.5 },
    ],
    totalFollowers: 312000,
    avgEngagement: 4.5,
    postsPerWeek: 8,
    topContentTypes: ['Vídeos longos', 'Lives', 'Posts informativos'],
    strengths: ['Autoridade no mercado', 'Conteúdo aprofundado', 'Base fiel'],
    weaknesses: ['Design datado', 'Pouco conteúdo curto', 'Resposta lenta'],
    bestPostingTime: '12:00 - 14:00',
    contentStrategy: 'Conteúdo profundo e tutoriais completos'
  },
  { 
    id: '3', 
    name: 'Social Boost', 
    handle: '@socialboost', 
    avatar: 'SB',
    platforms: [
      { name: 'instagram', handle: '@socialboost', followers: 156000, followersGrowth: -0.8, avgEngagement: 3.5 },
      { name: 'tiktok', handle: '@socialboost', followers: 234000, followersGrowth: 15.2, avgEngagement: 9.8 },
    ],
    totalFollowers: 390000,
    avgEngagement: 6.7,
    postsPerWeek: 21,
    topContentTypes: ['TikToks virais', 'Trends', 'Memes'],
    strengths: ['Viral no TikTok', 'Conteúdo divertido', 'Alta frequência'],
    weaknesses: ['Qualidade inconsistente', 'Pouca profundidade', 'Instagram em queda'],
    bestPostingTime: '20:00 - 23:00',
    contentStrategy: 'Trends e conteúdo viral'
  },
  { 
    id: '4', 
    name: 'Content Factory BR', 
    handle: '@contentfactory', 
    avatar: 'CF',
    platforms: [
      { name: 'instagram', handle: '@contentfactory', followers: 210000, followersGrowth: 8.4, avgEngagement: 5.1 },
      { name: 'linkedin', handle: 'contentfactorybr', followers: 78000, followersGrowth: 6.2, avgEngagement: 4.8 },
      { name: 'twitter', handle: '@contentfactory', followers: 45000, followersGrowth: 2.1, avgEngagement: 2.3 },
    ],
    totalFollowers: 333000,
    avgEngagement: 4.1,
    postsPerWeek: 15,
    topContentTypes: ['Cases', 'Infográficos', 'Threads'],
    strengths: ['B2B forte', 'Cases impressionantes', 'LinkedIn dominante'],
    weaknesses: ['Pouco TikTok', 'Tom muito corporativo', 'Engagement baixo no Twitter'],
    bestPostingTime: '09:00 - 11:00',
    contentStrategy: 'B2B focado em resultados e cases'
  },
];

const viralPosts: CompetitorPost[] = [
  { 
    id: '1', 
    competitorId: '3',
    competitorName: 'Social Boost', 
    competitorAvatar: 'SB',
    content: 'POV: Quando o cliente pede "algo simples" e manda 47 referências diferentes 😅 #marketingdigital #agencia #humor',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400',
    platform: 'tiktok', 
    likes: 245000, 
    comments: 3420, 
    shares: 18500,
    views: 2100000,
    engagementRate: 12.8, 
    publishedAt: '2026-01-12',
    type: 'video',
    isViral: true
  },
  { 
    id: '2', 
    competitorId: '1',
    competitorName: 'Digital Pro Agency', 
    competitorAvatar: 'DP',
    content: '🚀 CASE: Como aumentamos o faturamento de um e-commerce em 340% em 6 meses\n\nSalva esse post e aplique no seu negócio:\n\n1️⃣ Análise completa de funil...',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    platform: 'instagram', 
    likes: 15420, 
    comments: 892, 
    shares: 2340,
    engagementRate: 8.3, 
    publishedAt: '2026-01-10',
    type: 'carousel',
    isViral: true
  },
  { 
    id: '3', 
    competitorId: '2',
    competitorName: 'Marketing Masters', 
    competitorAvatar: 'MM',
    content: 'O segredo para viralizar no Instagram em 2026 não é o que você pensa 🧵\n\nDepois de analisar 500 posts virais, descobrimos um padrão...',
    platform: 'instagram', 
    likes: 12300, 
    comments: 567, 
    shares: 890,
    engagementRate: 7.8, 
    publishedAt: '2026-01-09',
    type: 'reel',
    isViral: true
  },
  { 
    id: '4', 
    competitorId: '4',
    competitorName: 'Content Factory BR', 
    competitorAvatar: 'CF',
    content: 'Thread: 10 métricas que todo gestor de tráfego deve acompanhar em 2026\n\n1/ CTR é importante, mas não é tudo...',
    platform: 'twitter', 
    likes: 4500, 
    comments: 234, 
    shares: 1890,
    engagementRate: 6.5, 
    publishedAt: '2026-01-08',
    type: 'image',
    isViral: false
  },
];

const marketInsights: MarketInsight[] = [
  {
    id: '1',
    title: 'Social Boost perdendo força no Instagram',
    description: 'Concorrente teve queda de 0.8% em seguidores. Oportunidade de capturar audiência insatisfeita.',
    type: 'opportunity',
    impact: 'high',
    date: '2026-01-14'
  },
  {
    id: '2',
    title: 'Tendência: Conteúdo educativo em alta',
    description: 'Posts com dicas práticas estão performando 3x melhor que entretenimento puro.',
    type: 'trend',
    impact: 'high',
    date: '2026-01-13'
  },
  {
    id: '3',
    title: 'Content Factory investindo em LinkedIn',
    description: 'Crescimento de 6.2% indica estratégia B2B agressiva. Monitore posicionamento.',
    type: 'threat',
    impact: 'medium',
    date: '2026-01-12'
  },
  {
    id: '4',
    title: 'Gap de mercado: Conteúdo em Português para TikTok B2B',
    description: 'Nenhum concorrente está produzindo conteúdo B2B para TikTok de forma consistente.',
    type: 'opportunity',
    impact: 'medium',
    date: '2026-01-11'
  },
];

const platformIcons: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: FaTiktok,
  youtube: Play,
};

const platformColors: Record<string, string> = {
  instagram: 'from-pink-500 to-purple-500',
  facebook: 'from-blue-600 to-blue-500',
  twitter: 'from-sky-500 to-sky-400',
  linkedin: 'from-blue-700 to-blue-600',
  tiktok: 'from-black to-gray-800',
  youtube: 'from-red-600 to-red-500',
};

export default function CompetitorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'insights' | 'compare'>('overview');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const totalFollowers = competitors.reduce((sum, c) => sum + c.totalFollowers, 0);
  const avgEngagement = competitors.reduce((sum, c) => sum + c.avgEngagement, 0) / competitors.length;

  const filteredPosts = selectedPlatform === 'all' 
    ? viralPosts 
    : viralPosts.filter(p => p.platform === selectedPlatform);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Análise de Concorrência</h1>
          <p className="text-gray-400 mt-1">Monitore, analise e supere seus concorrentes</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
            Exportar Relatório
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Adicionar Concorrente
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#111] rounded-xl border border-[#1a1a1a] w-fit">
        {[
          { id: 'overview', label: 'Visão Geral' },
          { id: 'posts', label: 'Posts Virais' },
          { id: 'insights', label: 'Insights' },
          { id: 'compare', label: 'Comparativo' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white text-black'
                : 'text-gray-400 hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Eye className="w-5 h-5 text-violet-400" />
            <Badge variant="success">Ativo</Badge>
          </div>
          <div className="text-2xl font-bold text-white">{competitors.length}</div>
          <div className="text-sm text-gray-500">Concorrentes monitorados</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-green-400 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" /> 4.2%
            </span>
          </div>
          <div className="text-2xl font-bold text-white">{formatNumber(totalFollowers)}</div>
          <div className="text-sm text-gray-500">Seguidores combinados</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <BarChart3 className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-400">Média</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgEngagement.toFixed(1)}%</div>
          <div className="text-sm text-gray-500">Taxa de engajamento</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <Badge variant="warning">{viralPosts.filter(p => p.isViral).length}</Badge>
          </div>
          <div className="text-2xl font-bold text-white">{viralPosts.length}</div>
          <div className="text-sm text-gray-500">Posts virais esta semana</div>
        </Card>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Market Insights Alert */}
          {marketInsights.filter(i => i.type === 'opportunity' && i.impact === 'high').length > 0 && (
            <Card className="p-4 bg-gradient-to-r from-green-500/10 to-transparent border-green-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Oportunidade detectada!</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {marketInsights.find(i => i.type === 'opportunity' && i.impact === 'high')?.description}
                  </p>
                </div>
                <Button size="sm" variant="secondary">Ver detalhes</Button>
              </div>
            </Card>
          )}

          {/* Competitors Grid */}
          <div className="grid lg:grid-cols-2 gap-4">
            {competitors.map((competitor) => (
              <Card 
                key={competitor.id} 
                className="p-5 hover:border-violet-500/30 transition-all cursor-pointer"
                onClick={() => setSelectedCompetitor(competitor)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold">
                      {competitor.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{competitor.name}</h3>
                      <p className="text-sm text-gray-500">{competitor.handle}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-500">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Platforms */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {competitor.platforms.map((platform) => {
                    const Icon = platformIcons[platform.name] || Users;
                    return (
                      <div 
                        key={platform.name}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a]"
                      >
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-white">{formatNumber(platform.followers)}</span>
                        <span className={cn(
                          'text-xs flex items-center',
                          platform.followersGrowth > 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                          {platform.followersGrowth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {Math.abs(platform.followersGrowth)}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-[#0a0a0a]">
                    <div className="text-lg font-bold text-white">{formatNumber(competitor.totalFollowers)}</div>
                    <div className="text-xs text-gray-500">Total Seguidores</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#0a0a0a]">
                    <div className="text-lg font-bold text-white">{competitor.avgEngagement}%</div>
                    <div className="text-xs text-gray-500">Engajamento</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#0a0a0a]">
                    <div className="text-lg font-bold text-white">{competitor.postsPerWeek}</div>
                    <div className="text-xs text-gray-500">Posts/Semana</div>
                  </div>
                </div>

                {/* Content Types */}
                <div className="flex flex-wrap gap-1.5">
                  {competitor.topContentTypes.map((type) => (
                    <span key={type} className="px-2 py-1 rounded-md bg-violet-500/10 text-violet-400 text-xs">
                      {type}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <>
          {/* Filter */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 p-1 bg-[#111] rounded-lg border border-[#1a1a1a]">
              {['all', 'instagram', 'tiktok', 'twitter', 'linkedin'].map((platform) => {
                const Icon = platform === 'all' ? Filter : platformIcons[platform];
                return (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all',
                      selectedPlatform === platform
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {platform === 'all' ? 'Todos' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredPosts.map((post) => {
              const Icon = platformIcons[post.platform] || Users;
              return (
                <Card key={post.id} className="overflow-hidden">
                  {post.image && (
                    <div className="aspect-video relative">
                      <Image src={post.image} alt="" fill className="object-cover" />
                      {post.isViral && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Viral
                        </div>
                      )}
                      {post.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
                            <Play className="w-6 h-6 text-white ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {post.competitorAvatar}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{post.competitorName}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Icon className="w-3 h-3" />
                          {post.publishedAt}
                        </div>
                      </div>
                      <Badge variant={post.engagementRate > 8 ? 'success' : 'default'}>
                        {post.engagementRate}% eng.
                      </Badge>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-gray-300 line-clamp-3 mb-4">{post.content}</p>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-sm text-gray-400">
                          <Heart className="w-4 h-4" />
                          {formatNumber(post.likes)}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-400">
                          <MessageCircle className="w-4 h-4" />
                          {formatNumber(post.comments)}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-400">
                          <Share2 className="w-4 h-4" />
                          {formatNumber(post.shares)}
                        </span>
                        {post.views && (
                          <span className="flex items-center gap-1.5 text-sm text-gray-400">
                            <Eye className="w-4 h-4" />
                            {formatNumber(post.views)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-500 hover:text-violet-400 transition-colors" title="Copiar texto">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-500 hover:text-violet-400 transition-colors" title="Gerar inspiração com IA">
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {marketInsights.map((insight) => (
            <Card 
              key={insight.id} 
              className={cn(
                'p-5',
                insight.type === 'opportunity' && 'border-green-500/20 bg-gradient-to-r from-green-500/5 to-transparent',
                insight.type === 'threat' && 'border-red-500/20 bg-gradient-to-r from-red-500/5 to-transparent',
                insight.type === 'trend' && 'border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'p-3 rounded-xl',
                  insight.type === 'opportunity' && 'bg-green-500/10',
                  insight.type === 'threat' && 'bg-red-500/10',
                  insight.type === 'trend' && 'bg-blue-500/10'
                )}>
                  {insight.type === 'opportunity' && <Target className="w-5 h-5 text-green-400" />}
                  {insight.type === 'threat' && <AlertCircle className="w-5 h-5 text-red-400" />}
                  {insight.type === 'trend' && <TrendingUp className="w-5 h-5 text-blue-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{insight.title}</h3>
                    <Badge 
                      variant={
                        insight.impact === 'high' ? 'danger' : 
                        insight.impact === 'medium' ? 'warning' : 'default'
                      }
                    >
                      {insight.impact === 'high' ? 'Alto impacto' : 
                       insight.impact === 'medium' ? 'Médio impacto' : 'Baixo impacto'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{insight.description}</p>
                  <div className="text-xs text-gray-600 mt-2">{insight.date}</div>
                </div>
                <Button size="sm" variant="ghost">
                  Criar ação
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Compare Tab */}
      {activeTab === 'compare' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left p-4 text-gray-400 font-medium">Concorrente</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Seguidores</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Crescimento</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Engajamento</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Posts/Semana</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Melhor Horário</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Estratégia</th>
                </tr>
              </thead>
              <tbody>
                {/* Your brand row */}
                <tr className="border-b border-violet-500/30 bg-violet-500/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold">
                        MA
                      </div>
                      <div>
                        <div className="font-medium text-white">Sua Agência</div>
                        <div className="text-xs text-violet-400">Você</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center p-4 text-white font-medium">180K</td>
                  <td className="text-center p-4">
                    <span className="text-green-400 flex items-center justify-center gap-1">
                      <ArrowUp className="w-3 h-3" /> 6.8%
                    </span>
                  </td>
                  <td className="text-center p-4 text-white">5.2%</td>
                  <td className="text-center p-4 text-white">10</td>
                  <td className="text-center p-4 text-gray-400">19:00 - 21:00</td>
                  <td className="text-center p-4 text-gray-400 text-sm">Mix educativo + cases</td>
                </tr>
                {competitors.map((competitor) => {
                  const avgGrowth = competitor.platforms.reduce((sum, p) => sum + p.followersGrowth, 0) / competitor.platforms.length;
                  return (
                    <tr key={competitor.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-white font-bold">
                            {competitor.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-white">{competitor.name}</div>
                            <div className="text-xs text-gray-500">{competitor.handle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4 text-white font-medium">{formatNumber(competitor.totalFollowers)}</td>
                      <td className="text-center p-4">
                        <span className={cn(
                          'flex items-center justify-center gap-1',
                          avgGrowth > 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                          {avgGrowth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {Math.abs(avgGrowth).toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center p-4 text-white">{competitor.avgEngagement}%</td>
                      <td className="text-center p-4 text-white">{competitor.postsPerWeek}</td>
                      <td className="text-center p-4 text-gray-400">{competitor.bestPostingTime}</td>
                      <td className="text-center p-4 text-gray-400 text-sm max-w-[200px] truncate">{competitor.contentStrategy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Competitor Detail Modal */}
      {selectedCompetitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between sticky top-0 bg-[#111]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {selectedCompetitor.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCompetitor.name}</h2>
                  <p className="text-gray-500">{selectedCompetitor.handle}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompetitor(null)}
                className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Platforms */}
              <div>
                <h3 className="font-semibold text-white mb-3">Presença nas Redes</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {selectedCompetitor.platforms.map((platform) => {
                    const Icon = platformIcons[platform.name] || Users;
                    return (
                      <div key={platform.name} className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn('p-2 rounded-lg bg-gradient-to-br', platformColors[platform.name])}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white capitalize">{platform.name}</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{formatNumber(platform.followers)}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            'text-sm flex items-center gap-1',
                            platform.followersGrowth > 0 ? 'text-green-400' : 'text-red-400'
                          )}>
                            {platform.followersGrowth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {Math.abs(platform.followersGrowth)}% mês
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-400">{platform.avgEngagement}% eng.</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Pontos Fortes
                  </h3>
                  <ul className="space-y-2">
                    {selectedCompetitor.strengths.map((strength, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    Pontos Fracos
                  </h3>
                  <ul className="space-y-2">
                    {selectedCompetitor.weaknesses.map((weakness, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Strategy */}
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <h3 className="font-semibold text-white mb-2">Estratégia de Conteúdo</h3>
                <p className="text-gray-400">{selectedCompetitor.contentStrategy}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {selectedCompetitor.postsPerWeek} posts/semana
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-4 h-4" />
                    Melhor horário: {selectedCompetitor.bestPostingTime}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Gerar estratégia com IA
                </Button>
                <Button variant="secondary" leftIcon={<Bell className="w-4 h-4" />}>
                  Configurar alertas
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-[#1a1a1a]">
              <h2 className="text-xl font-bold text-white">Adicionar Concorrente</h2>
              <p className="text-sm text-gray-500">Monitore um novo concorrente</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome da empresa/marca</label>
                <input
                  type="text"
                  placeholder="Ex: Marketing Agency Pro"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Perfil do Instagram</label>
                <input
                  type="text"
                  placeholder="@username"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Outras redes (opcional)</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="TikTok @username"
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn company/name"
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#1a1a1a] flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Adicionar e Analisar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
