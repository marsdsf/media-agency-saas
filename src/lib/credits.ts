import { createClient } from '@/lib/supabase/server';
import { CREDIT_COSTS } from '@/lib/stripe';

export type CreditAction = keyof typeof CREDIT_COSTS;

export async function useCredits(userId: string, action: CreditAction, description?: string) {
  const supabase = await createClient();
  const cost = CREDIT_COSTS[action];

  // Buscar créditos atuais
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits, credits_used')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return { success: false, error: 'Usuário não encontrado' };
  }

  // Verificar se tem créditos suficientes
  if (profile.credits < cost) {
    return { 
      success: false, 
      error: 'Créditos insuficientes',
      required: cost,
      available: profile.credits
    };
  }

  // Deduzir créditos
  const newCredits = profile.credits - cost;
  const newCreditsUsed = profile.credits_used + cost;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      credits: newCredits,
      credits_used: newCreditsUsed
    })
    .eq('id', userId);

  if (updateError) {
    return { success: false, error: 'Erro ao atualizar créditos' };
  }

  // Registrar transação
  await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: -cost,
      type: 'usage',
      action,
      description: description || `Uso: ${action}`,
      balance_after: newCredits
    });

  return { 
    success: true, 
    creditsUsed: cost,
    creditsRemaining: newCredits
  };
}

export async function addCredits(
  userId: string, 
  amount: number, 
  type: 'purchase' | 'subscription' | 'bonus' | 'refund',
  description?: string
) {
  const supabase = await createClient();

  // Buscar créditos atuais
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return { success: false, error: 'Usuário não encontrado' };
  }

  const newCredits = profile.credits + amount;

  // Atualizar créditos
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits: newCredits })
    .eq('id', userId);

  if (updateError) {
    return { success: false, error: 'Erro ao adicionar créditos' };
  }

  // Registrar transação
  await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount,
      type,
      description: description || `${type}: ${amount} créditos`,
      balance_after: newCredits
    });

  return { 
    success: true, 
    creditsAdded: amount,
    creditsTotal: newCredits
  };
}

export async function getCreditsBalance(userId: string) {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('credits, credits_used, plan')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  return {
    available: profile.credits,
    used: profile.credits_used,
    plan: profile.plan
  };
}
