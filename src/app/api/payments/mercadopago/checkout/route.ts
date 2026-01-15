import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mercadopago } from '@/lib/payments/mercadopago';
import { getPlanById } from '@/lib/payments';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const { planId, agencyId, customerEmail, customerName } = await request.json();

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

    // Criar checkout de assinatura recorrente
    const subscription = await mercadopago.createRecurringCheckout({
      reason: `Plano ${plan.name} - MediaAI`,
      external_reference: agencyId,
      payer_email: customerEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: plan.price,
        currency_id: 'BRL',
      },
      back_url: `${APP_URL}/dashboard/billing?success=true`,
    });

    // Salvar referência no banco
    await supabase
      .from('agencies')
      .update({
        mercadopago_subscription_id: subscription.id,
        subscription_status: 'pending',
        plan: planId,
      })
      .eq('id', agencyId);

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      checkoutUrl: subscription.init_point || subscription.sandbox_init_point,
    });

  } catch (error) {
    console.error('Erro ao criar checkout Mercado Pago:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    );
  }
}
