'use client';

import { useState } from 'react';
import { 
  Music, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Download, 
  Copy, 
  RefreshCw,
  Play,
  Zap,
  Hash,
  MessageSquare,
  Target,
  Video,
  FileText,
  ChevronRight,
  Check,
  Flame,
  Eye,
  Heart
} from 'lucide-react';
import { Button, Card, Input, Badge } from '@/lib/ui';

// Trends simulados (em produção viria de API)
const TRENDING_SOUNDS = [
  { id: 1, name: 'Original Sound - viral.mp3', uses: '2.4M', growth: '+340%' },
  { id: 2, name: 'Aesthetic Vibes', uses: '1.8M', growth: '+220%' },
  { id: 3, name: 'POV Soundtrack', uses: '956K', growth: '+180%' },
  { id: 4, name: 'Tutorial Beat', uses: '1.2M', growth: '+150%' },
];

const TRENDING_HASHTAGS = [
  { tag: '#fyp', posts: '45B' },
  { tag: '#viral', posts: '32B' },
  { tag: '#trending', posts: '18B' },
  { tag: '#foryou', posts: '28B' },
  { tag: '#tiktok', posts: '22B' },
  { tag: '#tutorial', posts: '8.5B' },
  { tag: '#dica', posts: '2.1B' },
  { tag: '#empreendedor', posts: '890M' },
];

const VIDEO_TEMPLATES = [
  { 
    id: 'pov', 
    name: 'POV', 
    description: 'Perspectiva em primeira pessoa',
    structure: ['Hook (0-3s)', 'Setup (3-8s)', 'Twist (8-12s)', 'CTA (12-15s)']
  },
  { 
    id: 'tutorial', 
    name: 'Tutorial Rápido', 
    description: '3-5 passos simples',
    structure: ['Problema (0-3s)', 'Passo 1-3 (3-12s)', 'Resultado (12-15s)']
  },
  { 
    id: 'storytime', 
    name: 'Storytime', 
    description: 'Conte uma história envolvente',
    structure: ['Gancho (0-5s)', 'Contexto (5-20s)', 'Clímax (20-25s)', 'Conclusão (25-30s)']
  },
  { 
    id: 'trend', 
    name: 'Trend Adaptation', 
    description: 'Adapte uma trend ao seu nicho',
    structure: ['Trend Original', 'Sua Versão', 'Twist Único']
  },
];

const BEST_TIMES = [
  { day: 'Segunda', times: ['7h', '12h', '22h'] },
  { day: 'Terça', times: ['9h', '18h', '21h'] },
  { day: 'Quarta', times: ['7h', '11h', '22h'] },
  { day: 'Quinta', times: ['12h', '19h', '21h'] },
  { day: 'Sexta', times: ['17h', '19h', '21h'] },
  { day: 'Sábado', times: ['11h', '19h', '22h'] },
  { day: 'Domingo', times: ['9h', '15h', '19h'] },
];

const HOOK_EXAMPLES = [
  "POV: Você descobriu que...",
  "Ninguém te conta isso, mas...",
  "Pare de fazer isso AGORA!",
  "O segredo que as pessoas não sabem...",
  "3 coisas que eu queria saber antes...",
  "Eu testei por 30 dias e...",
  "Você está fazendo isso errado!",
  "A verdade sobre...",
];

export default function TikTokPage() {
  const [activeTab, setActiveTab] = useState<'generator' | 'trends' | 'templates' | 'scheduler'>('generator');
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState<{
    hook: string;
    script: string;
    caption: string;
    hashtags: string[];
    cta: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generateContent = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tiktok',
          topic,
          template: selectedTemplate,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data);
      } else {
        // Fallback com conteúdo simulado
        setGeneratedContent({
          hook: `POV: Você acabou de descobrir o segredo sobre ${topic}`,
          script: `[0-3s] Hook: Você não vai acreditar nisso...\n[3-8s] Contexto: Eu estava pesquisando sobre ${topic} e descobri algo incrível\n[8-15s] Revelação: A verdade é que a maioria das pessoas não sabe que...\n[15-20s] Prova: Olha só esses resultados\n[20-25s] CTA: Salva esse vídeo e me segue pra mais!`,
          caption: `🔥 O que ninguém te conta sobre ${topic}!\n\nVocê sabia disso? Comenta aqui 👇`,
          hashtags: ['#fyp', '#viral', '#dica', `#${topic.replace(/\s/g, '')}`, '#tutorial', '#foryou', '#trending', '#tiktok'],
          cta: 'Salva esse vídeo e me segue pra mais dicas! 🚀',
        });
      }
    } catch (error) {
      // Fallback
      setGeneratedContent({
        hook: `POV: Você acabou de descobrir o segredo sobre ${topic}`,
        script: `[0-3s] Hook chamativo\n[3-10s] Desenvolva o conteúdo sobre ${topic}\n[10-15s] Entregue valor\n[15-20s] Call to action`,
        caption: `🔥 ${topic} - O que você precisa saber!\n\nComenta aqui 👇`,
        hashtags: ['#fyp', '#viral', '#dica', '#trending', '#foryou'],
        cta: 'Salva e segue pra mais! 🚀',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const tabs = [
    { id: 'generator', label: 'Gerador de Conteúdo', icon: Sparkles },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'scheduler', label: 'Melhores Horários', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ff0050] to-[#00f2ea] rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TikTok Studio</h1>
              <p className="text-gray-400">Crie conteúdo viral para TikTok</p>
            </div>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-[#ff0050] to-[#00f2ea] text-white border-0">
          <Flame className="w-3 h-3 mr-1" />
          Modo Viral
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[#1a1a2e] rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#ff0050] to-[#00f2ea] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <Card className="p-6 bg-[#1a1a2e] border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Gerador de Conteúdo Viral
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Sobre o que é seu vídeo?</label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: como ganhar dinheiro online, dicas de skincare..."
                    className="bg-[#0d0d1a] border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Template (opcional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {VIDEO_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedTemplate === template.id
                            ? 'border-[#ff0050] bg-[#ff0050]/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <p className="font-medium text-white text-sm">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={generateContent}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full bg-gradient-to-r from-[#ff0050] to-[#00f2ea] hover:opacity-90"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Conteúdo Viral
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Hook Examples */}
            <Card className="p-6 bg-[#1a1a2e] border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-400" />
                Hooks que Viralizam
              </h3>
              <div className="space-y-2">
                {HOOK_EXAMPLES.map((hook, index) => (
                  <button
                    key={index}
                    onClick={() => copyToClipboard(hook, `hook-${index}`)}
                    className="w-full p-3 rounded-lg bg-[#0d0d1a] border border-white/5 hover:border-[#ff0050]/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{hook}</span>
                      {copied === `hook-${index}` ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Generated Content */}
          <div className="space-y-4">
            {generatedContent ? (
              <>
                {/* Phone Preview */}
                <Card className="p-6 bg-[#1a1a2e] border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-400" />
                    Preview 9:16
                  </h3>
                  <div className="flex justify-center">
                    <div className="w-[200px] h-[356px] bg-black rounded-3xl border-4 border-gray-700 relative overflow-hidden">
                      {/* TikTok UI mockup */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
                      <div className="absolute bottom-4 left-3 right-12 text-white">
                        <p className="text-xs font-semibold mb-1">@seuusuario</p>
                        <p className="text-[10px] leading-tight line-clamp-3">{generatedContent.caption}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {generatedContent.hashtags.slice(0, 4).map((tag, i) => (
                            <span key={i} className="text-[8px] text-cyan-400">{tag}</span>
                          ))}
                        </div>
                      </div>
                      {/* Side icons */}
                      <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
                        <div className="text-center">
                          <Heart className="w-6 h-6 text-white" />
                          <span className="text-[8px] text-white">42.5K</span>
                        </div>
                        <div className="text-center">
                          <MessageSquare className="w-6 h-6 text-white" />
                          <span className="text-[8px] text-white">892</span>
                        </div>
                      </div>
                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Hook */}
                <Card className="p-4 bg-[#1a1a2e] border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-400">🎯 Hook</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.hook, 'hook')}
                    >
                      {copied === 'hook' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-white">{generatedContent.hook}</p>
                </Card>

                {/* Script */}
                <Card className="p-4 bg-[#1a1a2e] border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-400">📝 Roteiro</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.script, 'script')}
                    >
                      {copied === 'script' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <pre className="text-white text-sm whitespace-pre-wrap font-sans">{generatedContent.script}</pre>
                </Card>

                {/* Caption */}
                <Card className="p-4 bg-[#1a1a2e] border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-400">✍️ Legenda</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.caption, 'caption')}
                    >
                      {copied === 'caption' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-white">{generatedContent.caption}</p>
                </Card>

                {/* Hashtags */}
                <Card className="p-4 bg-[#1a1a2e] border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-400"># Hashtags</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.hashtags.join(' '), 'hashtags')}
                    >
                      {copied === 'hashtags' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.hashtags.map((tag, i) => (
                      <Badge key={i} className="bg-[#00f2ea]/20 text-[#00f2ea] border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* CTA */}
                <Card className="p-4 bg-[#1a1a2e] border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-400">🚀 Call to Action</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.cta, 'cta')}
                    >
                      {copied === 'cta' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-white">{generatedContent.cta}</p>
                </Card>

                {/* Copy All Button */}
                <Button
                  onClick={() => copyToClipboard(
                    `Hook: ${generatedContent.hook}\n\nRoteiro:\n${generatedContent.script}\n\nLegenda: ${generatedContent.caption}\n\nHashtags: ${generatedContent.hashtags.join(' ')}\n\nCTA: ${generatedContent.cta}`,
                    'all'
                  )}
                  variant="secondary"
                  className="w-full"
                >
                  {copied === 'all' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copiar Tudo
                </Button>
              </>
            ) : (
              <Card className="p-12 bg-[#1a1a2e] border-white/10 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ff0050]/20 to-[#00f2ea]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#ff0050]" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Pronto para viralizar?</h3>
                <p className="text-gray-400 text-sm">
                  Digite o tema do seu vídeo e gere conteúdo otimizado para TikTok
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trending Sounds */}
          <Card className="p-6 bg-[#1a1a2e] border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-[#ff0050]" />
              Sons em Alta
            </h3>
            <div className="space-y-3">
              {TRENDING_SOUNDS.map((sound) => (
                <div
                  key={sound.id}
                  className="p-4 rounded-lg bg-[#0d0d1a] border border-white/5 hover:border-[#ff0050]/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#ff0050] to-[#00f2ea] rounded-lg flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{sound.name}</p>
                        <p className="text-gray-500 text-xs">{sound.uses} vídeos</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-0">
                      {sound.growth}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Trending Hashtags */}
          <Card className="p-6 bg-[#1a1a2e] border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-[#00f2ea]" />
              Hashtags em Alta
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {TRENDING_HASHTAGS.map((item, index) => (
                <button
                  key={index}
                  onClick={() => copyToClipboard(item.tag, `trend-${index}`)}
                  className="p-4 rounded-lg bg-[#0d0d1a] border border-white/5 hover:border-[#00f2ea]/50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#00f2ea] font-medium">{item.tag}</p>
                      <p className="text-gray-500 text-xs">{item.posts} posts</p>
                    </div>
                    {copied === `trend-${index}` ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <Button
              onClick={() => copyToClipboard(TRENDING_HASHTAGS.map(h => h.tag).join(' '), 'all-trends')}
              variant="secondary"
              className="w-full mt-4"
            >
              {copied === 'all-trends' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Copiar Todas as Hashtags
            </Button>
          </Card>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VIDEO_TEMPLATES.map((template) => (
            <Card key={template.id} className="p-6 bg-[#1a1a2e] border-white/10 hover:border-[#ff0050]/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                  <p className="text-gray-400 text-sm">{template.description}</p>
                </div>
                <Badge className="bg-[#ff0050]/20 text-[#ff0050] border-0">
                  Popular
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Estrutura:</p>
                {template.structure.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#ff0050] to-[#00f2ea] flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-300 text-sm">{step}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setActiveTab('generator');
                }}
                className="w-full mt-4 bg-gradient-to-r from-[#ff0050] to-[#00f2ea] hover:opacity-90"
              >
                Usar Template
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'scheduler' && (
        <div className="space-y-6">
          <Card className="p-6 bg-[#1a1a2e] border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Melhores Horários para Postar
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Baseado em análises de engajamento no Brasil 🇧🇷
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {BEST_TIMES.map((day) => (
                <div key={day.day} className="p-4 rounded-lg bg-[#0d0d1a] border border-white/5">
                  <p className="text-white font-medium mb-3">{day.day}</p>
                  <div className="flex flex-wrap gap-2">
                    {day.times.map((time, index) => (
                      <Badge 
                        key={index}
                        className={`border-0 ${
                          index === 0 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-[#ff0050]/20 text-[#ff0050]'
                        }`}
                      >
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-[#1a1a2e] border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Dicas para Viralizar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#0d0d1a] border border-white/5">
                <p className="text-[#ff0050] font-medium mb-2">🎯 Primeiros 3 segundos</p>
                <p className="text-gray-400 text-sm">O hook precisa prender a atenção imediatamente</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0d0d1a] border border-white/5">
                <p className="text-[#00f2ea] font-medium mb-2">⏱️ Duração ideal</p>
                <p className="text-gray-400 text-sm">15-30 segundos para maior retenção</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0d0d1a] border border-white/5">
                <p className="text-yellow-400 font-medium mb-2">🔄 Consistência</p>
                <p className="text-gray-400 text-sm">Poste 1-3x por dia nos melhores horários</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0d0d1a] border border-white/5">
                <p className="text-green-400 font-medium mb-2">💬 Engajamento</p>
                <p className="text-gray-400 text-sm">Responda comentários na primeira hora</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
