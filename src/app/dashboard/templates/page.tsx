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
  Check,
  Loader2
} from 'lucide-react';
import { Button, Card, Input, Badge, Modal } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useTemplates, useApiMutation } from '@/hooks/useApiData';

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
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: '', content: '', category: 'business', platforms: ['instagram'] });

  const categoryParam = selectedCategory === 'all' ? undefined : selectedCategory;
  const { data: templates, loading, refetch } = useTemplates(categoryParam);
  const createMutation = useApiMutation('/api/templates', 'POST');

  const templatesList: any[] = templates || [];

  const filteredTemplates = templatesList.filter((t: any) => {
    const matchesSearch = (t.title || t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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

  const handleCreate = async () => {
    if (!newTemplate.title || !newTemplate.content) return;
    await createMutation.execute({
      title: newTemplate.title,
      content: newTemplate.content,
      category: newTemplate.category,
      platforms: newTemplate.platforms,
    });
    setNewTemplate({ title: '', content: '', category: 'business', platforms: ['instagram'] });
    setShowCreate(false);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Templates de Posts</h1>
          <p className="text-gray-400 mt-1">Modelos prontos para acelerar sua criação</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} className="group" onClick={() => setShowCreate(true)}>
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
                <p className="text-gray-300 text-sm line-clamp-3">{(template.content || '').substring(0, 120)}...</p>
              </div>

              {/* Platforms */}
              <div className="flex items-center gap-2 mb-4">
                {(template.platforms || []).map((platform: string) => {
                  const Icon = platformIcons[platform];
                  if (!Icon) return null;
                  return (
                    <div key={platform} className={cn('p-1.5 rounded-lg', platformColors[platform] || 'bg-white/10 text-white')}>
                      <Icon className="w-4 h-4" />
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {template.metadata?.usageCount != null && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Number(template.metadata.usageCount).toLocaleString()} usos
                  </span>
                )}
                {template.metadata?.rating != null && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-white" />
                    {template.metadata.rating}
                  </span>
                )}
                {template.created_at && (
                  <span className="text-gray-500 text-xs">
                    {new Date(template.created_at).toLocaleDateString('pt-BR')}
                  </span>
                )}
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
              {(selectedTemplate.platforms || []).map((platform: string) => {
                const Icon = platformIcons[platform];
                if (!Icon) return null;
                return (
                  <div key={platform} className={cn('p-2 rounded-lg', platformColors[platform] || 'bg-white/10 text-white')}>
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
              {selectedTemplate.metadata?.usageCount != null && (
                <span className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  {Number(selectedTemplate.metadata.usageCount).toLocaleString()} usos
                </span>
              )}
              {selectedTemplate.metadata?.rating != null && (
                <span className="flex items-center gap-2 text-gray-400">
                  <Star className="w-4 h-4 text-white" />
                  {selectedTemplate.metadata.rating} avaliação
                </span>
              )}
              {selectedTemplate.created_at && (
                <span className="text-gray-500">
                  Criado em: {new Date(selectedTemplate.created_at).toLocaleDateString('pt-BR')}
                </span>
              )}
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

      {/* Create Template Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Criar Template"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Título</label>
            <Input
              placeholder="Nome do template"
              value={newTemplate.title}
              onChange={(e) => setNewTemplate(p => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Categoria</label>
            <select
              value={newTemplate.category}
              onChange={(e) => setNewTemplate(p => ({ ...p, category: e.target.value }))}
              className="w-full bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg px-3 py-2 text-white text-sm"
            >
              {categories.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Plataformas</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(platformIcons).map(([key, Icon]) => (
                <button
                  key={key}
                  onClick={() => {
                    setNewTemplate(p => ({
                      ...p,
                      platforms: p.platforms.includes(key)
                        ? p.platforms.filter(pl => pl !== key)
                        : [...p.platforms, key]
                    }));
                  }}
                  className={cn(
                    'p-2 rounded-lg border transition-all',
                    newTemplate.platforms.includes(key)
                      ? 'border-white/30 bg-white/10 text-white'
                      : 'border-transparent bg-[#1a1a2e] text-gray-500'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Conteúdo</label>
            <textarea
              rows={8}
              placeholder="Escreva o conteúdo do template..."
              value={newTemplate.content}
              onChange={(e) => setNewTemplate(p => ({ ...p, content: e.target.value }))}
              className="w-full bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg px-3 py-2 text-white text-sm resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              leftIcon={createMutation.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              onClick={handleCreate}
              disabled={createMutation.loading || !newTemplate.title || !newTemplate.content}
            >
              {createMutation.loading ? 'Criando...' : 'Criar Template'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
