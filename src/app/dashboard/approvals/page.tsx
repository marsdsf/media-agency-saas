'use client';

import { useState } from 'react';
import { 
  CheckCircle, XCircle, Clock, MessageSquare, Eye, Send,
  Instagram, Facebook, Twitter, Linkedin, Calendar, 
  ThumbsUp, ThumbsDown, Edit,
  AlertCircle, Sparkles, RefreshCw, Bell, Mail, Phone,
  Loader2
} from 'lucide-react';
import { useApiData, useApiMutation } from '@/hooks/useApiData';

type ApprovalStatus = 'pending_approval' | 'approved' | 'rejected' | 'draft' | 'scheduled' | 'published' | 'failed';

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  pending_approval: { label: 'Aguardando', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: Clock },
  approved: { label: 'Aprovado', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: CheckCircle },
  rejected: { label: 'Rejeitado', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: XCircle },
  draft: { label: 'Rascunho', color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: Edit },
  scheduled: { label: 'Agendado', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: Calendar },
  published: { label: 'Publicado', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', icon: CheckCircle },
  failed: { label: 'Falhou', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: AlertCircle },
};

const platformIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
};

export default function ApprovalsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [sendingApproval, setSendingApproval] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch real posts from API
  const { data, loading, error, refetch } = useApiData<{ posts: any[] }>(
    '/api/posts',
    { refreshKey }
  );

  const updateMutation = useApiMutation('/api/posts', 'PATCH');
  const approvalNotification = useApiMutation('/api/notifications/approval', 'POST');

  const posts = data?.posts || [];
  
  const filteredPosts = posts.filter((p: any) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'needs_action') return ['pending_approval', 'rejected'].includes(p.status);
    return p.status === filterStatus;
  });

  const stats = {
    pending: posts.filter((p: any) => p.status === 'pending_approval').length,
    approved: posts.filter((p: any) => p.status === 'approved').length,
    rejected: posts.filter((p: any) => p.status === 'rejected').length,
    total: posts.length,
  };

  const handleApprove = async (id: string) => {
    try {
      await updateMutation.mutate({ id, status: 'approved' });
      setRefreshKey(k => k + 1);
      setSelectedPost(null);
    } catch (e) {
      console.error('Error approving:', e);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateMutation.mutate({ id, status: 'rejected' });
      setRefreshKey(k => k + 1);
      setShowRejectModal(null);
      setRejectionReason('');
      setSelectedPost(null);
    } catch (e) {
      console.error('Error rejecting:', e);
    }
  };

  const handleSendForApproval = async (postId: string) => {
    setSendingApproval(postId);
    try {
      await approvalNotification.mutate({ postId });
      setRefreshKey(k => k + 1);
    } catch (e) {
      console.error('Error sending approval:', e);
    } finally {
      setSendingApproval(null);
    }
  };

  const handleRequestChanges = async (id: string) => {
    try {
      await updateMutation.mutate({ id, status: 'draft' });
      setRefreshKey(k => k + 1);
      setSelectedPost(null);
    } catch (e) {
      console.error('Error requesting changes:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

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
            Workflow de aprovação com seus clientes via Email e WhatsApp
          </p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-gray-300 hover:text-white hover:border-violet-500/50 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          className={`bg-[#1a1a1a] rounded-xl p-4 border cursor-pointer transition-all ${
            filterStatus === 'pending_approval' ? 'border-yellow-500' : 'border-[#333] hover:border-yellow-500/50'
          }`}
          onClick={() => setFilterStatus(filterStatus === 'pending_approval' ? 'all' : 'pending_approval')}
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
            filterStatus === 'needs_action' ? 'border-orange-500' : 'border-[#333] hover:border-orange-500/50'
          }`}
          onClick={() => setFilterStatus(filterStatus === 'needs_action' ? 'all' : 'needs_action')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending + stats.rejected}</p>
              <p className="text-sm text-gray-400">Ação Necessária</p>
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

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-12 text-center">
          <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum post encontrado</h3>
          <p className="text-gray-400">
            {filterStatus === 'all' 
              ? 'Crie posts na página de agendamento para enviá-los para aprovação.'
              : 'Nenhum post com este status no momento.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPosts.map((post: any) => {
            const status = statusConfig[post.status] || statusConfig.draft;
            const StatusIcon = status.icon;
            const PlatformIcon = platformIcons[post.platform] || MessageSquare;
            const clientName = post.clients?.name || 'Sem cliente';

            return (
              <div
                key={post.id}
                className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden hover:border-[#444] transition-colors"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-[#333]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-sm">
                        {clientName.charAt(0)}
                      </div>
                      <span className="font-medium text-white text-sm">{clientName}</span>
                    </div>
                    <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${status.bgColor} ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <PlatformIcon className="w-4 h-4" />
                      <span className="capitalize">{post.platform || 'N/A'}</span>
                    </div>
                    {(post.scheduled_for || post.scheduled_at) && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(post.scheduled_for || post.scheduled_at).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Preview */}
                <div className="p-4">
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="mb-3 aspect-video bg-[#252525] rounded-lg overflow-hidden">
                      <img 
                        src={post.media_urls[0]} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <p className="text-sm text-gray-300 line-clamp-4 whitespace-pre-line">
                    {post.content || 'Sem conteúdo'}
                  </p>

                  {post.ai_generated && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-violet-400">
                      <Sparkles className="w-3 h-3" />
                      Gerado por IA
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-[#333] flex items-center gap-2">
                  {post.status === 'draft' && (
                    <button
                      onClick={() => handleSendForApproval(post.id)}
                      disabled={sendingApproval === post.id}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-violet-500/20 text-violet-400 rounded-lg hover:bg-violet-500/30 transition-colors disabled:opacity-50"
                    >
                      {sendingApproval === post.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                      Enviar p/ Aprovação
                    </button>
                  )}
                  {post.status === 'pending_approval' && (
                    <>
                      <button
                        onClick={() => handleApprove(post.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => setShowRejectModal(post.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Rejeitar
                      </button>
                    </>
                  )}
                  {post.status === 'rejected' && (
                    <button
                      onClick={() => handleRequestChanges(post.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Voltar p/ Rascunho
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-[#252525] text-gray-300 rounded-lg hover:bg-[#333] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[#333] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-lg">
                  {(selectedPost.clients?.name || 'P').charAt(0)}
                </div>
                <div>
                  <h2 className="font-semibold text-white">{selectedPost.clients?.name || 'Post'}</h2>
                  <p className="text-sm text-gray-400 capitalize">{selectedPost.platform || 'N/A'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="p-2 text-gray-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {(() => {
                const s = statusConfig[selectedPost.status] || statusConfig.draft;
                return (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${s.bgColor} ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                    {s.label}
                  </div>
                );
              })()}

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">CONTEÚDO</h3>
                <div className="bg-[#252525] rounded-lg p-4">
                  <p className="text-white whitespace-pre-line">{selectedPost.content || 'Sem conteúdo'}</p>
                </div>
              </div>

              {selectedPost.media_urls?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">MÍDIA</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedPost.media_urls.map((url: string, i: number) => (
                      <div key={i} className="aspect-square bg-[#252525] rounded-lg overflow-hidden">
                        <img src={url} alt={`Media ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">AGENDAR PARA</h3>
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    {selectedPost.scheduled_for || selectedPost.scheduled_at
                      ? new Date(selectedPost.scheduled_for || selectedPost.scheduled_at).toLocaleString('pt-BR')
                      : 'Não agendado'
                    }
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">CLIENTE</h3>
                  <p className="text-white">{selectedPost.clients?.name || 'Sem cliente'}</p>
                </div>
              </div>

              {selectedPost.rejection_reason && (
                <div>
                  <h3 className="text-sm font-medium text-red-400 mb-2">MOTIVO DA REJEIÇÃO</h3>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-200">{selectedPost.rejection_reason}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">CANAIS DE NOTIFICAÇÃO</h3>
                <div className="flex gap-3">
                  {selectedPost.clients?.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-300 bg-[#252525] px-3 py-2 rounded-lg">
                      <Mail className="w-4 h-4 text-blue-400" />
                      {selectedPost.clients.contact_email}
                    </div>
                  )}
                  {selectedPost.clients?.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-300 bg-[#252525] px-3 py-2 rounded-lg">
                      <Phone className="w-4 h-4 text-green-400" />
                      {selectedPost.clients.contact_phone}
                    </div>
                  )}
                  {!selectedPost.clients?.contact_email && !selectedPost.clients?.contact_phone && (
                    <p className="text-sm text-gray-500">Cliente sem email ou telefone cadastrado</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#333] flex gap-3">
              {selectedPost.status === 'draft' && (
                <button
                  onClick={() => { handleSendForApproval(selectedPost.id); setSelectedPost(null); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  Enviar para Aprovação
                </button>
              )}
              {selectedPost.status === 'pending_approval' && (
                <>
                  <button
                    onClick={() => { setShowRejectModal(selectedPost.id); setSelectedPost(null); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Rejeitar
                  </button>
                  <button
                    onClick={() => handleRequestChanges(selectedPost.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                    Solicitar Alterações
                  </button>
                  <button
                    onClick={() => handleApprove(selectedPost.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Aprovar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowRejectModal(null)}>
          <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Rejeitar Post</h3>
            <p className="text-gray-400 text-sm mb-4">Informe o motivo da rejeição (opcional):</p>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Ex: Precisa ajustar o tom da mensagem..."
              className="w-full px-4 py-3 bg-[#252525] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none resize-none"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(null)}
                className="flex-1 px-4 py-3 bg-[#252525] text-gray-300 rounded-lg hover:bg-[#333] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
