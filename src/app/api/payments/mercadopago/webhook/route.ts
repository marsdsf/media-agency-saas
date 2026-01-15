import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mercadopago } from '@/lib/payments/mercadopago';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Webhook do Mercado Pago
// Configure a URL: https://seu-dominio.com/api/payments/mercadopago/webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Mercado Pago Webhook:', body.type, body);

    const { type, data } = body;

    switch (type) {
      case 'payment': {
        // Buscar detalhes do pagamento
        const payment = await mercadopago.getPayment(data.id);
        
        if (payment.external_reference) {
          const status = payment.status === 'approved' ? 'active' : 
                        payment.status === 'pending' ? 'pending' : 'failed';
          
          await supabase
            .from('agencies')
            .update({
              subscription_status: status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.external_reference);
        }
        break;
      }

      case 'subscription_preapproval': {
        // Atualização de assinatura
        const subscription = await mercadopago.getSubscription(data.id);
        
        if (subscription.external_reference) {
          const status = subscription.status === 'authorized' ? 'active' :
                        subscription.status === 'pending' ? 'pending' :
                        subscription.status === 'cancelled' ? 'cancelled' : 'failed';
          
          await supabase
            .from('agencies')
            .update({
              subscription_status: status,
              mercadopago_subscription_id: subscription.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.external_reference);
        }
        break;
      }

      case 'subscription_authorized_payment': {
        // Pagamento autorizado na assinatura
        const payment = await mercadopago.getPayment(data.id);
        
        if (payment.external_reference) {
          await supabase
            .from('agencies')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.external_reference);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erro no webhook Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    );
  }
}
