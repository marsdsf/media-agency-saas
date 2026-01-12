'use client';

import { useState } from 'react';
import { 
  MessageCircle,
  Search,
  Filter,
  Star,
  Archive,
  Trash2,
  Reply,
  Send,
  Instagram,
  Facebook,
  Linkedin,
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  Sparkles,
  Bot,
  User,
  Tag,
  Pin
} from 'lucide-react';
import { Button, Card, Badge, Input, Textarea } from '@/lib/ui';
import { cn } from '@/lib/utils';

const FaTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

interface Message {
  id: string;
  contact: string;
  avatar: string;
  platform: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isStarred: boolean;
  isPinned: boolean;
  status: 'online' | 'offline';
  tags: string[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'contact';
  content: string;
  timestamp: string;
  isRead: boolean;
}

const messages: Message[] = [
  { id: '1', contact: 'Maria Silva', avatar: 'M', platform: 'instagram', lastMessage: 'Olá! Vi o post sobre marketing digital e gostei muito...', timestamp: '10:30', unread: 3, isStarred: true, isPinned: true, status: 'online', tags: ['lead', 'hot'] },
  { id: '2', contact: 'João Santos', avatar: 'J', platform: 'facebook', lastMessage: 'Quanto custa o serviço de gestão de redes sociais?', timestamp: '09:45', unread: 1, isStarred: false, isPinned: false, status: 'offline', tags: ['lead'] },
  { id: '3', contact: 'Ana Beatriz', avatar: 'A', platform: 'instagram', lastMessage: 'Perfeito! Vou aguardar o orçamento então 😊', timestamp: 'Ontem', unread: 0, isStarred: false, isPinned: false, status: 'online', tags: ['cliente'] },
  { id: '4', contact: 'Carlos Mendes', avatar: 'C', platform: 'linkedin', lastMessage: 'Interessante a proposta. Podemos agendar uma call?', timestamp: 'Ontem', unread: 0, isStarred: true, isPinned: false, status: 'offline', tags: ['parceiro'] },
  { id: '5', contact: 'Fernanda Lima', avatar: 'F', platform: 'instagram', lastMessage: 'Adorei o trabalho de vocês! 🔥', timestamp: '2 dias', unread: 0, isStarred: false, isPinned: false, status: 'offline', tags: [] },
];

const chatMessages: ChatMessage[] = [
  { id: '1', sender: 'contact', content: 'Olá! Tudo bem?', timestamp: '10:25', isRead: true },
  { id: '2', sender: 'contact', content: 'Vi o post sobre marketing digital e gostei muito do conteúdo!', timestamp: '10:26', isRead: true },
  { id: '3', sender: 'user', content: 'Olá Maria! Que bom que gostou! 😊', timestamp: '10:28', isRead: true },
  { id: '4', sender: 'contact', content: 'Vocês fazem gestão de redes sociais?', timestamp: '10:28', isRead: true },
  { id: '5', sender: 'contact', content: 'Tenho uma loja online e preciso de ajuda com o Instagram', timestamp: '10:29', isRead: true },
  { id: '6', sender: 'contact', content: 'Podem me enviar mais informações?', timestamp: '10:30', isRead: false },
];

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
};

export default function InboxPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(messages[0]);
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread') return msg.unread > 0;
    if (filter === 'starred') return msg.isStarred;
    return true;
  });

  const tagColors: Record<string, string> = {
    lead: 'bg-blue-500/20 text-blue-400',
    hot: 'bg-red-500/20 text-red-400',
    cliente: 'bg-emerald-500/20 text-emerald-400',
    parceiro: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Inbox</h1>
          <p className="text-gray-400 mt-1">Gerencie todas as suas mensagens em um só lugar</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<Bot className="w-4 h-4" />}>
            Respostas Automáticas
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Messages List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          {/* Search & Filters */}
          <div className="p-4 border-b border-[#1a1a1a]">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input placeholder="Buscar conversas..." className="pl-10" />
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.map((msg) => {
              const PlatformIcon = platformIcons[msg.platform];
              return (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={cn(
                    'p-4 cursor-pointer transition-all border-b border-[#1a1a1a]',
                    selectedMessage?.id === msg.id
                      ? 'bg-white/10'
                      : 'hover:bg-white/5',
                    msg.isPinned && 'bg-white/5'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                        'bg-gradient-to-br from-white/20 to-white/5 text-white'
                      )}>
                        {msg.avatar}
                      </div>
                      {msg.status === 'online' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{msg.contact}</h4>
                          <PlatformIcon className="w-3 h-3 text-gray-500" />
                          {msg.isStarred && <Star className="w-3 h-3 text-white fill-white" />}
                        </div>
                        <span className="text-xs text-gray-500">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{msg.lastMessage}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {msg.tags.map((tag) => (
                          <span key={tag} className={cn('text-xs px-2 py-0.5 rounded-full', tagColors[tag] || 'bg-gray-500/20 text-gray-400')}>
                            {tag}
                          </span>
                        ))}
                        {msg.unread > 0 && (
                          <span className="ml-auto w-5 h-5 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center">
                            {msg.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedMessage ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white font-bold">
                      {selectedMessage.avatar}
                    </div>
                    {selectedMessage.status === 'online' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedMessage.contact}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedMessage.status === 'online' ? 'Online agora' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                    <Star className={cn('w-4 h-4', selectedMessage.isStarred && 'fill-white text-white')} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                    <Tag className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                    <Archive className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex',
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[70%] px-4 py-3 rounded-2xl',
                        msg.sender === 'user'
                          ? 'bg-white text-black rounded-br-md'
                          : 'bg-[#1a1a1a] text-white rounded-bl-md'
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className={cn(
                        'flex items-center gap-1 mt-1',
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      )}>
                        <span className={cn('text-xs', msg.sender === 'user' ? 'text-gray-600' : 'text-gray-500')}>
                          {msg.timestamp}
                        </span>
                        {msg.sender === 'user' && (
                          msg.isRead ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Replies */}
              <div className="px-4 py-2 border-t border-[#1a1a1a] flex gap-2 overflow-x-auto">
                {quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => setReply(qr)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[#1a1a1a] text-gray-400 text-sm hover:bg-white/10 hover:text-white transition-all"
                  >
                    {qr.slice(0, 30)}...
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[#1a1a1a]">
                <div className="flex items-end gap-3">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    rows={2}
                    className="flex-1"
                  />
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
                      IA
                    </Button>
                    <Button size="sm" leftIcon={<Send className="w-4 h-4" />}>
                      Enviar
                    </Button>
                  </div>
                </div>
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
