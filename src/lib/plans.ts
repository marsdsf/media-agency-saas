// =============================================
// Source of truth para planos e preços
// Usado por TODOS os gateways (Stripe, Asaas, MercadoPago)
// =============================================

export type PlanId = 'starter' | 'professional' | 'enterprise';
export type PaymentGateway = 'stripe' | 'asaas' | 'mercadopago';

export interface PlanLimits {
  clients: number;       // -1 = ilimitado
  teamMembers: number;   // -1 = ilimitado
  aiCredits: number;     // -1 = ilimitado
  socialAccounts: number;
  storageGB: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  limits: PlanLimits;
  features: string[];
  // IDs específicos de cada gateway (configurar via env)
  stripe_price_id?: string;
  asaas_plan_id?: string;
  mercadopago_plan_id?: string;
}

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 197,
    currency: 'BRL',
    interval: 'month',
    limits: {
      clients: 5,
      teamMembers: 2,
      aiCredits: 2000,
      socialAccounts: 5,
      storageGB: 5,
    },
    features: [
      'Até 5 clientes',
      '2 membros da equipe',
      '2.000 créditos de IA/mês',
      '5 contas sociais',
      'Agendamento ilimitado',
      'Templates padrão',
      'Relatórios básicos',
      'Suporte por email',
    ],
    stripe_price_id: process.env.STRIPE_PRICE_STARTER,
    asaas_plan_id: process.env.ASAAS_PLAN_STARTER,
    mercadopago_plan_id: process.env.MERCADOPAGO_PLAN_STARTER,
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 497,
    currency: 'BRL',
    interval: 'month',
    limits: {
      clients: 20,
      teamMembers: 10,
      aiCredits: 10000,
      socialAccounts: 20,
      storageGB: 25,
    },
    features: [
      'Até 20 clientes',
      '10 membros da equipe',
      '10.000 créditos de IA/mês',
      '20 contas sociais',
      'Agendamento ilimitado',
      'Todos os templates',
      'Analytics completo',
      'Portal do cliente',
      'Agentes IA',
      'Suporte prioritário',
      'API access',
    ],
    stripe_price_id: process.env.STRIPE_PRICE_PROFESSIONAL,
    asaas_plan_id: process.env.ASAAS_PLAN_PROFESSIONAL,
    mercadopago_plan_id: process.env.MERCADOPAGO_PLAN_PROFESSIONAL,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 997,
    currency: 'BRL',
    interval: 'month',
    limits: {
      clients: -1,
      teamMembers: -1,
      aiCredits: 50000,
      socialAccounts: -1,
      storageGB: 100,
    },
    features: [
      'Clientes ilimitados',
      'Equipe ilimitada',
      '50.000 créditos de IA/mês',
      'Contas sociais ilimitadas',
      'Agendamento ilimitado',
      'Relatórios personalizados',
      'Portal do cliente',
      'White-label',
      'Suporte 24/7',
      'API access',
      'Onboarding dedicado',
      'SLA garantido',
    ],
    stripe_price_id: process.env.STRIPE_PRICE_ENTERPRISE,
    asaas_plan_id: process.env.ASAAS_PLAN_ENTERPRISE,
    mercadopago_plan_id: process.env.MERCADOPAGO_PLAN_ENTERPRISE,
  },
};

// Custos de créditos por ação
export const CREDIT_COSTS = {
  // IA
  generate_post: 10,
  generate_caption: 5,
  generate_hashtags: 3,
  generate_image: 50,
  generate_video: 100,
  ai_chat: 2,
  ai_predict: 15,
  ai_pipeline: 15,
  ai_campaign: 30,
  ai_schedule: 20,
  
  // Publicação
  schedule_post: 1,
  publish_now: 1,
  
  // Analytics
  generate_report: 20,
  competitor_analysis: 15,
  
  // Outros
  trend_analysis: 10,
  influencer_search: 5,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

// Helpers
export function getPlanById(planId: string): Plan | undefined {
  return PLANS[planId as PlanId];
}

export function getPlanLimits(planId: string): PlanLimits {
  return PLANS[planId as PlanId]?.limits || PLANS.starter.limits;
}

export function formatPrice(price: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(price);
}

export function isWithinLimit(current: number, limit: number): boolean {
  return limit === -1 || current < limit;
}

export function getCreditCost(action: CreditAction): number {
  return CREDIT_COSTS[action];
}

export function getAvailableCredits(limit: number, used: number): number {
  if (limit === -1) return Infinity;
  return Math.max(0, limit - used);
}
