// Integração com Mercado Pago
// Documentação: https://www.mercadopago.com.br/developers/pt/docs

const MP_API_URL = 'https://api.mercadopago.com';
const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

interface MPCustomer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface MPPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

interface MPSubscription {
  id: string;
  payer_id: number;
  status: string;
  reason: string;
  external_reference?: string;
}

async function mpRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${MP_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Erro na API do Mercado Pago');
  }

  return data;
}

export const mercadopago = {
  // Criar preferência de pagamento (checkout)
  async createPreference(params: {
    items: Array<{
      title: string;
      description?: string;
      quantity: number;
      currency_id: string;
      unit_price: number;
    }>;
    payer?: {
      email: string;
      name?: string;
    };
    back_urls?: {
      success: string;
      failure: string;
      pending: string;
    };
    auto_return?: 'approved' | 'all';
    external_reference?: string;
    notification_url?: string;
  }): Promise<MPPreference> {
    return mpRequest('/checkout/preferences', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Criar plano de assinatura
  async createPlan(params: {
    reason: string;
    auto_recurring: {
      frequency: number;
      frequency_type: 'months' | 'days';
      transaction_amount: number;
      currency_id: string;
    };
    back_url: string;
  }) {
    return mpRequest('/preapproval_plan', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Criar assinatura
  async createSubscription(params: {
    preapproval_plan_id: string;
    payer_email: string;
    external_reference?: string;
    back_url: string;
  }): Promise<MPSubscription> {
    return mpRequest('/preapproval', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        reason: 'Assinatura MediaAI',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
        },
      }),
    });
  },

  // Buscar assinatura
  async getSubscription(subscriptionId: string): Promise<MPSubscription> {
    return mpRequest(`/preapproval/${subscriptionId}`);
  },

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await mpRequest(`/preapproval/${subscriptionId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled' }),
    });
  },

  // Buscar pagamento
  async getPayment(paymentId: string) {
    return mpRequest(`/v1/payments/${paymentId}`);
  },

  // Criar checkout com Pix
  async createPixPayment(params: {
    transaction_amount: number;
    description: string;
    payment_method_id: 'pix';
    payer: {
      email: string;
      first_name?: string;
      last_name?: string;
      identification?: {
        type: 'CPF' | 'CNPJ';
        number: string;
      };
    };
    external_reference?: string;
    notification_url?: string;
  }) {
    return mpRequest('/v1/payments', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Gerar link de pagamento recorrente
  async createRecurringCheckout(params: {
    reason: string;
    external_reference: string;
    payer_email: string;
    auto_recurring: {
      frequency: 1;
      frequency_type: 'months';
      transaction_amount: number;
      currency_id: 'BRL';
    };
    back_url: string;
  }) {
    return mpRequest('/preapproval', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

export type { MPCustomer, MPPreference, MPSubscription };
