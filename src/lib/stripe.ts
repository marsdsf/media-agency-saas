import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Planos disponíveis
export const PLANS = {
  starter: {
    name: 'Starter',
    price: 97,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    credits: 1000,
    features: [
      '1.000 créditos/mês',
      '3 contas sociais',
      'Agendamento básico',
      'Templates padrão',
      'Suporte por email',
    ],
  },
  professional: {
    name: 'Professional',
    price: 197,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL!,
    credits: 5000,
    features: [
      '5.000 créditos/mês',
      '10 contas sociais',
      'Agendamento avançado',
      'Todos os templates',
      'Analytics completo',
      'Agentes IA',
      'Suporte prioritário',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 497,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    credits: 20000,
    features: [
      '20.000 créditos/mês',
      'Contas ilimitadas',
      'White-label',
      'API access',
      'Gerente dedicado',
      'Treinamento personalizado',
      'SLA garantido',
    ],
  },
} as const;

// Custos de créditos por ação
export const CREDIT_COSTS = {
  // IA
  generate_post: 10,
  generate_caption: 5,
  generate_hashtags: 3,
  generate_image: 50,
  ai_chat: 2,
  
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
