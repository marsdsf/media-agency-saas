'use client';

import { useState } from 'react';
import { 
  Users,
  Plus,
  Search,
  Settings,
  MoreVertical,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Check,
  X,
  Clock,
  Eye,
  Edit3,
  Trash2,
  UserPlus,
  UserMinus,
  Key,
  Activity
} from 'lucide-react';
import { Button, Card, Badge, Input, Switch } from '@/lib/ui';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  lastActive: string;
  projects: number;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  roles: { owner: boolean; admin: boolean; editor: boolean; viewer: boolean };
}

const teamMembers: TeamMember[] = [
  { id: '1', name: 'Você', email: 'voce@empresa.com', avatar: 'V', role: 'owner', status: 'active', lastActive: 'Agora', projects: 12 },
  { id: '2', name: 'Ana Paula', email: 'ana@empresa.com', avatar: 'A', role: 'admin', status: 'active', lastActive: '5 min atrás', projects: 8 },
  { id: '3', name: 'Carlos Silva', email: 'carlos@empresa.com', avatar: 'C', role: 'editor', status: 'active', lastActive: '1 hora atrás', projects: 5 },
  { id: '4', name: 'Mariana Costa', email: 'mariana@empresa.com', avatar: 'M', role: 'editor', status: 'pending', lastActive: '-', projects: 0 },
  { id: '5', name: 'Pedro Santos', email: 'pedro@freelancer.com', avatar: 'P', role: 'viewer', status: 'active', lastActive: '2 dias atrás', projects: 3 },
];

const permissions: Permission[] = [
  { id: '1', name: 'Criar Campanhas', description: 'Criar e publicar novas campanhas', roles: { owner: true, admin: true, editor: true, viewer: false } },
  { id: '2', name: 'Editar Campanhas', description: 'Modificar campanhas existentes', roles: { owner: true, admin: true, editor: true, viewer: false } },
  { id: '3', name: 'Excluir Campanhas', description: 'Remover campanhas permanentemente', roles: { owner: true, admin: true, editor: false, viewer: false } },
  { id: '4', name: 'Ver Relatórios', description: 'Acessar analytics e métricas', roles: { owner: true, admin: true, editor: true, viewer: true } },
  { id: '5', name: 'Gerenciar Equipe', description: 'Adicionar e remover membros', roles: { owner: true, admin: true, editor: false, viewer: false } },
  { id: '6', name: 'Faturamento', description: 'Acessar faturas e pagamentos', roles: { owner: true, admin: false, editor: false, viewer: false } },
];

const roleConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  owner: { label: 'Proprietário', color: 'bg-amber-500/20 text-amber-400', icon: Crown },
  admin: { label: 'Admin', color: 'bg-purple-500/20 text-purple-400', icon: ShieldCheck },
  editor: { label: 'Editor', color: 'bg-blue-500/20 text-blue-400', icon: Edit3 },
  viewer: { label: 'Visualizador', color: 'bg-gray-500/20 text-gray-400', icon: Eye },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'bg-emerald-500/20 text-emerald-400' },
  pending: { label: 'Pendente', color: 'bg-amber-500/20 text-amber-400' },
  inactive: { label: 'Inativo', color: 'bg-gray-500/20 text-gray-400' },
};

export default function TeamPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'permissions' | 'activity'>('members');

  const filteredMembers = teamMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Membros', value: '5', icon: Users },
    { label: 'Ativos', value: '4', icon: Activity },
    { label: 'Pendentes', value: '1', icon: Clock },
    { label: 'Projetos', value: '12', icon: Shield },
  ];

  const activityLogs = [
    { user: 'Ana Paula', action: 'criou uma nova campanha', target: 'Lançamento Produto X', time: '5 min atrás' },
    { user: 'Carlos Silva', action: 'editou o post', target: 'Promoção Black Friday', time: '1 hora atrás' },
    { user: 'Você', action: 'convidou', target: 'Mariana Costa', time: '2 horas atrás' },
    { user: 'Pedro Santos', action: 'visualizou relatório', target: 'Analytics Dezembro', time: '2 dias atrás' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Equipe</h1>
          <p className="text-gray-400 mt-1">Gerencie membros e permissões da equipe</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<Settings className="w-4 h-4" />}>
            Configurações
          </Button>
          <Button leftIcon={<UserPlus className="w-4 h-4" />}>
            Convidar Membro
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
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1a1a1a] pb-2">
        {[
          { id: 'members', label: 'Membros', icon: Users },
          { id: 'permissions', label: 'Permissões', icon: Shield },
          { id: 'activity', label: 'Atividade', icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white text-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <Card className="overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-[#1a1a1a]">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Buscar membro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Members List */}
          <div className="divide-y divide-[#1a1a1a]">
            {filteredMembers.map((member) => {
              const RoleIcon = roleConfig[member.role].icon;
              return (
                <div
                  key={member.id}
                  className="p-4 flex items-center gap-4 hover:bg-white/5 transition-all"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-black text-lg font-bold">
                      {member.avatar}
                    </div>
                    {member.status === 'active' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{member.name}</h4>
                      {member.role === 'owner' && <Crown className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>

                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Projetos</p>
                      <p className="text-sm font-medium text-white">{member.projects}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Último Acesso</p>
                      <p className="text-sm text-white">{member.lastActive}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={cn('text-xs px-2 py-1 rounded-full flex items-center gap-1', roleConfig[member.role].color)}>
                      <RoleIcon className="w-3 h-3" />
                      {roleConfig[member.role].label}
                    </span>
                    <span className={cn('text-xs px-2 py-1 rounded-full', statusConfig[member.status].color)}>
                      {statusConfig[member.status].label}
                    </span>
                  </div>

                  <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Permissão</th>
                  <th className="text-center p-4 text-sm font-medium text-amber-400">
                    <div className="flex items-center justify-center gap-1">
                      <Crown className="w-4 h-4" /> Proprietário
                    </div>
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-purple-400">
                    <div className="flex items-center justify-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Admin
                    </div>
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-blue-400">
                    <div className="flex items-center justify-center gap-1">
                      <Edit3 className="w-4 h-4" /> Editor
                    </div>
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="w-4 h-4" /> Visualizador
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.id} className="border-b border-[#1a1a1a] hover:bg-white/5">
                    <td className="p-4">
                      <p className="font-medium text-white">{perm.name}</p>
                      <p className="text-sm text-gray-500">{perm.description}</p>
                    </td>
                    {['owner', 'admin', 'editor', 'viewer'].map((role) => (
                      <td key={role} className="p-4 text-center">
                        {perm.roles[role as keyof typeof perm.roles] ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                            <Check className="w-4 h-4 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto">
                            <X className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <Card className="p-4">
          <h3 className="font-semibold text-white mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            {activityLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-all">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-bold text-white">
                  {log.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-white">
                    <span className="font-medium">{log.user}</span>
                    {' '}{log.action}{' '}
                    <span className="font-medium text-gray-300">{log.target}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
