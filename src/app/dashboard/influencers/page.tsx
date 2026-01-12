'use client';

import { useState } from 'react';
import { 
  Users,
  Search,
  Filter,
  Plus,
  Star,
  Instagram,
  MessageCircle,
  DollarSign,
  TrendingUp,
  Eye,
  Heart,
  UserPlus,
  MoreVertical,
  ExternalLink,
  Mail,
  Target,
  BarChart2
} from 'lucide-react';
import { Button, Card, Badge, Input } from '@/lib/ui';
import { cn } from '@/lib/utils';

const FaTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

interface Influencer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  platform: string;
  followers: string;
  engagement: string;
  niche: string;
  price: string;
  status: 'active' | 'pending' | 'completed';
  campaigns: number;
  rating: number;
  avgViews: string;
}

const influencers: Influencer[] = [
  { id: '1', name: 'Camila Torres', username: '@camilatorres', avatar: 'C', platform: 'instagram', followers: '250K', engagement: '4.8%', niche: 'Lifestyle', price: 'R$ 2.500', status: 'active', campaigns: 3, rating: 5, avgViews: '45K' },
  { id: '2', name: 'Lucas Mendes', username: '@lucasmendes', avatar: 'L', platform: 'tiktok', followers: '1.2M', engagement: '8.2%', niche: 'Tech', price: 'R$ 8.000', status: 'pending', campaigns: 0, rating: 0, avgViews: '180K' },
  { id: '3', name: 'Bianca Costa', username: '@biancacosta', avatar: 'B', platform: 'instagram', followers: '85K', engagement: '6.1%', niche: 'Moda', price: 'R$ 1.200', status: 'completed', campaigns: 5, rating: 4, avgViews: '12K' },
  { id: '4', name: 'Pedro Alves', username: '@pedroalves', avatar: 'P', platform: 'instagram', followers: '520K', engagement: '3.9%', niche: 'Fitness', price: 'R$ 4.500', status: 'active', campaigns: 2, rating: 5, avgViews: '65K' },
  { id: '5', name: 'Juliana Reis', username: '@julianareis', avatar: 'J', platform: 'tiktok', followers: '890K', engagement: '9.5%', niche: 'Humor', price: 'R$ 6.000', status: 'pending', campaigns: 0, rating: 0, avgViews: '220K' },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'bg-emerald-500/20 text-emerald-400' },
  pending: { label: 'Pendente', color: 'bg-amber-500/20 text-amber-400' },
  completed: { label: 'Concluído', color: 'bg-gray-500/20 text-gray-400' },
};

const platformIcons: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  tiktok: FaTiktok,
};

export default function InfluencersPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const filteredInfluencers = influencers.filter(inf => {
    if (filter !== 'all' && inf.status !== filter) return false;
    if (search && !inf.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = [
    { label: 'Influenciadores', value: '12', icon: Users, trend: '+3 este mês' },
    { label: 'Campanhas Ativas', value: '5', icon: Target, trend: '2 em análise' },
    { label: 'Alcance Total', value: '3.2M', icon: Eye, trend: '+450K' },
    { label: 'Investimento', value: 'R$ 28.5K', icon: DollarSign, trend: 'Este mês' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Influenciadores</h1>
          <p className="text-gray-400 mt-1">Gerencie parcerias e campanhas com influenciadores</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<Search className="w-4 h-4" />}>
            Descobrir
          </Button>
          <Button leftIcon={<UserPlus className="w-4 h-4" />}>
            Adicionar Influenciador
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="group p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Buscar influenciador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filter === f
                    ? 'bg-white text-black'
                    : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                )}
              >
                {f === 'all' ? 'Todos' : statusLabels[f].label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Influencers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInfluencers.map((inf) => {
          const PlatformIcon = platformIcons[inf.platform];
          return (
            <Card key={inf.id} className="group p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-black text-xl font-bold">
                      {inf.avatar}
                    </div>
                    <div className={cn(
                      'absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0a0a0a]',
                      inf.platform === 'instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-black'
                    )}>
                      <PlatformIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{inf.name}</h3>
                    <p className="text-sm text-gray-500">{inf.username}</p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-[#0a0a0a]">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Seguidores</p>
                  <p className="text-sm font-bold text-white">{inf.followers}</p>
                </div>
                <div className="text-center border-x border-[#1a1a1a]">
                  <p className="text-xs text-gray-500">Engajamento</p>
                  <p className="text-sm font-bold text-emerald-400">{inf.engagement}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Média Views</p>
                  <p className="text-sm font-bold text-white">{inf.avgViews}</p>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge className="text-xs">{inf.niche}</Badge>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', statusLabels[inf.status].color)}>
                    {statusLabels[inf.status].label}
                  </span>
                </div>
                <p className="text-white font-semibold">{inf.price}</p>
              </div>

              {/* Rating & Campaigns */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i < inf.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
                      )}
                    />
                  ))}
                  {inf.campaigns > 0 && (
                    <span className="text-xs text-gray-500 ml-2">({inf.campaigns} campanhas)</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" leftIcon={<MessageCircle className="w-4 h-4" />}>
                  Contato
                </Button>
                <Button size="sm" className="flex-1" leftIcon={<Target className="w-4 h-4" />}>
                  Campanha
                </Button>
              </div>
            </Card>
          );
        })}

        {/* Add New Card */}
        <Card className="group p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300 border-2 border-dashed border-[#2a2a2a] flex items-center justify-center min-h-[320px] cursor-pointer">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-medium text-white mb-1">Adicionar Influenciador</h3>
            <p className="text-sm text-gray-500">Buscar ou cadastrar manualmente</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
