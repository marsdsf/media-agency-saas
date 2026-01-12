import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key || url.includes('placeholder')) {
    throw new Error('Supabase não configurado. Configure as variáveis no arquivo .env.local');
  }
  
  return createBrowserClient(url, key);
}
