'use client';

import { useState, useCallback } from 'react';

interface FetchOptions extends RequestInit {
  body?: any;
}

interface UseApiResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  execute: (url: string, options?: FetchOptions) => Promise<T | null>;
}

export function useApi<T = any>(): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (url: string, options: FetchOptions = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchOptions: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      if (options.body && typeof options.body === 'object') {
        fetchOptions.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, fetchOptions);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro na requisição');
      }

      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, error, isLoading, execute };
}

// Hook específico para créditos
export function useCredits() {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCredits = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      if (data.profile) {
        setCredits(data.profile.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCredits = fetchCredits;

  return { credits, isLoading, refreshCredits };
}

// Hook para geração com IA
export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, type: 'post' | 'caption' | 'hashtags' = 'post') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar conteúdo');
      }

      return {
        content: data.content,
        creditsRemaining: data.creditsRemaining,
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const chat = useCallback(async (message: string, agentType: string = 'general', conversationId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, agentType, conversationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no chat');
      }

      return {
        reply: data.reply,
        conversationId: data.conversationId,
        creditsRemaining: data.creditsRemaining,
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generate, chat, isLoading, error };
}

// Hook para redes sociais
export function useSocialAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/social/accounts');
      const data = await response.json();
      if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectInstagram = useCallback(async () => {
    const response = await fetch('/api/social/instagram/connect');
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }, []);

  const disconnectAccount = useCallback(async (accountId: string) => {
    await fetch('/api/social/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId }),
    });
    await fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, isLoading, fetchAccounts, connectInstagram, disconnectAccount };
}
