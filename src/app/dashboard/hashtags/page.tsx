'use client';

import { useState } from 'react';
import { 
  Hash,
  Search,
  TrendingUp,
  Copy,
  Star,
  StarOff,
  Plus,
  Sparkles,
  BarChart3,
  Eye,
  Zap,
  FolderPlus,
  Check,
  RefreshCw,
  Loader2,
  Trash2
} from 'lucide-react';
import { Button, Card, Badge, Input, Textarea } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useHashtagGroups, useApiMutation } from '@/hooks/useApiData';

export default function HashtagsPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [savingGroup, setSavingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');

  const { data, loading, refetch } = useHashtagGroups();
  const createMutation = useApiMutation('/api/hashtags', 'POST');
  const deleteMutation = useApiMutation('/api/hashtags', 'DELETE');

  const hashtagGroups: any[] = data?.groups || [];

  const generateHashtags = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'hashtags',
          prompt: `Gere 15 hashtags relevantes para: ${prompt}. Retorne apenas as hashtags separadas por vírgula, sem explicações.`,
        }),
      });
      const data = await res.json();
      if (data.content) {
        const tags = data.content
          .split(/[,\n]/)
          .map((t: string) => t.trim())
          .filter((t: string) => t.startsWith('#'))
          .slice(0, 15);
        setGeneratedHashtags(tags.length > 0 ? tags : ['#' + prompt.split(' ')[0].toLowerCase()]);
      }
    } catch {
      // Fallback to simple generation
      setGeneratedHashtags([
        '#' + prompt.split(' ')[0].toLowerCase(),
        '#marketingdigital', '#socialmedia', '#digitalmarketing',
        '#negocios', '#empreendedorismo', '#sucesso', '#dicas',
        '#estrategia', '#crescimento', '#inovacao', '#produtividade',
      ]);
    }
    
    setIsGenerating(false);
  };

  const copyAll = () => {
    const text = selectedHashtags.length > 0 
      ? selectedHashtags.join(' ') 
      : generatedHashtags.join(' ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveGroup = async () => {
    if (!groupName || selectedHashtags.length === 0) return;
    setSavingGroup(true);
    try {
      await createMutation.mutate({
        name: groupName,
        hashtags: selectedHashtags,
      });
      setGroupName('');
      setSavingGroup(false);
      refetch();
    } catch {
      setSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    await deleteMutation.mutate({ id });
    refetch();
  };

  const copyGroupHashtags = (hashtags: string[]) => {
    navigator.clipboard.writeText(hashtags.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Gerador de Hashtags</h1>
          <p className="text-gray-400 mt-1">Encontre as melhores hashtags para seu conteúdo</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Generator */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Generator */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Gerar com IA</h3>
            </div>
            <Textarea
              placeholder="Descreva seu post ou nicho... Ex: Dicas de marketing digital para pequenas empresas"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="mb-4"
            />
            <div className="flex items-center gap-3">
              <Button
                onClick={generateHashtags}
                disabled={!prompt || isGenerating}
                leftIcon={isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              >
                {isGenerating ? 'Gerando...' : 'Gerar Hashtags'}
              </Button>
              <span className="text-sm text-gray-500">5 créditos</span>
            </div>

            {/* Generated Results */}
            {generatedHashtags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-400">Hashtags Geradas</h4>
                  <Button variant="ghost" size="sm" onClick={copyAll} leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
                    {copied ? 'Copiado!' : 'Copiar Todas'}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generatedHashtags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleHashtag(tag)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:scale-105',
                        selectedHashtags.includes(tag)
                          ? 'bg-white text-black'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Trending - Placeholder */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-white" />
                <h3 className="text-lg font-semibold text-white">Hashtags em Alta</h3>
              </div>
            </div>
            <div className="text-center py-8">
              <TrendingUp className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Análise de hashtags em alta será implementada em breve.</p>
              <p className="text-xs text-gray-500 mt-1">Requer integração com APIs das redes sociais.</p>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Hashtags */}
          {selectedHashtags.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Selecionadas</h3>
                <span className="text-sm text-gray-500">{selectedHashtags.length}/30</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedHashtags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => toggleHashtag(tag)}
                    className="px-2 py-1 rounded-lg bg-white text-black text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={copyAll} leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              {/* Save as group */}
              <div className="mt-3 pt-3 border-t border-[#1a1a1a]">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do grupo"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={handleSaveGroup}
                    disabled={!groupName || savingGroup}
                    leftIcon={savingGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Saved Groups */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Grupos Salvos</h3>
              {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
            </div>
            {hashtagGroups.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum grupo salvo ainda</p>
            ) : (
            <div className="space-y-3">
              {hashtagGroups.map((group) => (
                <div
                  key={group.id}
                  className="group p-3 rounded-xl bg-[#0a0a0a] hover:bg-white/5 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{group.name}</h4>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => copyGroupHashtags(group.hashtags || [])}>
                        <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                      <button onClick={() => handleDeleteGroup(group.id)}>
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                    {(group.hashtags || []).join(' ')}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {(group.hashtags || []).length} hashtags
                    </span>
                    {group.category && (
                      <span>{group.category}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </Card>

          {/* Tips */}
          <Card className="p-4 bg-gradient-to-br from-white/5 to-transparent border-white/10">
            <h3 className="text-sm font-semibold text-white mb-3">💡 Dicas</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Use 5-10 hashtags por post no Instagram</li>
              <li>• Misture hashtags populares e de nicho</li>
              <li>• Evite hashtags banidas ou spam</li>
              <li>• Atualize seus grupos regularmente</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
