// Configuração dos Gateways de Pagamento
// Usa definições centralizadas de @/lib/plans

import { PLANS as UNIFIED_PLANS, getPlanById, formatPrice } from '@/lib/plans';
import type { Plan, PlanId, PaymentGateway } from '@/lib/plans';

// Re-export tudo da fonte centralizada
export { getPlanById, formatPrice };
export type { Plan, PlanId, PaymentGateway };

// Para compatibilidade - exporta como array
export const PLANS: Plan[] = Object.values(UNIFIED_PLANS);
