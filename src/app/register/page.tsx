'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, Check, Building2, Globe, Users } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

type Step = 1 | 2 | 3;

interface AgencyData {
  name: string;
  email: string;
  password: string;
  agencyName: string;
  agencyWebsite: string;
  teamSize: string;
  plan: string;
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const isInvite = !!inviteToken;

  const [step, setStep] = useState<Step>(isInvite ? 1 : 1);
  const [data, setData] = useState<AgencyData>({
    name: '',
    email: '',
    password: '',
    agencyName: '',
    agencyWebsite: '',
    teamSize: '1-3',
    plan: 'professional',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuthStore();

  const updateData = (field: keyof AgencyData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Para convites, pular direto para submissão (não precisa de agência/plano)
    if (!isInvite && step < 3) {
      setStep((step + 1) as Step);
      return;
    }

    if (isInvite && step < 1) {
      setStep((step + 1) as Step);
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
      } else {
        body.agencyName = data.agencyName;
        body.agencyWebsite = data.agencyWebsite;
        body.teamSize = data.teamSize;
        body.plan = data.plan;
      }

      // Register via API
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
      router.push('/dashboard?welcome=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'Gerencie múltiplos clientes',
    'IA para criar conteúdo',
    'Portal do cliente incluso',
    'Relatórios automáticos',
    '14 dias grátis',
  ];

  const plans = [
    { id: 'starter', name: 'Starter', price: 'R$ 197/mês', clients: '5 clientes' },
    { id: 'professional', name: 'Professional', price: 'R$ 497/mês', clients: '20 clientes', popular: true },
    { id: 'enterprise', name: 'Enterprise', price: 'R$ 997/mês', clients: '50 clientes' },
  ];

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-violet-600/10 to-purple-600/5 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mb-8 overflow-hidden shadow-2xl shadow-violet-500/20">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Escale sua agência com IA
          </h2>
          <p className="text-gray-400 mb-8">
            Junte-se a centenas de agências que gerenciam seus clientes de forma inteligente.
          </p>
          <ul className="space-y-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-sm shadow-violet-500/20">
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
              <p className="text-xs text-gray-500">Para Agências</p>
            </div>
          </Link>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  s < step ? 'bg-violet-600 text-white' :
                  s === step ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' :
                  'bg-[#1a1a1a] text-gray-500'
                }`}>
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-violet-600' : 'bg-[#1a1a1a]'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Criar sua conta</h2>
                  <p className="text-gray-500 text-sm mb-6">Dados do administrador da agência</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Seu nome</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => updateData('name', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
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
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
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
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                      placeholder="Mínimo 8 caracteres"
                      minLength={8}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Agency Info */}
            {step === 2 && (
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
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
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
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
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
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white focus:outline-none focus:border-violet-500/50 transition-colors appearance-none"
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

            {/* Step 3: Plan Selection */}
            {step === 3 && (
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
                          ? 'bg-violet-600/10 border-violet-500/50'
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
                        data.plan === plan.id ? 'border-violet-500 bg-violet-500' : 'border-gray-600'
                      }`}>
                        {data.plan === plan.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{plan.name}</span>
                          {plan.popular && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500 text-white">Popular</span>
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
                    className="mt-1 w-4 h-4 rounded bg-[#1a1a1a] border-[#333] text-violet-500 focus:ring-violet-500/20" 
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-400">
                    Concordo com os{' '}
                    <Link href="/terms" className="text-violet-400 hover:text-violet-300">
                      Termos de Serviço
                    </Link>{' '}
                    e{' '}
                    <Link href="/privacy" className="text-violet-400 hover:text-violet-300">
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
                  className="flex-1 py-3.5 rounded-xl border border-[#333] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#111] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={`${step > 1 ? 'flex-1' : 'w-full'} py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : step < 3 ? (
                  <>
                    Continuar
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Começar trial grátis
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-gray-400">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
