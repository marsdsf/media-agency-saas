'use client';

import { useState } from 'react';
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
  Trash2
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
  platform: string;
  followers: number;
  followersGrowth: number;
  avgEngagement: number;
  postsPerWeek: number;
  lastPost: string;
}

interface CompetitorPost {
  id: string;
  competitor: string;
  content: string;
  platform: string;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  publishedAt: string;
}

const competitors: Competitor[] = [
  { id: '1', name: 'Agência Digital Pro', handle: '@agenciadigitalpro', platform: 'instagram', followers: 125000, followersGrowth: 5.2, avgEngagement: 4.8, postsPerWeek: 5, lastPost: '2h atrás' },
  { id: '2', name: 'Marketing Masters', handle: '@marketingmasters', platform: 'instagram', followers: 89000, followersGrowth: 3.1, avgEngagement: 6.2, postsPerWeek: 7, lastPost: '5h atrás' },
  { id: '3', name: 'Social Growth', handle: '@socialgrowth', platform: 'instagram', followers: 156000, followersGrowth: -0.8, avgEngagement: 3.5, postsPerWeek: 4, lastPost: '1d atrás' },
  { id: '4', name: 'Content Creators BR', handle: '@contentcreatorsbr', platform: 'instagram', followers: 210000, followersGrowth: 8.4, avgEngagement: 5.1, postsPerWeek: 6, lastPost: '3h atrás' },
];

const viralPosts: CompetitorPost[] = [
  { id: '1', competitor: 'Content Creators BR', content: '10 dicas que ninguém te conta sobre crescimento orgânico...', platform: 'instagram', likes: 15420, comments: 892, shares: 1230, engagementRate: 8.3, publishedAt: '2026-01-10' },
  { id: '2', competitor: 'Marketing Masters', content: 'O segredo para viralizar no Instagram em 2026 🚀', platform: 'instagram', likes: 12300, comments: 567, shares: 890, engagementRate: 7.8, publishedAt: '2026-01-09' },
  { id: '3', competitor: 'Agência Digital Pro', content: 'Case de sucesso: como fizemos 1M de alcance...', platform: 'instagram', likes: 9800, comments: 423, shares: 567, engagementRate: 6.5, publishedAt: '2026-01-08' },
];

const platformIcons: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: FaTiktok,
};

export default function CompetitorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Análise de Concorrência</h1>
          <p className="text-gray-400 mt-1">Monitore e analise seus concorrentes</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<RefreshCw className="w-4 h-4" />}>
            Atualizar Dados
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Adicionar Concorrente
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="group p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-white to-gray-200 transition-transform duration-300 group-hover:scale-110">
              <Eye className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{competitors.length}</p>
              <p className="text-sm text-gray-400">Monitorados</p>
            </div>
          </div>
        </Card>
        <Card className="group p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-300 to-gray-500 transition-transform duration-300 group-hover:scale-110">
              <Users className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">580K</p>
              <p className="text-sm text-gray-400">Seguidores Total</p>
            </div>
          </div>
        </Card>
        <Card className="group p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 transition-transform duration-300 group-hover:scale-110">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4.9%</p>
              <p className="text-sm text-gray-400">Eng. Médio</p>
            </div>
          </div>
        </Card>
        <Card className="group p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 transition-transform duration-300 group-hover:scale-110">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-sm text-gray-400">Alertas Hoje</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Competitors List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Buscar concorrentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="ghost" leftIcon={<Filter className="w-4 h-4" />}>
              Filtros
            </Button>
          </div>

          {competitors.map((competitor) => {
            const PlatformIcon = platformIcons[competitor.platform];
            return (
              <Card
                key={competitor.id}
                className={cn(
                  'group p-5 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300',
                  selectedCompetitor?.id === competitor.id && 'ring-2 ring-white border-white/50'
                )}
                onClick={() => setSelectedCompetitor(competitor)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{competitor.name[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{competitor.name}</h4>
                        <PlatformIcon className="w-4 h-4 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-500">{competitor.handle}</p>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#1a1a1a]">
                  <div>
                    <p className="text-lg font-bold text-white">{formatNumber(competitor.followers)}</p>
                    <p className="text-xs text-gray-500">Seguidores</p>
                  </div>
                  <div>
                    <p className={cn(
                      'text-lg font-bold flex items-center gap-1',
                      competitor.followersGrowth > 0 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {competitor.followersGrowth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {competitor.followersGrowth}%
                    </p>
                    <p className="text-xs text-gray-500">Crescimento</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{competitor.avgEngagement}%</p>
                    <p className="text-xs text-gray-500">Engajamento</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{competitor.postsPerWeek}/sem</p>
                    <p className="text-xs text-gray-500">Posts</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Viral Posts */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Posts Virais</h3>
          {viralPosts.map((post) => (
            <Card key={post.id} className="p-4 hover:bg-white/5 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-white">{post.competitor}</span>
                <Badge variant="success">{post.engagementRate}% eng</Badge>
              </div>
              <p className="text-sm text-gray-400 line-clamp-2 mb-3">{post.content}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {formatNumber(post.likes)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {formatNumber(post.comments)}
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="w-3 h-3" />
                  {formatNumber(post.shares)}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#1a1a1a]">
                <Button variant="ghost" size="sm" className="w-full" leftIcon={<ExternalLink className="w-4 h-4" />}>
                  Ver Post
                </Button>
              </div>
            </Card>
          ))}

          {/* Alerts Card */}
          <Card className="p-4 bg-gradient-to-br from-white/10 to-transparent border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-white" />
              <h3 className="font-semibold text-white">Alertas Recentes</h3>
            </div>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-white">Content Creators BR publicou um post viral</p>
                <p className="text-xs text-gray-500">há 2 horas</p>
              </div>
              <div className="text-sm">
                <p className="text-white">Marketing Masters atingiu 90K seguidores</p>
                <p className="text-xs text-gray-500">há 5 horas</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
