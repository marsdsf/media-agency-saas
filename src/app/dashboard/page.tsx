'use client';

import Link from 'next/link';
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button, Card, Badge } from '@/lib/ui';
import { usePostsStore } from '@/lib/store';

export default function DashboardPage() {
  const { posts } = usePostsStore();

  const stats = [
    { label: 'Posts Agendados', value: posts.filter(p => p.status === 'scheduled').length, icon: Calendar, gradient: 'from-gray-600 to-gray-800' },
    { label: 'Publicados Hoje', value: 0, icon: CheckCircle, gradient: 'from-gray-500 to-gray-700' },
    { label: 'Rascunhos', value: posts.filter(p => p.status === 'draft').length, icon: Clock, gradient: 'from-gray-600 to-gray-800' },
    { label: 'Engajamento', value: '+24%', icon: TrendingUp, gradient: 'from-white to-gray-200' },
  ];

  const upcomingPosts = posts
    .filter(p => p.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Gerencie seus posts e campanhas</p>
        </div>
        <Link href="/dashboard/scheduler">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Novo Post
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-5 h-5 ${stat.gradient.includes('white') ? 'text-black' : 'text-white'}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/dashboard/scheduler">
          <Card className="p-6 hover:border-white/30 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 cursor-pointer group hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-white to-gray-200 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-gray-200 transition-colors">Agendador</h3>
                <p className="text-sm text-gray-400">Criar e agendar posts</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/agents">
          <Card className="p-6 hover:border-white/30 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 cursor-pointer group hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gray-300 to-gray-500 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-gray-200 transition-colors">Agentes IA</h3>
                <p className="text-sm text-gray-400">Gerar conteúdo com IA</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/projects">
          <Card className="p-6 hover:border-white/30 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 cursor-pointer group hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-gray-200 transition-colors">Analytics</h3>
                <p className="text-sm text-gray-400">Ver métricas e relatórios</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Upcoming Posts */}
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
    </div>
  );
}
