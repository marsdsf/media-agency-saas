'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Calendar, 
  Check, 
  X, 
  MessageSquare, 
  BarChart3,
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  FileText,
  Download,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

// Mock data - em produção virá do Supabase
const mockPosts = [
  {
    id: '1',
    type: 'instagram',
    content: 'Novo lançamento! Nossa coleção de verão chegou com peças exclusivas...',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    scheduledFor: '2024-01-15T10:00:00',
    status: 'pending_approval',
    hashtags: ['#moda', '#verao2024', '#lancamento'],
  },
  {
    id: '2',
    type: 'facebook',
    content: 'Promoção especial de fim de semana! 30% OFF em toda a loja...',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
    scheduledFor: '2024-01-16T14:00:00',
    status: 'pending_approval',
    hashtags: ['#promocao', '#desconto'],
  },
  {
    id: '3',
    type: 'instagram',
    content: 'Dica de estilo: como combinar as cores do momento...',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    scheduledFor: '2024-01-17T18:00:00',
    status: 'approved',
    hashtags: ['#dica', '#estilo', '#moda'],
  },
];

const mockReports = [
  {
    id: '1',
    title: 'Relatório Mensal - Dezembro 2023',
    createdAt: '2024-01-05',
    metrics: { reach: 45000, engagement: 3.2, followers: 1250 },
  },
  {
    id: '2',
    title: 'Relatório Mensal - Novembro 2023',
    createdAt: '2023-12-05',
    metrics: { reach: 38000, engagement: 2.8, followers: 980 },
  },
];

export default function ClientPortalPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'calendar' | 'reports' | 'messages'>('posts');
  const [posts, setPosts] = useState(mockPosts);
  const [selectedPost, setSelectedPost] = useState<typeof mockPosts[0] | null>(null);
  const [feedback, setFeedback] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const router = useRouter();
  // Removed useSearchParams to fix build
  
  // Get client info from token/session
  const clientName = 'Loja Fashion Style';
  const agencyName = 'Digital Plus Marketing';

  const pendingPosts = posts.filter(p => p.status === 'pending_approval');
  const approvedPosts = posts.filter(p => p.status === 'approved');

  const handleApprove = (postId: string) => {
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, status: 'approved' } : p
    ));
    setSelectedPost(null);
  };

  const handleReject = (postId: string) => {
    if (!feedback.trim()) {
      alert('Por favor, explique o motivo da rejeição');
      return;
    }
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, status: 'rejected' } : p
    ));
    setSelectedPost(null);
    setFeedback('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending_approval: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      approved: 'bg-green-500/10 text-green-400 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
      published: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    const labels = {
      pending_approval: 'Aguardando aprovação',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      published: 'Publicado',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">FS</span>
            </div>
            <div>
              <h1 className="text-white font-semibold">{clientName}</h1>
              <p className="text-xs text-gray-500">Gerenciado por {agencyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {pendingPosts.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-yellow-400 text-sm">{pendingPosts.length} para aprovar</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-1">
            {[
              { id: 'posts', label: 'Posts', icon: FileText, badge: pendingPosts.length },
              { id: 'calendar', label: 'Calendário', icon: Calendar },
              { id: 'reports', label: 'Relatórios', icon: BarChart3 },
              { id: 'messages', label: 'Mensagens', icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge ? (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-yellow-500 text-black text-xs font-semibold">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Pending Section */}
            {pendingPosts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  Aguardando sua aprovação
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all cursor-pointer"
                      onClick={() => setSelectedPost(post)}
                    >
                      {post.image && (
                        <div className="aspect-square relative">
                          <Image
                            src={post.image}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500 capitalize">{post.type}</span>
                          {getStatusBadge(post.status)}
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2 mb-2">{post.content}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.scheduledFor)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Section */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                Posts aprovados
              </h2>
              {approvedPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhum post aprovado ainda
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden"
                    >
                      {post.image && (
                        <div className="aspect-square relative">
                          <Image
                            src={post.image}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500 capitalize">{post.type}</span>
                          {getStatusBadge(post.status)}
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2 mb-2">{post.content}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.scheduledFor)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                  className="p-2 rounded-lg bg-[#1a1a1a] text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                  className="p-2 rounded-lg bg-[#1a1a1a] text-gray-400 hover:text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 1;
                const isCurrentMonth = day > 0 && day <= new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                const hasPost = posts.some(p => new Date(p.scheduledFor).getDate() === day);
                
                return (
                  <div
                    key={i}
                    className={`aspect-square p-1 rounded-lg ${
                      isCurrentMonth ? 'bg-[#1a1a1a]' : 'bg-transparent'
                    }`}
                  >
                    {isCurrentMonth && (
                      <div className="h-full flex flex-col items-center justify-center">
                        <span className={`text-sm ${hasPost ? 'text-white' : 'text-gray-600'}`}>
                          {day}
                        </span>
                        {hasPost && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {mockReports.map((report) => (
              <div
                key={report.id}
                className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6 hover:border-violet-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">{report.title}</h3>
                    <p className="text-sm text-gray-500">Criado em {new Date(report.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm transition-colors">
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#0a0a0a]">
                    <div className="text-2xl font-bold text-white">{(report.metrics.reach / 1000).toFixed(1)}k</div>
                    <div className="text-sm text-gray-500">Alcance</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0a0a0a]">
                    <div className="text-2xl font-bold text-white">{report.metrics.engagement}%</div>
                    <div className="text-sm text-gray-500">Engajamento</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0a0a0a]">
                    <div className="text-2xl font-bold text-white">+{report.metrics.followers}</div>
                    <div className="text-sm text-gray-500">Novos seguidores</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
            <div className="h-[400px] flex flex-col">
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex-shrink-0 flex items-center justify-center text-white text-sm">
                    A
                  </div>
                  <div className="bg-[#1a1a1a] rounded-2xl rounded-tl-none p-3 max-w-[70%]">
                    <p className="text-sm text-gray-300">Olá! Os posts da semana já estão prontos para aprovação. Qualquer dúvida é só avisar!</p>
                    <span className="text-xs text-gray-600 mt-1 block">Agência • 10:30</span>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-violet-600 rounded-2xl rounded-tr-none p-3 max-w-[70%]">
                    <p className="text-sm text-white">Perfeito! Vou revisar hoje à tarde.</p>
                    <span className="text-xs text-violet-200 mt-1 block">Você • 11:45</span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-[#1a1a1a]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                  />
                  <button className="p-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 capitalize">{selectedPost.type}</span>
                  {getStatusBadge(selectedPost.status)}
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedPost.image && (
                <div className="aspect-video relative rounded-xl overflow-hidden mb-4">
                  <Image
                    src={selectedPost.image}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <p className="text-white mb-4">{selectedPost.content}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedPost.hashtags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Calendar className="w-4 h-4" />
                Agendado para {formatDate(selectedPost.scheduledFor)}
              </div>

              {selectedPost.status === 'pending_approval' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Feedback (obrigatório se rejeitar)
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Explique o que precisa ser alterado..."
                      className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 resize-none h-24"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(selectedPost.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <ThumbsDown className="w-5 h-5" />
                      Rejeitar
                    </button>
                    <button
                      onClick={() => handleApprove(selectedPost.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white transition-colors"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      Aprovar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
