import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Listar concorrentes
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
      .from('competitors')
      .select('*, clients(id, name)')
      .eq('agency_id', ctx.agencyId)
      .order('name');

    if (clientId) query = query.eq('client_id', clientId);

    const { data: competitors, error } = await query;
    if (error) throw error;

    return NextResponse.json({ competitors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar concorrentes' }, { status: 500 });
  }
}

// Adicionar concorrente
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const { data: competitor, error } = await supabase
      .from('competitors')
      .insert({
        agency_id: ctx.agencyId,
        client_id: body.clientId || null,
        name: body.name,
        website: body.website || null,
        instagram_handle: body.instagramHandle || null,
        tiktok_handle: body.tiktokHandle || null,
        facebook_url: body.facebookUrl || null,
        notes: body.notes || null,
        metrics: body.metrics || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, competitor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao adicionar concorrente' }, { status: 500 });
  }
}

// Atualizar concorrente
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const fieldMap: Record<string, string> = {
      clientId: 'client_id', instagramHandle: 'instagram_handle',
      tiktokHandle: 'tiktok_handle', facebookUrl: 'facebook_url',
    };

    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      updateData[fieldMap[key] || key] = value;
    }

    const { data: competitor, error } = await supabase
      .from('competitors')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, competitor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar concorrente' }, { status: 500 });
  }
}

// Deletar concorrente
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await request.json();

    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', id)
      .eq('agency_id', ctx.agencyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao deletar concorrente' }, { status: 500 });
  }
}
