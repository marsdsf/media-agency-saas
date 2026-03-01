'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  PenTool, 
  Image as ImageIcon, 
  Share, 
  Search as SearchIcon,
  Play,
  Zap,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Send,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { Button, Card, Badge, Textarea } from '@/lib/ui';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  capabilities: string[];
  usageCount: number;
  avgTime: string;
  rating: number;
}

const agents: Agent[] = [
  {
    id: 'maestro',
    name: 'Maestro',
    description: 'Orquestra todos os agentes e coordena o fluxo de trabalho completo da agência.',
    icon: Sparkles,
    gradient: 'bg-gradient-to-br from-white to-gray-200',
    capabilities: ['Análise de briefing', 'Orquestração', 'Controle de qualidade'],
    usageCount: 1250,
    avgTime: '2min',
    rating: 4.9,
  },
  {
    id: 'copywriter',
    name: 'Copywriter',
    description: 'Cria textos persuasivos, headlines impactantes e CTAs que convertem.',
    icon: PenTool,
    gradient: 'bg-gradient-to-br from-gray-300 to-gray-500',
    capabilities: ['Headlines', 'Textos para ads', 'Email marketing', 'Landing pages'],
    usageCount: 3420,
    avgTime: '30s',
    rating: 4.8,
  },
  {
    id: 'image',
    name: 'Image Creator',
    description: 'Gera prompts detalhados para criação de imagens e elementos visuais.',
    icon: ImageIcon,
    gradient: 'bg-gradient-to-br from-gray-400 to-gray-600',
    capabilities: ['Prompts DALL-E', 'Prompts Midjourney', 'Descrições visuais'],
    usageCount: 2180,
    avgTime: '45s',
    rating: 4.7,
  },
  {
    id: 'social',
    name: 'Social Media',
    description: 'Adapta conteúdo para cada plataforma com hashtags e formatos otimizados.',
    icon: Share,
    gradient: 'bg-gradient-to-br from-gray-500 to-gray-700',
    capabilities: ['Posts Instagram', 'Threads Twitter', 'Posts LinkedIn'],
    usageCount: 4560,
    avgTime: '20s',
    rating: 4.9,
  },
  {
    id: 'seo',
    name: 'SEO Expert',
    description: 'Otimiza conteúdo para buscadores com palavras-chave estratégicas.',
    icon: SearchIcon,
    gradient: 'bg-gradient-to-br from-gray-600 to-gray-800',
    capabilities: ['Pesquisa keywords', 'Meta descriptions', 'Títulos SEO'],
    usageCount: 1890,
    avgTime: '1min',
    rating: 4.6,
  },
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!selectedAgent || !prompt) return;
    
    setIsGenerating(true);
    setResult('');
    
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedAgent.id,
          prompt,
          context: `Agente: ${selectedAgent.name}. ${selectedAgent.description}. Capacidades: ${selectedAgent.capabilities.join(', ')}.`,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.content || data.result || 'Resultado gerado com sucesso!');
    } catch (err) {
      // Fallback to local templates on error
      const fallback: Record<string, string> = {
        copywriter: `🚀 **Headline Principal:**\n"${prompt.slice(0, 30)}... que vai transformar seu negócio"\n\n**CTA Sugerido:**\n"Comece agora →"`,
        social: `📱 **Post para Instagram:**\n\n${prompt}\n\n#marketing #digitalmarketing #socialmedia`,
        image: `🎨 **Prompt para geração:**\n\n"Professional ${prompt}, modern minimalist style, high quality, 4k"`,
        seo: `🔍 **Palavra-chave:** "${prompt.split(' ').slice(0, 3).join(' ')}"\n\n**Meta Title:** "${prompt.slice(0, 40)} | Guia Completo"`,
        maestro: `📋 **Plano:** ${prompt}\n\n1. Copywriter → Textos\n2. Image Creator → Visuais\n3. Social Media → Plataformas\n4. SEO → Otimização`,
      };
      setResult(fallback[selectedAgent.id] || 'Erro ao gerar. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <h1 className="text-2xl font-bold text-white relative">Agentes de IA</h1>
        <p className="text-gray-400 mt-1">Escolha um agente para gerar conteúdo personalizado</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Agents List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Selecione um Agente</h2>
          {agents.map((agent) => (
            <Card 
              key={agent.id}
              className={`group p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 ${
                selectedAgent?.id === agent.id 
                  ? 'ring-2 ring-white border-white/50 bg-white/5' 
                  : 'hover:border-white/20 hover:bg-white/[0.02]'
              }`}
              onClick={() => {
                setSelectedAgent(agent);
                setResult('');
              }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${agent.gradient} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <agent.icon className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mt-1">{agent.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {agent.usageCount.toLocaleString()} usos
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {agent.avgTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-white fill-white" />
                      {agent.rating}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedAgent ? (
            <Card className="h-full flex flex-col">
              {/* Agent Header */}
              <div className="p-6 border-b border-[#1a1a1a]">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${selectedAgent.gradient}`}>
                    <selectedAgent.icon className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedAgent.name}</h2>
                    <p className="text-gray-400">{selectedAgent.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedAgent.capabilities.map((cap) => (
                    <Badge key={cap}>{cap}</Badge>
                  ))}
                </div>
              </div>

              {/* Result Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                {result ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-400">Resultado</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={copyToClipboard}
                        leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      >
                        {copied ? 'Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a]">
                      <pre className="whitespace-pre-wrap text-gray-300 text-sm font-sans">
                        {result}
                      </pre>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="secondary" 
                        onClick={() => { setResult(''); handleGenerate(); }}
                        leftIcon={<TrendingUp className="w-4 h-4" />}
                      >
                        Regenerar
                      </Button>
                      <Link href="/dashboard/scheduler">
                        <Button leftIcon={<ArrowRight className="w-4 h-4" />}>
                          Usar no Scheduler
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <div className={`w-16 h-16 rounded-2xl ${selectedAgent.gradient} flex items-center justify-center mx-auto mb-4`}>
                        <selectedAgent.icon className="w-8 h-8 text-black" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Pronto para ajudar!
                      </h3>
                      <p className="text-gray-400 max-w-sm">
                        Digite seu prompt abaixo e deixe o {selectedAgent.name} criar conteúdo incrível para você.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-[#1a1a1a]">
                <div className="flex gap-3">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Ex: ${
                      selectedAgent.id === 'copywriter' ? 'Crie uma headline para uma campanha de Black Friday de uma loja de eletrônicos' :
                      selectedAgent.id === 'social' ? 'Adapte esse texto para Instagram: Nosso novo produto chegou!' :
                      selectedAgent.id === 'image' ? 'Uma imagem de produto tecnológico em fundo futurista' :
                      selectedAgent.id === 'seo' ? 'marketing digital para pequenas empresas' :
                      'Crie uma campanha completa para lançamento de produto'
                    }`}
                    rows={3}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Zap className="w-4 h-4 text-white" />
                    <span>Custo: 5 créditos</span>
                  </div>
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt || isGenerating}
                    leftIcon={isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  >
                    {isGenerating ? 'Gerando...' : 'Gerar'}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
              <div className="text-center relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg shadow-white/10">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Selecione um Agente</h2>
                <p className="text-gray-400 max-w-sm">
                  Escolha um dos agentes de IA ao lado para começar a gerar conteúdo personalizado.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
