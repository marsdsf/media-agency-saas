'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Users, 
  Instagram, 
  Facebook, 
  Twitter,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  BarChart3,
  Edit2,
  Trash2,
  UserPlus,
  Send,
  Check,
  X,
  Building2
} from 'lucide-react';

// Mock clients data
const mockClients = [
  {
    id: '1',
    name: 'Fashion Style',
    email: 'contato@fashionstyle.com.br',
    phone: '(11) 99999-1234',
    website: 'fashionstyle.com.br',
    logo: 'FS',
    color: '#8B5CF6',
    socialAccounts: [
      { platform: 'instagram', username: '@fashionstyle', followers: 45000 },
      { platform: 'facebook', username: 'fashionstyle', followers: 12000 },
    ],
    postsThisMonth: 24,
    pendingApproval: 3,
    portalAccess: true,
    createdAt: '2023-10-15',
  },
  {
    id: '2',
    name: 'Café Aroma',
    email: 'marketing@cafearoma.com',
    phone: '(11) 98888-5678',
    website: 'cafearoma.com',
    logo: 'CA',
    color: '#EC4899',
    socialAccounts: [
      { platform: 'instagram', username: '@cafearoma', followers: 28000 },
      { platform: 'tiktok', username: '@cafearoma', followers: 15000 },
    ],
    postsThisMonth: 18,
    pendingApproval: 0,
    portalAccess: true,
    createdAt: '2023-11-20',
  },
  {
    id: '3',
    name: 'Tech Solutions',
    email: 'social@techsolutions.io',
    phone: '(11) 97777-9012',
    website: 'techsolutions.io',
    logo: 'TS',
    color: '#06B6D4',
    socialAccounts: [
      { platform: 'linkedin', username: 'techsolutions', followers: 8500 },
      { platform: 'twitter', username: '@techsolutions', followers: 5200 },
    ],
    postsThisMonth: 12,
    pendingApproval: 5,
    portalAccess: false,
    createdAt: '2023-12-01',
  },
];

export default function ClientsPage() {
  const [clients, setClients] = useState(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<typeof mockClients[0] | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFollowers = clients.reduce((sum, client) => 
    sum + client.socialAccounts.reduce((s, acc) => s + acc.followers, 0), 0
  );

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return Instagram;
      case 'facebook': return Facebook;
      case 'twitter': return Twitter;
      default: return Users;
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-gray-500">Gerencie os clientes da sua agência</p>
        </div>
        <button
          onClick={() => setShowNewClientModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold transition-all shadow-lg shadow-violet-500/25"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-[#111] border border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-3">
            <Building2 className="w-5 h-5 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white">{clients.length}</div>
          <div className="text-sm text-gray-500">Clientes ativos</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#111] border border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{(totalFollowers / 1000).toFixed(1)}k</div>
          <div className="text-sm text-gray-500">Seguidores totais</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#111] border border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {clients.reduce((sum, c) => sum + c.postsThisMonth, 0)}
          </div>
          <div className="text-sm text-gray-500">Posts este mês</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#111] border border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-3">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {clients.reduce((sum, c) => sum + c.pendingApproval, 0)}
          </div>
          <div className="text-sm text-gray-500">Aguardando aprovação</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar cliente por nome ou email..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#111] border border-[#1a1a1a] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="p-5 rounded-2xl bg-[#111] border border-[#1a1a1a] hover:border-violet-500/30 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: client.color }}
                >
                  {client.logo}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{client.name}</h3>
                  <a 
                    href={`https://${client.website}`} 
                    target="_blank" 
                    className="text-sm text-gray-500 hover:text-violet-400 flex items-center gap-1"
                  >
                    {client.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Social Accounts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {client.socialAccounts.map((account, i) => {
                const Icon = getPlatformIcon(account.platform);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] text-sm"
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{(account.followers / 1000).toFixed(1)}k</span>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar className="w-4 h-4" />
                {client.postsThisMonth} posts
              </div>
              {client.pendingApproval > 0 && (
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  {client.pendingApproval} pendentes
                </div>
              )}
            </div>

            {/* Portal Access */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                {client.portalAccess ? (
                  <span className="flex items-center gap-1.5 text-xs text-green-400">
                    <Check className="w-3 h-3" />
                    Portal ativo
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <X className="w-3 h-3" />
                    Sem portal
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedClient(client);
                    setShowInviteModal(true);
                  }}
                  className="p-2 rounded-lg hover:bg-violet-500/10 text-gray-500 hover:text-violet-400 transition-colors"
                  title="Convidar para portal"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="px-3 py-1.5 rounded-lg bg-violet-600/10 text-violet-400 text-sm hover:bg-violet-600/20 transition-colors"
                >
                  Gerenciar
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Client Card */}
        <button
          onClick={() => setShowNewClientModal(true)}
          className="p-5 rounded-2xl border-2 border-dashed border-[#1a1a1a] hover:border-violet-500/30 transition-all flex flex-col items-center justify-center gap-3 min-h-[200px] group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] group-hover:bg-violet-500/10 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-gray-500 group-hover:text-violet-400" />
          </div>
          <span className="text-gray-500 group-hover:text-gray-300">Adicionar cliente</span>
        </button>
      </div>

      {/* New Client Modal */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-[#1a1a1a]">
              <h2 className="text-xl font-bold text-white">Novo Cliente</h2>
              <p className="text-sm text-gray-500">Adicione um novo cliente à sua agência</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome do cliente/empresa</label>
                <input
                  type="text"
                  placeholder="Ex: Fashion Style"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="contato@empresa.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                <input
                  type="url"
                  placeholder="www.empresa.com.br"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <input type="checkbox" id="portal" className="w-4 h-4 rounded" defaultChecked />
                <label htmlFor="portal" className="text-sm text-gray-300">
                  Enviar convite para o Portal do Cliente
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-[#1a1a1a] flex justify-end gap-3">
              <button
                onClick={() => setShowNewClientModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[#333] text-white hover:bg-[#1a1a1a] transition-colors"
              >
                Cancelar
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold transition-all">
                Criar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-[#1a1a1a]">
              <h2 className="text-xl font-bold text-white">Convidar para Portal</h2>
              <p className="text-sm text-gray-500">Envie um convite para {selectedClient.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email do cliente</label>
                <input
                  type="email"
                  defaultValue={selectedClient.email}
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div className="p-4 rounded-xl bg-[#0a0a0a] text-sm text-gray-400">
                <p className="mb-2">O cliente receberá:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Acesso ao portal para aprovar posts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Visualização do calendário de conteúdo
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Relatórios de performance
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-[#1a1a1a] flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setSelectedClient(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-[#333] text-white hover:bg-[#1a1a1a] transition-colors"
              >
                Cancelar
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold transition-all">
                <Send className="w-4 h-4" />
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
