'use client';

import { useState } from 'react';
import { 
  Upload,
  FolderPlus,
  Search,
  Grid3X3,
  List,
  Image as ImageIcon,
  Video,
  FileText,
  MoreVertical,
  Download,
  Trash2,
  Copy,
  Star,
  Filter,
  SortAsc,
  ExternalLink,
  Cloud,
  HardDrive,
  Tag
} from 'lucide-react';
import { Button, Card, Badge, Input } from '@/lib/ui';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size: string;
  uploadedAt: string;
  folder: string;
  url: string;
  tags: string[];
  isFavorite: boolean;
}

interface Folder {
  id: string;
  name: string;
  count: number;
  color: string;
}

const folders: Folder[] = [
  { id: 'all', name: 'Todos', count: 48, color: 'from-white to-gray-200' },
  { id: 'products', name: 'Produtos', count: 15, color: 'from-gray-300 to-gray-500' },
  { id: 'brand', name: 'Marca', count: 8, color: 'from-gray-400 to-gray-600' },
  { id: 'social', name: 'Social', count: 20, color: 'from-gray-500 to-gray-700' },
  { id: 'templates', name: 'Templates', count: 5, color: 'from-gray-600 to-gray-800' },
];

const mockMedia: MediaItem[] = [
  { id: '1', name: 'produto-hero.jpg', type: 'image', size: '2.4 MB', uploadedAt: '2026-01-10', folder: 'products', url: '/placeholder.jpg', tags: ['produto', 'destaque'], isFavorite: true },
  { id: '2', name: 'logo-branco.png', type: 'image', size: '156 KB', uploadedAt: '2026-01-08', folder: 'brand', url: '/placeholder.jpg', tags: ['logo', 'marca'], isFavorite: true },
  { id: '3', name: 'video-promo.mp4', type: 'video', size: '45 MB', uploadedAt: '2026-01-09', folder: 'social', url: '/placeholder.jpg', tags: ['video', 'promo'], isFavorite: false },
  { id: '4', name: 'banner-instagram.jpg', type: 'image', size: '1.8 MB', uploadedAt: '2026-01-11', folder: 'social', url: '/placeholder.jpg', tags: ['instagram', 'banner'], isFavorite: false },
  { id: '5', name: 'carrossel-dicas.psd', type: 'document', size: '12 MB', uploadedAt: '2026-01-07', folder: 'templates', url: '/placeholder.jpg', tags: ['template', 'carrossel'], isFavorite: false },
  { id: '6', name: 'mockup-celular.png', type: 'image', size: '3.2 MB', uploadedAt: '2026-01-06', folder: 'products', url: '/placeholder.jpg', tags: ['mockup', 'produto'], isFavorite: true },
  { id: '7', name: 'story-template.png', type: 'image', size: '890 KB', uploadedAt: '2026-01-05', folder: 'templates', url: '/placeholder.jpg', tags: ['story', 'template'], isFavorite: false },
  { id: '8', name: 'reels-behind.mp4', type: 'video', size: '28 MB', uploadedAt: '2026-01-04', folder: 'social', url: '/placeholder.jpg', tags: ['reels', 'bastidores'], isFavorite: false },
];

const typeIcons = {
  image: ImageIcon,
  video: Video,
  document: FileText,
};

export default function MediaPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMedia = mockMedia.filter(item => {
    const matchesFolder = selectedFolder === 'all' || item.folder === selectedFolder;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const storageUsed = 2.4;
  const storageTotal = 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Biblioteca de Mídia</h1>
          <p className="text-gray-400 mt-1">Organize e gerencie seus arquivos</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<FolderPlus className="w-4 h-4" />}>
            Nova Pasta
          </Button>
          <Button leftIcon={<Upload className="w-4 h-4" />}>
            Upload
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Sidebar - Folders */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">PASTAS</h3>
            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all',
                    selectedFolder === folder.id
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-3 h-3 rounded-sm bg-gradient-to-br', folder.color)} />
                    <span className="text-sm font-medium">{folder.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{folder.count}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Storage */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-400">ARMAZENAMENTO</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{storageUsed} GB usados</span>
                <span className="text-white">{storageTotal} GB</span>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-white to-gray-300 h-2 rounded-full transition-all"
                  style={{ width: `${(storageUsed / storageTotal) * 100}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Quick Links */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-400">INTEGRAÇÕES</h3>
            </div>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">Unsplash</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">Pexels</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Buscar arquivos ou tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="ghost" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
                Filtros
              </Button>
              <Button variant="ghost" size="sm" leftIcon={<SortAsc className="w-4 h-4" />}>
                Ordenar
              </Button>
            </div>
            <div className="flex bg-[#1a1a1a] rounded-xl p-1">
              <button
                onClick={() => setView('grid')}
                className={cn(
                  'px-3 py-1.5 rounded-lg transition-all',
                  view === 'grid' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={cn(
                  'px-3 py-1.5 rounded-lg transition-all',
                  view === 'list' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Selection Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-sm text-gray-400">{selectedItems.length} selecionados</span>
              <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                Download
              </Button>
              <Button variant="ghost" size="sm" leftIcon={<Copy className="w-4 h-4" />}>
                Copiar Link
              </Button>
              <Button variant="ghost" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} className="text-red-400 hover:text-red-300">
                Excluir
              </Button>
            </div>
          )}

          {/* Grid View */}
          {view === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((item) => {
                const TypeIcon = typeIcons[item.type];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelection(item.id)}
                    className={cn(
                      'group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-white/10',
                      selectedItems.includes(item.id)
                        ? 'border-white ring-2 ring-white'
                        : 'border-[#1a1a1a] hover:border-white/30'
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
                      <TypeIcon className="w-12 h-12 text-gray-600" />
                    </div>

                    {/* Favorite */}
                    {item.isFavorite && (
                      <div className="absolute top-2 left-2">
                        <Star className="w-4 h-4 text-white fill-white" />
                      </div>
                    )}

                    {/* Menu */}
                    <button className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>

                    {/* Info */}
                    <div className="p-3 bg-[#0a0a0a]">
                      <p className="text-sm font-medium text-white truncate">{item.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{item.size}</span>
                        <div className="flex items-center gap-1">
                          {item.tags.slice(0, 1).map((tag) => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {view === 'list' && (
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-[#1a1a1a]">
                    <th className="p-4 font-medium">Arquivo</th>
                    <th className="p-4 font-medium">Tipo</th>
                    <th className="p-4 font-medium">Tamanho</th>
                    <th className="p-4 font-medium">Tags</th>
                    <th className="p-4 font-medium">Data</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedia.map((item) => {
                    const TypeIcon = typeIcons[item.type];
                    return (
                      <tr
                        key={item.id}
                        onClick={() => toggleSelection(item.id)}
                        className={cn(
                          'border-b border-[#1a1a1a] cursor-pointer transition-colors',
                          selectedItems.includes(item.id) ? 'bg-white/10' : 'hover:bg-white/5'
                        )}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5">
                              <TypeIcon className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="text-white font-medium">{item.name}</span>
                            {item.isFavorite && <Star className="w-3 h-3 text-white fill-white" />}
                          </div>
                        </td>
                        <td className="p-4 text-gray-400 capitalize">{item.type}</td>
                        <td className="p-4 text-gray-400">{item.size}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {item.tags.map((tag) => (
                              <span key={tag} className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-gray-400">{new Date(item.uploadedAt).toLocaleDateString('pt-BR')}</td>
                        <td className="p-4">
                          <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
