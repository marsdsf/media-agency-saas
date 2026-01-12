import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  Calendar, 
  Zap, 
  BarChart3, 
  ArrowRight, 
  Check, 
  Star,
  Instagram,
  Facebook,
  Linkedin,
  Twitter
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a] bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image src="/logo.svg" alt="MediaAI" width={40} height={40} />
            </div>
            <span className="text-xl font-bold text-white">MediaAI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-400 hover:text-white transition-colors">Recursos</Link>
            <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">Preços</Link>
            <Link href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Depoimentos</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black font-semibold transition-all shadow-lg shadow-white/10"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/3 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-white/5 to-transparent rounded-full blur-[150px]" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Potencializado por IA
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Sua agência de mídia
            <br />
            <span className="bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent">
              no piloto automático
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Crie, agende e publique posts em todas as redes sociais com o poder da Inteligência Artificial. 
            Economize horas de trabalho toda semana.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black font-semibold text-lg flex items-center gap-2 transition-all shadow-lg shadow-white/20"
            >
              Começar Grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#demo" 
              className="px-8 py-4 rounded-xl border border-[#333] bg-gradient-to-r from-[#111] to-[#0a0a0a] text-white font-medium text-lg hover:from-[#1a1a1a] hover:to-[#111] transition-all"
            >
              Ver Demo
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-white" />
              1.000 créditos grátis
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-white" />
              Sem cartão de crédito
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-white" />
              Cancele quando quiser
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-12 px-6 border-y border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-600 mb-8">Publique em todas as plataformas</p>
          <div className="flex items-center justify-center gap-12">
            <Instagram className="w-8 h-8 text-gray-700 hover:text-white hover:scale-125 transition-all duration-300 cursor-pointer" />
            <Facebook className="w-8 h-8 text-gray-700 hover:text-white hover:scale-125 transition-all duration-300 cursor-pointer" />
            <Twitter className="w-8 h-8 text-gray-700 hover:text-white hover:scale-125 transition-all duration-300 cursor-pointer" />
            <Linkedin className="w-8 h-8 text-gray-700 hover:text-white hover:scale-125 transition-all duration-300 cursor-pointer" />
            <div className="w-8 h-8 text-gray-700 hover:text-white hover:scale-125 transition-all duration-300 cursor-pointer flex items-center justify-center font-bold text-xl">
              𝕏
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Tudo que você precisa</h2>
            <p className="text-gray-400 text-lg">Ferramentas poderosas para automatizar sua criação de conteúdo</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Agendamento Inteligente',
                description: 'Agende posts para o melhor horário de cada plataforma automaticamente.',
              },
              {
                icon: Sparkles,
                title: 'Geração com IA',
                description: 'Crie textos, hashtags e até imagens com Inteligência Artificial.',
              },
              {
                icon: BarChart3,
                title: 'Analytics Avançados',
                description: 'Acompanhe o desempenho dos seus posts em tempo real.',
              },
              {
                icon: Zap,
                title: 'Automação Total',
                description: 'Configure uma vez e deixe a IA trabalhar por você.',
              },
              {
                icon: Calendar,
                title: 'Calendário Visual',
                description: 'Visualize todos os posts do mês em um calendário intuitivo.',
              },
              {
                icon: Star,
                title: 'Preview Real',
                description: 'Veja exatamente como seu post vai aparecer em cada rede.',
              },
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-gradient-to-br from-[#0a0a0a] to-[#080808] border border-[#1a1a1a] hover:border-white/30 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-gray-200 flex items-center justify-center mb-4 shadow-lg shadow-white/10 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-gray-100 transition-colors">{feature.title}</h3>
                <p className="text-gray-500 group-hover:text-gray-400 transition-colors">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Planos simples e transparentes</h2>
            <p className="text-gray-500 text-lg">Escolha o plano ideal para o tamanho da sua operação</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: 'R$ 97',
                description: 'Para criadores individuais',
                features: ['1.000 créditos/mês', '3 redes sociais', 'Agendamento básico', 'Suporte por email'],
                popular: false,
              },
              {
                name: 'Professional',
                price: 'R$ 197',
                description: 'Para pequenas equipes',
                features: ['5.000 créditos/mês', 'Redes ilimitadas', 'IA avançada', 'Analytics completo', 'Suporte prioritário'],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'R$ 497',
                description: 'Para agências',
                features: ['Créditos ilimitados', 'Multi-clientes', 'API completa', 'White-label', 'Gerente dedicado'],
                popular: false,
              },
            ].map((plan, i) => (
              <div 
                key={i} 
                className={`p-8 rounded-2xl border ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-white to-gray-100 text-black border-white shadow-2xl shadow-white/20' 
                    : 'bg-gradient-to-br from-[#0a0a0a] to-[#080808] border-[#1a1a1a] hover:border-white/20'
                } relative transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-black to-gray-800 text-white text-sm font-semibold shadow-lg">
                    Mais Popular
                  </div>
                )}
                <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? 'text-black' : 'text-white'}`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.popular ? 'text-gray-600' : 'text-gray-500'}`}>{plan.description}</p>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-black' : 'text-white'}`}>{plan.price}</span>
                  <span className={plan.popular ? 'text-gray-600' : 'text-gray-500'}>/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className={`flex items-center gap-3 ${plan.popular ? 'text-gray-700' : 'text-gray-400'}`}>
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-black' : 'text-white'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full py-3 rounded-xl text-center font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white'
                      : 'bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black'
                  }`}
                >
                  Começar agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Amado por criadores</h2>
            <p className="text-gray-500 text-lg">Veja o que nossos clientes dizem</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Maria Silva', role: 'Social Media', text: 'Economizo 10 horas por semana com o agendamento automático. Incrível!' },
              { name: 'João Santos', role: 'Designer Freelancer', text: 'A IA gera textos que parecem escritos por humanos. Meus clientes adoram.' },
              { name: 'Ana Costa', role: 'Dono de Agência', text: 'Consegui triplicar minha carteira de clientes sem contratar mais pessoas.' },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-gradient-to-br from-[#0a0a0a] to-[#080808] border border-[#1a1a1a] hover:border-white/20 hover:shadow-lg hover:shadow-white/5 transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-white fill-white drop-shadow-sm" />
                  ))}
                </div>
                <p className="text-gray-400 mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-gray-600">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-[#1a1a1a]">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para automatizar sua agência?
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Comece gratuitamente hoje e veja a diferença que a IA pode fazer.
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black font-semibold text-lg transition-all shadow-xl shadow-white/20"
          >
            Criar conta grátis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#1a1a1a] bg-gradient-to-t from-[#050505] to-transparent">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden shadow-lg shadow-white/10">
              <Image src="/logo.svg" alt="MediaAI" width={32} height={32} />
            </div>
            <span className="text-white font-semibold">MediaAI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contato</Link>
          </div>
          <p className="text-sm text-gray-600">© 2026 MediaAI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
