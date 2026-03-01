import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/auth';
import { getPlanById } from '@/lib/plans';

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
        const agencyId = session.metadata?.agency_id;
        const planId = session.metadata?.plan_id;

        if (agencyId && planId) {
          const plan = getPlanById(planId);
          
          if (plan) {
            await supabaseAdmin
              .from('agencies')
              .update({
                plan: planId,
                ai_credits_limit: plan.limits.aiCredits,
                ai_credits_used: 0,
                max_clients: plan.limits.clients,
                max_team_members: plan.limits.teamMembers,
                stripe_subscription_id: session.subscription,
                subscription_status: 'active',
              })
              .eq('id', agencyId);

            // Registrar transação de créditos
            await supabaseAdmin
              .from('credit_transactions')
              .insert({
                agency_id: agencyId,
                amount: plan.limits.aiCredits,
                type: 'subscription',
                action: 'subscription_activated',
                description: `Assinatura ${plan.name} ativada`,
              });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Buscar agência pelo customer_id
        const { data: agency } = await supabaseAdmin
          .from('agencies')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (agency) {
          await supabaseAdmin
            .from('agencies')
            .update({
              subscription_status: subscription.status,
            })
            .eq('id', agency.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const { data: agency } = await supabaseAdmin
          .from('agencies')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (agency) {
          await supabaseAdmin
            .from('agencies')
            .update({
              plan: 'starter',
              subscription_status: 'canceled',
              stripe_subscription_id: null,
            })
            .eq('id', agency.id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        // Renovação mensal - reset créditos
        if (invoice.billing_reason === 'subscription_cycle') {
          const { data: agency } = await supabaseAdmin
            .from('agencies')
            .select('id, plan, ai_credits_limit')
            .eq('stripe_customer_id', customerId)
            .single();

          if (agency) {
            const plan = getPlanById(agency.plan);
            if (plan) {
              // Reset credits on renewal
              await supabaseAdmin
                .from('agencies')
                .update({ ai_credits_used: 0 })
                .eq('id', agency.id);

              await supabaseAdmin
                .from('credit_transactions')
                .insert({
                  agency_id: agency.id,
                  amount: plan.limits.aiCredits,
                  type: 'subscription',
                  action: 'subscription_renewed',
                  description: `Renovação mensal - ${plan.name}`,
                });
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        const { data: agency } = await supabaseAdmin
          .from('agencies')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (agency) {
          await supabaseAdmin
            .from('agencies')
            .update({ subscription_status: 'past_due' })
            .eq('id', agency.id);
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
