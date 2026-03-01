'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  Image as ImageIcon,
  Video,
  Calendar,
  Loader2,
  Check,
  Copy,
  Plus,
  Clock,
  Wand2,
  ArrowRight,
  Edit3,
  Megaphone,
  Download,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { Button, Card, Badge, Textarea } from '@/lib/ui';

type Tab = 'pipeline' | 'autopilot' | 'image' | 'video' | 'campaign' | 'scheduler';

interface GeneratedPost {
  id?: string;
  content: string;
  platform: string;
  hashtags: string[];
  imageUrl?: string | null;
  scheduledAt?: string | null;
  hook?: string;
  cta?: string;
  mood?: string;
  provider?: string;
}

interface AutopilotConfig {
  enabled: boolean;
  platforms: string[];
  frequency: Record<string, number>;
  contentPillars: string[];
  tone: string;
  autoApprove: boolean;
  autoPost: boolean;
  description: string;
  imageGeneration: boolean;
  provider: string;
}

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: 'text-pink-400' },
  { id: 'facebook', name: 'Facebook', color: 'text-blue-400' },
  { id: 'linkedin', name: 'LinkedIn', color: 'text-blue-300' },
  { id: 'twitter', name: 'Twitter/X', color: 'text-gray-300' },
  { id: 'tiktok', name: 'TikTok', color: 'text-cyan-400' },
  { id: 'youtube', name: 'YouTube', color: 'text-red-400' },
];

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pipeline');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pipeline state
  const [pipelinePrompt, setPipelinePrompt] = useState('');
  const [pipelinePlatforms, setPipelinePlatforms] = useState<string[]>(['instagram']);
  const [pipelineCount, setPipelineCount] = useState(1);
  const [pipelineAutoSchedule, setPipelineAutoSchedule] = useState(false);
  const [pipelineImages, setPipelineImages] = useState(true);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);

  // Autopilot state
  const [autopilotConfig, setAutopilotConfig] = useState<AutopilotConfig>({
    enabled: false,
    platforms: ['instagram'],
    frequency: { instagram: 3 },
    contentPillars: [],
    tone: 'profissional',
    autoApprove: false,
    autoPost: false,
    description: '',
    imageGeneration: true,
    provider: 'auto',
  });
  const [autopilotStats, setAutopilotStats] = useState({ totalGenerated: 0, published: 0, scheduled: 0, drafts: 0 });
  const [newPillar, setNewPillar] = useState('');

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState<'vivid' | 'natural'>('vivid');
  const [imageSize, setImageSize] = useState<'1024x1024' | '1792x1024' | '1024x1792'>('1024x1024');
  const [generatedImages, setGeneratedImages] = useState<{ url: string; revisedPrompt?: string }[]>([]);

  // Video generation state
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspect, setVideoAspect] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [videoDuration, setVideoDuration] = useState(8);
  const [videoResult, setVideoResult] = useState<{ status: string; videoUrl?: string; operationId?: string } | null>(null);

  // Campaign state
  const [campaignGoal, setCampaignGoal] = useState('');
  const [campaignPlatforms, setCampaignPlatforms] = useState<string[]>(['instagram', 'facebook']);
  const [campaignDuration, setCampaignDuration] = useState(7);
  const [campaignResult, setCampaignResult] = useState<any>(null);

  // Scheduler state
  const [schedulerThemes, setSchedulerThemes] = useState<string[]>([]);
  const [schedulerPlatforms, setSchedulerPlatforms] = useState<string[]>(['instagram']);
  const [schedulerFrequency, setSchedulerFrequency] = useState(3);
  const [schedulerResult, setSchedulerResult] = useState<any>(null);
  const [newTheme, setNewTheme] = useState('');

  // Load autopilot config
  useEffect(() => {
    fetch('/api/ai/autopilot')
      .then(r => r.json())
      .then(data => {
        if (data.config) {
          const c = Array.isArray(data.config) ? data.config[0] : data.config;
          if (c) {
            setAutopilotConfig({
              enabled: c.enabled || false,
              platforms: c.platforms || ['instagram'],
              frequency: c.frequency || { instagram: 3 },
              contentPillars: c.content_pillars || [],
              tone: c.tone || 'profissional',
              autoApprove: c.auto_approve || false,
              autoPost: c.auto_post || false,
              description: c.description || '',
              imageGeneration: c.image_generation !== false,
              provider: c.provider || 'auto',
            });
          }
        }
        if (data.stats) setAutopilotStats(data.stats);
      })
      .catch(() => {});
  }, []);

  const clearMessages = () => { setError(''); setSuccess(''); };

  // === Pipeline ===
  const handlePipelineGenerate = async () => {
    if (!pipelinePrompt.trim()) return;
    clearMessages();
    setLoading(true);
    setGeneratedPosts([]);
    try {
      const res = await fetch('/api/ai/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: pipelinePrompt,
          platforms: pipelinePlatforms,
          count: pipelineCount,
          autoSchedule: pipelineAutoSchedule,
          generateImages: pipelineImages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar conteúdo');
      setGeneratedPosts(data.posts || []);
      setSuccess(`${data.totalGenerated} post(s) gerado(s) com sucesso!`);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  // === Autopilot ===
  const handleSaveAutopilot = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/ai/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(autopilotConfig),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar');
      setSuccess('Autopilot configurado com sucesso!');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  // === Image ===
  const handleImageGenerate = async () => {
    if (!imagePrompt.trim()) return;
    clearMessages();
    setLoading(true);
    setGeneratedImages([]);
    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, style: imageStyle, size: imageSize }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar imagem');
      setGeneratedImages(data.images || []);
      setSuccess('Imagem gerada com sucesso!');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  // === Video ===
  const handleVideoGenerate = async () => {
    if (!videoPrompt.trim()) return;
    clearMessages();
    setLoading(true);
    setVideoResult(null);
    try {
      const res = await fetch('/api/ai/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: videoPrompt, aspectRatio: videoAspect, duration: videoDuration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar vídeo');
      setVideoResult({ status: data.status, videoUrl: data.videoUrl, operationId: data.operationId });
      setSuccess(data.status === 'processing' ? 'Vídeo sendo gerado...' : 'Vídeo gerado!');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  // === Campaign ===
  const handleCampaignGenerate = async () => {
    if (!campaignGoal.trim()) return;
    clearMessages();
    setLoading(true);
    setCampaignResult(null);
    try {
      const res = await fetch('/api/ai/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: campaignGoal, platforms: campaignPlatforms, duration: campaignDuration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar campanha');
      setCampaignResult(data);
      setSuccess(`Campanha "${data.campaign?.name}" criada com ${data.totalPosts} posts!`);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  // === Scheduler ===
  const handleSchedulerGenerate = async () => {
    clearMessages();
    setLoading(true);
    setSchedulerResult(null);
    try {
      const res = await fetch('/api/ai/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms: schedulerPlatforms, postsPerWeek: schedulerFrequency, themes: schedulerThemes.length ? schedulerThemes : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar calendário');
      setSchedulerResult(data);
      setSuccess(`${data.totalGenerated} posts agendados!`);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const tabs = [
    { id: 'pipeline' as Tab, name: 'Pipeline IA', icon: Wand2 },
    { id: 'autopilot' as Tab, name: 'Autopilot', icon: Bot },
    { id: 'image' as Tab, name: 'Imagens', icon: ImageIcon },
    { id: 'video' as Tab, name: 'Vídeos', icon: Video },
    { id: 'campaign' as Tab, name: 'Campanhas', icon: Megaphone },
    { id: 'scheduler' as Tab, name: 'Smart Calendar', icon: Calendar },
  ];

  const togglePlatform = (list: string[], setter: (v: string[]) => void, platform: string) => {
    setter(list.includes(platform) ? list.filter(p => p !== platform) : [...list, platform]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-violet-400" />
            Central de IA
          </h1>
          <p className="text-gray-400 mt-1">Crie conteúdo, imagens, vídeos e campanhas com inteligência artificial</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
          autopilotConfig.enabled ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-[#1a1a1a] text-gray-500 border border-[#2a2a2a]'
        }`}>
          <div className={`w-2 h-2 rounded-full ${autopilotConfig.enabled ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          Autopilot {autopilotConfig.enabled ? 'Ativo' : 'Inativo'}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Gerados pela IA', value: autopilotStats.totalGenerated, icon: Sparkles, color: 'violet' },
          { label: 'Publicados', value: autopilotStats.published, icon: CheckCircle, color: 'green' },
          { label: 'Agendados', value: autopilotStats.scheduled, icon: Clock, color: 'blue' },
          { label: 'Rascunhos', value: autopilotStats.drafts, icon: Edit3, color: 'yellow' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#0a0a0a] border-[#1a1a1a] p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${stat.color}-900/30`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4 text-red-400" /></button>
        </div>
      )}
      {success && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4 text-green-400" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); clearMessages(); }}
            className={`p-3 rounded-xl border transition-all text-center ${
              activeTab === tab.id
                ? 'bg-violet-900/30 border-violet-700 text-violet-300'
                : 'bg-[#0a0a0a] border-[#1a1a1a] text-gray-400 hover:border-[#2a2a2a] hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs font-medium">{tab.name}</p>
          </button>
        ))}
      </div>

      {/* === PIPELINE === */}
      {activeTab === 'pipeline' && (
        <Card className="bg-[#0a0a0a] border-[#1a1a1a] p-6">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-violet-400" /> Pipeline de Conteúdo IA
          </h2>
          <p className="text-gray-500 text-sm mb-6">Descreva o que precisa e a IA gera texto + imagem + hashtags + agendamento</p>
          <div className="space-y-4">
            <Textarea value={pipelinePrompt} onChange={(e: any) => setPipelinePrompt(e.target.value)}
              placeholder="Ex: Post sobre as tendências de marketing digital para 2025, focando em IA e automação..."
              className="bg-[#111] border-[#2a2a2a] text-white min-h-[100px]" />
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Plataformas</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button key={p.id} onClick={() => togglePlatform(pipelinePlatforms, setPipelinePlatforms, p.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${pipelinePlatforms.includes(p.id) ? 'bg-violet-900/30 border-violet-700 text-violet-300' : 'bg-[#111] border-[#2a2a2a] text-gray-500 hover:text-gray-300'}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Variações</label>
                <select value={pipelineCount} onChange={(e) => setPipelineCount(Number(e.target.value))}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm">
                  {[1, 2, 3, 5, 10].map((n) => <option key={n} value={n}>{n} post{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={pipelineImages} onChange={(e) => setPipelineImages(e.target.checked)} className="rounded" />
                  Gerar imagens
                </label>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={pipelineAutoSchedule} onChange={(e) => setPipelineAutoSchedule(e.target.checked)} className="rounded" />
                  Auto-agendar
                </label>
              </div>
            </div>
            <Button onClick={handlePipelineGenerate} disabled={loading || !pipelinePrompt.trim()} className="bg-violet-600 hover:bg-violet-700 text-white w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
              Gerar Conteúdo Completo
            </Button>
          </div>
          {generatedPosts.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Posts Gerados ({generatedPosts.length})</h3>
              {generatedPosts.map((post, idx) => (
                <div key={idx} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-violet-900/30 text-violet-300 border-violet-700">{post.platform}</Badge>
                    <div className="flex items-center gap-2">
                      {post.mood && <span className="text-xs text-gray-500">{post.mood}</span>}
                      {post.scheduledAt && <span className="text-xs text-blue-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(post.scheduledAt).toLocaleString('pt-BR')}</span>}
                    </div>
                  </div>
                  {post.hook && <p className="text-xs text-yellow-400 italic">Hook: {post.hook}</p>}
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{post.content}</p>
                  {post.imageUrl && <img src={post.imageUrl} alt="Generated" className="w-full max-w-sm rounded-lg border border-[#2a2a2a]" />}
                  {post.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.hashtags.map((h: string, i: number) => <span key={i} className="text-xs text-violet-400">#{h.replace('#', '')}</span>)}
                    </div>
                  )}
                  {post.cta && <p className="text-xs text-green-400">CTA: {post.cta}</p>}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#2a2a2a]">
                    <button onClick={() => navigator.clipboard.writeText(post.content)} className="text-xs text-gray-500 hover:text-white flex items-center gap-1"><Copy className="w-3 h-3" /> Copiar</button>
                    <Link href="/dashboard/scheduler" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"><Calendar className="w-3 h-3" /> Ver no calendário</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* === AUTOPILOT === */}
      {activeTab === 'autopilot' && (
        <Card className="bg-[#0a0a0a] border-[#1a1a1a] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Bot className="w-5 h-5 text-green-400" /> Autopilot</h2>
              <p className="text-gray-500 text-sm">A IA gera e agenda posts automaticamente com base na sua marca</p>
            </div>
            <button onClick={() => setAutopilotConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${autopilotConfig.enabled ? 'bg-green-600' : 'bg-[#2a2a2a]'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${autopilotConfig.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Descrição do conteúdo desejado</label>
              <Textarea value={autopilotConfig.description} onChange={(e: any) => setAutopilotConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ex: Posts sobre marketing digital, empreendedorismo e produtividade..."
                className="bg-[#111] border-[#2a2a2a] text-white min-h-[80px]" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Plataformas</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button key={p.id} onClick={() => togglePlatform(autopilotConfig.platforms, (v) => setAutopilotConfig(prev => ({ ...prev, platforms: v })), p.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${autopilotConfig.platforms.includes(p.id) ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-[#111] border-[#2a2a2a] text-gray-500 hover:text-gray-300'}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Posts por semana</label>
                <select value={autopilotConfig.frequency[autopilotConfig.platforms[0]] || 3}
                  onChange={(e) => { const freq: Record<string, number> = {}; autopilotConfig.platforms.forEach(p => { freq[p] = Number(e.target.value); }); setAutopilotConfig(prev => ({ ...prev, frequency: freq })); }}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm">
                  {[1, 2, 3, 5, 7].map((n) => <option key={n} value={n}>{n}x por semana por plataforma</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Tom de voz</label>
                <select value={autopilotConfig.tone} onChange={(e) => setAutopilotConfig(prev => ({ ...prev, tone: e.target.value }))}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm">
                  <option value="profissional">Profissional</option>
                  <option value="casual">Casual</option>
                  <option value="inspirador">Inspirador</option>
                  <option value="educativo">Educativo</option>
                  <option value="divertido">Divertido</option>
                  <option value="vendas">Focado em Vendas</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Pilares de conteúdo</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {autopilotConfig.contentPillars.map((pillar, idx) => (
                  <span key={idx} className="px-2 py-1 bg-[#111] border border-[#2a2a2a] rounded-lg text-sm text-gray-300 flex items-center gap-1">
                    {pillar}
                    <button onClick={() => setAutopilotConfig(prev => ({ ...prev, contentPillars: prev.contentPillars.filter((_, i) => i !== idx) }))}>
                      <X className="w-3 h-3 text-gray-500 hover:text-red-400" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newPillar} onChange={(e) => setNewPillar(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && newPillar.trim()) { setAutopilotConfig(prev => ({ ...prev, contentPillars: [...prev.contentPillars, newPillar.trim()] })); setNewPillar(''); } }}
                  placeholder="Adicionar pilar..." className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm" />
                <Button onClick={() => { if (newPillar.trim()) { setAutopilotConfig(prev => ({ ...prev, contentPillars: [...prev.contentPillars, newPillar.trim()] })); setNewPillar(''); } }}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Provedor de IA</label>
              <select value={autopilotConfig.provider} onChange={(e) => setAutopilotConfig(prev => ({ ...prev, provider: e.target.value }))}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm">
                <option value="auto">Auto (melhor disponível)</option>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input type="checkbox" checked={autopilotConfig.imageGeneration} onChange={(e) => setAutopilotConfig(prev => ({ ...prev, imageGeneration: e.target.checked }))} className="rounded" />
                Gerar imagens
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input type="checkbox" checked={autopilotConfig.autoApprove} onChange={(e) => setAutopilotConfig(prev => ({ ...prev, autoApprove: e.target.checked }))} className="rounded" />
                Aprovar automaticamente
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input type="checkbox" checked={autopilotConfig.autoPost} onChange={(e) => setAutopilotConfig(prev => ({ ...prev, autoPost: e.target.checked }))} className="rounded" />
                Publicar automaticamente
              </label>
            </div>
            <Button onClick={handleSaveAutopilot} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Salvar Configuração do Autopilot
            </Button>
          </div>
        </Card>
      )}

      {/* === IMAGE === */}
      {activeTab === 'image' && (
        <Card className="bg-[#0a0a0a] border-[#1a1a1a] p-6">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-pink-400" /> Gerador de Imagens IA</h2>
          <p className="text-gray-500 text-sm mb-6">DALL-E 3 + Gemini Imagen — gere imagens profissionais</p>
          <div className="space-y-4">
            <Textarea value={imagePrompt} onChange={(e: any) => setImagePrompt(e.target.value)}
              placeholder="Descreva a imagem... Ex: Pessoa trabalhando em laptop, escritório moderno, iluminação suave"
              className="bg-[#111] border-[#2a2a2a] text-white min-h-[80px]" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Estilo</label>
                <select value={imageStyle} onChange={(e) => setImageStyle(e.target.value as any)}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm">
                  <option value="vivid">Vibrante</option>
                  <option value="natural">Natural</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Tamanho</label>
                <select value={imageSize} onChange={(e) => setImageSize(e.target.value as any)}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm">
                  <option value="1024x1024">Quadrado (1:1)</option>
                  <option value="1792x1024">Paisagem (16:9)</option>
                  <option value="1024x1792">Retrato (9:16)</option>
                </select>
              </div>
            </div>
            <Button onClick={handleImageGenerate} disabled={loading || !imagePrompt.trim()} className="bg-pink-600 hover:bg-pink-700 text-white w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
              Gerar Imagem
            </Button>
          </div>
          {generatedImages.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img.url} alt={`Generated ${idx + 1}`} className="w-full rounded-xl border border-[#2a2a2a]" />
                  {img.revisedPrompt && <p className="mt-2 text-xs text-gray-500 italic">{img.revisedPrompt}</p>}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={img.url} download target="_blank" className="p-2 bg-black/80 rounded-lg hover:bg-black"><Download className="w-4 h-4 text-white" /></a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* === VIDEO === */}
      {activeTab === 'video' && (
        <Card className="bg-[#0a0a0a] border-[#1a1a1a] p-6">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><Video className="w-5 h-5 text-cyan-400" /> Gerador de Vídeos IA</h2>
          <p className="text-gray-500 text-sm mb-6">Gemini Veo 2 — gere vídeos curtos para Reels, TikTok e Stories</p>
          <div className="space-y-4">
            <Textarea value={videoPrompt} onChange={(e: any) => setVideoPrompt(e.target.value)}
              placeholder="Descreva o vídeo... Ex: Timelapse de cidade moderna ao anoitecer, estilo cinematográfico"
              className="bg-[#111] border-[#2a2a2a] text-white min-h-[80px]" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Proporção</label>
                <select value={videoAspect} onChange={(e) => setVideoAspect(e.target.value as any)}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm">
                  <option value="9:16">Vertical (9:16) — Reels/TikTok</option>
                  <option value="16:9">Horizontal (16:9) — YouTube</option>
                  <option value="1:1">Quadrado (1:1) — Feed</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Duração</label>
                <select value={videoDuration} onChange={(e) => setVideoDuration(Number(e.target.value))}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm">
                  <option value={5}>5 segundos</option>
                  <option value={8}>8 segundos</option>
                  <option value={10}>10 segundos</option>
                </select>
              </div>
            </div>
            <Button onClick={handleVideoGenerate} disabled={loading || !videoPrompt.trim()} className="bg-cyan-600 hover:bg-cyan-700 text-white w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Video className="w-4 h-4 mr-2" />}
              Gerar Vídeo
            </Button>
          </div>
          {videoResult && (
            <div className="mt-6 bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
              {videoResult.status === 'processing' ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  <div><p className="text-white font-medium">Gerando vídeo...</p><p className="text-xs text-gray-500">Pode levar alguns minutos</p></div>
                </div>
              ) : videoResult.videoUrl ? (
                <video src={videoResult.videoUrl} controls className="w-full max-w-md rounded-lg" />
              ) : <p className="text-red-400">Falha ao gerar vídeo</p>}
            </div>
          )}
        </Card>
      )}

      {/* === CAMPAIGN === */}
      {activeTab === 'campaign' && (
        <Card className="bg-[#0a0a0a] border-[#1a1a1a] p-6">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><Megaphone className="w-5 h-5 text-orange-400" /> Planejador de Campanhas IA</h2>
          <p className="text-gray-500 text-sm mb-6">Descreva o objetivo e a IA cria toda a campanha com posts, estratégia e cronograma</p>
          <div className="space-y-4">
            <Textarea value={campaignGoal} onChange={(e: any) => setCampaignGoal(e.target.value)}
              placeholder="Ex: Lançamento do novo produto X, aumentar awareness e gerar leads..."
              className="bg-[#111] border-[#2a2a2a] text-white min-h-[80px]" />
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Plataformas</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button key={p.id} onClick={() => togglePlatform(campaignPlatforms, setCampaignPlatforms, p.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${campaignPlatforms.includes(p.id) ? 'bg-orange-900/30 border-orange-700 text-orange-300' : 'bg-[#111] border-[#2a2a2a] text-gray-500 hover:text-gray-300'}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Duração</label>
              <select value={campaignDuration} onChange={(e) => setCampaignDuration(Number(e.target.value))}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm">
                <option value={3}>3 dias</option>
                <option value={7}>1 semana</option>
                <option value={14}>2 semanas</option>
                <option value={30}>1 mês</option>
              </select>
            </div>
            <Button onClick={handleCampaignGenerate} disabled={loading || !campaignGoal.trim()} className="bg-orange-600 hover:bg-orange-700 text-white w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Megaphone className="w-4 h-4 mr-2" />}
              Gerar Campanha Completa
            </Button>
          </div>
          {campaignResult && (
            <div className="mt-6 space-y-4">
              <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
                <h3 className="text-lg font-bold text-white">{campaignResult.campaign?.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{campaignResult.campaign?.strategy}</p>
                {campaignResult.campaign?.kpis?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">KPIs:</p>
                    <div className="flex flex-wrap gap-1">
                      {campaignResult.campaign.kpis.map((kpi: string, i: number) => <span key={i} className="px-2 py-0.5 bg-[#1a1a1a] rounded text-xs text-gray-400">{kpi}</span>)}
                    </div>
                  </div>
                )}
                {campaignResult.campaign?.phases?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500">Fases:</p>
                    {campaignResult.campaign.phases.map((phase: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-violet-900/50 flex items-center justify-center text-xs text-violet-400 font-bold">{i + 1}</div>
                        <div><p className="text-sm text-white">{phase.name}</p><p className="text-xs text-gray-500">{phase.description}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <h3 className="text-white font-semibold">{campaignResult.totalPosts} Posts Criados</h3>
              {campaignResult.posts?.map((post: any, idx: number) => (
                <div key={idx} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-900/30 text-orange-300 border-orange-700">Dia {post.day} — {post.platform}</Badge>
                    <span className="text-xs text-gray-500">{post.type} • {post.phase}</span>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* === SMART SCHEDULER === */}
      {activeTab === 'scheduler' && (
        <Card className="bg-[#0a0a0a] border-[#1a1a1a] p-6">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-400" /> Agendador Inteligente</h2>
          <p className="text-gray-500 text-sm mb-6">A IA planeja e preenche seu calendário automaticamente</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Plataformas</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button key={p.id} onClick={() => togglePlatform(schedulerPlatforms, setSchedulerPlatforms, p.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${schedulerPlatforms.includes(p.id) ? 'bg-blue-900/30 border-blue-700 text-blue-300' : 'bg-[#111] border-[#2a2a2a] text-gray-500 hover:text-gray-300'}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Frequência</label>
              <select value={schedulerFrequency} onChange={(e) => setSchedulerFrequency(Number(e.target.value))}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm">
                {[1, 2, 3, 5, 7].map((n) => <option key={n} value={n}>{n}x por semana</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Temas (opcional)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {schedulerThemes.map((theme, idx) => (
                  <span key={idx} className="px-2 py-1 bg-[#111] border border-[#2a2a2a] rounded-lg text-sm text-gray-300 flex items-center gap-1">
                    {theme}
                    <button onClick={() => setSchedulerThemes(prev => prev.filter((_, i) => i !== idx))}><X className="w-3 h-3 text-gray-500 hover:text-red-400" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newTheme} onChange={(e) => setNewTheme(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && newTheme.trim()) { setSchedulerThemes(prev => [...prev, newTheme.trim()]); setNewTheme(''); } }}
                  placeholder="Adicionar tema..." className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm" />
                <Button onClick={() => { if (newTheme.trim()) { setSchedulerThemes(prev => [...prev, newTheme.trim()]); setNewTheme(''); } }}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
            <Button onClick={handleSchedulerGenerate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
              Preencher Calendário com IA
            </Button>
          </div>
          {schedulerResult && (
            <div className="mt-6 space-y-3">
              <h3 className="text-white font-semibold">{schedulerResult.totalGenerated} posts agendados</h3>
              {schedulerResult.posts?.map((post: any, idx: number) => (
                <div key={idx} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3 flex items-start gap-3">
                  <div className="text-center min-w-[50px]">
                    <p className="text-xs text-gray-500">{post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : ''}</p>
                    <p className="text-xs text-blue-400">{post.scheduledAt ? new Date(post.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-blue-900/30 text-blue-300 border-blue-700 text-xs">{post.platform}</Badge>
                      {post.theme && <span className="text-xs text-gray-500">{post.theme}</span>}
                    </div>
                    <p className="text-gray-300 text-sm truncate">{post.content}</p>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/calendar" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                <Calendar className="w-4 h-4" /> Ver calendário completo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
