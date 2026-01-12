'use client';

import { useState } from 'react';
import { 
  Search,
  Filter,
  Plus,
  Copy,
  Edit,
  Trash2,
  Star,
  StarOff,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Briefcase,
  Utensils,
  Dumbbell,
  ShoppingBag,
  Palette,
  Code,
  Heart,
  Building,
  Sparkles,
  Clock,
  Eye,
  Check
} from 'lucide-react';
import { Button, Card, Input, Badge, Modal } from '@/lib/ui';
import { cn } from '@/lib/utils';

const FaTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const categories = [
  { id: 'all', label: 'Todos', icon: Sparkles },
  { id: 'business', label: 'Negócios', icon: Briefcase },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'tech', label: 'Tech', icon: Code },
  { id: 'health', label: 'Saúde', icon: Heart },
  { id: 'realestate', label: 'Imóveis', icon: Building },
];

const templates = [
  {
    id: '1',
    title: 'Lançamento de Produto',
    description: 'Template para anunciar novos produtos com destaque',
    category: 'ecommerce',
    platforms: ['instagram', 'facebook'],
    content: '🚀 LANÇAMENTO EXCLUSIVO!\n\n[Nome do Produto] chegou para revolucionar sua rotina.\n\n✨ [Benefício 1]\n✨ [Benefício 2]\n✨ [Benefício 3]\n\n🔥 Oferta de lançamento: [Desconto]% OFF\n⏰ Por tempo limitado!\n\n👉 Link na bio\n\n#lancamento #novidade #[nicho]',
    usageCount: 1250,
    rating: 4.8,
    isFavorite: true,
    createdBy: 'Sistema',
    preview: '🚀 LANÇAMENTO EXCLUSIVO! Produto chegou para revolucionar...',
  },
  {
    id: '2',
    title: 'Carrossel Educativo',
    description: 'Sequência de dicas e informações valiosas',
    category: 'business',
    platforms: ['instagram', 'linkedin'],
    content: '📚 [Título do Carrossel]\n\nSlide 1: Introdução atrativa\nSlide 2: Dica/Info 1\nSlide 3: Dica/Info 2\nSlide 4: Dica/Info 3\nSlide 5: Dica/Info 4\nSlide 6: CTA + Salva esse post!\n\n💡 Qual dica você mais curtiu?\nComenta aqui! 👇\n\n#dicas #[nicho] #aprendizado',
    usageCount: 890,
    rating: 4.6,
    isFavorite: false,
    createdBy: 'Sistema',
    preview: '📚 [Título do Carrossel] - Dicas valiosas em formato de slides...',
  },
  {
    id: '3',
    title: 'Antes e Depois',
    description: 'Mostrar transformações e resultados',
    category: 'fitness',
    platforms: ['instagram', 'tiktok'],
    content: '💪 TRANSFORMAÇÃO REAL!\n\n📅 [Tempo de transformação]\n\n🔥 ANTES:\n• [Situação anterior]\n\n✨ DEPOIS:\n• [Resultado alcançado]\n\n📌 O que mudou:\n→ [Mudança 1]\n→ [Mudança 2]\n→ [Mudança 3]\n\nVocê também pode! 🚀\n\n#transformacao #antesedepois #fitness #resultado',
    usageCount: 2340,
    rating: 4.9,
    isFavorite: true,
    createdBy: 'Sistema',
    preview: '💪 TRANSFORMAÇÃO REAL! Resultado de [X] semanas...',
  },
  {
    id: '4',
    title: 'Receita Passo a Passo',
    description: 'Template para compartilhar receitas',
    category: 'food',
    platforms: ['instagram', 'tiktok', 'facebook'],
    content: '🍳 [NOME DA RECEITA]\n\n⏱️ Tempo: [X] minutos\n👥 Rende: [X] porções\n\n📝 INGREDIENTES:\n• [Ingrediente 1]\n• [Ingrediente 2]\n• [Ingrediente 3]\n\n👨‍🍳 MODO DE PREPARO:\n1. [Passo 1]\n2. [Passo 2]\n3. [Passo 3]\n\n💡 Dica: [Dica especial]\n\nSalva pra fazer depois! 📌\n\n#receita #food #culinaria',
    usageCount: 1560,
    rating: 4.7,
    isFavorite: false,
    createdBy: 'Sistema',
    preview: '🍳 [NOME DA RECEITA] - Receita rápida e deliciosa...',
  },
  {
    id: '5',
    title: 'Depoimento de Cliente',
    description: 'Prova social com feedback real',
    category: 'business',
    platforms: ['instagram', 'facebook', 'linkedin'],
    content: '⭐ O QUE NOSSOS CLIENTES DIZEM:\n\n"[Depoimento do cliente aqui - seja específico sobre resultados]"\n\n— [Nome do Cliente], [Cargo/Cidade]\n\n✅ [Resultado específico 1]\n✅ [Resultado específico 2]\n\n🤝 Quer resultados assim também?\n👉 Link na bio\n\n#depoimento #cliente #resultado #sucesso',
    usageCount: 780,
    rating: 4.5,
    isFavorite: false,
    createdBy: 'Sistema',
    preview: '⭐ O QUE NOSSOS CLIENTES DIZEM: "Depoimento incrível..."',
  },
  {
    id: '6',
    title: 'Behind the Scenes',
    description: 'Bastidores do negócio para humanizar',
    category: 'business',
    platforms: ['instagram', 'tiktok'],
    content: '🎬 BASTIDORES!\n\nHoje você vai ver como é o dia a dia aqui na [Empresa]...\n\n[Descrição do que está acontecendo]\n\nMuita gente não sabe, mas:\n→ [Curiosidade 1]\n→ [Curiosidade 2]\n\n💬 Quer ver mais conteúdos assim?\n\n#bastidores #rotina #behindthescenes',
    usageCount: 650,
    rating: 4.4,
    isFavorite: true,
    createdBy: 'Sistema',
    preview: '🎬 BASTIDORES! Hoje você vai ver como é o dia a dia...',
  },
  {
    id: '7',
    title: 'Dica Rápida',
    description: 'Conteúdo educativo objetivo',
    category: 'tech',
    platforms: ['twitter', 'linkedin'],
    content: '💡 DICA RÁPIDA:\n\n[Título da dica]\n\n➡️ [Explicação concisa]\n\n📌 Por que isso funciona:\n[Breve explicação]\n\n🔗 Mais dicas no perfil!\n\n#dica #hack #produtividade',
    usageCount: 1120,
    rating: 4.6,
    isFavorite: false,
    createdBy: 'Sistema',
    preview: '💡 DICA RÁPIDA: [Título] - Explicação objetiva...',
  },
  {
    id: '8',
    title: 'Imóvel à Venda',
    description: 'Anúncio profissional de imóvel',
    category: 'realestate',
    platforms: ['instagram', 'facebook'],
    content: '🏠 À VENDA - [Bairro/Cidade]\n\n📐 [X]m² | 🛏️ [X] quartos | 🚗 [X] vagas\n\n✨ DESTAQUES:\n• [Característica 1]\n• [Característica 2]\n• [Característica 3]\n\n💰 R$ [Valor]\n📍 [Endereço aproximado]\n\n📲 Agende sua visita!\n📞 [Telefone]\n\n#imovel #venda #[cidade] #corretor',
    usageCount: 430,
    rating: 4.3,
    isFavorite: false,
    createdBy: 'Sistema',
    preview: '🏠 À VENDA - [Bairro/Cidade] - 3 quartos, 2 vagas...',
  },
];

const platformIcons: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: FaTiktok,
};

const platformColors: Record<string, string> = {
  instagram: 'bg-white/20 text-white',
  facebook: 'bg-white/20 text-white',
  twitter: 'bg-gray-400/20 text-gray-300',
  linkedin: 'bg-gray-500/20 text-gray-300',
  tiktok: 'bg-white/20 text-white',
};

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['1', '3', '6']);
  const [copied, setCopied] = useState(false);

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const copyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Templates de Posts</h1>
          <p className="text-gray-400 mt-1">Modelos prontos para acelerar sua criação</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} className="group">
          <span className="group-hover:scale-105 transition-transform inline-block">Criar Template</span>
        </Button>
      </div>

      {/* Search and Categories */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:-translate-y-0.5',
                selectedCategory === cat.id
                  ? 'bg-white/20 text-white border border-white/30 shadow-lg shadow-white/10'
                  : 'bg-[#12121f] text-gray-400 border border-transparent hover:text-white hover:bg-white/5 hover:shadow-md hover:shadow-white/5'
              )}
            >
              <cat.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden group hover:ring-1 hover:ring-white/30 hover:-translate-y-2 hover:shadow-xl hover:shadow-white/10 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-gray-200 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                </div>
                <button
                  onClick={() => toggleFavorite(template.id)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-110"
                >
                  {favorites.includes(template.id) ? (
                    <Star className="w-5 h-5 text-white fill-white" />
                  ) : (
                    <StarOff className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-xl bg-[#1a1a2e] mb-4">
                <p className="text-gray-300 text-sm line-clamp-3">{template.preview}</p>
              </div>

              {/* Platforms */}
              <div className="flex items-center gap-2 mb-4">
                {template.platforms.map((platform) => {
                  const Icon = platformIcons[platform];
                  return (
                    <div key={platform} className={cn('p-1.5 rounded-lg', platformColors[platform])}>
                      <Icon className="w-4 h-4" />
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {template.usageCount.toLocaleString()} usos
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-white" />
                  {template.rating}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-[#0f0f1a] border-t border-[#1a1a2e] flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={() => setSelectedTemplate(template)}
              >
                Ver
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex-1"
                leftIcon={<Copy className="w-4 h-4" />}
                onClick={() => copyTemplate(template.content)}
              >
                Copiar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum template encontrado</p>
          <p className="text-sm text-gray-500 mt-1">Tente ajustar sua busca ou filtros</p>
        </div>
      )}

      {/* Template Preview Modal */}
      <Modal
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        title={selectedTemplate?.title || ''}
        size="lg"
      >
        {selectedTemplate && (
          <div className="space-y-6">
            <p className="text-gray-400">{selectedTemplate.description}</p>

            {/* Platforms */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Plataformas:</span>
              {selectedTemplate.platforms.map((platform) => {
                const Icon = platformIcons[platform];
                return (
                  <div key={platform} className={cn('p-2 rounded-lg', platformColors[platform])}>
                    <Icon className="w-4 h-4" />
                  </div>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-6 rounded-xl bg-[#1a1a2e] border border-[#2a2a4a]">
              <pre className="text-gray-200 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {selectedTemplate.content}
              </pre>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                {selectedTemplate.usageCount.toLocaleString()} usos
              </span>
              <span className="flex items-center gap-2 text-gray-400">
                <Star className="w-4 h-4 text-white" />
                {selectedTemplate.rating} avaliação
              </span>
              <span className="text-gray-500">
                Criado por: {selectedTemplate.createdBy}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[#1a1a2e]">
              <Button 
                className="flex-1"
                leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                onClick={() => copyTemplate(selectedTemplate.content)}
              >
                {copied ? 'Copiado!' : 'Copiar Template'}
              </Button>
              <Button 
                variant="secondary"
                className="flex-1"
                leftIcon={<Edit className="w-4 h-4" />}
              >
                Usar no Agendador
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
