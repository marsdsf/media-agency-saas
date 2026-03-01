'use client';

import { useState, useEffect } from 'react';
import { 
  Link,
  Plus,
  Settings,
  ExternalLink,
  Eye,
  MousePointerClick,
  Copy,
  Trash2,
  GripVertical,
  Image,
  Instagram,
  Youtube,
  Twitter,
  Globe,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  Music,
  Palette,
  BarChart2,
  QrCode,
  Share2,
  Loader2
} from 'lucide-react';
import { Button, Card, Badge, Input, Switch } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useLinkPages, useApiMutation } from '@/hooks/useApiData';

const FaTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const iconMap: Record<string, React.ComponentType<any>> = {
  globe: Globe, shop: ShoppingBag, calendar: Calendar, youtube: Youtube,
  music: Music, instagram: Instagram, tiktok: FaTiktok, twitter: Twitter,
  mail: Mail, phone: Phone, link: Link,
};

const themes = [
  { id: 'dark', name: 'Dark', bg: '#0a0a0a', accent: '#ffffff' },
  { id: 'light', name: 'Light', bg: '#ffffff', accent: '#000000' },
  { id: 'gradient', name: 'Gradient', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#ffffff' },
  { id: 'neon', name: 'Neon', bg: '#0a0a0a', accent: '#00ff88' },
  { id: 'sunset', name: 'Sunset', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', accent: '#ffffff' },
];

export default function LinksPage() {
  const { data, loading, refetch } = useLinkPages();
  const createMutation = useApiMutation('/api/links', 'POST');
  const updateMutation = useApiMutation('/api/links', 'PATCH');

  const pages: any[] = data?.pages || [];
  const currentPage = pages[0]; // Use first page

  const [localLinks, setLocalLinks] = useState<any[]>([]);
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [showCreate, setShowCreate] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  useEffect(() => {
    if (currentPage) {
      setLocalLinks(currentPage.links || []);
      setSelectedTheme(currentPage.theme || 'dark');
    }
  }, [currentPage]);

  const socialLinks = currentPage?.social_links || {};

  const toggleLink = (index: number) => {
    const updated = [...localLinks];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    setLocalLinks(updated);
    if (currentPage) {
      updateMutation.mutate({ id: currentPage.id, links: updated });
    }
  };

  const handleCreatePage = async () => {
    if (!newPageTitle) return;
    await createMutation.mutate({ title: newPageTitle, links: [] });
    setNewPageTitle('');
    setShowCreate(false);
    refetch();
  };

  const stats = [
    { label: 'Links Ativos', value: localLinks.filter(l => l.isActive !== false).length.toString(), icon: Link, trend: '' },
    { label: 'Total Links', value: localLinks.length.toString(), icon: BarChart2, trend: '' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="text-center py-16">
        <Link className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Nenhuma página de links</h2>
        <p className="text-gray-400">Crie sua primeira página link-in-bio</p>
        <div className="mt-4 flex items-center gap-2 justify-center">
          <Input
            placeholder="Título da página (ex: @empresa)"
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            className="max-w-xs"
          />
          <Button
            onClick={handleCreatePage}
            disabled={!newPageTitle || createMutation.loading}
            leftIcon={createMutation.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          >
            Criar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Link in Bio</h1>
          <p className="text-gray-400 mt-1">Crie sua página de links personalizada</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<QrCode className="w-4 h-4" />}>
            QR Code
          </Button>
          <Button variant="secondary" leftIcon={<Share2 className="w-4 h-4" />}>
            Compartilhar
          </Button>
          <Button leftIcon={<ExternalLink className="w-4 h-4" />}>
            Visualizar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="group p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                {stat.trend && (
                  <p className="text-xs text-emerald-400 mt-1">{stat.trend}</p>
                )}
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Links Editor */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Seus Links</h3>
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Adicionar
              </Button>
            </div>
            
            <div className="space-y-3">
              {localLinks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Link className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum link adicionado</p>
                </div>
              )}
              {localLinks.map((link, index) => {
                const IconComp = iconMap[(link.icon || 'link').toLowerCase()] || Link;
                return (
                <div
                  key={index}
                  className={cn(
                    'group p-4 rounded-xl transition-all duration-300',
                    'bg-[#0a0a0a] hover:bg-[#1a1a1a]',
                    link.isActive === false && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button className="cursor-grab text-gray-500 hover:text-white transition-colors">
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                      <IconComp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white">{link.title || 'Sem título'}</h4>
                      <p className="text-sm text-gray-500 truncate">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">{link.clicks || 0} cliques</span>
                      <Switch 
                        checked={link.isActive !== false}
                        onCheckedChange={() => toggleLink(index)}
                      />
                      <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );})}
            </div>
          </Card>

          {/* Social Links */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Redes Sociais</h3>
              <Button size="sm" variant="ghost" leftIcon={<Plus className="w-4 h-4" />}>
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(socialLinks).length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma rede social adicionada</p>
              )}
              {Object.entries(socialLinks).map(([platform, handle]) => {
                const SocialIcon = iconMap[platform.toLowerCase()] || Globe;
                return (
                  <div
                    key={platform}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white transition-all"
                  >
                    <SocialIcon className="w-4 h-4" />
                    <span className="text-sm">{platform}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Themes */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Temas</h3>
              <Button size="sm" variant="ghost" leftIcon={<Palette className="w-4 h-4" />}>
                Personalizar
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    'aspect-square rounded-xl transition-all duration-300 relative',
                    selectedTheme === theme.id && 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]'
                  )}
                  style={{ background: theme.bg }}
                >
                  <div
                    className="absolute inset-4 rounded-lg"
                    style={{ backgroundColor: theme.accent, opacity: 0.3 }}
                  />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Preview */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Preview</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">link.bio/{currentPage.slug || 'empresa'}</span>
              <button className="p-1 hover:bg-white/10 rounded transition-all">
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Phone Frame */}
          <div className="flex justify-center">
            <div className="w-[280px] h-[560px] bg-[#1a1a1a] rounded-[40px] p-3 border-4 border-[#2a2a2a] shadow-2xl">
              <div className="w-full h-full bg-[#0a0a0a] rounded-[28px] overflow-hidden flex flex-col">
                {/* Status Bar */}
                <div className="flex items-center justify-between px-6 py-2 text-[10px] text-gray-400">
                  <span>9:41</span>
                  <div className="w-16 h-5 bg-black rounded-full" />
                  <span>100%</span>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                  {/* Profile */}
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 mx-auto mb-3 flex items-center justify-center text-black text-2xl font-bold">
                      {(currentPage.title || 'E')[0].toUpperCase()}
                    </div>
                    <h3 className="font-bold text-white">{currentPage.title || '@empresa'}</h3>
                    <p className="text-xs text-gray-400 mt-1">{currentPage.bio || ''}</p>
                  </div>

                  {/* Social Icons */}
                  <div className="flex justify-center gap-3 mb-6">
                    {Object.entries(socialLinks).map(([platform]) => {
                      const SIcon = iconMap[platform.toLowerCase()] || Globe;
                      return (
                        <div
                          key={platform}
                          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                        >
                          <SIcon className="w-4 h-4 text-white" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Links */}
                  <div className="space-y-3">
                    {localLinks.filter(l => l.isActive !== false).map((link, i) => {
                      const LIcon = iconMap[(link.icon || 'link').toLowerCase()] || Link;
                      return (
                        <button
                          key={i}
                          className="w-full p-3 rounded-xl bg-white text-black font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                        >
                          <LIcon className="w-4 h-4" />
                          {link.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center py-3">
                  <p className="text-[10px] text-gray-600">Feito com ❤️ pela Agência</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
