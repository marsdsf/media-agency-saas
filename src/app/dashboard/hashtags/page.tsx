'use client';

import { useState } from 'react';
import { 
  Hash,
  Search,
  TrendingUp,
  Copy,
  Star,
  StarOff,
  Plus,
  Sparkles,
  BarChart3,
  Eye,
  Zap,
  FolderPlus,
  Check,
  RefreshCw
} from 'lucide-react';
import { Button, Card, Badge, Input, Textarea } from '@/lib/ui';
import { cn } from '@/lib/utils';

interface HashtagGroup {
  id: string;
  name: string;
  hashtags: string[];
  avgReach: number;
  usageCount: number;
}

interface Hashtag {
  tag: string;
  posts: number;
  trend: 'up' | 'down' | 'stable';
  competition: 'low' | 'medium' | 'high';
  score: number;
}

const hashtagGroups: HashtagGroup[] = [
  { id: '1', name: 'Marketing Digital', hashtags: ['#marketingdigital', '#socialmedia', '#digitalmarketing', '#marketing', '#negocios'], avgReach: 45000, usageCount: 23 },
  { id: '2', name: 'Empreendedorismo', hashtags: ['#empreendedorismo', '#empreender', '#negocios', '#sucesso', '#motivacao'], avgReach: 38000, usageCount: 18 },
  { id: '3', name: 'Lifestyle', hashtags: ['#lifestyle', '#vida', '#qualidadedevida', '#rotina', '#dicas'], avgReach: 52000, usageCount: 31 },
];

const trendingHashtags: Hashtag[] = [
  { tag: '#marketingdigital', posts: 2500000, trend: 'up', competition: 'high', score: 85 },
  { tag: '#empreendedorismo', posts: 1800000, trend: 'up', competition: 'high', score: 82 },
  { tag: '#negocios', posts: 1200000, trend: 'stable', competition: 'medium', score: 78 },
  { tag: '#dicas', posts: 950000, trend: 'up', competition: 'medium', score: 75 },
  { tag: '#motivacao', posts: 3200000, trend: 'stable', competition: 'high', score: 72 },
  { tag: '#produtividade', posts: 450000, trend: 'up', competition: 'low', score: 88 },
  { tag: '#crescimento', posts: 320000, trend: 'up', competition: 'low', score: 90 },
  { tag: '#estrategia', posts: 180000, trend: 'up', competition: 'low', score: 92 },
];

export default function HashtagsPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);

  const generateHashtags = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    
    // Simulated AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generated = [
      '#' + prompt.split(' ')[0].toLowerCase(),
      '#marketingdigital',
      '#socialmedia',
      '#digitalmarketing',
      '#negocios',
      '#empreendedorismo',
      '#sucesso',
      '#dicas',
      '#estrategia',
      '#crescimento',
      '#inovacao',
      '#tecnologia',
      '#produtividade',
      '#resultados',
      '#brasil',
    ];
    
    setGeneratedHashtags(generated);
    setIsGenerating(false);
  };

  const copyAll = () => {
    const text = generatedHashtags.length > 0 
      ? generatedHashtags.join(' ') 
      : selectedHashtags.join(' ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const competitionColors = {
    low: 'text-emerald-400 bg-emerald-400/20',
    medium: 'text-amber-400 bg-amber-400/20',
    high: 'text-red-400 bg-red-400/20',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Gerador de Hashtags</h1>
          <p className="text-gray-400 mt-1">Encontre as melhores hashtags para seu conteúdo</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Generator */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Generator */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Gerar com IA</h3>
            </div>
            <Textarea
              placeholder="Descreva seu post ou nicho... Ex: Dicas de marketing digital para pequenas empresas"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="mb-4"
            />
            <div className="flex items-center gap-3">
              <Button
                onClick={generateHashtags}
                disabled={!prompt || isGenerating}
                leftIcon={isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              >
                {isGenerating ? 'Gerando...' : 'Gerar Hashtags'}
              </Button>
              <span className="text-sm text-gray-500">5 créditos</span>
            </div>

            {/* Generated Results */}
            {generatedHashtags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-400">Hashtags Geradas</h4>
                  <Button variant="ghost" size="sm" onClick={copyAll} leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
                    {copied ? 'Copiado!' : 'Copiar Todas'}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generatedHashtags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleHashtag(tag)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:scale-105',
                        selectedHashtags.includes(tag)
                          ? 'bg-white text-black'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Trending Hashtags */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-white" />
                <h3 className="text-lg font-semibold text-white">Hashtags em Alta</h3>
              </div>
              <Button variant="ghost" size="sm">Ver mais</Button>
            </div>
            <div className="space-y-3">
              {trendingHashtags.map((hashtag) => (
                <div
                  key={hashtag.tag}
                  onClick={() => toggleHashtag(hashtag.tag)}
                  className={cn(
                    'group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all',
                    selectedHashtags.includes(hashtag.tag)
                      ? 'bg-white/10 ring-1 ring-white/30'
                      : 'bg-[#0a0a0a] hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-white font-medium">{hashtag.tag}</p>
                      <p className="text-xs text-gray-500">{(hashtag.posts / 1000000).toFixed(1)}M posts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn('px-2 py-0.5 rounded text-xs font-medium', competitionColors[hashtag.competition])}>
                      {hashtag.competition === 'low' ? 'Baixa' : hashtag.competition === 'medium' ? 'Média' : 'Alta'}
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3 text-gray-500" />
                      <span className="text-sm text-white font-medium">{hashtag.score}</span>
                    </div>
                    {hashtag.trend === 'up' && (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Hashtags */}
          {selectedHashtags.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Selecionadas</h3>
                <span className="text-sm text-gray-500">{selectedHashtags.length}/30</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedHashtags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => toggleHashtag(tag)}
                    className="px-2 py-1 rounded-lg bg-white text-black text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={copyAll} leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button variant="secondary" size="sm" leftIcon={<FolderPlus className="w-4 h-4" />}>
                  Salvar
                </Button>
              </div>
            </Card>
          )}

          {/* Saved Groups */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Grupos Salvos</h3>
              <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Novo
              </Button>
            </div>
            <div className="space-y-3">
              {hashtagGroups.map((group) => (
                <div
                  key={group.id}
                  className="group p-3 rounded-xl bg-[#0a0a0a] hover:bg-white/5 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{group.name}</h4>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                    {group.hashtags.join(' ')}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {(group.avgReach / 1000).toFixed(0)}K alcance
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {group.usageCount} usos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-4 bg-gradient-to-br from-white/5 to-transparent border-white/10">
            <h3 className="text-sm font-semibold text-white mb-3">💡 Dicas</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Use 5-10 hashtags por post no Instagram</li>
              <li>• Misture hashtags populares e de nicho</li>
              <li>• Evite hashtags banidas ou spam</li>
              <li>• Atualize seus grupos regularmente</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
