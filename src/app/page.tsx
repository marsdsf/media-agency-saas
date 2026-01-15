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
  Twitter,
  Users,
  Building2,
  Shield,
  Palette,
  FileText,
  MessageSquare
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
            <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">Planos</Link>
            <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">Como Funciona</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold transition-all shadow-lg shadow-violet-500/25"
            >
              Começar Trial Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-8 backdrop-blur-sm">
            <Building2 className="w-4 h-4" />
            Plataforma para Agências de Marketing
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Escale sua agência
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              sem aumentar a equipe
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Gerencie todos os seus clientes em uma única plataforma. 
            IA que cria conteúdo, portal do cliente para aprovação, relatórios automáticos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-lg flex items-center gap-2 transition-all shadow-lg shadow-violet-500/25"
            >
              Testar 14 dias grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#demo" 
              className="px-8 py-4 rounded-xl border border-[#333] bg-[#111] text-white font-medium text-lg hover:bg-[#1a1a1a] transition-all"
            >
              Agendar Demo
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-violet-400" />
              14 dias grátis
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-violet-400" />
              Sem cartão de crédito
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-violet-400" />
              Setup em 5 minutos
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-500">Agências ativas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">15k+</div>
              <div className="text-gray-500">Clientes gerenciados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">2M+</div>
              <div className="text-gray-500">Posts publicados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">40h</div>
              <div className="text-gray-500">Economizadas/mês</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Como funciona</h2>
            <p className="text-gray-400 text-lg">Três tipos de usuários, uma plataforma</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-600/10 to-transparent border border-violet-500/20">
              <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div className="text-violet-400 text-sm font-semibold mb-2">VOCÊ (PLATAFORMA)</div>
              <h3 className="text-2xl font-bold text-white mb-3">Admin Master</h3>
              <p className="text-gray-400 mb-4">Você gerencia todas as agências, planos, pagamentos e tem visão completa do negócio.</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-400" /> Dashboard administrativo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-400" /> Controle de assinaturas</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-violet-400" /> Analytics global</li>
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/20">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="text-purple-400 text-sm font-semibold mb-2">AGÊNCIAS</div>
              <h3 className="text-2xl font-bold text-white mb-3">Seus Clientes</h3>
              <p className="text-gray-400 mb-4">Agências pagam mensalidade e gerenciam múltiplos clientes na plataforma.</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Multi-clientes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Equipe com permissões</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> IA para criar conteúdo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Relatórios white-label</li>
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-fuchsia-600/10 to-transparent border border-fuchsia-500/20">
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-600 flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div className="text-fuchsia-400 text-sm font-semibold mb-2">CLIENTES FINAIS</div>
              <h3 className="text-2xl font-bold text-white mb-3">Clientes da Agência</h3>
              <p className="text-gray-400 mb-4">Portal simplificado para aprovar posts, ver métricas e se comunicar.</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-fuchsia-400" /> Aprovar/rejeitar posts</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-fuchsia-400" /> Ver calendário</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-fuchsia-400" /> Relatórios de resultado</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-fuchsia-400" /> Chat com a agência</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Recursos para Agências</h2>
            <p className="text-gray-400 text-lg">Tudo que sua agência precisa para escalar</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Multi-Clientes', description: 'Gerencie dezenas de clientes em uma única interface organizada.' },
              { icon: Sparkles, title: 'IA que Cria', description: 'Gere posts, legendas, hashtags e roteiros com Inteligência Artificial.' },
              { icon: Calendar, title: 'Calendário Visual', description: 'Planeje o conteúdo de todos os clientes em um calendário intuitivo.' },
              { icon: Shield, title: 'Aprovação de Posts', description: 'Workflow de aprovação: cliente aprova antes de publicar.' },
              { icon: Palette, title: 'White-Label', description: 'Sua marca nos relatórios e portal do cliente (planos avançados).' },
              { icon: FileText, title: 'Relatórios Auto', description: 'Relatórios mensais gerados automaticamente para enviar ao cliente.' },
              { icon: BarChart3, title: 'Analytics Unificado', description: 'Métricas de todas as redes em um só lugar.' },
              { icon: MessageSquare, title: 'Portal do Cliente', description: 'Acesso limitado para o cliente ver e aprovar conteúdo.' },
              { icon: Zap, title: 'Publicação Automática', description: 'Agende e publique em Instagram, TikTok, Facebook e mais.' },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#111] border border-[#1a1a1a] hover:border-violet-500/30 transition-all group">
                <feature.icon className="w-8 h-8 text-violet-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-16 px-6 border-y border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-500 mb-8">Publique e analise em todas as plataformas</p>
          <div className="flex items-center justify-center gap-12">
            <Instagram className="w-10 h-10 text-gray-600 hover:text-violet-400 transition-colors cursor-pointer" />
            <Facebook className="w-10 h-10 text-gray-600 hover:text-violet-400 transition-colors cursor-pointer" />
            <div className="w-10 h-10 text-gray-600 hover:text-violet-400 transition-colors cursor-pointer flex items-center justify-center font-bold text-2xl">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
            </div>
            <Twitter className="w-10 h-10 text-gray-600 hover:text-violet-400 transition-colors cursor-pointer" />
            <Linkedin className="w-10 h-10 text-gray-600 hover:text-violet-400 transition-colors cursor-pointer" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Planos para Agências</h2>
            <p className="text-gray-500 text-lg">Escolha pelo número de clientes que você gerencia</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: 'R$ 197',
                description: 'Para agências iniciantes',
                clients: 'Até 5 clientes',
                features: ['5 clientes', '2 membros da equipe', '3 redes por cliente', '2.000 créditos IA/mês', 'Suporte por email'],
                popular: false,
              },
              {
                name: 'Professional',
                price: 'R$ 497',
                description: 'Para agências em crescimento',
                clients: 'Até 20 clientes',
                features: ['20 clientes', '5 membros da equipe', 'Redes ilimitadas', '10.000 créditos IA/mês', 'Portal do cliente', 'Relatórios automáticos', 'Suporte prioritário'],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'R$ 997',
                description: 'Para grandes agências',
                clients: 'Até 50 clientes',
                features: ['50 clientes', 'Equipe ilimitada', 'Redes ilimitadas', 'Créditos ilimitados', 'White-label completo', 'API access', 'Gerente dedicado'],
                popular: false,
              },
            ].map((plan, i) => (
              <div 
                key={i} 
                className={`p-8 rounded-2xl border relative ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-violet-600/20 to-purple-600/10 border-violet-500/50 shadow-xl shadow-violet-500/10' 
                    : 'bg-[#111] border-[#1a1a1a] hover:border-[#333]'
                } transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{plan.description}</p>
                <p className="text-violet-400 font-semibold mb-4">{plan.clients}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-400 text-sm">
                      <Check className={`w-4 h-4 ${plan.popular ? 'text-violet-400' : 'text-gray-600'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full py-3 rounded-xl text-center font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white'
                      : 'bg-white hover:bg-gray-100 text-black'
                  }`}
                >
                  Começar trial grátis
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-8">
            Precisa de mais? <Link href="#contact" className="text-violet-400 hover:underline">Fale conosco</Link> para um plano personalizado.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Agências que crescem com a gente</h2>
            <p className="text-gray-500 text-lg">Veja o que nossos clientes dizem</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Ricardo Mendes', role: 'CEO @ Digital Plus', text: 'Triplicamos nossa carteira de clientes em 6 meses sem contratar mais ninguém. A IA faz o trabalho pesado.' },
              { name: 'Camila Soares', role: 'Fundadora @ Social Lab', text: 'O portal do cliente mudou nosso jogo. Aprovações que demoravam dias agora são em horas.' },
              { name: 'Fernando Lima', role: 'Diretor @ Mídia360', text: 'ROI absurdo. Pagamos R$497/mês e economizamos pelo menos R$8.000 em mão de obra.' },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#111] border border-[#1a1a1a]">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-violet-400 fill-violet-400" />
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
        <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-violet-600/20 to-purple-600/10 border border-violet-500/20">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para escalar sua agência?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Comece seu trial de 14 dias grátis. Sem cartão de crédito.
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-lg transition-all shadow-lg shadow-violet-500/25"
          >
            Criar conta grátis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
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
