'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
        <AlertTriangle className="w-10 h-10 text-red-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-3">Ops! Algo deu errado</h2>
      <p className="text-gray-400 text-center max-w-lg mb-2">
        Encontramos um problema ao carregar esta página. Isso pode ser temporário.
      </p>
      
      {error.digest && (
        <p className="text-xs text-gray-600 mb-6 font-mono">
          Código: {error.digest}
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-all font-semibold shadow-lg shadow-white/10"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-6 py-3 border border-[#333] text-gray-300 rounded-xl hover:bg-white/5 transition-all"
        >
          <Home className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
