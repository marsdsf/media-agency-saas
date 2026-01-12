import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Função para criar cliente admin do Supabase
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key || url === 'sua_url_do_supabase') {
    throw new Error('Supabase not configured');
  }
  
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id;
        const planId = session.metadata?.plan_id as keyof typeof PLANS;

        if (userId && planId) {
          const plan = PLANS[planId];
          
          await supabaseAdmin
            .from('profiles')
            .update({
              plan: planId,
              credits: plan.credits,
              stripe_subscription_id: session.subscription,
              subscription_status: 'active',
            })
            .eq('id', userId);

          // Registrar transação de créditos
          await supabaseAdmin
            .from('credit_transactions')
            .insert({
              user_id: userId,
              amount: plan.credits,
              type: 'subscription',
              description: `Assinatura ${plan.name} ativada`,
              balance_after: plan.credits,
            });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Buscar usuário pelo customer_id
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: subscription.status,
            })
            .eq('id', profile.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({
              plan: 'free',
              subscription_status: 'canceled',
              stripe_subscription_id: null,
            })
            .eq('id', profile.id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        // Renovação mensal - adicionar créditos
        if (invoice.billing_reason === 'subscription_cycle') {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, plan, credits')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile && profile.plan !== 'free') {
            const plan = PLANS[profile.plan as keyof typeof PLANS];
            const newCredits = profile.credits + plan.credits;

            await supabaseAdmin
              .from('profiles')
              .update({ credits: newCredits })
              .eq('id', profile.id);

            await supabaseAdmin
              .from('credit_transactions')
              .insert({
                user_id: profile.id,
                amount: plan.credits,
                type: 'subscription',
                description: `Renovação mensal - ${plan.name}`,
                balance_after: newCredits,
              });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_status: 'past_due' })
            .eq('id', profile.id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
