import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Listar brand assets do cliente
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
      .from('brand_assets')
      .select('*, clients(id, name)')
      .eq('agency_id', ctx.agencyId)
      .order('created_at', { ascending: false });

    if (clientId) query = query.eq('client_id', clientId);

    const { data: assets, error } = await query;
    if (error) throw error;

    return NextResponse.json({ assets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar brand assets' }, { status: 500 });
  }
}

// Criar brand asset
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const { data: asset, error } = await supabase
      .from('brand_assets')
      .insert({
        agency_id: ctx.agencyId,
        client_id: body.clientId || null,
        type: body.type, // logo, color, font, guideline, etc
        name: body.name,
        value: body.value, // URL, hex color, font name, etc
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, asset });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar brand asset' }, { status: 500 });
  }
}

// Atualizar brand asset
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const { data: asset, error } = await supabase
      .from('brand_assets')
      .update(updates)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, asset });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar brand asset' }, { status: 500 });
  }
}

// Deletar brand asset
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await request.json();

    const { error } = await supabase
      .from('brand_assets')
      .delete()
      .eq('id', id)
      .eq('agency_id', ctx.agencyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao deletar brand asset' }, { status: 500 });
  }
}
