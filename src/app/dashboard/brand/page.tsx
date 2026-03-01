'use client';

import { useState, useMemo } from 'react';
import { 
  Palette,
  Type,
  Image as ImageIcon,
  FileText,
  Plus,
  Copy,
  Edit,
  Trash2,
  Check,
  Upload,
  Sparkles,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Button, Card, Badge, Input, Textarea } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useBrandAssets, useApiMutation } from '@/hooks/useApiData';

export default function BrandKitPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const { data: brandData, loading, refetch } = useBrandAssets();
  const createMutation = useApiMutation('/api/brand', 'POST');
  const deleteMutation = useApiMutation('/api/brand', 'DELETE');

  const assets = brandData?.assets || [];

  const brandColors = useMemo(() => assets.filter((a: any) => a.type === 'color'), [assets]);
  const brandFonts = useMemo(() => assets.filter((a: any) => a.type === 'font'), [assets]);
  const brandLogos = useMemo(() => assets.filter((a: any) => a.type === 'logo' || a.type === 'icon'), [assets]);
  const guidelines = useMemo(() => assets.find((a: any) => a.type === 'guideline'), [assets]);

  const [toneOfVoice, setToneOfVoice] = useState(guidelines?.value || `Nossa marca é:

• Profissional mas acessível
• Inovadora e tecnológica
• Confiável e transparente
• Inspiradora e motivacional

Evitamos:
• Tom muito formal ou corporativo
• Linguagem técnica demais
• Promessas exageradas`);

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAddColor = async () => {
    await createMutation.execute({
      type: 'color',
      name: 'Nova Cor',
      value: '#FFFFFF',
      metadata: { usage: 'Defina o uso' },
    });
    refetch();
  };

  const handleAddFont = async () => {
    await createMutation.execute({
      type: 'font',
      name: 'Inter',
      value: 'Inter',
      metadata: { style: 'Regular', usage: 'Textos' },
    });
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este asset?')) return;
    await deleteMutation.execute({ id });
    refetch();
  };

  const handleSaveTone = async () => {
    if (guidelines) {
      // Update existing
      const patchMutation = useApiMutation('/api/brand', 'PATCH');
      await patchMutation.execute({ id: guidelines.id, value: toneOfVoice });
    } else {
      await createMutation.execute({
        type: 'guideline',
        name: 'Tom de Voz',
        value: toneOfVoice,
      });
    }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Brand Kit</h1>
          <p className="text-gray-400 mt-1">Mantenha a identidade visual consistente</p>
        </div>
        <Button leftIcon={<Sparkles className="w-4 h-4" />}>
          Gerar Guia de Marca
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Colors */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Paleta de Cores</h3>
            </div>
            <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleAddColor}>
              Adicionar
            </Button>
          </div>
          <div className="space-y-4">
            {brandColors.map((color: any) => (
              <div key={color.id} className="group flex items-center gap-4 p-3 rounded-xl bg-[#0a0a0a] hover:bg-white/5 transition-all">
                <div
                  className="w-12 h-12 rounded-xl border border-white/20 cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: color.value }}
                  onClick={() => copyColor(color.value)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">{color.name}</h4>
                    <button
                      onClick={() => copyColor(color.value)}
                      className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                    >
                      {copied === color.value ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {color.value}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">{color.metadata?.usage || ''}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400" onClick={() => handleDelete(color.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {brandColors.length === 0 && (
              <p className="text-gray-500 text-sm py-4 text-center">Nenhuma cor cadastrada. Clique em Adicionar.</p>
            )}
          </div>
        </Card>

        {/* Typography */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Tipografia</h3>
            </div>
            <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleAddFont}>
              Adicionar
            </Button>
          </div>
          <div className="space-y-4">
            {brandFonts.map((font: any) => (
              <div key={font.id} className="group flex items-center justify-between p-4 rounded-xl bg-[#0a0a0a] hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">Aa</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{font.value || font.name} {font.metadata?.style || ''}</h4>
                    <p className="text-sm text-gray-500">{font.metadata?.usage || ''}</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400" onClick={() => handleDelete(font.id)}>
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {brandFonts.length === 0 && (
              <p className="text-gray-500 text-sm py-4 text-center">Nenhuma fonte cadastrada.</p>
            )}
          </div>
          
          {/* Font Preview */}
          <div className="mt-6 p-4 rounded-xl bg-[#0a0a0a]">
            <h4 className="text-xs font-medium text-gray-500 mb-3">PREVIEW</h4>
            <p className="text-3xl font-bold text-white mb-2">Headline Principal</p>
            <p className="text-lg text-gray-300 mb-2">Subtítulo ou descrição do conteúdo</p>
            <p className="text-sm text-gray-500">Texto de corpo com informações detalhadas sobre o produto ou serviço.</p>
          </div>
        </Card>

        {/* Assets */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Logos & Assets</h3>
            </div>
            <Button variant="ghost" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
              Upload
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {brandLogos.map((asset: any) => (
              <div key={asset.id} className="group p-4 rounded-xl bg-[#0a0a0a] hover:bg-white/5 transition-all cursor-pointer">
                <div className="aspect-square rounded-xl bg-white/5 flex items-center justify-center mb-3">
                  {asset.value ? (
                    <img src={asset.value} alt={asset.name} className="max-w-full max-h-full object-contain p-2" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                      <span className="text-black text-2xl font-bold">M</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{asset.name}</p>
                    <p className="text-xs text-gray-500">{asset.metadata?.format || asset.type}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10 text-gray-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {brandLogos.length === 0 && (
              <div className="col-span-2 text-center py-8">
                <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Nenhum logo cadastrado</p>
              </div>
            )}
          </div>
        </Card>

        {/* Tone of Voice */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Tom de Voz</h3>
            </div>
            <Button variant="ghost" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
              Gerar com IA
            </Button>
          </div>
          <Textarea
            value={toneOfVoice}
            onChange={(e) => setToneOfVoice(e.target.value)}
            rows={12}
            className="font-mono text-sm"
          />
          <div className="mt-4 flex gap-2">
            <Badge>Profissional</Badge>
            <Badge>Inovador</Badge>
            <Badge>Acessível</Badge>
            <Badge>Inspirador</Badge>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Exportar Brand Kit</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" leftIcon={<FileText className="w-4 h-4" />}>
            Exportar PDF
          </Button>
          <Button variant="secondary" leftIcon={<ImageIcon className="w-4 h-4" />}>
            Download Assets
          </Button>
          <Button variant="secondary" leftIcon={<Copy className="w-4 h-4" />}>
            Copiar CSS
          </Button>
        </div>
      </Card>
    </div>
  );
}
