'use client';

import { useState } from 'react';
import {
  Sparkles, Wand2, Calendar, RefreshCw, Copy, Check,
  Image, Video, Layers, MessageSquare, Hash,
  Loader2, ChevronDown, Download, Send,
} from 'lucide-react';
import { Button, Card, Input, Textarea, Badge } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useApiData, useApiMutation } from '@/hooks/useApiData';

interface GeneratedPost {
  title: string;
  content: string;
  hashtags: string[];
  media_prompt: string;
  slides?: { title: string; text: string }[] | null;
  script_timestamps?: { time: string; action: string }[] | null;
  stories?: { text: string; cta: string }[] | null;
  engagement_tip: string;
  best_time: string;
}

interface Product {
  id: string;
  name: string;
  category: string | null;
  primary_image: string | null;
}

const CONTENT_TYPES = [
  { value: 'post', label: 'Post Feed', icon: Image, desc: 'Imagem + legenda' },
  { value: 'carousel', label: 'Carousel', icon: Layers, desc: '5-7 slides' },
  { value: 'reel', label: 'Reels', icon: Video, desc: 'Vídeo curto' },
  { value: 'story', label: 'Stories', icon: MessageSquare, desc: 'Sequência' },
];

export default function AIStudioPage() {
  const [contentType, setContentType] = useState('post');
  const [topic, setTopic] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [calendarDays, setCalendarDays] = useState(7);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'calendar'>('single');

  const { data: productsData } = useApiData<{ products: Product[] }>('/api/business/products');
  const { data: profileData } = useApiData<{ profile: any }>('/api/business/profile');

  const generatePostMutation = useApiMutation('/api/ai/auto-post', 'POST');
  const generateCalendarMutation = useApiMutation('/api/ai/content-plan', 'POST');

  const products = productsData?.products || [];
  const hasProfile = profileData?.profile?.onboarding_completed;

  const handleGeneratePost = async () => {
    try {
      const result = await generatePostMutation.mutate({
        productId: selectedProductId || undefined,
        topic: topic || undefined,
        contentType,
        platform: 'instagram',
      });
      if (result) {
        setGeneratedPost((result as any).post);
      }
    } catch { /* error in mutation */ }
  };

  const handleGenerateCalendar = async () => {
    try {
      const result = await generateCalendarMutation.mutate({
        days: calendarDays,
        regenerate: false,
      });
      if (result) {
        alert(`✅ ${(result as any).postsCreated || 0} posts foram criados no seu calendário!`);
      }
    } catch { /* error in mutation */ }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6" /> AI Studio
          </h1>
          <p className="text-gray-400 mt-1">
            Crie conteúdo profissional com inteligência artificial
          </p>
        </div>
      </div>

      {!hasProfile && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-yellow-200 font-medium">Complete seu perfil</p>
            <p className="text-xs text-yellow-400/70">
              Para melhores resultados, <a href="/onboarding" className="underline hover:text-yellow-300">configure seu negócio</a> primeiro.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('single')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
            activeTab === 'single' ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
          )}
        >
          <Wand2 className="w-4 h-4 inline mr-2" />
          Post Único
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
            activeTab === 'calendar' ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
          )}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Calendário IA
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Configuration */}
        <div className="space-y-6">
          {activeTab === 'single' ? (
            <>
              {/* Content Type */}
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Tipo de conteúdo</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CONTENT_TYPES.map((ct) => (
                    <button
                      key={ct.value}
                      onClick={() => setContentType(ct.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
                        contentType === ct.value
                          ? 'bg-white text-black border-white'
                          : 'bg-[#0a0a0a] text-gray-400 border-[#1a1a1a] hover:border-white/30'
                      )}
                    >
                      <ct.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{ct.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Product or Topic */}
              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white">Sobre o quê?</h3>

                {products.length > 0 && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Selecione um produto</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
                    >
                      <option value="">Nenhum produto (tema livre)</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} {p.category ? `(${p.category})` : ''}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    {selectedProductId ? 'Instruções adicionais (opcional)' : 'Tema ou tópico *'}
                  </label>
                  <Textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={selectedProductId
                      ? 'Ex: Foque nas características premium, use tom divertido...'
                      : 'Ex: Dicas de skincare para verão, Promoção de inauguração...'
                    }
                    rows={3}
                  />
                </div>

                <Button
                  className="w-full"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  onClick={handleGeneratePost}
                  isLoading={generatePostMutation.loading}
                  disabled={!selectedProductId && !topic.trim()}
                >
                  Gerar Conteúdo com IA
                </Button>

                {generatePostMutation.error && (
                  <p className="text-red-400 text-xs">{generatePostMutation.error}</p>
                )}
              </Card>
            </>
          ) : (
            /* Calendar Generator */
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white">Gerar calendário de conteúdo</h3>
              <p className="text-xs text-gray-500">
                A IA vai criar um plano completo de posts baseado no seu negócio, produtos e estratégia
              </p>

              <div>
                <label className="block text-xs text-gray-500 mb-2">Período</label>
                <div className="flex gap-2">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setCalendarDays(d)}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                        calendarDays === d ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                      )}
                    >
                      {d} dias
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0a0a0a] rounded-xl p-4 text-sm text-gray-400 space-y-2">
                <p className="text-white font-medium">O calendário incluirá:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Posts de produtos ({products.length} cadastrados)</li>
                  <li>• Dicas e conteúdo educativo do seu nicho</li>
                  <li>• Posts de engajamento (enquetes, perguntas)</li>
                  <li>• Conteúdo promocional e ofertas</li>
                  <li>• Melhores horários para postar</li>
                  <li>• Hashtags otimizadas</li>
                </ul>
              </div>

              <Button
                className="w-full"
                leftIcon={<Calendar className="w-4 h-4" />}
                onClick={handleGenerateCalendar}
                isLoading={generateCalendarMutation.loading}
              >
                Gerar Calendário ({calendarDays} dias)
              </Button>

              {generateCalendarMutation.error && (
                <p className="text-red-400 text-xs">{generateCalendarMutation.error}</p>
              )}
            </Card>
          )}
        </div>

        {/* Right: Preview / Result */}
        <div>
          {generatePostMutation.loading ? (
            <Card className="p-12 text-center">
              <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Gerando conteúdo incrível...</p>
              <p className="text-xs text-gray-600 mt-1">Isso pode levar alguns segundos</p>
            </Card>
          ) : generatedPost ? (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{generatedPost.title}</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<RefreshCw className="w-3 h-3" />}
                    onClick={handleGeneratePost}
                  >
                    Refazer
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    onClick={() => copyToClipboard(generatedPost.content)}
                  >
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Legenda</label>
                <div className="bg-[#0a0a0a] rounded-xl p-4 text-sm text-gray-300 whitespace-pre-wrap">
                  {generatedPost.content}
                </div>
              </div>

              {/* Hashtags */}
              {generatedPost.hashtags?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-500">Hashtags</label>
                    <button
                      onClick={() => copyToClipboard(generatedPost.hashtags.join(' '))}
                      className="text-xs text-gray-500 hover:text-white"
                    >
                      Copiar todas
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedPost.hashtags.map((h, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-white/5 text-blue-400 rounded-lg">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Carousel Slides */}
              {generatedPost.slides && generatedPost.slides.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Slides do Carousel</label>
                  <div className="space-y-2">
                    {generatedPost.slides.map((slide, i) => (
                      <div key={i} className="bg-[#0a0a0a] rounded-lg p-3 border border-[#1a1a1a]">
                        <p className="text-xs text-gray-500 mb-1">Slide {i + 1}</p>
                        <p className="text-sm font-semibold text-white mb-1">{slide.title}</p>
                        <p className="text-xs text-gray-400">{slide.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reel Script */}
              {generatedPost.script_timestamps && generatedPost.script_timestamps.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Roteiro do Reels</label>
                  <div className="space-y-2">
                    {generatedPost.script_timestamps.map((ts, i) => (
                      <div key={i} className="flex gap-3 bg-[#0a0a0a] rounded-lg p-3">
                        <span className="text-xs font-mono text-white bg-white/10 px-2 py-0.5 rounded self-start">{ts.time}</span>
                        <p className="text-sm text-gray-300">{ts.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stories */}
              {generatedPost.stories && generatedPost.stories.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Sequência de Stories</label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {generatedPost.stories.map((story, i) => (
                      <div key={i} className="flex-shrink-0 w-40 bg-[#0a0a0a] rounded-xl p-3 border border-[#1a1a1a]">
                        <p className="text-xs text-gray-500 mb-1">Story {i + 1}</p>
                        <p className="text-xs text-white mb-2">{story.text}</p>
                        {story.cta && <p className="text-[10px] text-blue-400">CTA: {story.cta}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Prompt */}
              {generatedPost.media_prompt && (
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Sugestão de imagem</label>
                  <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[#1a1a1a]">
                    <p className="text-xs text-gray-400 italic">{generatedPost.media_prompt}</p>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <p className="text-xs text-emerald-400 font-medium mb-1">💡 Dica de engajamento</p>
                <p className="text-xs text-emerald-300/70">{generatedPost.engagement_tip}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Melhor horário: {generatedPost.best_time}</span>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Sparkles className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI Studio</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Selecione um produto ou descreva um tema, e a IA vai criar um post profissional completo para você
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
