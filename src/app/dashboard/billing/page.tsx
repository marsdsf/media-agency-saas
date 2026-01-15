'use client';

import { useState } from 'react';
import { 
  Check,
  Sparkles,
  Zap,
  Crown,
  CreditCard,
  History,
  Download,
  Calendar,
  QrCode,
  Landmark
} from 'lucide-react';
import { Button, Card, Badge } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { PLANS, formatPrice, type PaymentGateway } from '@/lib/payments';

// Gateways de pagamento disponíveis
const paymentGateways = [
  {
    id: 'pix' as const,
    name: 'Pix',
    description: 'Pagamento instantâneo',
    icon: QrCode,
    gateway: 'asaas' as PaymentGateway,
    fee: '2.99%',
  },
  {
    id: 'mercadopago' as const,
    name: 'Mercado Pago',
    description: 'Cartão, Pix ou Boleto',
    icon: Landmark,
    gateway: 'mercadopago' as PaymentGateway,
    fee: '3.99%',
  },
  {
    id: 'stripe' as const,
    name: 'Cartão Internacional',
    description: 'Visa, Master, Amex',
    icon: CreditCard,
    gateway: 'stripe' as PaymentGateway,
    fee: '3.99%',
  },
];

const plans = PLANS.map((plan, index) => ({
  ...plan,
  icon: index === 0 ? Sparkles : index === 1 ? Zap : Crown,
  gradient: index === 0 ? 'from-gray-600 to-gray-800' : 
            index === 1 ? 'from-violet-600 to-purple-700' : 
            'from-amber-500 to-orange-600',
  popular: index === 1,
}));

const invoices = [
  { id: '1', date: '01/01/2026', amount: 497, status: 'paid', plan: 'Professional' },
  { id: '2', date: '01/12/2025', amount: 497, status: 'paid', plan: 'Professional' },
  { id: '3', date: '01/11/2025', amount: 497, status: 'paid', plan: 'Professional' },
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [selectedGateway, setSelectedGateway] = useState<string>('pix');
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const currentPlan = plans.find(p => p.id === 'professional');
  const currentUsage = {
    credits: 4250,
    limit: 10000,
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentOptions(true);
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      const gateway = paymentGateways.find(g => g.id === selectedGateway);
      if (!gateway) return;

      const endpoint = gateway.gateway === 'stripe' 
        ? '/api/stripe/checkout'
        : gateway.gateway === 'asaas'
        ? '/api/payments/asaas/checkout'
        : '/api/payments/mercadopago/checkout';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          agencyId: 'agency-id-here',
          customerEmail: 'user@email.com',
          billingType: selectedGateway === 'pix' ? 'PIX' : 'CREDIT_CARD',
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Faturamento</h1>
        <p className="text-gray-400">Gerencie seu plano e pagamentos</p>
      </div>

      {/* Current Plan Card */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              'p-3 rounded-xl bg-gradient-to-br',
              currentPlan?.gradient
            )}>
              {currentPlan && <currentPlan.icon className="w-6 h-6 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{currentPlan?.name}</h2>
                <Badge variant="success">Ativo</Badge>
              </div>
              <p className="text-gray-400">
                Renovação em 15 de Fevereiro, 2026
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="text-center px-6 py-3 bg-[#0a0a0a] rounded-xl">
              <p className="text-2xl font-bold text-white">{formatPrice(currentPlan?.price || 0)}</p>
              <p className="text-xs text-gray-500">por mês</p>
            </div>
            <div className="text-center px-6 py-3 bg-[#0a0a0a] rounded-xl">
              <p className="text-2xl font-bold text-white">
                {currentUsage.credits.toLocaleString()}/{currentUsage.limit.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">créditos usados</p>
            </div>
          </div>
        </div>
        
        {/* Usage Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Uso de créditos IA</span>
            <span className="text-white">{Math.round((currentUsage.credits / currentUsage.limit) * 100)}%</span>
          </div>
          <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${(currentUsage.credits / currentUsage.limit) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Planos Disponíveis</h2>
        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={cn(
                'relative p-6 transition-all duration-300 hover:-translate-y-1',
                selectedPlan === plan.id && 'ring-2 ring-violet-500 border-violet-500/50',
                plan.popular && 'border-violet-500/30'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-violet-600">Mais Popular</Badge>
                </div>
              )}
              
              <div className={cn(
                'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4',
                plan.gradient
              )}>
                <plan.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-white">{formatPrice(plan.price)}</span>
                <span className="text-gray-500">/mês</span>
              </div>
              
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full mt-6"
                variant={plan.id === currentPlan?.id ? 'secondary' : 'primary'}
                disabled={plan.id === currentPlan?.id}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.id === currentPlan?.id ? 'Plano Atual' : 'Selecionar'}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Options Modal */}
      {showPaymentOptions && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-white mb-2">Escolha a Forma de Pagamento</h2>
            <p className="text-gray-400 text-sm mb-6">
              Plano selecionado: <span className="text-white font-medium">{plans.find(p => p.id === selectedPlan)?.name}</span>
              {' - '}{formatPrice(plans.find(p => p.id === selectedPlan)?.price || 0)}/mês
            </p>
            
            <div className="space-y-3">
              {paymentGateways.map((gateway) => (
                <button
                  key={gateway.id}
                  onClick={() => setSelectedGateway(gateway.id)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border transition-all',
                    selectedGateway === gateway.id 
                      ? 'bg-violet-500/10 border-violet-500/50' 
                      : 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-violet-500/30'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    selectedGateway === gateway.id ? 'bg-violet-500/20' : 'bg-[#1a1a1a]'
                  )}>
                    <gateway.icon className={cn(
                      'w-6 h-6',
                      selectedGateway === gateway.id ? 'text-violet-400' : 'text-gray-400'
                    )} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-white">{gateway.name}</p>
                    <p className="text-sm text-gray-500">{gateway.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Taxa</p>
                    <p className="text-sm text-white">{gateway.fee}</p>
                  </div>
                  {selectedGateway === gateway.id && (
                    <Check className="w-5 h-5 text-violet-400" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                variant="ghost" 
                className="flex-1"
                onClick={() => setShowPaymentOptions(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? 'Processando...' : 'Continuar'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Invoice History */}
      <Card>
        <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Faturas
          </h2>
          <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Exportar
          </Button>
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{invoice.date}</p>
                  <p className="text-sm text-gray-500">{invoice.plan}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">{formatPrice(invoice.amount)}</span>
                <Badge variant="success">Pago</Badge>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment Methods Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Formas de Pagamento Aceitas
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#0a0a0a] rounded-xl">
            <QrCode className="w-8 h-8 text-green-400 mb-2" />
            <h3 className="font-medium text-white">Pix</h3>
            <p className="text-sm text-gray-500">Pagamento instantâneo via QR Code ou copia e cola</p>
          </div>
          <div className="p-4 bg-[#0a0a0a] rounded-xl">
            <CreditCard className="w-8 h-8 text-blue-400 mb-2" />
            <h3 className="font-medium text-white">Cartão de Crédito</h3>
            <p className="text-sm text-gray-500">Visa, Mastercard, Amex, Elo e mais</p>
          </div>
          <div className="p-4 bg-[#0a0a0a] rounded-xl">
            <Landmark className="w-8 h-8 text-orange-400 mb-2" />
            <h3 className="font-medium text-white">Boleto</h3>
            <p className="text-sm text-gray-500">Compensação em até 3 dias úteis</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
