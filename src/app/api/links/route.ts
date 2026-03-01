import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Listar link pages (link-in-bio)
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    let query = supabase
      .from('link_pages')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .order('created_at', { ascending: false });

    if (clientId) query = query.eq('client_id', clientId);

    const { data: pages, error } = await query;
    if (error) throw error;

    return NextResponse.json({ pages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar link pages' }, { status: 500 });
  }
}

// Criar link page
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    // Generate unique slug
    let slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    // Check uniqueness
    const { data: existing } = await supabase
      .from('link_pages')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const { data: page, error } = await supabase
      .from('link_pages')
      .insert({
        agency_id: ctx.agencyId,
        client_id: body.clientId || null,
        title: body.title,
        slug,
        bio: body.bio || null,
        avatar_url: body.avatarUrl || null,
        theme: body.theme || 'default',
        links: body.links || [],
        social_links: body.socialLinks || {},
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      page,
      publicUrl: `${process.env.NEXT_PUBLIC_APP_URL}/l/${slug}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar link page' }, { status: 500 });
  }
}

// Atualizar link page
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const fieldMap: Record<string, string> = {
      avatarUrl: 'avatar_url', socialLinks: 'social_links',
      isActive: 'is_active', clientId: 'client_id',
    };

    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      updateData[fieldMap[key] || key] = value;
    }

    const { data: page, error } = await supabase
      .from('link_pages')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar link page' }, { status: 500 });
  }
}

// Deletar link page
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await request.json();

    const { error } = await supabase
      .from('link_pages')
      .delete()
      .eq('id', id)
      .eq('agency_id', ctx.agencyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao deletar link page' }, { status: 500 });
  }
}
