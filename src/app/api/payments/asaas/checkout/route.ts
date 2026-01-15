import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { asaas } from '@/lib/payments/asaas';
import { getPlanById } from '@/lib/payments';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { planId, agencyId, customerEmail, customerName, billingType = 'PIX' } = await request.json();

    if (!planId || !agencyId || !customerEmail) {
      return NextResponse.json(
        { error: 'planId, agencyId e customerEmail são obrigatórios' },
        { status: 400 }
      );
    }

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    // Criar ou recuperar cliente no Asaas
    const customer = await asaas.getOrCreateCustomer({
      name: customerName || customerEmail,
      email: customerEmail,
    });

    // Criar assinatura
    const subscription = await asaas.createSubscription({
      customer: customer.id,
      billingType: billingType as 'BOLETO' | 'CREDIT_CARD' | 'PIX',
      value: plan.price,
      cycle: 'MONTHLY',
      description: `Plano ${plan.name} - MediaAI`,
      externalReference: agencyId,
    });

    // Salvar IDs no banco
    await supabase
      .from('agencies')
      .update({
        asaas_customer_id: customer.id,
        asaas_subscription_id: subscription.id,
        subscription_status: 'pending',
        plan: planId,
      })
      .eq('id', agencyId);

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
    });

  } catch (error) {
    console.error('Erro ao criar assinatura Asaas:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    );
  }
}
