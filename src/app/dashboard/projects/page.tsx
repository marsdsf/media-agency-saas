'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus,
  Search,
  FolderKanban,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import { Button, Card, Badge, Input } from '@/lib/ui';

interface Project {
  id: string;
  name: string;
  client: string;
  status: 'briefing' | 'in_progress' | 'review' | 'completed';
  progress: number;
  postsCount: number;
  deadline: string;
  createdAt: string;
}

const statusConfig = {
  briefing: { label: 'Briefing', color: 'bg-gray-500/20 text-gray-400', icon: AlertCircle },
  in_progress: { label: 'Em Andamento', color: 'bg-white/20 text-white', icon: Clock },
  review: { label: 'Em Revisão', color: 'bg-gray-400/20 text-gray-300', icon: Eye },
  completed: { label: 'Concluído', color: 'bg-white/10 text-gray-200', icon: CheckCircle },
};

const projects: Project[] = [
  {
    id: '1',
    name: 'Campanha Black Friday 2026',
    client: 'TechStore Brasil',
    status: 'in_progress',
    progress: 65,
    postsCount: 24,
    deadline: '2026-01-25',
    createdAt: '2026-01-05',
  },
  {
    id: '2',
    name: 'Lançamento Produto X',
    client: 'StartupAI',
    status: 'briefing',
    progress: 15,
    postsCount: 8,
    deadline: '2026-02-10',
    createdAt: '2026-01-10',
  },
  {
    id: '3',
    name: 'Rebranding Completo',
    client: 'Moda Express',
    status: 'review',
    progress: 90,
    postsCount: 32,
    deadline: '2026-01-15',
    createdAt: '2025-12-20',
  },
  {
    id: '4',
    name: 'Campanha de Verão',
    client: 'Beach Club',
    status: 'completed',
    progress: 100,
    postsCount: 18,
    deadline: '2026-01-01',
    createdAt: '2025-12-01',
  },
];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total de Projetos', value: projects.length, icon: FolderKanban, color: 'from-gray-600 to-gray-800' },
    { label: 'Em Andamento', value: projects.filter(p => p.status === 'in_progress').length, icon: Clock, color: 'from-gray-500 to-gray-700' },
    { label: 'Concluídos', value: projects.filter(p => p.status === 'completed').length, icon: CheckCircle, color: 'from-white to-gray-200' },
    { label: 'Posts Criados', value: projects.reduce((acc, p) => acc + p.postsCount, 0), icon: FileText, color: 'from-gray-400 to-gray-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Demo Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
        <div>
          <p className="text-sm text-yellow-200 font-medium">Modo de demonstração</p>
          <p className="text-xs text-yellow-400/70">Projetos mostra dados de exemplo. Módulo de gestão de projetos com dados reais em breve.</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Projetos</h1>
          <p className="text-gray-400 mt-1">Gerencie suas campanhas e projetos de clientes</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} className="group">
          <span className="group-hover:scale-105 transition-transform inline-block">Novo Projeto</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="group p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar projetos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'briefing', 'in_progress', 'review', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                statusFilter === status
                  ? 'bg-white text-black shadow-lg shadow-white/20'
                  : 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:shadow-md hover:shadow-white/5'
              }`}
            >
              {status === 'all' ? 'Todos' : statusConfig[status as keyof typeof statusConfig]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const StatusIcon = statusConfig[project.status].icon;
          return (
            <Card key={project.id} className="overflow-hidden group hover:-translate-y-2 hover:shadow-xl hover:shadow-white/10 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[project.status].color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig[project.status].label}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                      className="p-1.5 rounded-lg hover:bg-[#1a1a2e] text-gray-400 hover:text-white transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen === project.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl shadow-xl z-20 py-1">
                          <button className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#252540] flex items-center gap-2">
                            <Eye className="w-4 h-4" /> Ver detalhes
                          </button>
                          <button className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#252540] flex items-center gap-2">
                            <Edit className="w-4 h-4" /> Editar
                          </button>
                          <button className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-[#252540] flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Excluir
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-gray-300 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-400 flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4" />
                  {project.client}
                </p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-white font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-gray-600 to-white rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {project.postsCount} posts
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#1a1a2e] bg-[#0d0d14]">
                <Link href={`/dashboard/scheduler?project=${project.id}`}>
                  <Button variant="ghost" size="sm" className="w-full" rightIcon={<TrendingUp className="w-4 h-4" />}>
                    Ver Posts
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="p-12 text-center">
          <FolderKanban className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum projeto encontrado</h3>
          <p className="text-gray-400 mb-6">Crie seu primeiro projeto para começar</p>
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Criar Projeto
          </Button>
        </Card>
      )}
    </div>
  );
}
