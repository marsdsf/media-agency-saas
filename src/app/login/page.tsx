'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
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
      await login(email, password);
      router.push('/dashboard');
    } catch {
      setError('Email ou senha incorretos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <Image src="/logo.svg" alt="MediaAI" width={48} height={48} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">MediaAI</h1>
              <p className="text-xs text-gray-600">Agência Inteligente</p>
            </div>
          </Link>

          <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta!</h2>
          <p className="text-gray-500 mb-8">Entre na sua conta para continuar</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 transition-colors peer-focus:text-white" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 focus:shadow-lg focus:shadow-white/5 transition-all duration-300"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 transition-colors peer-focus:text-white" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 focus:shadow-lg focus:shadow-white/5 transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-[#1a1a1a] border-[#333] text-white focus:ring-white/20" />
                <span className="text-sm text-gray-500">Lembrar de mim</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-white hover:text-gray-300">
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full py-3.5 rounded-xl bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black font-semibold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-white hover:text-gray-300 font-medium">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-[#0a0a0a] to-[#050505] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-white/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative z-10 max-w-md text-center group">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-8 shadow-2xl shadow-white/20 ring-1 ring-white/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-white/30">
            <Image src="/logo.svg" alt="MediaAI" width={96} height={96} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Automatize sua agência com <span className="bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent">IA</span>
          </h2>
          <p className="text-gray-500">
            Crie posts incríveis, agende publicações e gerencie todas as suas redes sociais em um só lugar.
          </p>
        </div>
      </div>
    </div>
  );
}
