import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Listar templates (agency + global)
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const platform = searchParams.get('platform');

    // Fetch agency templates + global templates
    let query = supabase
      .from('templates')
      .select('*')
      .or(`agency_id.eq.${ctx.agencyId},is_global.eq.true`)
      .order('is_global', { ascending: false })
      .order('name');

    if (category) query = query.eq('category', category);
    if (platform) query = query.eq('platform', platform);

    const { data: templates, error } = await query;
    if (error) throw error;

    return NextResponse.json({ templates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar templates' }, { status: 500 });
  }
}

// Criar template
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const { data: template, error } = await supabase
      .from('templates')
      .insert({
        agency_id: ctx.agencyId,
        name: body.name,
        description: body.description || null,
        category: body.category || 'general',
        platform: body.platform || null,
        content: body.content,
        variables: body.variables || [],
        thumbnail_url: body.thumbnailUrl || null,
        is_global: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar template' }, { status: 500 });
  }
}

// Atualizar template
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const fieldMap: Record<string, string> = {
      thumbnailUrl: 'thumbnail_url',
    };

    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      updateData[fieldMap[key] || key] = value;
    }

    const { data: template, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId) // Can only edit own templates
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar template' }, { status: 500 });
  }
}

// Deletar template
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await request.json();

    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id)
      .eq('agency_id', ctx.agencyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao deletar template' }, { status: 500 });
  }
}
