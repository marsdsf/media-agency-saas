// Integração com Asaas
// Documentação: https://docs.asaas.com/

const ASAAS_API_URL = process.env.ASAAS_SANDBOX === 'true' 
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}

interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  value: number;
  cycle: 'MONTHLY' | 'YEARLY';
  status: string;
}

interface CreateCustomerParams {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}

interface CreateSubscriptionParams {
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  value: number;
  cycle: 'MONTHLY' | 'YEARLY';
  description: string;
  externalReference?: string;
}

async function asaasRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${ASAAS_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.description || 'Erro na API do Asaas');
  }

  return data;
}

export const asaas = {
  // Criar cliente
  async createCustomer(params: CreateCustomerParams): Promise<AsaasCustomer> {
    return asaasRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Buscar cliente por email
  async findCustomerByEmail(email: string): Promise<AsaasCustomer | null> {
    const response = await asaasRequest(`/customers?email=${encodeURIComponent(email)}`);
    return response.data?.[0] || null;
  },

  // Criar ou recuperar cliente
  async getOrCreateCustomer(params: CreateCustomerParams): Promise<AsaasCustomer> {
    const existing = await this.findCustomerByEmail(params.email);
    if (existing) return existing;
    return this.createCustomer(params);
  },

  // Criar assinatura
  async createSubscription(params: CreateSubscriptionParams): Promise<AsaasSubscription> {
    return asaasRequest('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        nextDueDate: new Date().toISOString().split('T')[0], // Hoje
      }),
    });
  },

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await asaasRequest(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    });
  },

  // Buscar assinatura
  async getSubscription(subscriptionId: string): Promise<AsaasSubscription> {
    return asaasRequest(`/subscriptions/${subscriptionId}`);
  },

  // Listar pagamentos de uma assinatura
  async getSubscriptionPayments(subscriptionId: string) {
    return asaasRequest(`/subscriptions/${subscriptionId}/payments`);
  },

  // Gerar link de pagamento (checkout)
  async createPaymentLink(params: {
    name: string;
    description: string;
    value: number;
    billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
    chargeType: 'DETACHED' | 'RECURRENT';
    subscriptionCycle?: 'MONTHLY' | 'YEARLY';
    externalReference?: string;
  }) {
    return asaasRequest('/paymentLinks', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        dueDateLimitDays: 10,
        maxInstallmentCount: 1,
      }),
    });
  },

  // Gerar QR Code Pix para pagamento
  async generatePixQrCode(paymentId: string) {
    return asaasRequest(`/payments/${paymentId}/pixQrCode`);
  },
};

export type { AsaasCustomer, AsaasSubscription };
