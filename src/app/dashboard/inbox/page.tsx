'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Search,
  Star,
  Archive,
  Send,
  Instagram,
  Facebook,
  Linkedin,
  MoreVertical,
  Check,
  CheckCheck,
  Sparkles,
  Bot,
  Tag,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Button, Card, Input, Textarea } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useApiData, useApiMutation } from '@/hooks/useApiData';

const FaTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

interface Conversation {
  id: string;
  contact_name: string;
  contact_avatar: string | null;
  platform: string;
  status: string;
  is_starred: boolean;
  is_pinned: boolean;
  unread_count: number;
  last_message_at: string | null;
  last_message_preview: string | null;
  tags: string[];
  assigned_to: string | null;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'contact' | 'agent' | 'system' | 'ai';
  sender_name: string | null;
  content: string;
  content_type: string;
  media_url: string | null;
  is_read: boolean;
  created_at: string;
}

const quickReplies = [
  'Olá! Obrigado pelo contato! 😊',
  'Claro! Vou enviar mais informações.',
  'Posso agendar uma call para conversarmos?',
  'Nossos planos começam a partir de R$ 997/mês.',
];

const platformIcons: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: FaTiktok,
  whatsapp: MessageCircle,
  email: MessageCircle,
  twitter: MessageCircle,
};

const tagColors: Record<string, string> = {
  lead: 'bg-blue-500/20 text-blue-400',
  hot: 'bg-red-500/20 text-red-400',
  cliente: 'bg-emerald-500/20 text-emerald-400',
  parceiro: 'bg-purple-500/20 text-purple-400',
};

function formatTimestamp(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Ontem';
  } else if (diffDays < 7) {
    return `${diffDays} dias`;
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
}

export default function InboxPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Build URL with filters
  const inboxParams = new URLSearchParams();
  if (filter === 'starred') inboxParams.set('starred', 'true');
  if (searchQuery) inboxParams.set('search', searchQuery);
  inboxParams.set('status', 'all');
  const inboxUrl = `/api/inbox?${inboxParams.toString()}`;

  const { data: inboxData, loading: loadingConversations, error: inboxError, refetch: refetchInbox } =
    useApiData<{ conversations: Conversation[]; unreadCount: number }>(inboxUrl, { refreshKey });

  // Messages for selected conversation
  const messagesUrl = selectedConversation
    ? `/api/inbox/messages?conversation_id=${selectedConversation.id}`
    : null;
  const { data: messagesData, loading: loadingMessages, refetch: refetchMessages } =
    useApiData<{ messages: ChatMessage[] }>(messagesUrl, { refreshKey });

  const sendMessageMutation = useApiMutation('/api/inbox', 'POST');
  const updateConversationMutation = useApiMutation('/api/inbox', 'PATCH');

  const conversations = inboxData?.conversations || [];

  // Filter client-side for unread (API doesn't filter by unread directly)
  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'unread') return conv.unread_count > 0;
    return true;
  });

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.messages]);

  // Auto-select first conversation
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  const handleSendMessage = async () => {
    if (!reply.trim() || !selectedConversation) return;
    try {
      await sendMessageMutation.mutate({
        conversationId: selectedConversation.id,
        content: reply.trim(),
        contentType: 'text',
      });
      setReply('');
      refetchMessages();
      refetchInbox();
    } catch {
      // error already in mutation state
    }
  };

  const handleToggleStar = async (conv: Conversation, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await updateConversationMutation.mutate({
        id: conv.id,
        isStarred: !conv.is_starred,
      });
      refetchInbox();
    } catch {
      // error handled by mutation
    }
  };

  const handleArchive = async (conv: Conversation) => {
    try {
      await updateConversationMutation.mutate({
        id: conv.id,
        status: conv.status === 'archived' ? 'open' : 'archived',
      });
      if (selectedConversation?.id === conv.id) setSelectedConversation(null);
      refetchInbox();
    } catch {
      // error handled
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Inbox</h1>
          <p className="text-gray-400 mt-1">
            Gerencie todas as suas mensagens em um só lugar
            {inboxData?.unreadCount ? (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white text-black text-xs font-bold">
                {inboxData.unreadCount} não lidas
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            Atualizar
          </Button>
          <Button variant="secondary" leftIcon={<Bot className="w-4 h-4" />}>
            Respostas Automáticas
          </Button>
        </div>
      </div>

      {inboxError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
          Erro ao carregar conversas: {inboxError}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          {/* Search & Filters */}
          <div className="p-4 border-b border-[#1a1a1a]">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'unread', 'starred'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    filter === f
                      ? 'bg-white text-black'
                      : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                  )}
                >
                  {f === 'all' ? 'Todas' : f === 'unread' ? 'Não lidas' : 'Favoritas'}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MessageCircle className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm">
                  {filter !== 'all'
                    ? 'Nenhuma conversa encontrada com este filtro'
                    : 'Nenhuma conversa ainda'}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  As conversas aparecerão aqui quando você conectar suas redes sociais
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const PlatformIcon = platformIcons[conv.platform] || MessageCircle;
                const avatar = conv.contact_avatar || conv.contact_name?.charAt(0)?.toUpperCase() || '?';
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      'p-4 cursor-pointer transition-all border-b border-[#1a1a1a]',
                      selectedConversation?.id === conv.id
                        ? 'bg-white/10'
                        : 'hover:bg-white/5',
                      conv.is_pinned && 'bg-white/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                          'bg-gradient-to-br from-white/20 to-white/5 text-white'
                        )}>
                          {avatar.length === 1 ? avatar : avatar.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white truncate">{conv.contact_name}</h4>
                            <PlatformIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            {conv.is_starred && <Star className="w-3 h-3 text-white fill-white flex-shrink-0" />}
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTimestamp(conv.last_message_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                          {conv.last_message_preview || 'Sem mensagens'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {(conv.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className={cn(
                                'text-xs px-2 py-0.5 rounded-full',
                                tagColors[tag] || 'bg-gray-500/20 text-gray-400'
                              )}
                            >
                              {tag}
                            </span>
                          ))}
                          {conv.unread_count > 0 && (
                            <span className="ml-auto w-5 h-5 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white font-bold">
                      {selectedConversation.contact_avatar?.charAt(0) ||
                        selectedConversation.contact_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedConversation.contact_name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{selectedConversation.platform}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStar(selectedConversation)}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    <Star className={cn('w-4 h-4', selectedConversation.is_starred && 'fill-white text-white')} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                    <Tag className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleArchive(selectedConversation)}
                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
                  </div>
                ) : (messagesData?.messages || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageCircle className="w-10 h-10 text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm">Nenhuma mensagem ainda</p>
                    <p className="text-gray-500 text-xs mt-1">Envie a primeira mensagem</p>
                  </div>
                ) : (
                  (messagesData?.messages || []).map((msg) => {
                    const isAgent = msg.sender_type === 'agent';
                    const isSystem = msg.sender_type === 'system';
                    const isAi = msg.sender_type === 'ai';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <span className="text-xs text-gray-500 bg-[#1a1a1a] px-3 py-1 rounded-full">
                            {msg.content}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={cn('flex', isAgent || isAi ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] px-4 py-3 rounded-2xl',
                            isAgent
                              ? 'bg-white text-black rounded-br-md'
                              : isAi
                                ? 'bg-purple-900/40 text-white rounded-br-md border border-purple-500/30'
                                : 'bg-[#1a1a1a] text-white rounded-bl-md'
                          )}
                        >
                          {isAi && (
                            <div className="flex items-center gap-1 mb-1">
                              <Sparkles className="w-3 h-3 text-purple-400" />
                              <span className="text-xs text-purple-400">IA</span>
                            </div>
                          )}
                          {msg.media_url && (
                            <div className="mb-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={msg.media_url}
                                alt="Media"
                                className="rounded-lg max-w-full"
                              />
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <div
                            className={cn(
                              'flex items-center gap-1 mt-1',
                              isAgent || isAi ? 'justify-end' : 'justify-start'
                            )}
                          >
                            <span
                              className={cn(
                                'text-xs',
                                isAgent ? 'text-gray-600' : 'text-gray-500'
                              )}
                            >
                              {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isAgent &&
                              (msg.is_read ? (
                                <CheckCheck className="w-3 h-3 text-blue-500" />
                              ) : (
                                <Check className="w-3 h-3 text-gray-500" />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="px-4 py-2 border-t border-[#1a1a1a] flex gap-2 overflow-x-auto">
                {quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => setReply(qr)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[#1a1a1a] text-gray-400 text-sm hover:bg-white/10 hover:text-white transition-all"
                  >
                    {qr.length > 30 ? `${qr.slice(0, 30)}...` : qr}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[#1a1a1a]">
                <div className="flex items-end gap-3">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    rows={2}
                    className="flex-1"
                  />
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
                      IA
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<Send className="w-4 h-4" />}
                      onClick={handleSendMessage}
                      isLoading={sendMessageMutation.loading}
                      disabled={!reply.trim()}
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
                {sendMessageMutation.error && (
                  <p className="text-red-400 text-xs mt-2">{sendMessageMutation.error}</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Selecione uma conversa</h3>
                <p className="text-gray-500">Escolha uma mensagem para visualizar</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
