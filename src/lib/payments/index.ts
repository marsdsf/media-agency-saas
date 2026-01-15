// Configuração dos Gateways de Pagamento
// Suporte para: Stripe, Asaas e Mercado Pago

export type PaymentGateway = 'stripe' | 'asaas' | 'mercadopago';

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    clients: number;
    teamMembers: number;
    aiCredits: number;
  };
  // IDs dos planos em cada gateway
  stripe_price_id?: string;
  asaas_plan_id?: string;
  mercadopago_plan_id?: string;
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 197,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Até 5 clientes',
      '2 membros da equipe',
      '2.000 créditos de IA/mês',
      'Agendamento ilimitado',
      'Relatórios básicos',
      'Suporte por email',
    ],
    limits: {
      clients: 5,
      teamMembers: 2,
      aiCredits: 2000,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 497,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Até 20 clientes',
      '10 membros da equipe',
      '10.000 créditos de IA/mês',
      'Agendamento ilimitado',
      'Relatórios avançados',
      'Portal do cliente',
      'Suporte prioritário',
      'API access',
    ],
    limits: {
      clients: 20,
      teamMembers: 10,
      aiCredits: 10000,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 997,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Clientes ilimitados',
      'Equipe ilimitada',
      '50.000 créditos de IA/mês',
      'Agendamento ilimitado',
      'Relatórios personalizados',
      'Portal do cliente',
      'Suporte 24/7',
      'API access',
      'White-label',
      'Onboarding dedicado',
    ],
    limits: {
      clients: -1, // ilimitado
      teamMembers: -1,
      aiCredits: 50000,
    },
  },
];

export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find(p => p.id === planId);
}

export function formatPrice(price: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(price);
}
