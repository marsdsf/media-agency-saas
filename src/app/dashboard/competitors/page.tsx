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
  Play,
  Loader2
} from 'lucide-react';
import { Button, Card, Badge, Input } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useCompetitors, useApiMutation } from '@/hooks/useApiData';

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
  const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'insights' | 'compare'>('overview');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [newCompetitorIG, setNewCompetitorIG] = useState('');
  const [newCompetitorTT, setNewCompetitorTT] = useState('');
  const [newCompetitorLI, setNewCompetitorLI] = useState('');

  const { data, loading, refetch } = useCompetitors();
  const createMutation = useApiMutation('/api/competitors', 'POST');
  const deleteMutation = useApiMutation('/api/competitors', 'DELETE');

  const competitors: any[] = data?.competitors || [];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getAvatar = (name: string) => {
    const words = (name || '').split(' ');
    return words.length >= 2 ? words[0][0] + words[1][0] : (name || 'C').substring(0, 2);
  };

  const getPlatforms = (c: any) => c.metrics?.platforms || [];
  const getTotalFollowers = (c: any) => c.metrics?.totalFollowers || 0;
  const getAvgEngagement = (c: any) => c.metrics?.avgEngagement || 0;
  const getPostsPerWeek = (c: any) => c.metrics?.postsPerWeek || 0;
  const getContentTypes = (c: any) => c.metrics?.topContentTypes || [];
  const getStrengths = (c: any) => c.metrics?.strengths || [];
  const getWeaknesses = (c: any) => c.metrics?.weaknesses || [];
  const getBestTime = (c: any) => c.metrics?.bestPostingTime || '-';
  const getStrategy = (c: any) => c.metrics?.contentStrategy || '-';
  const getHandle = (c: any) => c.instagram_handle || c.tiktok_handle || '';

  const totalFollowers = competitors.reduce((sum, c) => sum + getTotalFollowers(c), 0);
  const avgEngagement = competitors.length > 0 ? competitors.reduce((sum, c) => sum + getAvgEngagement(c), 0) / competitors.length : 0;

  const handleAddCompetitor = async () => {
    if (!newCompetitorName) return;
    await createMutation.mutate({
      name: newCompetitorName,
      instagramHandle: newCompetitorIG || null,
      tiktokHandle: newCompetitorTT || null,
      facebookUrl: newCompetitorLI || null,
      metrics: {},
    });
    setNewCompetitorName('');
    setNewCompetitorIG('');
    setNewCompetitorTT('');
    setNewCompetitorLI('');
    setShowAddModal(false);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

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
            <Badge variant="warning">0</Badge>
          </div>
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-sm text-gray-500">Posts virais esta semana</div>
        </Card>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Competitors Grid */}
          {competitors.length === 0 ? (
            <div className="text-center py-16">
              <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum concorrente cadastrado</p>
              <p className="text-sm text-gray-500 mt-1">Adicione concorrentes para monitorar</p>
              <Button className="mt-4" onClick={() => setShowAddModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Adicionar Primeiro Concorrente
              </Button>
            </div>
          ) : (
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
                      {getAvatar(competitor.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{competitor.name}</h3>
                      <p className="text-sm text-gray-500">{getHandle(competitor)}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-500">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Platforms */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {getPlatforms(competitor).map((platform: any) => {
                    const Icon = platformIcons[platform.name] || Users;
                    return (
                      <div 
                        key={platform.name}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a]"
                      >
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-white">{formatNumber(platform.followers || 0)}</span>
                        <span className={cn(
                          'text-xs flex items-center',
                          (platform.followersGrowth || 0) > 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                          {(platform.followersGrowth || 0) > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {Math.abs(platform.followersGrowth || 0)}%
                        </span>
                      </div>
                    );
                  })}
                  {getPlatforms(competitor).length === 0 && (
                    <span className="text-sm text-gray-500">Sem dados de plataformas</span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-[#0a0a0a]">
                    <div className="text-lg font-bold text-white">{formatNumber(getTotalFollowers(competitor))}</div>
                    <div className="text-xs text-gray-500">Total Seguidores</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#0a0a0a]">
                    <div className="text-lg font-bold text-white">{getAvgEngagement(competitor)}%</div>
                    <div className="text-xs text-gray-500">Engajamento</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#0a0a0a]">
                    <div className="text-lg font-bold text-white">{getPostsPerWeek(competitor)}</div>
                    <div className="text-xs text-gray-500">Posts/Semana</div>
                  </div>
                </div>

                {/* Content Types */}
                <div className="flex flex-wrap gap-1.5">
                  {getContentTypes(competitor).map((type: string) => (
                    <span key={type} className="px-2 py-1 rounded-md bg-violet-500/10 text-violet-400 text-xs">
                      {type}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          )}
        </>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="text-center py-16">
          <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Posts Virais</h3>
          <p className="text-gray-400">Monitoramento de posts virais dos concorrentes será implementado em breve.</p>
          <p className="text-sm text-gray-500 mt-1">Requer integração com APIs das redes sociais.</p>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="text-center py-16">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Insights de Mercado</h3>
          <p className="text-gray-400">Análise inteligente de mercado será implementada em breve.</p>
          <p className="text-sm text-gray-500 mt-1">Insights serão gerados com base nos dados coletados dos concorrentes.</p>
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
                  const platforms = getPlatforms(competitor);
                  const avgGrowth = platforms.length > 0 ? platforms.reduce((sum: number, p: any) => sum + (p.followersGrowth || 0), 0) / platforms.length : 0;
                  return (
                    <tr key={competitor.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-white font-bold">
                            {getAvatar(competitor.name)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{competitor.name}</div>
                            <div className="text-xs text-gray-500">{getHandle(competitor)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4 text-white font-medium">{formatNumber(getTotalFollowers(competitor))}</td>
                      <td className="text-center p-4">
                        <span className={cn(
                          'flex items-center justify-center gap-1',
                          avgGrowth > 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                          {avgGrowth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {Math.abs(avgGrowth).toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center p-4 text-white">{getAvgEngagement(competitor)}%</td>
                      <td className="text-center p-4 text-white">{getPostsPerWeek(competitor)}</td>
                      <td className="text-center p-4 text-gray-400">{getBestTime(competitor)}</td>
                      <td className="text-center p-4 text-gray-400 text-sm max-w-[200px] truncate">{getStrategy(competitor)}</td>
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
                  {getAvatar(selectedCompetitor.name)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCompetitor.name}</h2>
                  <p className="text-gray-500">{getHandle(selectedCompetitor)}</p>
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
                  {getPlatforms(selectedCompetitor).map((platform: any) => {
                    const Icon = platformIcons[platform.name] || Users;
                    return (
                      <div key={platform.name} className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn('p-2 rounded-lg bg-gradient-to-br', platformColors[platform.name])}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white capitalize">{platform.name}</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{formatNumber(platform.followers || 0)}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            'text-sm flex items-center gap-1',
                            (platform.followersGrowth || 0) > 0 ? 'text-green-400' : 'text-red-400'
                          )}>
                            {(platform.followersGrowth || 0) > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {Math.abs(platform.followersGrowth || 0)}% mês
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-400">{platform.avgEngagement || 0}% eng.</span>
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
                    {getStrengths(selectedCompetitor).map((strength: string, i: number) => (
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
                    {getWeaknesses(selectedCompetitor).map((weakness: string, i: number) => (
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
                <p className="text-gray-400">{getStrategy(selectedCompetitor)}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {getPostsPerWeek(selectedCompetitor)} posts/semana
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-4 h-4" />
                    Melhor horário: {getBestTime(selectedCompetitor)}
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
                  value={newCompetitorName}
                  onChange={(e) => setNewCompetitorName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Perfil do Instagram</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={newCompetitorIG}
                  onChange={(e) => setNewCompetitorIG(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Outras redes (opcional)</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="TikTok @username"
                    value={newCompetitorTT}
                    onChange={(e) => setNewCompetitorTT(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn company/name"
                    value={newCompetitorLI}
                    onChange={(e) => setNewCompetitorLI(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#1a1a1a] flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button 
                leftIcon={createMutation.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                onClick={handleAddCompetitor}
                disabled={!newCompetitorName || createMutation.loading}
              >
                {createMutation.loading ? 'Adicionando...' : 'Adicionar e Analisar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
