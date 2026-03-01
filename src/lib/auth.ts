import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export interface UserContext {
  userId: string;
  email: string;
  agencyId: string;
  role: string;
  permissions: string[];
}

// Get authenticated user context with agency info
export async function getUserContext(): Promise<UserContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id, role, permissions')
    .eq('id', user.id)
    .single();

  if (!profile?.agency_id) return null;

  return {
    userId: user.id,
    email: user.email || '',
    agencyId: profile.agency_id,
    role: profile.role || 'agency_member',
    permissions: profile.permissions || [],
  };
}

// Check if user has specific permission
export function hasPermission(ctx: UserContext, permission: string): boolean {
  if (ctx.role === 'super_admin' || ctx.role === 'agency_owner') return true;
  if (ctx.permissions.includes('*')) return true;
  return ctx.permissions.includes(permission);
}

// Check if user has one of the allowed roles
export function hasRole(ctx: UserContext, roles: string[]): boolean {
  return roles.includes(ctx.role);
}

// Get Supabase admin client (service role)
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase not configured');
  }

  return createAdminClient(url, key);
}

// Generate CSRF token for OAuth
export function generateCsrfToken(userId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  // Simple HMAC-like token: userId.timestamp.random
  return Buffer.from(`${userId}.${timestamp}.${random}`).toString('base64url');
}

// Validate CSRF token and extract userId
export function validateCsrfToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split('.');
    if (parts.length !== 3) return null;
    return parts[0];
  } catch {
    return null;
  }
}
