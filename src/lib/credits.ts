import { createClient } from '@/lib/supabase/server';
import { CREDIT_COSTS, type CreditAction } from '@/lib/plans';

export type { CreditAction };

// Helper to get agency_id for a user
async function getUserAgencyId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', userId)
    .single();
  return data?.agency_id || null;
}

// Deduct credits atomically (multi-tenant: uses agency credits)
export async function deductCredits(
  userId: string,
  action: CreditAction,
  description?: string
): Promise<{
  success: boolean;
  error?: string;
  creditsUsed?: number;
  creditsRemaining?: number;
  required?: number;
  available?: number;
}> {
  const supabase = await createClient();
  const cost = CREDIT_COSTS[action];

  // Get user's agency
  const agencyId = await getUserAgencyId(userId);
  if (!agencyId) {
    return { success: false, error: 'Agência não encontrada' };
  }

  // Get agency credits info
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('ai_credits_limit, ai_credits_used, plan')
    .eq('id', agencyId)
    .single();

  if (agencyError || !agency) {
    return { success: false, error: 'Agência não encontrada' };
  }

  const available = agency.ai_credits_limit === -1
    ? Infinity
    : agency.ai_credits_limit - agency.ai_credits_used;

  // Check if enough credits
  if (available < cost) {
    return {
      success: false,
      error: 'Créditos insuficientes',
      required: cost,
      available: available === Infinity ? -1 : available,
    };
  }

  // Atomic deduction via RPC
  const { data: deducted, error: rpcError } = await supabase
    .rpc('deduct_credits', {
      p_agency_id: agencyId,
      p_amount: cost,
    });

  if (rpcError || !deducted) {
    return { success: false, error: 'Créditos insuficientes ou erro na dedução' };
  }

  const remaining = agency.ai_credits_limit === -1
    ? -1
    : agency.ai_credits_limit - (agency.ai_credits_used + cost);

  // Record the transaction (non-blocking)
  supabase
    .from('credit_transactions')
    .insert({
      agency_id: agencyId,
      user_id: userId,
      amount: -cost,
      type: 'usage',
      action,
      description: description || `Uso: ${action}`,
      balance_after: remaining === -1 ? null : remaining,
    })
    .then(() => {});

  return {
    success: true,
    creditsUsed: cost,
    creditsRemaining: remaining,
  };
}

// Add credits to agency
export async function addCredits(
  agencyId: string,
  amount: number,
  type: 'purchase' | 'subscription' | 'bonus' | 'refund',
  description?: string,
  userId?: string
): Promise<{ success: boolean; error?: string; creditsTotal?: number }> {
  const supabase = await createClient();

  // For subscription renewal, reset used credits
  if (type === 'subscription') {
    const { error } = await supabase
      .from('agencies')
      .update({ ai_credits_used: 0 })
      .eq('id', agencyId);

    if (error) {
      return { success: false, error: 'Erro ao resetar créditos' };
    }
  }

  // Get current state
  const { data: agency } = await supabase
    .from('agencies')
    .select('ai_credits_limit, ai_credits_used')
    .eq('id', agencyId)
    .single();

  const remaining = agency
    ? (agency.ai_credits_limit === -1 ? -1 : agency.ai_credits_limit - agency.ai_credits_used)
    : 0;

  // Record the transaction
  await supabase
    .from('credit_transactions')
    .insert({
      agency_id: agencyId,
      user_id: userId || null,
      amount,
      type,
      description: description || `${type}: ${amount} créditos`,
      balance_after: remaining === -1 ? null : remaining,
    });

  return {
    success: true,
    creditsTotal: remaining,
  };
}

// Get credits balance for an agency
export async function getCreditsBalance(agencyId: string) {
  const supabase = await createClient();

  const { data: agency, error } = await supabase
    .from('agencies')
    .select('ai_credits_limit, ai_credits_used, plan')
    .eq('id', agencyId)
    .single();

  if (error || !agency) {
    return null;
  }

  return {
    limit: agency.ai_credits_limit,
    used: agency.ai_credits_used,
    available: agency.ai_credits_limit === -1
      ? -1
      : agency.ai_credits_limit - agency.ai_credits_used,
    plan: agency.plan,
  };
}

// Get credits balance for a user (via their agency)
export async function getUserCreditsBalance(userId: string) {
  const agencyId = await getUserAgencyId(userId);
  if (!agencyId) return null;
  return getCreditsBalance(agencyId);
}

// Legacy alias for backward compatibility
export const useCredits = deductCredits;
