'use client';

import { useState } from 'react';
import { 
  Megaphone,
  Plus,
  Play,
  Pause,
  BarChart2,
  DollarSign,
  Eye,
  MousePointerClick,
  TrendingUp,
  Target,
  Settings,
  MoreVertical,
  Instagram,
  Facebook,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users,
  ShoppingCart,
  Heart,
  AlertCircle
} from 'lucide-react';
import { Button, Card, Badge, Input } from '@/lib/ui';
import { cn } from '@/lib/utils';

const FaTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'ended' | 'draft';
  objective: string;
  budget: number;
  spent: number;
  reach: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
  conversions: number;
  startDate: string;
  endDate: string;
}

const campaigns: Campaign[] = [
  { 
    id: '1', 
    name: 'Lançamento Produto X', 
    platform: 'instagram', 
    status: 'active',
    objective: 'Conversões',
    budget: 5000,
    spent: 3250,
    reach: '125K',
    impressions: '380K',
    clicks: '4.2K',
    ctr: '1.1%',
    cpc: 'R$ 0.77',
    conversions: 89,
    startDate: '01/01/2025',
    endDate: '31/01/2025'
  },
  { 
    id: '2', 
    name: 'Awareness Marca', 
    platform: 'facebook', 
    status: 'active',
    objective: 'Alcance',
    budget: 3000,
    spent: 1800,
    reach: '250K',
    impressions: '520K',
    clicks: '2.8K',
    ctr: '0.54%',
    cpc: 'R$ 0.64',
    conversions: 0,
    startDate: '15/12/2024',
    endDate: '15/02/2025'
  },
  { 
    id: '3', 
    name: 'Remarketing Carrinho', 
    platform: 'instagram', 
    status: 'paused',
    objective: 'Conversões',
    budget: 2000,
    spent: 980,
    reach: '45K',
    impressions: '120K',
    clicks: '1.5K',
    ctr: '1.25%',
    cpc: 'R$ 0.65',
    conversions: 42,
    startDate: '01/12/2024',
    endDate: '31/01/2025'
  },
  { 
    id: '4', 
    name: 'TikTok Viral Challenge', 
    platform: 'tiktok', 
    status: 'draft',
    objective: 'Engajamento',
    budget: 8000,
    spent: 0,
    reach: '0',
    impressions: '0',
    clicks: '0',
    ctr: '0%',
    cpc: 'R$ 0.00',
    conversions: 0,
    startDate: '-',
    endDate: '-'
  },
];

const platformIcons: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: FaTiktok,
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  active: { label: 'Ativo', color: 'bg-emerald-500/20 text-emerald-400', icon: Play },
  paused: { label: 'Pausado', color: 'bg-amber-500/20 text-amber-400', icon: Pause },
  ended: { label: 'Encerrado', color: 'bg-gray-500/20 text-gray-400', icon: AlertCircle },
  draft: { label: 'Rascunho', color: 'bg-blue-500/20 text-blue-400', icon: Settings },
};

const objectiveIcons: Record<string, React.ComponentType<any>> = {
  'Conversões': ShoppingCart,
  'Alcance': Eye,
  'Engajamento': Heart,
  'Tráfego': MousePointerClick,
};

export default function AdsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'ended' | 'draft'>('all');

  const filteredCampaigns = campaigns.filter(c => filter === 'all' || c.status === filter);

  const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
  const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  const stats = [
    { label: 'Investimento Total', value: `R$ ${totalBudget.toLocaleString()}`, icon: DollarSign, trend: 'R$ 18K orçado' },
    { label: 'Gasto Atual', value: `R$ ${totalSpent.toLocaleString()}`, icon: TrendingUp, trend: `${((totalSpent / totalBudget) * 100).toFixed(0)}% do orçamento` },
    { label: 'Campanhas Ativas', value: activeCampaigns.toString(), icon: Play, trend: `${campaigns.length} total` },
    { label: 'ROAS Médio', value: '3.2x', icon: BarChart2, trend: '+0.5x vs. mês anterior' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Gestão de Anúncios</h1>
          <p className="text-gray-400 mt-1">Gerencie campanhas de anúncios em todas as plataformas</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<BarChart2 className="w-4 h-4" />}>
            Relatório
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Nova Campanha
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
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'paused', 'ended', 'draft'] as const).map((f) => (
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
              {f === 'all' ? 'Todas' : statusConfig[f].label}
            </button>
          ))}
        </div>
      </Card>

      {/* Campaigns */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => {
          const PlatformIcon = platformIcons[campaign.platform];
          const StatusIcon = statusConfig[campaign.status].icon;
          const ObjectiveIcon = objectiveIcons[campaign.objective] || Target;
          const budgetProgress = (campaign.spent / campaign.budget) * 100;

          return (
            <Card key={campaign.id} className="group hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300 overflow-hidden">
              <div className="p-5">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      campaign.platform === 'instagram' && 'bg-gradient-to-br from-purple-500 to-pink-500',
                      campaign.platform === 'facebook' && 'bg-blue-600',
                      campaign.platform === 'tiktok' && 'bg-black border border-white/20'
                    )}>
                      <PlatformIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full flex items-center gap-1', statusConfig[campaign.status].color)}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[campaign.status].label}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <ObjectiveIcon className="w-3 h-3" />
                          {campaign.objective}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {campaign.startDate} - {campaign.endDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === 'active' && (
                      <Button variant="secondary" size="sm" leftIcon={<Pause className="w-4 h-4" />}>
                        Pausar
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button variant="secondary" size="sm" leftIcon={<Play className="w-4 h-4" />}>
                        Retomar
                      </Button>
                    )}
                    {campaign.status === 'draft' && (
                      <Button size="sm" leftIcon={<Play className="w-4 h-4" />}>
                        Publicar
                      </Button>
                    )}
                    <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Budget Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Orçamento</span>
                    <span className="text-sm text-white">
                      R$ {campaign.spent.toLocaleString()} / R$ {campaign.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        budgetProgress > 80 ? 'bg-red-500' : budgetProgress > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                      style={{ width: `${budgetProgress}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  <div className="p-3 rounded-lg bg-[#0a0a0a] text-center">
                    <p className="text-xs text-gray-500 mb-1">Alcance</p>
                    <p className="text-lg font-bold text-white">{campaign.reach}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a] text-center">
                    <p className="text-xs text-gray-500 mb-1">Impressões</p>
                    <p className="text-lg font-bold text-white">{campaign.impressions}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a] text-center">
                    <p className="text-xs text-gray-500 mb-1">Cliques</p>
                    <p className="text-lg font-bold text-white">{campaign.clicks}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a] text-center">
                    <p className="text-xs text-gray-500 mb-1">CTR</p>
                    <p className="text-lg font-bold text-emerald-400">{campaign.ctr}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a] text-center">
                    <p className="text-xs text-gray-500 mb-1">CPC</p>
                    <p className="text-lg font-bold text-white">{campaign.cpc}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0a0a0a] text-center">
                    <p className="text-xs text-gray-500 mb-1">Conversões</p>
                    <p className="text-lg font-bold text-white">{campaign.conversions}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
