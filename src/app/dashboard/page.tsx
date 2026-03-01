'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Users,
  Building2,
  ChevronDown,
  FileText,
  BarChart3,
  Zap,
  Loader2,
  ShoppingBag,
  Rocket,
  Image,
  Hash,
} from 'lucide-react';
import { Button, Card, Badge } from '@/lib/ui';
import { usePostsStore, useAuthStore } from '@/lib/store';
import { useClients, useProfile } from '@/hooks/useApiData';

export default function DashboardPage() {
  const { posts, fetchPosts } = usePostsStore();
  const { data: clientsData, loading: clientsLoading } = useClients();
  const { data: profileData, loading: profileLoading } = useProfile();
  const { user } = useAuthStore();
  const [isWelcome, setIsWelcome] = useState(false);
  const [selectedClient, setSelectedClient] = useState('all');
  const [showClientSelector, setShowClientSelector] = useState(false);

  const isSolo = user?.account_type === 'solo';
  const clients = clientsData?.clients ?? [];
  const agency = profileData?.agency;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsWelcome(params.get('welcome') === 'true');
  }, []);

  useEffect(() => {
    if (!isSolo) {
      fetchPosts(selectedClient === 'all' ? undefined : selectedClient);
    } else {
      fetchPosts();
    }
  }, [selectedClient, fetchPosts, isSolo]);

  const selectorClients = useMemo(() => [
    { id: 'all', name: 'Todos os Clientes', logo: '📊' },
    ...clients.map((c: any) => ({
      id: c.id,
      name: c.name,
      logo: c.name?.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase() || '??',
    })),
  ], [clients]);

  const currentClient = selectorClients.find(c => c.id === selectedClient);

  const pendingPosts = posts.filter(p => p.status === 'pending_approval');
  const scheduledPosts = posts.filter(p => p.status === 'scheduled');
  const draftPosts = posts.filter(p => p.status === 'draft');
  const publishedThisWeek = posts.filter(p => {
    if (p.status !== 'published') return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(p.updatedAt) >= weekAgo;
  });

  const aiCreditsUsed = user?.credits ?? agency?.aiCreditsUsed ?? 0;
  const aiCreditsLimit = user?.creditsLimit ?? agency?.aiCreditsLimit ?? 0;

  // Solo stats — focused on the individual user's content
  const soloStats = [
    { label: 'Posts Agendados', value: scheduledPosts.length, icon: Calendar, color: 'violet' },
    { label: 'Publicados na Semana', value: publishedThisWeek.length, icon: CheckCircle, color: 'green' },
    { label: 'Rascunhos', value: draftPosts.length, icon: FileText, color: 'yellow' },
    { label: 'Créditos IA', value: `${aiCreditsUsed}/${aiCreditsLimit}`, icon: Zap, color: 'blue' },
  ];

  // Agency stats
  const agencyStats = selectedClient === 'all'
    ? [
        { label: 'Clientes Ativos', value: clients.length, icon: Building2, color: 'violet' },
        { label: 'Posts Este Mês', value: posts.length, icon: FileText, color: 'blue' },
        { label: 'Aguardando Aprovação', value: pendingPosts.length, icon: Clock, color: 'yellow' },
        { label: 'Publicados na Semana', value: publishedThisWeek.length, icon: CheckCircle, color: 'green' },
      ]
    : [
        { label: 'Posts Agendados', value: scheduledPosts.length, icon: Calendar, color: 'violet' },
        { label: 'Publicados', value: publishedThisWeek.length, icon: CheckCircle, color: 'green' },
        { label: 'Rascunhos', value: draftPosts.length, icon: Clock, color: 'yellow' },
        { label: 'Pendentes', value: pendingPosts.length, icon: TrendingUp, color: 'blue' },
      ];

  const stats = isSolo ? soloStats : agencyStats;

  const colorClasses = {
    violet: 'bg-violet-500/10 text-violet-400',
    blue: 'bg-blue-500/10 text-blue-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    green: 'bg-green-500/10 text-green-400',
  };

  const upcomingPosts = posts
    .filter(p => p.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);

  const isLoading = (!isSolo && clientsLoading) || profileLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner — Solo */}
      {isSolo && isWelcome && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/10 border border-violet-500/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-violet-600">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">Bem-vindo ao MediaAI! 🚀</h2>
              <p className="text-gray-400 mb-4">Sua conta está pronta. Comece a criar conteúdo com IA:</p>
              <div className="grid md:grid-cols-3 gap-3">
                <Link href="/dashboard/products" className="flex items-center gap-2 p-3 rounded-xl bg-[#111] border border-[#1a1a1a] hover:border-violet-500/30 transition-all">
                  <ShoppingBag className="w-5 h-5 text-violet-400" />
                  <span className="text-sm text-white">Cadastrar produtos</span>
                </Link>
                <Link href="/dashboard/ai-studio" className="flex items-center gap-2 p-3 rounded-xl bg-[#111] border border-[#1a1a1a] hover:border-violet-500/30 transition-all">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <span className="text-sm text-white">Gerar conteúdo com IA</span>
                </Link>
                <Link href="/dashboard/autopilot" className="flex items-center gap-2 p-3 rounded-xl bg-[#111] border border-[#1a1a1a] hover:border-violet-500/30 transition-all">
                  <Rocket className="w-5 h-5 text-violet-400" />
                  <span className="text-sm text-white">Ativar Autopilot</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner — Agency */}
      {!isSolo && (isWelcome || clients.length === 0) && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/10 border border-violet-500/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-violet-600">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">Bem-vindo ao MediaAI! 🎉</h2>
              <p className="text-gray-400 mb-4">Sua agência está pronta para começar. Aqui estão seus próximos passos:</p>
              <div className="grid md:grid-cols-3 gap-3">
                <Link href="/dashboard/clients" className="flex items-center gap-2 p-3 rounded-xl bg-[#111] border border-[#1a1a1a] hover:border-violet-500/30 transition-all">
                  <Users className="w-5 h-5 text-violet-400" />
                  <span className="text-sm text-white">Adicionar clientes</span>
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-2 p-3 rounded-xl bg-[#111] border border-[#1a1a1a] hover:border-violet-500/30 transition-all">
                  <Building2 className="w-5 h-5 text-violet-400" />
                  <span className="text-sm text-white">Configurar agência</span>
                </Link>
                <Link href="/dashboard/scheduler" className="flex items-center gap-2 p-3 rounded-xl bg-[#111] border border-[#1a1a1a] hover:border-violet-500/30 transition-all">
                  <Calendar className="w-5 h-5 text-violet-400" />
                  <span className="text-sm text-white">Criar primeiro post</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header — Solo Mode */}
      {isSolo && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Olá, {user?.name || 'Empreendedor'}! 👋</h1>
            <p className="text-gray-400 text-sm">Gerencie seu conteúdo e redes sociais</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111] border border-[#1a1a1a]">
              <Zap className="w-4 h-4 text-violet-400" />
              <div className="text-sm">
                <span className="text-white font-medium">{aiCreditsUsed.toLocaleString()}</span>
                <span className="text-gray-500">/{aiCreditsLimit.toLocaleString()} créditos</span>
              </div>
            </div>
            <Link href="/dashboard/ai-studio">
              <Button leftIcon={<Sparkles className="w-4 h-4" />}>
                Criar com IA
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Header — Agency Mode with Client Selector */}
      {!isSolo && (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Client Selector */}
          <div className="relative">
            <button
              onClick={() => setShowClientSelector(!showClientSelector)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#111] border border-[#1a1a1a] hover:border-violet-500/30 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {currentClient?.logo}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-white">{currentClient?.name}</div>
                <div className="text-xs text-gray-500">{selectedClient === 'all' ? 'Visão geral' : 'Cliente selecionado'}</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showClientSelector ? 'rotate-180' : ''}`} />
            </button>

            {showClientSelector && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#111] border border-[#1a1a1a] rounded-xl shadow-2xl z-50 overflow-hidden">
                {selectorClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client.id);
                      setShowClientSelector(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors ${
                      selectedClient === client.id ? 'bg-violet-500/10' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-sm">
                      {client.logo}
                    </div>
                    <span className="text-sm text-white">{client.name}</span>
                    {selectedClient === client.id && (
                      <CheckCircle className="w-4 h-4 text-violet-400 ml-auto" />
                    )}
                  </button>
                ))}
                <div className="border-t border-[#1a1a1a]">
                  <Link
                    href="/dashboard/clients"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-violet-400 hover:bg-[#1a1a1a] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Gerenciar clientes
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm">
              {selectedClient === 'all' ? 'Visão geral da agência' : `Gerenciando ${currentClient?.name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111] border border-[#1a1a1a]">
            <Zap className="w-4 h-4 text-violet-400" />
            <div className="text-sm">
              <span className="text-white font-medium">{aiCreditsUsed.toLocaleString()}</span>
              <span className="text-gray-500">/{aiCreditsLimit.toLocaleString()} créditos</span>
            </div>
          </div>

          <Link href="/dashboard/scheduler">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Novo Post
            </Button>
          </Link>
        </div>
      </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 hover:border-violet-500/20 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions — Solo */}
      {isSolo && (
        <div className="grid md:grid-cols-4 gap-4">
          <Link href="/dashboard/products">
            <Card className="p-5 hover:border-violet-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10">
                  <ShoppingBag className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">Produtos</h3>
                  <p className="text-xs text-gray-500">Gerenciar catálogo</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/ai-studio">
            <Card className="p-5 hover:border-violet-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">AI Studio</h3>
                  <p className="text-xs text-gray-500">Criar conteúdo</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/calendar">
            <Card className="p-5 hover:border-violet-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">Calendário</h3>
                  <p className="text-xs text-gray-500">Ver agenda</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/autopilot">
            <Card className="p-5 hover:border-violet-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-500/10">
                  <Rocket className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">Autopilot</h3>
                  <p className="text-xs text-gray-500">Postagem automática</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      )}

      {/* Upcoming Posts — Solo */}
      {isSolo && (
        <Card>
          <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Próximos Posts</h2>
            <Link href="/dashboard/calendar">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Ver calendário
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {upcomingPosts.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Nenhum post agendado</p>
                <p className="text-gray-500 text-sm mb-4">Use o AI Studio para criar seu primeiro conteúdo</p>
                <Link href="/dashboard/ai-studio">
                  <Button leftIcon={<Sparkles className="w-4 h-4" />}>
                    Criar com IA
                  </Button>
                </Link>
              </div>
            ) : (
              upcomingPosts.map((post) => (
                <div key={post.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {post.platforms.map((platform) => (
                          <Badge key={platform} variant="info">{platform}</Badge>
                        ))}
                        <span className="text-xs text-gray-500">
                          {new Date(post.scheduledAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Quick Actions for Agency View */}
      {!isSolo && selectedClient === 'all' && (
        <div className="grid md:grid-cols-4 gap-4">
          <Link href="/dashboard/clients">
            <Card className="p-5 hover:border-violet-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10">
                  <Users className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">Clientes</h3>
                  <p className="text-xs text-gray-500">{clients.length} ativos</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/scheduler">
            <Card className="p-5 hover:border-violet-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">Calendário</h3>
                  <p className="text-xs text-gray-500">Agendar posts</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/agents">
            <Card className="p-5 hover:border-violet-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">IA Criativa</h3>
                  <p className="text-xs text-gray-500">Gerar conteúdo</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/analytics">
            <Card className="p-5 hover:border-violet-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-500/10">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">Relatórios</h3>
                  <p className="text-xs text-gray-500">Analytics</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      )}

      {/* Pending Approvals — Agency only */}
      {!isSolo && selectedClient === 'all' && pendingPosts.length > 0 && (
        <Card>
          <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <h2 className="text-lg font-semibold text-white">Aguardando Aprovação</h2>
              <Badge variant="warning">{pendingPosts.length}</Badge>
            </div>
            <Link href="/dashboard/approvals">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Ver todos
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {pendingPosts.slice(0, 5).map((post) => {
              const client = clients.find((c: any) => c.id === post.clientId);
              const clientName = client?.name || 'Sem cliente';
              return (
                <div key={post.id} className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-semibold">
                    {clientName.split(' ').map((w: string) => w[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{clientName}</p>
                    <p className="text-sm text-gray-500 truncate">{post.content}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Quick Actions for Client View — Agency only */}
      {!isSolo && selectedClient !== 'all' && (
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/dashboard/scheduler">
            <Card className="p-6 hover:border-violet-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-violet-500/10">
                  <Calendar className="w-6 h-6 text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Agendador</h3>
                  <p className="text-sm text-gray-400">Criar e agendar posts</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/agents">
            <Card className="p-6 hover:border-violet-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Agentes IA</h3>
                  <p className="text-sm text-gray-400">Gerar conteúdo com IA</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/analytics">
            <Card className="p-6 hover:border-violet-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Analytics</h3>
                  <p className="text-sm text-gray-400">Ver métricas e relatórios</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>
        </div>
      )}

      {/* Upcoming Posts — Agency Client View */}
      {!isSolo && selectedClient !== 'all' && (
        <Card>
          <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Próximos Posts</h2>
            <Link href="/dashboard/scheduler">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Ver todos
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {upcomingPosts.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum post agendado</p>
                <Link href="/dashboard/scheduler">
                  <Button variant="secondary" className="mt-4" leftIcon={<Plus className="w-4 h-4" />}>
                    Agendar Post
                  </Button>
                </Link>
              </div>
            ) : (
              upcomingPosts.map((post) => (
                <div key={post.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {post.platforms.map((platform) => (
                          <Badge key={platform} variant="info">{platform}</Badge>
                        ))}
                        <span className="text-xs text-gray-500">
                          {new Date(post.scheduledAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
