'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, Check, Building2, Globe, Users, ShoppingBag, Sparkles, Rocket, Zap, BarChart3, Calendar } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

type AccountType = 'solo' | 'agency' | null;
type Step = 0 | 1 | 2 | 3;

interface FormData {
  name: string;
  email: string;
  password: string;
  agencyName: string;
  agencyWebsite: string;
  teamSize: string;
  plan: string;
  accountType: AccountType;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
      <RegisterPageInner />
    </Suspense>
  );
}

function RegisterPageInner() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const isInvite = !!inviteToken;

  const [step, setStep] = useState<Step>(isInvite ? 1 : 0);
  const [data, setData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    agencyName: '',
    agencyWebsite: '',
    teamSize: '1-3',
    plan: 'professional',
    accountType: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuthStore();

  const updateData = (field: keyof FormData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const totalSteps = data.accountType === 'solo' ? 2 : 3;
  const isFinalStep = data.accountType === 'solo' ? step === 1 : step === 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isInvite && step === 1) {
      // invite flow skips to submit
    } else if (data.accountType === 'solo' && step === 1) {
      // solo: step 1 is the last (personal info only)
    } else if (data.accountType === 'agency' && step < 3) {
      setStep((step + 1) as Step);
      return;
    } else if (step === 0) {
      // should not happen — step 0 has its own buttons
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const body: Record<string, string> = {
        name: data.name,
        email: data.email,
        password: data.password,
      };

      if (isInvite) {
        body.inviteToken = inviteToken!;
      } else if (data.accountType === 'solo') {
        body.accountType = 'solo';
        body.agencyName = data.name; // use the user's name as workspace name
      } else {
        body.agencyName = data.agencyName;
        body.agencyWebsite = data.agencyWebsite;
        body.teamSize = data.teamSize;
        body.plan = data.plan;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao criar conta');
      }

      await login(data.email, data.password);

      if (data.accountType === 'solo') {
        router.push('/onboarding');
      } else {
        router.push('/dashboard?welcome=true');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== STEP 0: Account Type Selection =====
  if (step === 0 && !isInvite) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-3xl">
          {/* Logo */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/logo.svg" alt="MediaAI" width={56} height={56} />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white">MediaAI</h1>
                <p className="text-xs text-gray-600">Plataforma Inteligente</p>
              </div>
            </Link>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Como você quer usar o MediaAI?
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Escolha o perfil que melhor descreve você. Você pode mudar depois.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Solo Card */}
            <button
              onClick={() => {
                setData(prev => ({ ...prev, accountType: 'solo' }));
                setStep(1);
              }}
              className="group relative text-left p-8 rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <User className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sou Empreendedor</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Quero que a IA crie e poste conteúdo automaticamente nas minhas redes sociais, sem precisar de designer.
                </p>
                <ul className="space-y-2.5">
                  {[
                    { icon: Sparkles, text: 'IA cria posts automaticamente' },
                    { icon: Calendar, text: 'Calendário de postagens' },
                    { icon: Rocket, text: 'Piloto automático' },
                    { icon: BarChart3, text: 'Analytics das redes' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-400">
                      <item.icon className="w-4 h-4 text-white/60 flex-shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-2 text-white font-medium text-sm group-hover:gap-3 transition-all">
                  Começar grátis <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* Agency Card */}
            <button
              onClick={() => {
                setData(prev => ({ ...prev, accountType: 'agency' }));
                setStep(1);
              }}
              className="group relative text-left p-8 rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sou Agência</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Gerencio múltiplos clientes e preciso de uma plataforma completa para escalar minha agência.
                </p>
                <ul className="space-y-2.5">
                  {[
                    { icon: Users, text: 'Gerenciar múltiplos clientes' },
                    { icon: Zap, text: 'Automações + aprovações' },
                    { icon: Sparkles, text: 'IA para criar conteúdo' },
                    { icon: BarChart3, text: 'Relatórios profissionais' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-400">
                      <item.icon className="w-4 h-4 text-white/60 flex-shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-2 text-white font-medium text-sm group-hover:gap-3 transition-all">
                  Começar trial grátis <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>

          <p className="mt-8 text-center text-gray-500 text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-white hover:text-gray-300 font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ===== LEFT PANEL CONTENT =====
  const soloFeatures = [
    'IA cria posts automaticamente',
    'Upload seus produtos',
    'Calendário inteligente',
    'Piloto automático',
    '14 dias grátis',
  ];

  const agencyFeatures = [
    'Gerencie múltiplos clientes',
    'IA para criar conteúdo',
    'Portal do cliente incluso',
    'Relatórios automáticos',
    '14 dias grátis',
  ];

  const features = data.accountType === 'solo' ? soloFeatures : agencyFeatures;

  const plans = [
    { id: 'starter', name: 'Starter', price: 'R$ 197/mês', clients: '5 clientes' },
    { id: 'professional', name: 'Professional', price: 'R$ 497/mês', clients: '20 clientes', popular: true },
    { id: 'enterprise', name: 'Enterprise', price: 'R$ 997/mês', clients: '50 clientes' },
  ];

  const progressSteps = data.accountType === 'solo' ? 1 : (isInvite ? 1 : 3);

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-white/[0.03] to-transparent relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-2xl shadow-white/5">
            {data.accountType === 'solo' ? (
              <Sparkles className="w-10 h-10 text-white" />
            ) : (
              <Building2 className="w-10 h-10 text-white" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {data.accountType === 'solo'
              ? 'Suas redes sociais no piloto automático'
              : 'Escale sua agência com IA'}
          </h2>
          <p className="text-gray-400 mb-8">
            {data.accountType === 'solo'
              ? 'A IA cria e agenda posts automaticamente. Sem designer, sem complicação.'
              : 'Junte-se a centenas de agências que gerenciam seus clientes de forma inteligente.'}
          </p>
          <ul className="space-y-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl overflow-hidden">
              <Image src="/logo.svg" alt="MediaAI" width={48} height={48} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">MediaAI</h1>
              <p className="text-xs text-gray-500">
                {data.accountType === 'solo' ? 'Para Empreendedores' : 'Para Agências'}
              </p>
            </div>
          </Link>

          {/* Progress */}
          {!isInvite && (
            <div className="flex items-center gap-2 mb-8">
              {Array.from({ length: progressSteps }, (_, i) => i + 1).map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    s < step ? 'bg-white text-black' :
                    s === step ? 'bg-white text-black' :
                    'bg-[#1a1a1a] text-gray-500'
                  }`}>
                    {s < step ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < progressSteps && <div className={`w-12 h-0.5 ${s < step ? 'bg-white' : 'bg-[#1a1a1a]'}`} />}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Personal Info (both flows) */}
            {step === 1 && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Criar sua conta</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    {data.accountType === 'solo'
                      ? 'Seus dados para acessar a plataforma'
                      : 'Dados do administrador da agência'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Seu nome</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => updateData('name', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => updateData('email', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      value={data.password}
                      onChange={(e) => updateData('password', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                      placeholder="Mínimo 8 caracteres"
                      minLength={8}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Agency Info (agency only) */}
            {step === 2 && data.accountType === 'agency' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Sobre sua agência</h2>
                  <p className="text-gray-500 text-sm mb-6">Informações para configurar seu workspace</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome da agência</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={data.agencyName}
                      onChange={(e) => updateData('agencyName', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                      placeholder="Nome da sua agência"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Website (opcional)</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="url"
                      value={data.agencyWebsite}
                      onChange={(e) => updateData('agencyWebsite', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                      placeholder="https://suaagencia.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tamanho da equipe</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <select
                      value={data.teamSize}
                      onChange={(e) => updateData('teamSize', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all appearance-none"
                    >
                      <option value="1-3">1-3 pessoas</option>
                      <option value="4-10">4-10 pessoas</option>
                      <option value="11-25">11-25 pessoas</option>
                      <option value="25+">Mais de 25</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Plan Selection (agency only) */}
            {step === 3 && data.accountType === 'agency' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Escolha seu plano</h2>
                  <p className="text-gray-500 text-sm mb-6">14 dias grátis, cancele quando quiser</p>
                </div>

                <div className="space-y-3">
                  {plans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        data.plan === plan.id
                          ? 'bg-white/5 border-white/30'
                          : 'bg-[#0a0a0a] border-[#222] hover:border-[#333]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={data.plan === plan.id}
                        onChange={(e) => updateData('plan', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        data.plan === plan.id ? 'border-white bg-white' : 'border-gray-600'
                      }`}>
                        {data.plan === plan.id && <Check className="w-3 h-3 text-black" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{plan.name}</span>
                          {plan.popular && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white text-black font-semibold">Popular</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{plan.clients}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">{plan.price}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex items-start gap-2 mt-4">
                  <input 
                    type="checkbox" 
                    id="terms"
                    className="mt-1 w-4 h-4 rounded bg-[#1a1a1a] border-[#333] text-white focus:ring-white/20" 
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-400">
                    Concordo com os{' '}
                    <Link href="/terms" className="text-white hover:text-gray-300">
                      Termos de Serviço
                    </Link>{' '}
                    e{' '}
                    <Link href="/privacy" className="text-white hover:text-gray-300">
                      Política de Privacidade
                    </Link>
                  </label>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as Step)}
                  className="flex-1 py-3.5 rounded-xl border border-[#333] text-white font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>
              )}
              {step === 1 && !isInvite && (
                <button
                  type="button"
                  onClick={() => { setStep(0); setData(prev => ({ ...prev, accountType: null })); }}
                  className="py-3.5 px-5 rounded-xl border border-[#333] text-white font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3.5 rounded-xl bg-white hover:bg-gray-100 text-black font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isFinalStep ? (
                  <>
                    {data.accountType === 'solo' ? 'Criar conta' : 'Começar trial grátis'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-gray-500 text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-white hover:text-gray-300 font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

