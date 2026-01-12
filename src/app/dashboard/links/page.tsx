'use client';

import { useState } from 'react';
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
  Share2
} from 'lucide-react';
import { Button, Card, Badge, Input, Switch } from '@/lib/ui';
import { cn } from '@/lib/utils';

const FaTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  clicks: number;
  isActive: boolean;
  type: 'link' | 'social' | 'contact';
}

const links: LinkItem[] = [
  { id: '1', title: 'Nosso Site', url: 'https://empresa.com', icon: Globe, clicks: 1250, isActive: true, type: 'link' },
  { id: '2', title: 'Loja Online', url: 'https://loja.empresa.com', icon: ShoppingBag, clicks: 890, isActive: true, type: 'link' },
  { id: '3', title: 'Agende uma Consulta', url: 'https://calendly.com/empresa', icon: Calendar, clicks: 456, isActive: true, type: 'link' },
  { id: '4', title: 'Último Vídeo', url: 'https://youtube.com/watch?v=...', icon: Youtube, clicks: 2100, isActive: true, type: 'link' },
  { id: '5', title: 'Spotify Playlist', url: 'https://spotify.com/playlist/...', icon: Music, clicks: 320, isActive: false, type: 'link' },
];

const socialLinks = [
  { id: 's1', platform: 'Instagram', username: '@empresa', icon: Instagram, isActive: true },
  { id: 's2', platform: 'TikTok', username: '@empresa', icon: FaTiktok, isActive: true },
  { id: 's3', platform: 'YouTube', username: 'Empresa', icon: Youtube, isActive: true },
  { id: 's4', platform: 'Twitter', username: '@empresa', icon: Twitter, isActive: false },
];

const themes = [
  { id: 1, name: 'Dark', bg: '#0a0a0a', accent: '#ffffff' },
  { id: 2, name: 'Light', bg: '#ffffff', accent: '#000000' },
  { id: 3, name: 'Gradient', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#ffffff' },
  { id: 4, name: 'Neon', bg: '#0a0a0a', accent: '#00ff88' },
  { id: 5, name: 'Sunset', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', accent: '#ffffff' },
];

export default function LinksPage() {
  const [activeLinks, setActiveLinks] = useState(links);
  const [selectedTheme, setSelectedTheme] = useState(1);

  const stats = [
    { label: 'Visualizações', value: '12.5K', icon: Eye, trend: '+15%' },
    { label: 'Cliques', value: '5.2K', icon: MousePointerClick, trend: '+22%' },
    { label: 'CTR', value: '41.6%', icon: BarChart2, trend: '+5%' },
    { label: 'Links Ativos', value: '4', icon: Link, trend: '' },
  ];

  const toggleLink = (id: string) => {
    setActiveLinks(prev =>
      prev.map(link =>
        link.id === id ? { ...link, isActive: !link.isActive } : link
      )
    );
  };

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
              {activeLinks.map((link) => (
                <div
                  key={link.id}
                  className={cn(
                    'group p-4 rounded-xl transition-all duration-300',
                    'bg-[#0a0a0a] hover:bg-[#1a1a1a]',
                    !link.isActive && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button className="cursor-grab text-gray-500 hover:text-white transition-colors">
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                      <link.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white">{link.title}</h4>
                      <p className="text-sm text-gray-500 truncate">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">{link.clicks} cliques</span>
                      <Switch 
                        checked={link.isActive}
                        onCheckedChange={() => toggleLink(link.id)}
                      />
                      <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
              {socialLinks.map((social) => (
                <div
                  key={social.id}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
                    social.isActive
                      ? 'bg-white/10 text-white'
                      : 'bg-[#1a1a1a] text-gray-500'
                  )}
                >
                  <social.icon className="w-4 h-4" />
                  <span className="text-sm">{social.platform}</span>
                </div>
              ))}
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
              <span className="text-sm text-gray-400">link.bio/empresa</span>
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
                      E
                    </div>
                    <h3 className="font-bold text-white">@empresa</h3>
                    <p className="text-xs text-gray-400 mt-1">Marketing Digital & Criatividade</p>
                  </div>

                  {/* Social Icons */}
                  <div className="flex justify-center gap-3 mb-6">
                    {socialLinks.filter(s => s.isActive).map((social) => (
                      <div
                        key={social.id}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                      >
                        <social.icon className="w-4 h-4 text-white" />
                      </div>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="space-y-3">
                    {activeLinks.filter(l => l.isActive).map((link) => (
                      <button
                        key={link.id}
                        className="w-full p-3 rounded-xl bg-white text-black font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                      >
                        <link.icon className="w-4 h-4" />
                        {link.title}
                      </button>
                    ))}
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
