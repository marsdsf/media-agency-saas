'use client';

import { useState } from 'react';
import { 
  TrendingUp,
  Hash,
  Music,
  Flame,
  Clock,
  Eye,
  Play,
  ExternalLink,
  Filter,
  RefreshCw,
  Bookmark,
  Instagram,
  Sparkles
} from 'lucide-react';
import { Button, Card, Badge } from '@/lib/ui';
import { cn } from '@/lib/utils';

const FaTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

interface TrendingSound {
  id: string;
  name: string;
  artist: string;
  uses: number;
  platform: 'tiktok' | 'reels';
  trend: 'rising' | 'peak' | 'stable';
  daysActive: number;
}

interface TrendingTopic {
  id: string;
  topic: string;
  category: string;
  posts: number;
  growth: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface TrendingHashtag {
  id: string;
  tag: string;
  posts: number;
  growth: number;
  platform: string;
}

const trendingSounds: TrendingSound[] = [
  { id: '1', name: 'original sound - viral', artist: 'creator123', uses: 2500000, platform: 'tiktok', trend: 'rising', daysActive: 3 },
  { id: '2', name: 'APT.', artist: 'ROSÉ & Bruno Mars', uses: 15000000, platform: 'reels', trend: 'peak', daysActive: 14 },
  { id: '3', name: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars', uses: 8000000, platform: 'reels', trend: 'stable', daysActive: 30 },
  { id: '4', name: 'Espresso', artist: 'Sabrina Carpenter', uses: 12000000, platform: 'tiktok', trend: 'stable', daysActive: 45 },
  { id: '5', name: 'Birds of a Feather', artist: 'Billie Eilish', uses: 6000000, platform: 'reels', trend: 'rising', daysActive: 7 },
];

const trendingTopics: TrendingTopic[] = [
  { id: '1', topic: 'Inteligência Artificial no Marketing', category: 'Tech', posts: 45000, growth: 234, sentiment: 'positive' },
  { id: '2', topic: 'Tendências de Conteúdo 2026', category: 'Marketing', posts: 32000, growth: 156, sentiment: 'positive' },
  { id: '3', topic: 'Novidades do Instagram', category: 'Social Media', posts: 28000, growth: 89, sentiment: 'neutral' },
  { id: '4', topic: 'Estratégias de Growth', category: 'Business', posts: 19000, growth: 67, sentiment: 'positive' },
  { id: '5', topic: 'Creator Economy', category: 'Trends', posts: 15000, growth: 45, sentiment: 'positive' },
];

const trendingHashtags: TrendingHashtag[] = [
  { id: '1', tag: '#fyp', posts: 150000000, growth: 12, platform: 'TikTok' },
  { id: '2', tag: '#trending', posts: 89000000, growth: 23, platform: 'Instagram' },
  { id: '3', tag: '#viral', posts: 75000000, growth: 18, platform: 'All' },
  { id: '4', tag: '#marketingdigital', posts: 2500000, growth: 45, platform: 'Instagram' },
  { id: '5', tag: '#empreendedorismo', posts: 1800000, growth: 32, platform: 'Instagram' },
];

export default function TrendsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'sounds' | 'topics' | 'hashtags'>('sounds');
  const [savedItems, setSavedItems] = useState<string[]>([]);

  const toggleSave = (id: string) => {
    setSavedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const trendBadge = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <Badge variant="success" className="animate-pulse">🚀 Em Alta</Badge>;
      case 'peak':
        return <Badge variant="warning">🔥 No Pico</Badge>;
      default:
        return <Badge>📊 Estável</Badge>;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Demo Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0" />
        <div>
          <p className="text-sm text-yellow-200 font-medium">Modo de demonstração</p>
          <p className="text-xs text-yellow-400/70">Tendências mostra dados de exemplo. Integração com APIs do TikTok e Instagram para trends em tempo real em breve.</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Tendências</h1>
          <p className="text-gray-400 mt-1">Descubra o que está bombando nas redes sociais</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Atualizado há 2h
          </span>
          <Button variant="secondary" leftIcon={<RefreshCw className="w-4 h-4" />}>
            Atualizar
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'sounds', label: 'Sons Virais', icon: Music },
          { id: 'topics', label: 'Tópicos', icon: Flame },
          { id: 'hashtags', label: 'Hashtags', icon: Hash },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300',
              selectedCategory === cat.id
                ? 'bg-white text-black shadow-lg shadow-white/20'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Trending Sounds */}
      {selectedCategory === 'sounds' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaTiktok />
              TikTok & Reels
            </h3>
            {trendingSounds.map((sound) => (
              <Card
                key={sound.id}
                className="group p-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-medium truncate">{sound.name}</h4>
                      {trendBadge(sound.trend)}
                    </div>
                    <p className="text-sm text-gray-500">{sound.artist}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(sound.uses)} usos
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {sound.daysActive} dias
                      </span>
                      <span className="flex items-center gap-1">
                        {sound.platform === 'tiktok' ? <FaTiktok /> : <Instagram className="w-3 h-3" />}
                        {sound.platform === 'tiktok' ? 'TikTok' : 'Reels'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSave(sound.id)}
                      className={cn(
                        'p-2 rounded-lg transition-all',
                        savedItems.includes(sound.id)
                          ? 'bg-white/20 text-white'
                          : 'hover:bg-white/10 text-gray-400 hover:text-white'
                      )}
                    >
                      <Bookmark className={cn('w-4 h-4', savedItems.includes(sound.id) && 'fill-current')} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Tips */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-white/10 to-transparent border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-white" />
                <h3 className="text-lg font-semibold text-white">Dica do Dia</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Sons marcados como "🚀 Em Alta" têm maior potencial de viralização nos próximos 7 dias. 
                Use-os antes que atinjam o pico!
              </p>
              <Button variant="secondary" size="sm">
                Ver Tutorial
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Salvos</h3>
              {savedItems.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum som salvo ainda</p>
              ) : (
                <p className="text-white">{savedItems.length} itens salvos</p>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Trending Topics */}
      {selectedCategory === 'topics' && (
        <div className="space-y-4">
          {trendingTopics.map((topic, index) => (
            <Card
              key={topic.id}
              className="group p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300"
            >
              <div className="flex items-center gap-6">
                <span className="text-3xl font-bold text-gray-600">#{index + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-semibold text-white">{topic.topic}</h4>
                    <Badge>{topic.category}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatNumber(topic.posts)} posts</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                      +{topic.growth}%
                    </span>
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  Explorar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Trending Hashtags */}
      {selectedCategory === 'hashtags' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingHashtags.map((hashtag) => (
            <Card
              key={hashtag.id}
              className="group p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <Hash className="w-8 h-8 text-white/20" />
                <Badge variant="success">+{hashtag.growth}%</Badge>
              </div>
              <h4 className="text-xl font-bold text-white mb-1">{hashtag.tag}</h4>
              <p className="text-sm text-gray-500">{formatNumber(hashtag.posts)} posts</p>
              <p className="text-xs text-gray-600 mt-2">{hashtag.platform}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
