'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, ArrowRight, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulated registration
      await new Promise(resolve => setTimeout(resolve, 1500));
      await login(email, password);
      router.push('/dashboard');
    } catch {
      setError('Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'Agendamento inteligente de posts',
    'Geração de conteúdo com IA',
    'Preview em tempo real',
    'Analytics detalhados',
    '1.000 créditos grátis',
  ];

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-[#0a0a0a] to-[#050505] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-gray-200 flex items-center justify-center mb-8 overflow-hidden shadow-2xl shadow-white/20">
            <Image src="/logo.svg" alt="MediaAI" width={60} height={60} className="invert" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Comece sua jornada hoje
          </h2>
          <p className="text-gray-400 mb-8">
            Junte-se a milhares de criadores que já automatizam seu conteúdo com IA.
          </p>
          <ul className="space-y-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-white to-gray-300 flex items-center justify-center shadow-sm shadow-white/20">
                  <Check className="w-3 h-3 text-black" />
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
              <p className="text-xs text-gray-500">Agência Inteligente</p>
            </div>
          </Link>

          <h2 className="text-3xl font-bold text-white mb-2">Criar conta</h2>
          <p className="text-gray-400 mb-8">Comece com 1.000 créditos grátis</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="Seu nome"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-colors"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-white/10"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Criar conta grátis
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-400">
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
