import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// GET /api/business/products — List products
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('products')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) query = query.eq('category', category);
    if (featured === 'true') query = query.eq('is_featured', true);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data: products, error } = await query;
    if (error) throw error;

    // Get counts per category
    const { data: allProducts } = await supabase
      .from('products')
      .select('category')
      .eq('agency_id', ctx.agencyId)
      .eq('is_active', true);

    const categories: Record<string, number> = {};
    (allProducts || []).forEach((p) => {
      const cat = p.category || 'Sem categoria';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    return NextResponse.json({
      products: products || [],
      total: products?.length || 0,
      categories,
    });
  } catch (error: any) {
    console.error('Products error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar produtos' }, { status: 500 });
  }
}

// POST /api/business/products — Create product
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        agency_id: ctx.agencyId,
        name: body.name,
        description: body.description || null,
        category: body.category || null,
        price: body.price || null,
        sale_price: body.salePrice || null,
        images: body.images || [],
        primary_image: body.primaryImage || (body.images?.[0] ?? null),
        features: body.features || [],
        tags: body.tags || [],
        is_featured: body.isFeatured || false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Product create error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao criar produto' }, { status: 500 });
  }
}

// PATCH /api/business/products — Update product
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.salePrice !== undefined) updateData.sale_price = updates.salePrice;
    if (updates.images !== undefined) updateData.images = updates.images;
    if (updates.primaryImage !== undefined) updateData.primary_image = updates.primaryImage;
    if (updates.features !== undefined) updateData.features = updates.features;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao atualizar produto' }, { status: 500 });
  }
}

// DELETE /api/business/products — Soft-delete product
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await request.json();

    const { error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('agency_id', ctx.agencyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Product delete error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao deletar produto' }, { status: 500 });
  }
}
