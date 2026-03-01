'use client';

import { useState, useEffect } from 'react';
import {
  Zap, Clock, Calendar, Instagram, Facebook, Linkedin,
  Music, Save, Sparkles, TrendingUp, Shield, AlertCircle,
  CheckCircle, Settings, BarChart3, RefreshCw,
} from 'lucide-react';
import { Button, Card, Input } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useApiData, useApiMutation } from '@/hooks/useApiData';

const DAYS = [
  { value: 'mon', label: 'Seg' },
  { value: 'tue', label: 'Ter' },
  { value: 'wed', label: 'Qua' },
  { value: 'thu', label: 'Qui' },
  { value: 'fri', label: 'Sex' },
  { value: 'sat', label: 'Sáb' },
  { value: 'sun', label: 'Dom' },
];

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'tiktok', label: 'TikTok', icon: Music },
];

interface AutopilotSettings {
  is_enabled: boolean;
  posts_per_day: number;
  post_times: string[];
  platforms: string[];
  auto_hashtags: boolean;
  auto_caption: boolean;
  include_products: boolean;
  include_tips: boolean;
  include_promotions: boolean;
  require_approval: boolean;
  auto_approve_after_hours: number | null;
  active_days: string[];
  content_mix: { product: number; tips: number; engagement: number; promotional: number };
  creativity_level: number;
  use_trends: boolean;
}

export default function AutopilotPage() {
  const { data, loading } = useApiData<{ settings: AutopilotSettings }>('/api/business/autopilot');
  const { data: calendarData } = useApiData<{ stats: any }>('/api/business/calendar');
  const { data: profileData } = useApiData<{ profile: any }>('/api/business/profile');
  const saveMutation = useApiMutation('/api/business/autopilot', 'POST');
  const generateMutation = useApiMutation('/api/ai/content-plan', 'POST');

  const [settings, setSettings] = useState<AutopilotSettings>({
    is_enabled: false,
    posts_per_day: 1,
    post_times: ['09:00', '18:00'],
    platforms: ['instagram'],
    auto_hashtags: true,
    auto_caption: true,
    include_products: true,
    include_tips: true,
    include_promotions: true,
    require_approval: true,
    auto_approve_after_hours: null,
    active_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    content_mix: { product: 40, tips: 25, engagement: 20, promotional: 15 },
    creativity_level: 0.7,
    use_trends: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.settings) {
      setSettings(data.settings);
    }
  }, [data]);

  const updateSettings = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const toggleDay = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      active_days: prev.active_days.includes(day)
        ? prev.active_days.filter((d) => d !== day)
        : [...prev.active_days, day],
    }));
    setSaved(false);
  };

  const togglePlatform = (p: string) => {
    setSettings((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }));
    setSaved(false);
  };

  const updateContentMix = (key: string, value: number) => {
    setSettings((prev) => ({
      ...prev,
      content_mix: { ...prev.content_mix, [key]: value },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutate({
        isEnabled: settings.is_enabled,
        postsPerDay: settings.posts_per_day,
        postTimes: settings.post_times,
        platforms: settings.platforms,
        autoHashtags: settings.auto_hashtags,
        autoCaption: settings.auto_caption,
        includeProducts: settings.include_products,
        includeTips: settings.include_tips,
        includePromotions: settings.include_promotions,
        requireApproval: settings.require_approval,
        autoApproveAfterHours: settings.auto_approve_after_hours,
        activeDays: settings.active_days,
        contentMix: settings.content_mix,
        creativityLevel: settings.creativity_level,
        useTrends: settings.use_trends,
      });
      setSaved(true);
    } catch { /* */ }
  };

  const handleGenerateNow = async () => {
    try {
      const result = await generateMutation.mutate({ days: 7, regenerate: false });
      if (result) {
        alert(`✅ ${(result as any).postsCreated || 0} posts foram criados!`);
      }
    } catch { /* */ }
  };

  const calendarStats = calendarData?.stats || { total: 0, planned: 0, ready: 0, published: 0 };
  const hasProfile = profileData?.profile?.onboarding_completed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6" /> Piloto Automático
          </h1>
          <p className="text-gray-400 mt-1">
            Configure e a IA cria e agenda posts automaticamente
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={handleGenerateNow}
            isLoading={generateMutation.loading}
          >
            Gerar Agora
          </Button>
          <Button
            leftIcon={saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            onClick={handleSave}
            isLoading={saveMutation.loading}
          >
            {saved ? 'Salvo!' : 'Salvar'}
          </Button>
        </div>
      </div>

      {!hasProfile && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-yellow-200 font-medium">Configure seu negócio primeiro</p>
            <p className="text-xs text-yellow-400/70">
              <a href="/onboarding" className="underline hover:text-yellow-300">Complete o onboarding</a> para o piloto automático funcionar corretamente.
            </p>
          </div>
        </div>
      )}

      {/* Main Toggle + Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Status</h3>
            <button
              onClick={() => updateSettings('is_enabled', !settings.is_enabled)}
              className={cn(
                'w-14 h-7 rounded-full transition-all duration-300 relative',
                settings.is_enabled ? 'bg-emerald-500' : 'bg-[#333]'
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-sm',
                settings.is_enabled ? 'left-7' : 'left-0.5'
              )} />
            </button>
          </div>
          <p className={cn('text-sm', settings.is_enabled ? 'text-emerald-400' : 'text-gray-500')}>
            {settings.is_enabled ? '🟢 Piloto automático ativo' : '⚪ Desativado'}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">Conteúdo no calendário</p>
            <Calendar className="w-4 h-4 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-white">{calendarStats.total}</p>
          <div className="flex gap-3 mt-2 text-xs text-gray-500">
            <span>{calendarStats.planned} planejados</span>
            <span>{calendarStats.ready} prontos</span>
            <span>{calendarStats.published} publicados</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">Próxima geração</p>
            <Clock className="w-4 h-4 text-gray-600" />
          </div>
          <p className="text-lg font-bold text-white">
            {settings.is_enabled ? 'Diariamente' : 'Desativado'}
          </p>
          <p className="text-xs text-gray-500 mt-1">{settings.posts_per_day} post(s)/dia</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Schedule */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4" /> Agenda
            </h3>

            <div>
              <label className="block text-xs text-gray-500 mb-2">Posts por dia</label>
              <div className="flex gap-2">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateSettings('posts_per_day', n)}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                      settings.posts_per_day === n ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                    )}
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">Dias ativos</label>
              <div className="flex gap-1.5">
                {DAYS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => toggleDay(d.value)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
                      settings.active_days.includes(d.value)
                        ? 'bg-white text-black'
                        : 'bg-[#1a1a1a] text-gray-500 hover:text-white'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">Horários de postagem</label>
              <div className="flex gap-2">
                {settings.post_times.map((time, i) => (
                  <Input
                    key={i}
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const newTimes = [...settings.post_times];
                      newTimes[i] = e.target.value;
                      updateSettings('post_times', newTimes);
                    }}
                    className="flex-1"
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Platforms */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-white">Plataformas</h3>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => togglePlatform(p.value)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border transition-all',
                    settings.platforms.includes(p.value)
                      ? 'bg-white text-black border-white'
                      : 'bg-[#0a0a0a] text-gray-400 border-[#1a1a1a] hover:border-white/30'
                  )}
                >
                  <p.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Content Mix */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Mix de conteúdo
            </h3>
            <p className="text-xs text-gray-500">Ajuste a proporção de cada tipo de conteúdo</p>

            {[
              { key: 'product', label: 'Produtos', color: 'bg-blue-500' },
              { key: 'tips', label: 'Dicas/Educação', color: 'bg-emerald-500' },
              { key: 'engagement', label: 'Engajamento', color: 'bg-purple-500' },
              { key: 'promotional', label: 'Promocional', color: 'bg-yellow-500' },
            ].map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-gray-400">{item.label}</label>
                  <span className="text-sm text-white font-medium">
                    {(settings.content_mix as any)[item.key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={(settings.content_mix as any)[item.key]}
                  onChange={(e) => updateContentMix(item.key, parseInt(e.target.value))}
                  className="w-full accent-white h-1.5"
                />
              </div>
            ))}
          </Card>

          {/* AI Settings */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Configurações da IA
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-gray-400">Nível de criatividade</label>
                <span className="text-sm text-white">{Math.round(settings.creativity_level * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={settings.creativity_level * 100}
                onChange={(e) => updateSettings('creativity_level', parseInt(e.target.value) / 100)}
                className="w-full accent-white h-1.5"
              />
              <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                <span>Conservador</span>
                <span>Criativo</span>
              </div>
            </div>

            {[
              { key: 'auto_hashtags', label: 'Hashtags automáticas' },
              { key: 'auto_caption', label: 'Legendas automáticas' },
              { key: 'include_products', label: 'Incluir produtos' },
              { key: 'include_tips', label: 'Incluir dicas' },
              { key: 'include_promotions', label: 'Incluir promoções' },
              { key: 'use_trends', label: 'Usar tendências' },
              { key: 'require_approval', label: 'Exigir aprovação antes de postar' },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between">
                <label className="text-sm text-gray-400">{toggle.label}</label>
                <button
                  onClick={() => updateSettings(toggle.key, !(settings as any)[toggle.key])}
                  className={cn(
                    'w-10 h-5 rounded-full transition-all relative',
                    (settings as any)[toggle.key] ? 'bg-emerald-500' : 'bg-[#333]'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm',
                    (settings as any)[toggle.key] ? 'left-5' : 'left-0.5'
                  )} />
                </button>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
