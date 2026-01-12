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
  TrendingUp,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { Button, Card, Badge } from '@/lib/ui';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 97,
    description: 'Para criadores individuais',
    credits: 1000,
    features: [
      '1.000 créditos/mês',
      '3 redes sociais',
      'Agendamento básico',
      'Suporte por email',
      '5 projetos ativos',
    ],
    icon: Sparkles,
    gradient: 'from-gray-600 to-gray-800',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 197,
    description: 'Para pequenas equipes',
    credits: 5000,
    features: [
      '5.000 créditos/mês',
      'Redes ilimitadas',
      'IA avançada',
      'Analytics completo',
      'Suporte prioritário',
      'Projetos ilimitados',
      'Colaboradores (até 3)',
    ],
    icon: Zap,
    gradient: 'from-white to-gray-200',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 497,
    description: 'Para agências',
    credits: -1, // Ilimitado
    features: [
      'Créditos ilimitados',
      'Multi-clientes',
      'API completa',
      'White-label',
      'Gerente dedicado',
      'SLA garantido',
      'Treinamento personalizado',
    ],
    icon: Crown,
    gradient: 'from-gray-400 to-gray-600',
    popular: false,
  },
];

const usageHistory = [
  { date: '2026-01-11', action: 'Geração de Copy', credits: 5, agent: 'Copywriter' },
  { date: '2026-01-11', action: 'Post Agendado', credits: 2, agent: 'Social Media' },
  { date: '2026-01-10', action: 'Prompt de Imagem', credits: 8, agent: 'Image Creator' },
  { date: '2026-01-10', action: 'Análise SEO', credits: 5, agent: 'SEO Expert' },
  { date: '2026-01-09', action: 'Workflow Completo', credits: 45, agent: 'Maestro' },
  { date: '2026-01-09', action: 'Geração de Copy', credits: 5, agent: 'Copywriter' },
];

const invoices = [
  { id: 'INV-001', date: '2026-01-01', amount: 197, status: 'paid' },
  { id: 'INV-002', date: '2025-12-01', amount: 197, status: 'paid' },
  { id: 'INV-003', date: '2025-11-01', amount: 97, status: 'paid' },
];

export default function BillingPage() {
  const [currentPlan] = useState('professional');
  const [creditsUsed] = useState(2550);
  const [creditsTotal] = useState(5000);

  const creditsPercentage = (creditsUsed / creditsTotal) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Planos e Cobrança</h1>
        <p className="text-gray-400 mt-1">Gerencie sua assinatura e créditos</p>
      </div>

      {/* Current Usage */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Uso de Créditos</h2>
              <p className="text-sm text-gray-400">Período atual: Janeiro 2026</p>
            </div>
            <Badge variant="info">Professional</Badge>
          </div>
          
          <div className="mb-4">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-4xl font-bold text-white">{creditsUsed.toLocaleString()}</span>
                <span className="text-gray-400 ml-2">/ {creditsTotal.toLocaleString()} créditos</span>
              </div>
              <span className="text-sm text-gray-400">{Math.round(creditsPercentage)}% usado</span>
            </div>
            <div className="w-full h-3 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  creditsPercentage > 90 ? 'bg-red-500' : 
                  creditsPercentage > 70 ? 'bg-amber-500' : 
                  'bg-gradient-to-r from-gray-600 to-white'
                }`}
                style={{ width: `${creditsPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1a1a2e]">
            <div>
              <p className="text-sm text-gray-400">Restantes</p>
              <p className="text-xl font-bold text-white">{(creditsTotal - creditsUsed).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Média/dia</p>
              <p className="text-xl font-bold text-white">232</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Projeção</p>
              <p className="text-xl font-bold text-amber-400">7.192</p>
            </div>
          </div>

          {creditsPercentage > 80 && (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="flex-1">
                <p className="text-amber-400 text-sm font-medium">Créditos acabando</p>
                <p className="text-amber-400/70 text-xs">Considere fazer upgrade do seu plano</p>
              </div>
              <Button size="sm" variant="secondary">
                Upgrade
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Próxima Cobrança</h3>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-white">R$ 197</p>
            <p className="text-gray-400 mt-1">em 01/02/2026</p>
          </div>
          <div className="space-y-3 pt-4 border-t border-[#1a1a2e]">
            <div className="flex items-center gap-3 text-sm">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Visa •••• 4242</span>
            </div>
            <Button variant="ghost" size="sm" className="w-full">
              Alterar método de pagamento
            </Button>
          </div>
        </Card>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-6">Planos Disponíveis</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden ${
                plan.popular ? 'ring-2 ring-white shadow-lg shadow-white/10' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-black to-gray-800 text-white text-xs font-medium rounded-bl-xl">
                  Atual
                </div>
              )}
              <div className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">R$ {plan.price}</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-white shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={currentPlan === plan.id ? 'secondary' : 'primary'}
                  className="w-full"
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id ? 'Plano Atual' : 
                   plans.findIndex(p => p.id === currentPlan) < plans.findIndex(p => p.id === plan.id) 
                    ? 'Fazer Upgrade' : 'Downgrade'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Usage History & Invoices */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Usage History */}
        <Card>
          <div className="p-6 border-b border-[#1a1a2e] flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Histórico de Uso</h3>
            <Button variant="ghost" size="sm" leftIcon={<TrendingUp className="w-4 h-4" />}>
              Ver tudo
            </Button>
          </div>
          <div className="divide-y divide-[#1a1a2e]">
            {usageHistory.map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{item.action}</p>
                  <p className="text-sm text-gray-500">{item.agent} • {item.date}</p>
                </div>
                <span className="text-amber-400 font-medium">-{item.credits}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Invoices */}
        <Card>
          <div className="p-6 border-b border-[#1a1a2e] flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Faturas</h3>
            <Button variant="ghost" size="sm" leftIcon={<History className="w-4 h-4" />}>
              Histórico
            </Button>
          </div>
          <div className="divide-y divide-[#1a1a2e]">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-[#1a1a2e]">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{invoice.id}</p>
                    <p className="text-sm text-gray-500">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white font-medium">R$ {invoice.amount}</p>
                    <Badge variant="success">Pago</Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
