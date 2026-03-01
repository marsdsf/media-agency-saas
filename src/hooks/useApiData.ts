'use client';

import { useState, useEffect, useCallback } from 'react';

// Generic fetch hook
export function useApiData<T>(url: string | null, options?: { refreshKey?: number }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar dados');
      console.error(`API Error [${url}]:`, e);
    } finally {
      setLoading(false);
    }
  }, [url, options?.refreshKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Generic mutation hook (POST/PATCH/DELETE)
export function useApiMutation<TInput = any, TOutput = any>(url: string, method: 'POST' | 'PATCH' | 'DELETE' = 'POST') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (body: TInput): Promise<TOutput | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e: any) {
      setError(e.message || 'Erro na operação');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [url, method]);

  return { mutate, loading, error };
}

// Typed API hooks for each entity
export function useClients(search?: string) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  const url = `/api/clients${params.toString() ? '?' + params.toString() : ''}`;
  return useApiData<{ clients: any[] }>(url);
}

export function useCampaigns(clientId?: string) {
  const params = new URLSearchParams();
  if (clientId) params.set('client_id', clientId);
  return useApiData<{ campaigns: any[] }>(`/api/campaigns?${params.toString()}`);
}

export function useCalendarEvents(start?: string, end?: string, clientId?: string) {
  const params = new URLSearchParams();
  if (start) params.set('start', start);
  if (end) params.set('end', end);
  if (clientId) params.set('client_id', clientId);
  return useApiData<{ events: any[]; scheduledPosts: any[] }>(`/api/calendar?${params.toString()}`);
}

export function useTemplates(category?: string) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  return useApiData<{ templates: any[] }>(`/api/templates?${params.toString()}`);
}

export function useMediaLibrary(type?: string, clientId?: string) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (clientId) params.set('client_id', clientId);
  return useApiData<{ media: any[] }>(`/api/media?${params.toString()}`);
}

export function useTeam() {
  return useApiData<{ members: any[]; invitations: any[] }>('/api/team');
}

export function useNotifications(unreadOnly = false) {
  const params = new URLSearchParams();
  if (unreadOnly) params.set('unread', 'true');
  return useApiData<{ notifications: any[]; unreadCount: number }>(`/api/notifications?${params.toString()}`);
}

export function useBrandAssets(clientId?: string) {
  const params = new URLSearchParams();
  if (clientId) params.set('client_id', clientId);
  return useApiData<{ assets: any[] }>(`/api/brand?${params.toString()}`);
}

export function useReports(clientId?: string) {
  const params = new URLSearchParams();
  if (clientId) params.set('client_id', clientId);
  return useApiData<{ reports: any[] }>(`/api/reports?${params.toString()}`);
}

export function useCompetitors(clientId?: string) {
  const params = new URLSearchParams();
  if (clientId) params.set('client_id', clientId);
  return useApiData<{ competitors: any[] }>(`/api/competitors?${params.toString()}`);
}

export function useHashtagGroups(clientId?: string) {
  const params = new URLSearchParams();
  if (clientId) params.set('client_id', clientId);
  return useApiData<{ groups: any[] }>(`/api/hashtags?${params.toString()}`);
}

export function useLinkPages(clientId?: string) {
  const params = new URLSearchParams();
  if (clientId) params.set('client_id', clientId);
  return useApiData<{ pages: any[] }>(`/api/links?${params.toString()}`);
}

export function useAutomations() {
  return useApiData<{ automations: any[] }>('/api/automations');
}

export function useSocialAccounts() {
  return useApiData<{ accounts: any[] }>('/api/social/accounts');
}

export function useProfile() {
  return useApiData<{ profile: any; agency: any }>('/api/user/profile');
}
