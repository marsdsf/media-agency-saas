'use client';

import { useState } from 'react';
import {
  Plus, Search, ShoppingBag, Image, Sparkles, Edit3, Trash2,
  Star, Tag, Package, Camera, Loader2, X, Upload,
} from 'lucide-react';
import { Button, Card, Input, Textarea, Badge } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useApiData, useApiMutation } from '@/hooks/useApiData';

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  sale_price: number | null;
  images: string[];
  primary_image: string | null;
  features: string[];
  tags: string[];
  is_featured: boolean;
  posts_generated: number;
  last_posted_at: string | null;
  created_at: string;
}

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: '', description: '', category: '', price: '',
    salePrice: '', features: '' as string, tags: '' as string,
    images: [] as string[], isFeatured: false,
  });

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (selectedCategory) params.set('category', selectedCategory);

  const { data, loading, refetch } = useApiData<{ products: Product[]; categories: Record<string, number> }>(
    `/api/business/products?${params.toString()}`, { refreshKey }
  );
  const createMutation = useApiMutation('/api/business/products', 'POST');
  const updateMutation = useApiMutation('/api/business/products', 'PATCH');
  const deleteMutation = useApiMutation('/api/business/products', 'DELETE');
  const autoPostMutation = useApiMutation('/api/ai/auto-post', 'POST');

  const products = data?.products || [];
  const categories = data?.categories || {};

  const resetForm = () => {
    setFormData({ name: '', description: '', category: '', price: '', salePrice: '', features: '', tags: '', images: [], isFeatured: false });
    setEditingProduct(null);
    setShowForm(false);
  };

  const openEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      price: product.price?.toString() || '',
      salePrice: product.sale_price?.toString() || '',
      features: (product.features || []).join(', '),
      tags: (product.tags || []).join(', '),
      images: product.images || [],
      isFeatured: product.is_featured,
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload = {
      name: formData.name,
      description: formData.description || null,
      category: formData.category || null,
      price: formData.price ? parseFloat(formData.price) : null,
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      features: formData.features ? formData.features.split(',').map((f) => f.trim()).filter(Boolean) : [],
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      images: formData.images,
      primaryImage: formData.images[0] || null,
      isFeatured: formData.isFeatured,
    };

    try {
      if (editingProduct) {
        await updateMutation.mutate({ id: editingProduct.id, ...payload });
      } else {
        await createMutation.mutate(payload);
      }
      resetForm();
      setRefreshKey((k) => k + 1);
    } catch { /* error in mutation state */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este produto?')) return;
    try {
      await deleteMutation.mutate({ id } as any);
      setRefreshKey((k) => k + 1);
    } catch { /* */ }
  };

  const handleGeneratePost = async (product: Product) => {
    try {
      const result = await autoPostMutation.mutate({ productId: product.id });
      if (result) {
        alert(`Post gerado com sucesso!\n\n${(result as any).post?.title || 'Veja no AI Studio'}`);
      }
    } catch { /* */ }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      try {
        const res = await fetch('/api/media/upload', { method: 'POST', body: formDataUpload });
        const data = await res.json();
        if (data.url) {
          setFormData((prev) => ({ ...prev, images: [...prev.images, data.url] }));
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Meus Produtos</h1>
          <p className="text-gray-400 mt-1">
            Cadastre seus produtos e a IA cria posts automaticamente
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { resetForm(); setShowForm(true); }}>
          Novo Produto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: products.length, icon: Package },
          { label: 'Destaque', value: products.filter((p) => p.is_featured).length, icon: Star },
          { label: 'Categorias', value: Object.keys(categories).length, icon: Tag },
          { label: 'Posts gerados', value: products.reduce((a, p) => a + (p.posts_generated || 0), 0), icon: Sparkles },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
              <s.icon className="w-5 h-5 text-gray-600" />
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              !selectedCategory ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
            )}
          >
            Todos
          </button>
          {Object.entries(categories).map(([cat, count]) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                selectedCategory === cat ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
              )}
            >
              {cat} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => resetForm()}>
          <div onClick={(e) => e.stopPropagation()}>
          <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={resetForm} className="p-1 rounded-lg hover:bg-white/10 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nome *</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome do produto" />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Descrição</label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Descreva o produto..." rows={3} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Categoria</label>
                  <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Ex: Roupas" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Preço (R$)</label>
                  <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="99.90" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Promoção</label>
                  <Input type="number" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} placeholder="79.90" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Características (separar por vírgula)</label>
                <Input value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} placeholder="100% algodão, Feito à mão, Tamanho único" />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Tags (separar por vírgula)</label>
                <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="verão, promoção, novo" />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Fotos do produto</label>
                <div className="flex flex-wrap gap-3">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#333] group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Produto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setFormData({ ...formData, images: formData.images.filter((_, j) => j !== i) })}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[#333] flex flex-col items-center justify-center cursor-pointer hover:border-white/30 transition-all">
                    <Camera className="w-5 h-5 text-gray-500" />
                    <span className="text-[10px] text-gray-500 mt-1">Upload</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Produto destaque</span>
              </label>

              <div className="flex gap-3 pt-4 border-t border-[#1a1a1a]">
                <Button variant="ghost" className="flex-1" onClick={resetForm}>Cancelar</Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  isLoading={createMutation.loading || updateMutation.loading}
                  disabled={!formData.name.trim()}
                >
                  {editingProduct ? 'Salvar' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </Card>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum produto cadastrado</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Adicione seus produtos e a IA vai criar posts incríveis automaticamente com fotos, legendas e hashtags
          </p>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { resetForm(); setShowForm(true); }}>
            Cadastrar primeiro produto
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group">
              {/* Product Image */}
              <div className="aspect-square bg-[#0a0a0a] relative">
                {product.primary_image || product.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.primary_image || product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-12 h-12 text-gray-700" />
                  </div>
                )}
                {product.is_featured && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-yellow-500/90 text-black text-xs font-bold rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Destaque
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="primary" leftIcon={<Sparkles className="w-3 h-3" />} onClick={() => handleGeneratePost(product)} isLoading={autoPostMutation.loading}>
                    Criar Post
                  </Button>
                  <Button size="sm" variant="secondary" leftIcon={<Edit3 className="w-3 h-3" />} onClick={() => openEdit(product)}>
                    Editar
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-white truncate">{product.name}</h3>
                  <button onClick={() => handleDelete(product.id)} className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {product.category && (
                  <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                )}

                <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                  {product.description || 'Sem descrição'}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {product.price && (
                      <>
                        {product.sale_price ? (
                          <>
                            <span className="text-sm text-gray-500 line-through">R$ {product.price.toFixed(2)}</span>
                            <span className="text-sm font-bold text-emerald-400">R$ {product.sale_price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-white">R$ {product.price.toFixed(2)}</span>
                        )}
                      </>
                    )}
                  </div>
                  <span className="text-xs text-gray-600">
                    {product.posts_generated || 0} posts
                  </span>
                </div>

                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-white/5 text-gray-500 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
