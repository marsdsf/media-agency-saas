import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { planId } = await request.json();
    const plan = PLANS[planId as keyof typeof PLANS];

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    // Buscar ou criar customer no Stripe via agency
    const { data: agency } = await supabase
      .from('agencies')
      .select('stripe_customer_id, name')
      .eq('id', ctx.agencyId)
      .single();

    let customerId = agency?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: ctx.email,
        name: agency?.name,
        metadata: {
          agency_id: ctx.agencyId,
          supabase_user_id: ctx.userId,
        },
      });
      customerId = customer.id;

      // Salvar customer_id na agência
      await supabase
        .from('agencies')
        .update({ stripe_customer_id: customerId })
        .eq('id', ctx.agencyId);
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        agency_id: ctx.agencyId,
        plan_id: planId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão de pagamento' },
      { status: 500 }
    );
  }
}
