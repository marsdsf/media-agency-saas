import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPlanById } from '@/lib/payments';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Webhook do Asaas
// Configure a URL: https://www.mediamars.com.br/api/payments/asaas/webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Asaas Webhook:', body.event, body);

    const { event, payment, subscription } = body;

    switch (event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED': {
        // Pagamento confirmado
        const externalReference = payment?.externalReference || subscription?.externalReference;
        
        if (externalReference) {
          await supabase
            .from('agencies')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', externalReference);
        }
        break;
      }

      case 'PAYMENT_OVERDUE': {
        // Pagamento atrasado
        const externalReference = payment?.externalReference;
        
        if (externalReference) {
          await supabase
            .from('agencies')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('id', externalReference);
        }
        break;
      }

      case 'SUBSCRIPTION_DELETED':
      case 'SUBSCRIPTION_INACTIVE': {
        // Assinatura cancelada
        const externalReference = subscription?.externalReference;
        
        if (externalReference) {
          await supabase
            .from('agencies')
            .update({
              subscription_status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', externalReference);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erro no webhook Asaas:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    );
  }
}
