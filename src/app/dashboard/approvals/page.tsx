'use client';

import { useState } from 'react';
import { 
  CheckCircle, XCircle, Clock, MessageSquare, Eye, Send,
  Instagram, Facebook, Twitter, Linkedin, Calendar, User,
  ThumbsUp, ThumbsDown, Edit, History, Filter, Search,
  AlertCircle, Sparkles, ArrowRight, MoreVertical, ExternalLink
} from 'lucide-react';

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

interface ApprovalItem {
  id: string;
  client: {
    name: string;
    avatar: string;
  };
  content: {
    text: string;
    media?: string[];
    platforms: string[];
    scheduledFor: string;
  };
  status: ApprovalStatus;
  submittedAt: string;
  submittedBy: string;
  reviewedAt?: string;
  reviewedBy?: string;
  comments: {
    id: string;
    author: string;
    text: string;
    timestamp: string;
  }[];
  version: number;
}

const demoApprovals: ApprovalItem[] = [
  {
    id: '1',
    client: { name: 'Loja Fashion', avatar: '👗' },
    content: {
      text: '✨ Nova coleção Primavera/Verão 2026 chegou!\n\nPeças leves, coloridas e cheias de estilo para você arrasar na estação mais quente do ano. 🌸☀️\n\n👆 Link na bio para conferir\n\n#moda #primaveraverão #novacoleção #fashion',
      media: ['https://placehold.co/400x400/violet/white?text=Post+1'],
      platforms: ['instagram', 'facebook'],
      scheduledFor: '2026-01-16T10:00:00'
    },
    status: 'pending',
    submittedAt: '2026-01-15T09:00:00',
    submittedBy: 'Ana (Social Media)',
    comments: [],
    version: 1
  },
  {
    id: '2',
    client: { name: 'Academia XYZ', avatar: '💪' },
    content: {
      text: '🏋️ Segunda-feira é dia de começar a semana com tudo!\n\nVem treinar com a gente e conquistar seus objetivos. Primeira aula experimental GRÁTIS!\n\n📍 Unidade Centro e Shopping\n📞 (11) 99999-9999',
      platforms: ['instagram'],
      scheduledFor: '2026-01-20T06:00:00'
    },
    status: 'changes_requested',
    submittedAt: '2026-01-14T16:00:00',
    submittedBy: 'Carlos (Designer)',
    reviewedAt: '2026-01-14T18:30:00',
    reviewedBy: 'Cliente',
    comments: [
      {
        id: 'c1',
        author: 'Cliente (Academia XYZ)',
        text: 'Podem trocar a foto por uma com mais pessoas treinando? E adicionar o desconto de 20% para novos alunos.',
        timestamp: '2026-01-14T18:30:00'
      }
    ],
    version: 2
  },
  {
    id: '3',
    client: { name: 'Restaurante ABC', avatar: '🍽️' },
    content: {
      text: '🍝 Novidade no cardápio!\n\nExperimente nosso novo Risoto de Camarão com toque especial do Chef.\n\nDisponível apenas às sextas e sábados.\nReservas: (11) 3333-4444\n\n#gastronomia #restaurante #risoto',
      media: ['https://placehold.co/400x400/orange/white?text=Risoto'],
      platforms: ['instagram', 'facebook'],
      scheduledFor: '2026-01-17T18:00:00'
    },
    status: 'approved',
    submittedAt: '2026-01-13T14:00:00',
    submittedBy: 'Ana (Social Media)',
    reviewedAt: '2026-01-13T15:45:00',
    reviewedBy: 'Cliente',
    comments: [
      {
        id: 'c2',
        author: 'Cliente (Restaurante ABC)',
        text: 'Perfeito! Aprovado! 👏',
        timestamp: '2026-01-13T15:45:00'
      }
    ],
    version: 1
  },
  {
    id: '4',
    client: { name: 'Tech Startup', avatar: '🚀' },
    content: {
      text: 'Economize até 40% em infraestrutura cloud com nossa solução.\n\nAgende uma demo gratuita e descubra como empresas como a sua estão reduzindo custos.\n\n🔗 Link na bio',
      platforms: ['linkedin', 'twitter'],
      scheduledFor: '2026-01-18T09:00:00'
    },
    status: 'rejected',
    submittedAt: '2026-01-12T11:00:00',
    submittedBy: 'Pedro (Copywriter)',
    reviewedAt: '2026-01-12T14:00:00',
    reviewedBy: 'Cliente',
    comments: [
      {
        id: 'c3',
        author: 'Cliente (Tech Startup)',
        text: 'Não podemos afirmar 40% de economia sem dados concretos. Precisamos reformular completamente.',
        timestamp: '2026-01-12T14:00:00'
      }
    ],
    version: 1
  }
];

const statusConfig: Record<ApprovalStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  pending: { label: 'Aguardando', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: Clock },
  approved: { label: 'Aprovado', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: CheckCircle },
  rejected: { label: 'Rejeitado', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: XCircle },
  changes_requested: { label: 'Alterações', color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: Edit }
};

const platformIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(demoApprovals);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'all'>('all');
  const [newComment, setNewComment] = useState('');

  const filteredApprovals = approvals.filter(a => 
    filterStatus === 'all' || a.status === filterStatus
  );

  const stats = {
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
    changes: approvals.filter(a => a.status === 'changes_requested').length
  };

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(a => 
      a.id === id ? { 
        ...a, 
        status: 'approved' as ApprovalStatus, 
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Você'
      } : a
    ));
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.map(a => 
      a.id === id ? { 
        ...a, 
        status: 'rejected' as ApprovalStatus,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Você'
      } : a
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            Aprovações de Conteúdo
          </h1>
          <p className="text-gray-400 mt-1">
            Workflow de aprovação com seus clientes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          className={`bg-[#1a1a1a] rounded-xl p-4 border cursor-pointer transition-all ${
            filterStatus === 'pending' ? 'border-yellow-500' : 'border-[#333] hover:border-yellow-500/50'
          }`}
          onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-sm text-gray-400">Aguardando</p>
            </div>
          </div>
        </div>
        <div 
          className={`bg-[#1a1a1a] rounded-xl p-4 border cursor-pointer transition-all ${
            filterStatus === 'changes_requested' ? 'border-orange-500' : 'border-[#333] hover:border-orange-500/50'
          }`}
          onClick={() => setFilterStatus(filterStatus === 'changes_requested' ? 'all' : 'changes_requested')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Edit className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.changes}</p>
              <p className="text-sm text-gray-400">Alterações</p>
            </div>
          </div>
        </div>
        <div 
          className={`bg-[#1a1a1a] rounded-xl p-4 border cursor-pointer transition-all ${
            filterStatus === 'approved' ? 'border-green-500' : 'border-[#333] hover:border-green-500/50'
          }`}
          onClick={() => setFilterStatus(filterStatus === 'approved' ? 'all' : 'approved')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.approved}</p>
              <p className="text-sm text-gray-400">Aprovados</p>
            </div>
          </div>
        </div>
        <div 
          className={`bg-[#1a1a1a] rounded-xl p-4 border cursor-pointer transition-all ${
            filterStatus === 'rejected' ? 'border-red-500' : 'border-[#333] hover:border-red-500/50'
          }`}
          onClick={() => setFilterStatus(filterStatus === 'rejected' ? 'all' : 'rejected')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.rejected}</p>
              <p className="text-sm text-gray-400">Rejeitados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Approvals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredApprovals.map((approval) => {
          const status = statusConfig[approval.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={approval.id}
              className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden hover:border-[#444] transition-colors"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-[#333]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                      {approval.client.avatar}
                    </div>
                    <span className="font-medium text-white">{approval.client.name}</span>
                  </div>
                  <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${status.bgColor} ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Agendar: {new Date(approval.content.scheduledFor).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-4">
                {/* Media Preview */}
                {approval.content.media && approval.content.media.length > 0 && (
                  <div className="mb-3 aspect-square bg-[#252525] rounded-lg overflow-hidden">
                    <img 
                      src={approval.content.media[0]} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Text */}
                <p className="text-sm text-gray-300 line-clamp-4 whitespace-pre-line">
                  {approval.content.text}
                </p>

                {/* Platforms */}
                <div className="flex items-center gap-2 mt-3">
                  {approval.content.platforms.map(platform => {
                    const Icon = platformIcons[platform] || MessageSquare;
                    return (
                      <div key={platform} className="p-1.5 bg-[#252525] rounded">
                        <Icon className="w-4 h-4 text-gray-400" />
                      </div>
                    );
                  })}
                </div>

                {/* Comments indicator */}
                {approval.comments.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>{approval.comments.length} comentário(s)</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-[#333] flex items-center gap-2">
                {approval.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(approval.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleReject(approval.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Rejeitar
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedApproval(approval)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-[#252525] text-gray-300 rounded-lg hover:bg-[#333] transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Detalhes
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#333] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-xl">
                  {selectedApproval.client.avatar}
                </div>
                <div>
                  <h2 className="font-semibold text-white">{selectedApproval.client.name}</h2>
                  <p className="text-sm text-gray-400">Versão {selectedApproval.version}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApproval(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Content */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">CONTEÚDO</h3>
                <div className="bg-[#252525] rounded-lg p-4">
                  <p className="text-white whitespace-pre-line">{selectedApproval.content.text}</p>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">AGENDAR PARA</h3>
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    {new Date(selectedApproval.content.scheduledFor).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">PLATAFORMAS</h3>
                  <div className="flex items-center gap-2">
                    {selectedApproval.content.platforms.map(p => {
                      const Icon = platformIcons[p] || MessageSquare;
                      return (
                        <div key={p} className="p-2 bg-[#252525] rounded">
                          <Icon className="w-4 h-4 text-gray-300" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  COMENTÁRIOS ({selectedApproval.comments.length})
                </h3>
                <div className="space-y-3">
                  {selectedApproval.comments.map(comment => (
                    <div key={comment.id} className="bg-[#252525] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white text-sm">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.text}</p>
                    </div>
                  ))}

                  {/* New Comment */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Adicionar comentário..."
                      className="flex-1 px-3 py-2 bg-[#252525] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                    />
                    <button className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            {selectedApproval.status === 'pending' && (
              <div className="p-6 border-t border-[#333] flex gap-3">
                <button
                  onClick={() => {
                    handleReject(selectedApproval.id);
                    setSelectedApproval(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Rejeitar
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors">
                  <Edit className="w-5 h-5" />
                  Solicitar Alterações
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedApproval.id);
                    setSelectedApproval(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Aprovar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
