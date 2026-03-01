'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles, ArrowRight, ArrowLeft, Check, Store, Camera,
  Instagram, Facebook, Linkedin, Palette, Target,
  Clock, Zap, Users, ShoppingBag, Scissors, Dumbbell,
  Heart, GraduationCap, Laptop, UtensilsCrossed, PawPrint,
  Home, Briefcase, Paintbrush, Music, Building,
} from 'lucide-react';
import { Button, Card, Input, Textarea } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useApiMutation } from '@/hooks/useApiData';
import { Logo } from '@/components/Logo';

const BUSINESS_TYPES = [
  { value: 'ecommerce', label: 'E-commerce', icon: ShoppingBag, desc: 'Loja online' },
  { value: 'restaurante', label: 'Restaurante', icon: UtensilsCrossed, desc: 'Alimentação' },
  { value: 'salao_beleza', label: 'Salão de Beleza', icon: Scissors, desc: 'Estética' },
  { value: 'academia', label: 'Academia', icon: Dumbbell, desc: 'Fitness' },
  { value: 'clinica', label: 'Clínica', icon: Heart, desc: 'Saúde' },
  { value: 'loja_roupa', label: 'Moda', icon: ShoppingBag, desc: 'Vestuário' },
  { value: 'pet_shop', label: 'Pet Shop', icon: PawPrint, desc: 'Animais' },
  { value: 'imobiliaria', label: 'Imobiliária', icon: Home, desc: 'Imóveis' },
  { value: 'consultoria', label: 'Consultoria', icon: Briefcase, desc: 'Serviços' },
  { value: 'freelancer', label: 'Freelancer', icon: Laptop, desc: 'Autônomo' },
  { value: 'artesanato', label: 'Artesanato', icon: Paintbrush, desc: 'Handmade' },
  { value: 'educacao', label: 'Educação', icon: GraduationCap, desc: 'Cursos' },
  { value: 'tecnologia', label: 'Tecnologia', icon: Laptop, desc: 'Tech/SaaS' },
  { value: 'varejo', label: 'Varejo', icon: Store, desc: 'Loja física' },
  { value: 'outro', label: 'Outro', icon: Building, desc: 'Outro tipo' },
];

const BRAND_VOICES = [
  { value: 'profissional', label: 'Profissional', desc: 'Sério e confiável', emoji: '💼' },
  { value: 'casual', label: 'Casual', desc: 'Relaxado e acessível', emoji: '😊' },
  { value: 'divertido', label: 'Divertido', desc: 'Alegre e descontraído', emoji: '🎉' },
  { value: 'inspirador', label: 'Inspirador', desc: 'Motivacional', emoji: '✨' },
  { value: 'educativo', label: 'Educativo', desc: 'Informativo e didático', emoji: '📚' },
  { value: 'luxuoso', label: 'Luxuoso', desc: 'Elegante e premium', emoji: '💎' },
  { value: 'jovem', label: 'Jovem', desc: 'Dinâmico e moderno', emoji: '🔥' },
  { value: 'amigavel', label: 'Amigável', desc: 'Próximo e caloroso', emoji: '🤗' },
];

const POSTING_FREQUENCIES = [
  { value: 'daily', label: '1x por dia', desc: '30 posts/mês' },
  { value: '3x_week', label: '3x por semana', desc: '12 posts/mês' },
  { value: '5x_week', label: '5x por semana', desc: '20 posts/mês' },
  { value: 'twice_daily', label: '2x por dia', desc: '60 posts/mês' },
  { value: 'weekly', label: '1x por semana', desc: '4 posts/mês' },
];

const STEPS = [
  { title: 'Seu Negócio', desc: 'Conte-nos sobre você' },
  { title: 'Público-Alvo', desc: 'Quem você quer alcançar' },
  { title: 'Identidade', desc: 'Tom e estilo da marca' },
  { title: 'Plataformas', desc: 'Onde você quer postar' },
  { title: 'Pronto!', desc: 'Tudo configurado' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const saveMutation = useApiMutation('/api/business/profile', 'POST');

  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    businessDescription: '',
    targetAudience: '',
    audienceAgeRange: '',
    audienceGender: 'all' as string,
    audienceLocation: '',
    audienceInterests: [] as string[],
    brandVoice: 'profissional',
    brandColors: ['#000000', '#ffffff'],
    preferredPlatforms: ['instagram'] as string[],
    postingFrequency: 'daily',
    preferredPostTimes: ['09:00', '18:00'],
  });

  const [interestInput, setInterestInput] = useState('');

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const togglePlatform = (p: string) => {
    setForm((prev) => ({
      ...prev,
      preferredPlatforms: prev.preferredPlatforms.includes(p)
        ? prev.preferredPlatforms.filter((x) => x !== p)
        : [...prev.preferredPlatforms, p],
    }));
  };

  const addInterest = () => {
    if (interestInput.trim() && !form.audienceInterests.includes(interestInput.trim())) {
      updateForm('audienceInterests', [...form.audienceInterests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (i: string) => {
    updateForm('audienceInterests', form.audienceInterests.filter((x) => x !== i));
  };

  const canNext = () => {
    switch (step) {
      case 0: return form.businessName.trim() && form.businessType;
      case 1: return true;
      case 2: return form.brandVoice;
      case 3: return form.preferredPlatforms.length > 0;
      default: return true;
    }
  };

  const handleFinish = async () => {
    try {
      await saveMutation.mutate({
        ...form,
        onboardingStep: 5,
        onboardingCompleted: true,
      });
    } catch {
      // API may fail in test mode, continue anyway
    }
    router.push('/dashboard');
  };

  const handleNext = async () => {
    if (step < 4) {
      // Auto-save progress
      try {
        await saveMutation.mutate({
          ...form,
          onboardingStep: step + 1,
          onboardingCompleted: false,
        });
      } catch { /* continue anyway */ }
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-gray-400 mt-2">Configure seu assistente de conteúdo IA</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1">
              <div className={cn(
                'h-1.5 rounded-full transition-all duration-500',
                i <= step ? 'bg-white' : 'bg-[#1a1a1a]'
              )} />
              <p className={cn(
                'text-xs mt-1 hidden md:block',
                i <= step ? 'text-white' : 'text-gray-600'
              )}>
                {s.title}
              </p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="p-8">
          {/* Step 0: Business Info */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Sobre seu negócio</h2>
                <p className="text-gray-400">A IA vai usar essas informações para criar conteúdo personalizado</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome do negócio *</label>
                <Input
                  value={form.businessName}
                  onChange={(e) => updateForm('businessName', e.target.value)}
                  placeholder="Ex: Loja da Maria, Studio Bella..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Tipo de negócio *</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {BUSINESS_TYPES.map((bt) => (
                    <button
                      key={bt.value}
                      onClick={() => updateForm('businessType', bt.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 text-center',
                        form.businessType === bt.value
                          ? 'bg-white text-black border-white'
                          : 'bg-[#0a0a0a] text-gray-400 border-[#1a1a1a] hover:border-white/30 hover:text-white'
                      )}
                    >
                      <bt.icon className="w-5 h-5" />
                      <span className="text-xs font-medium leading-tight">{bt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descreva seu negócio</label>
                <Textarea
                  value={form.businessDescription}
                  onChange={(e) => updateForm('businessDescription', e.target.value)}
                  placeholder="O que você vende? Qual o diferencial? Ex: Vendo bolos artesanais personalizados para festas, com ingredientes naturais e entrega em São Paulo..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Quanto mais detalhes, melhor o conteúdo gerado pela IA</p>
              </div>
            </div>
          )}

          {/* Step 1: Target Audience */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Seu público-alvo</h2>
                <p className="text-gray-400">Ajuda a IA a criar conteúdo que converte</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descreva seu público</label>
                <Textarea
                  value={form.targetAudience}
                  onChange={(e) => updateForm('targetAudience', e.target.value)}
                  placeholder="Ex: Mulheres de 25 a 40 anos, classe B, interessadas em alimentação saudável e lifestyle..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Faixa etária</label>
                  <Input
                    value={form.audienceAgeRange}
                    onChange={(e) => updateForm('audienceAgeRange', e.target.value)}
                    placeholder="Ex: 25-40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gênero</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'all', label: 'Todos' },
                      { value: 'female', label: 'Feminino' },
                      { value: 'male', label: 'Masculino' },
                    ].map((g) => (
                      <button
                        key={g.value}
                        onClick={() => updateForm('audienceGender', g.value)}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                          form.audienceGender === g.value
                            ? 'bg-white text-black'
                            : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                        )}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Localização</label>
                <Input
                  value={form.audienceLocation}
                  onChange={(e) => updateForm('audienceLocation', e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Interesses do público</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    placeholder="Ex: moda, beleza, fitness..."
                    className="flex-1"
                  />
                  <Button variant="secondary" onClick={addInterest} size="sm">Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.audienceInterests.map((interest) => (
                    <span
                      key={interest}
                      onClick={() => removeInterest(interest)}
                      className="px-3 py-1 rounded-full bg-white/10 text-white text-sm cursor-pointer hover:bg-red-500/20 hover:text-red-400 transition-all"
                    >
                      {interest} ×
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Brand Identity */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Identidade da marca</h2>
                <p className="text-gray-400">Como sua marca se comunica</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Tom de voz *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BRAND_VOICES.map((v) => (
                    <button
                      key={v.value}
                      onClick={() => updateForm('brandVoice', v.value)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
                        form.brandVoice === v.value
                          ? 'bg-white text-black border-white'
                          : 'bg-[#0a0a0a] text-gray-400 border-[#1a1a1a] hover:border-white/30'
                      )}
                    >
                      <span className="text-xl">{v.emoji}</span>
                      <span className="text-xs font-medium">{v.label}</span>
                      <span className={cn('text-[10px]', form.brandVoice === v.value ? 'text-gray-600' : 'text-gray-600')}>{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Cores da marca</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Primária</label>
                    <input
                      type="color"
                      value={form.brandColors[0] || '#000000'}
                      onChange={(e) => updateForm('brandColors', [e.target.value, form.brandColors[1] || '#ffffff'])}
                      className="w-10 h-10 rounded-lg border border-[#333] cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Secundária</label>
                    <input
                      type="color"
                      value={form.brandColors[1] || '#ffffff'}
                      onChange={(e) => updateForm('brandColors', [form.brandColors[0] || '#000000', e.target.value])}
                      className="w-10 h-10 rounded-lg border border-[#333] cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="h-10 rounded-lg" style={{
                      background: `linear-gradient(135deg, ${form.brandColors[0] || '#000'}, ${form.brandColors[1] || '#fff'})`
                    }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Platforms & Schedule */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Plataformas e frequência</h2>
                <p className="text-gray-400">Onde e quando você quer postar</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Redes sociais *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'instagram', label: 'Instagram', icon: Instagram },
                    { value: 'facebook', label: 'Facebook', icon: Facebook },
                    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                    { value: 'tiktok', label: 'TikTok', icon: Music },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => togglePlatform(p.value)}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-xl border transition-all',
                        form.preferredPlatforms.includes(p.value)
                          ? 'bg-white text-black border-white'
                          : 'bg-[#0a0a0a] text-gray-400 border-[#1a1a1a] hover:border-white/30'
                      )}
                    >
                      <p.icon className="w-5 h-5" />
                      <span className="font-medium">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Frequência de postagem</label>
                <div className="space-y-2">
                  {POSTING_FREQUENCIES.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => updateForm('postingFrequency', f.value)}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-xl border transition-all',
                        form.postingFrequency === f.value
                          ? 'bg-white text-black border-white'
                          : 'bg-[#0a0a0a] text-gray-400 border-[#1a1a1a] hover:border-white/30'
                      )}
                    >
                      <span className="font-medium">{f.label}</span>
                      <span className={cn('text-sm', form.postingFrequency === f.value ? 'text-gray-600' : 'text-gray-600')}>
                        {f.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-gray-300 flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Tudo pronto! 🎉</h2>
                <p className="text-gray-400">
                  Seu assistente IA está configurado para <strong className="text-white">{form.businessName}</strong>
                </p>
              </div>

              <div className="bg-[#0a0a0a] rounded-xl p-6 text-left space-y-3">
                <h3 className="text-sm font-semibold text-white mb-3">Resumo da configuração:</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <span className="text-white ml-2">
                      {BUSINESS_TYPES.find((t) => t.value === form.businessType)?.label || form.businessType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tom:</span>
                    <span className="text-white ml-2">
                      {BRAND_VOICES.find((v) => v.value === form.brandVoice)?.label || form.brandVoice}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Redes:</span>
                    <span className="text-white ml-2">{form.preferredPlatforms.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Frequência:</span>
                    <span className="text-white ml-2">
                      {POSTING_FREQUENCIES.find((f) => f.value === form.postingFrequency)?.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-400">
                <p>Próximos passos:</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-white" />
                    <span>Faça upload dos seus produtos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>A IA vai gerar posts automaticamente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white" />
                    <span>Ative o piloto automático</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1a1a1a]">
            {step > 0 ? (
              <Button
                variant="ghost"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setStep(step - 1)}
              >
                Voltar
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                Pular
              </Button>
            )}

            {step < 4 ? (
              <Button
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleNext}
                disabled={!canNext()}
                isLoading={saveMutation.loading}
              >
                Continuar
              </Button>
            ) : (
              <Button
                leftIcon={<Zap className="w-4 h-4" />}
                onClick={handleFinish}
                isLoading={saveMutation.loading}
              >
                Ir para o Dashboard
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
