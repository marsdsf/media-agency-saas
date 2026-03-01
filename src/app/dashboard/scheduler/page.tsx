'use client';

import { useState, useMemo } from 'react';
import { 
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
  Filter,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Sparkles
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button, Card, Badge, Tabs, Modal, Textarea, Input, Select } from '@/lib/ui';
import { usePostsStore, Platform, ScheduledPost } from '@/lib/store';

const platformIcons: Record<Platform, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  tiktok: Grid3X3,
  youtube: Youtube,
  pinterest: Grid3X3,
};

const platformColors: Record<Platform, string> = {
  instagram: 'bg-white/20',
  facebook: 'bg-white/20',
  linkedin: 'bg-white/20',
  twitter: 'bg-white/20',
  tiktok: 'bg-white/20',
  youtube: 'bg-white/20',
  pinterest: 'bg-white/20',
};

const statusConfig: Record<string, { label: string; variant: string }> = {
  draft: { label: 'Rascunho', variant: 'warning' },
  scheduled: { label: 'Agendado', variant: 'info' },
  published: { label: 'Publicado', variant: 'success' },
  failed: { label: 'Falhou', variant: 'danger' },
  rejected: { label: 'Rejeitado', variant: 'danger' },
  approved: { label: 'Aprovado', variant: 'success' },
  pending_approval: { label: 'Pendente', variant: 'warning' },
};

export default function SchedulerPage() {
  const { posts, addPost, updatePost, deletePost, duplicatePost, campaigns } = usePostsStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (filterPlatform === 'all') return true;
      return post.platforms.includes(filterPlatform);
    });
  }, [posts, filterPlatform]);

  // Get posts for a specific day
  const getPostsForDay = (date: Date) => {
    return filteredPosts.filter(post => 
      isSameDay(new Date(post.scheduledAt), date)
    );
  };

  // Navigate months
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Open post modal
  const openNewPostModal = (date?: Date) => {
    setSelectedDate(date || new Date());
    setSelectedPost(null);
    setIsNewPostModalOpen(true);
  };

  const openEditPostModal = (post: ScheduledPost) => {
    setSelectedPost(post);
    setSelectedDate(new Date(post.scheduledAt));
    setIsNewPostModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Agendador de Posts</h1>
          <p className="text-gray-400 mt-1">Crie, agende e gerencie seus posts em todas as redes sociais</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Gerar com IA
          </Button>
          <Button 
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => openNewPostModal()}
          >
            Novo Post
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold text-white min-w-[180px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Hoje
          </Button>
        </div>

        {/* View Mode & Filters */}
        <div className="flex items-center gap-3">
          <Tabs
            tabs={[
              { id: 'calendar', label: 'Calendário', icon: <CalendarIcon className="w-4 h-4" /> },
              { id: 'list', label: 'Lista', icon: <List className="w-4 h-4" /> },
            ]}
            activeTab={viewMode}
            onChange={(id) => setViewMode(id as 'calendar' | 'list')}
          />
          
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value as Platform | 'all')}
            className="px-3 py-2 rounded-xl bg-[#0a0a0a] border border-[#222] text-white text-sm focus:outline-none focus:border-white/30"
          >
            <option value="all">Todas Plataformas</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter/X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card className="overflow-hidden">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-[#1a1a1a]">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-400 bg-[#0a0a0a]">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayPosts = getPostsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={idx}
                  className={`
                    min-h-[120px] p-2 border-b border-r border-[#1a1a1a] 
                    ${!isCurrentMonth ? 'bg-black opacity-50' : 'bg-[#0a0a0a]'}
                    ${isCurrentDay ? 'ring-2 ring-white ring-inset' : ''}
                    hover:bg-white/5 transition-colors cursor-pointer group
                  `}
                  onClick={() => openNewPostModal(day)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`
                      text-sm font-medium
                      ${isCurrentDay ? 'text-white' : isCurrentMonth ? 'text-white' : 'text-gray-600'}
                    `}>
                      {format(day, 'd')}
                    </span>
                    <button 
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNewPostModal(day);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Posts for this day */}
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((post) => (
                      <div
                        key={post.id}
                        className="p-1.5 rounded-lg bg-[#1a1a2e] hover:bg-[#252540] transition-colors cursor-pointer group/post"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPostModal(post);
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {post.platforms.slice(0, 2).map((platform) => {
                            const Icon = platformIcons[platform];
                            return (
                              <div key={platform} className={`p-0.5 rounded ${platformColors[platform]}`}>
                                <Icon className="w-2.5 h-2.5 text-white" />
                              </div>
                            );
                          })}
                          {post.platforms.length > 2 && (
                            <span className="text-[10px] text-gray-500">+{post.platforms.length - 2}</span>
                          )}
                          <span className="text-[10px] text-gray-500 ml-auto">
                            {format(new Date(post.scheduledAt), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-300 line-clamp-1">{post.content}</p>
                      </div>
                    ))}
                    {dayPosts.length > 3 && (
                      <p className="text-[10px] text-gray-500 text-center">+{dayPosts.length - 3} mais</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <div className="divide-y divide-[#1a1a2e]">
            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Nenhum post encontrado</h3>
                <p className="text-gray-400 mb-6">Comece criando seu primeiro post agendado</p>
                <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => openNewPostModal()}>
                  Criar Post
                </Button>
              </div>
            ) : (
              filteredPosts
                .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                .map((post) => (
                  <PostListItem
                    key={post.id}
                    post={post}
                    onEdit={() => openEditPostModal(post)}
                    onDelete={() => deletePost(post.id)}
                    onDuplicate={() => duplicatePost(post.id)}
                  />
                ))
            )}
          </div>
        </Card>
      )}

      {/* New/Edit Post Modal */}
      <PostModal
        isOpen={isNewPostModalOpen}
        onClose={() => {
          setIsNewPostModalOpen(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
        defaultDate={selectedDate}
        campaigns={campaigns}
        onSave={(data) => {
          if (selectedPost) {
            updatePost(selectedPost.id, data);
          } else {
            addPost({
              ...data,
              status: data.scheduledAt ? 'scheduled' : 'draft',
            });
          }
          setIsNewPostModalOpen(false);
          setSelectedPost(null);
        }}
      />
    </div>
  );
}

// Post List Item Component
function PostListItem({ 
  post, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: { 
  post: ScheduledPost;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-start gap-4">
        {/* Date/Time */}
        <div className="w-20 text-center shrink-0">
          <div className="text-2xl font-bold text-white">
            {format(new Date(post.scheduledAt), 'd')}
          </div>
          <div className="text-xs text-gray-400">
            {format(new Date(post.scheduledAt), 'MMM', { locale: ptBR })}
          </div>
          <div className="text-sm text-white mt-1">
            {format(new Date(post.scheduledAt), 'HH:mm')}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {post.platforms.map((platform) => {
              const Icon = platformIcons[platform];
              return (
                <div key={platform} className={`p-1.5 rounded-lg ${platformColors[platform]}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              );
            })}
            <Badge variant={statusConfig[post.status]?.variant as any}>
              {statusConfig[post.status]?.label || post.status}
            </Badge>
            {post.campaign && (
              <Badge>{post.campaign}</Badge>
            )}
          </div>
          <p className="text-white line-clamp-2 mb-2">{post.content}</p>
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.hashtags.map((tag) => (
                <span key={tag} className="text-xs text-gray-400">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-xl z-20 py-1">
                <button
                  onClick={() => { onEdit(); setMenuOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => { onDuplicate(); setMenuOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Duplicar
                </button>
                <button
                  onClick={() => { onDelete(); setMenuOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Post Modal Component
function PostModal({
  isOpen,
  onClose,
  post,
  defaultDate,
  campaigns,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  post: ScheduledPost | null;
  defaultDate: Date | null;
  campaigns: { id: string; name: string; color: string }[];
  onSave: (data: Omit<ScheduledPost, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [content, setContent] = useState(post?.content || '');
  const [platforms, setPlatforms] = useState<Platform[]>(post?.platforms || ['instagram']);
  const [scheduledDate, setScheduledDate] = useState(
    post?.scheduledAt 
      ? format(new Date(post.scheduledAt), 'yyyy-MM-dd')
      : defaultDate 
        ? format(defaultDate, 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd')
  );
  const [scheduledTime, setScheduledTime] = useState(
    post?.scheduledAt
      ? format(new Date(post.scheduledAt), 'HH:mm')
      : '10:00'
  );
  const [hashtags, setHashtags] = useState(post?.hashtags.join(' ') || '');
  const [campaign, setCampaign] = useState(post?.campaign || '');
  const [activePreview, setActivePreview] = useState<Platform>('instagram');

  const togglePlatform = (platform: Platform) => {
    if (platforms.includes(platform)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter(p => p !== platform));
      }
    } else {
      setPlatforms([...platforms, platform]);
    }
    if (!platforms.includes(activePreview) && platforms.length > 0) {
      setActivePreview(platforms[0]);
    }
  };

  const handleSave = () => {
    const hashtagArray = hashtags
      .split(/[\s,#]+/)
      .filter(tag => tag.length > 0);

    onSave({
      content,
      platforms,
      scheduledAt: `${scheduledDate}T${scheduledTime}:00`,
      status: post?.status || 'scheduled',
      hashtags: hashtagArray,
      campaign: campaign || undefined,
    });
  };

  // Best times suggestions
  const bestTimes = [
    { time: '09:00', label: 'Manhã', engagement: 'Alto' },
    { time: '12:00', label: 'Almoço', engagement: 'Médio' },
    { time: '18:00', label: 'Fim do dia', engagement: 'Alto' },
    { time: '21:00', label: 'Noite', engagement: 'Muito Alto' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={post ? 'Editar Post' : 'Novo Post'} size="full">
      <div className="flex h-[calc(90vh-80px)]">
        {/* Editor */}
        <div className="flex-1 p-6 overflow-y-auto border-r border-[#1a1a2e]">
          <div className="space-y-6">
            {/* Platforms */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Plataformas</label>
              <div className="flex flex-wrap gap-2">
                {(['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'] as Platform[]).map((platform) => {
                  const Icon = platformIcons[platform];
                  const isSelected = platforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl border transition-all
                        ${isSelected 
                          ? 'border-white bg-white/20 text-white' 
                          : 'border-[#333] bg-[#0a0a0a] text-gray-400 hover:border-white/30'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{platform}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">Conteúdo</label>
                <span className="text-xs text-gray-500">{content.length}/2200</span>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva seu post aqui..."
                rows={6}
              />
              <div className="flex gap-2 mt-2">
                <Button variant="ghost" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Melhorar com IA
                </Button>
              </div>
            </div>

            {/* Hashtags */}
            <Input
              label="Hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="marketing digital inovacao tecnologia"
            />

            {/* Campaign */}
            <Select
              label="Campanha (opcional)"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              options={[
                { value: '', label: 'Sem campanha' },
                ...campaigns.map(c => ({ value: c.id, label: c.name }))
              ]}
            />

            {/* Schedule */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Data"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
              <Input
                label="Hora"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>

            {/* Best Times */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Melhores Horários</label>
              <div className="grid grid-cols-4 gap-2">
                {bestTimes.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setScheduledTime(slot.time)}
                    className={`
                      p-3 rounded-xl border text-center transition-all
                      ${scheduledTime === slot.time
                        ? 'border-white bg-white/20'
                        : 'border-[#333] bg-[#0a0a0a] hover:border-white/30'
                      }
                    `}
                  >
                    <div className="text-lg font-bold text-white">{slot.time}</div>
                    <div className="text-xs text-gray-400">{slot.label}</div>
                    <div className={`text-xs mt-1 ${
                      slot.engagement === 'Muito Alto' ? 'text-white' :
                      slot.engagement === 'Alto' ? 'text-gray-300' : 'text-gray-400'
                    }`}>
                      {slot.engagement}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="w-[400px] bg-black p-6 overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-3">Preview</label>
            <div className="flex gap-2">
              {platforms.map((platform) => {
                const Icon = platformIcons[platform];
                return (
                  <button
                    key={platform}
                    onClick={() => setActivePreview(platform)}
                    className={`
                      p-2 rounded-lg transition-all
                      ${activePreview === platform
                        ? 'bg-[#1a1a2e] text-white'
                        : 'text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platform Preview */}
          <PostPreview 
            platform={activePreview} 
            content={content} 
            hashtags={hashtags.split(/[\s,#]+/).filter(t => t)} 
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-[#1a1a2e] flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => onSave({ 
            content, 
            platforms, 
            scheduledAt: `${scheduledDate}T${scheduledTime}:00`,
            status: 'draft',
            hashtags: hashtags.split(/[\s,#]+/).filter(t => t),
            campaign: campaign || undefined,
          })}>
            Salvar Rascunho
          </Button>
          <Button onClick={handleSave} leftIcon={<Clock className="w-4 h-4" />}>
            Agendar Post
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Post Preview Component
function PostPreview({ 
  platform, 
  content, 
  hashtags 
}: { 
  platform: Platform; 
  content: string; 
  hashtags: string[];
}) {
  const hashtagText = hashtags.length > 0 
    ? '\n\n' + hashtags.map(t => `#${t}`).join(' ')
    : '';

  if (platform === 'instagram') {
    return (
      <div className="bg-white rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-3">
          <div className="w-8 h-8 rounded-full bg-black" />
          <div>
            <div className="text-sm font-semibold text-black">sua_marca</div>
            <div className="text-xs text-gray-500">Patrocinado</div>
          </div>
        </div>
        {/* Image Placeholder */}
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Imagem/Vídeo</span>
        </div>
        {/* Actions */}
        <div className="p-3">
          <div className="flex gap-4 mb-3">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <div className="text-sm text-black">
            <span className="font-semibold">sua_marca </span>
            {content || 'Seu texto aqui...'}
            <span className="text-gray-600">{hashtagText}</span>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'twitter') {
    return (
      <div className="bg-black rounded-xl p-4 border border-gray-800">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-white shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white">Sua Marca</span>
              <span className="text-gray-500">@sua_marca · agora</span>
            </div>
            <div className="text-white whitespace-pre-wrap">
              {content || 'Seu texto aqui...'}
              <span className="text-gray-400">{hashtagText}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'linkedin') {
    return (
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="p-4">
          <div className="flex gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-black" />
            <div>
              <div className="font-semibold text-black">Sua Empresa</div>
              <div className="text-xs text-gray-500">1.234 seguidores</div>
              <div className="text-xs text-gray-500">agora · 🌐</div>
            </div>
          </div>
          <div className="text-sm text-black whitespace-pre-wrap">
            {content || 'Seu texto aqui...'}
            <span className="text-gray-600">{hashtagText}</span>
          </div>
        </div>
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Imagem/Link Preview</span>
        </div>
      </div>
    );
  }

  // Default preview
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4">
      <div className="text-white whitespace-pre-wrap">
        {content || 'Seu texto aqui...'}
        <span className="text-gray-400">{hashtagText}</span>
      </div>
    </div>
  );
}
