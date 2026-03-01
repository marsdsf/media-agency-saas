import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Listar campanhas
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('campaigns')
      .select('*, clients(id, name, brand_color)')
      .eq('agency_id', ctx.agencyId)
      .order('start_date', { ascending: false });

    if (clientId) query = query.eq('client_id', clientId);
    if (status) query = query.eq('status', status);

    const { data: campaigns, error } = await query;
    if (error) throw error;

    return NextResponse.json({ campaigns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar campanhas' }, { status: 500 });
  }
}

// Criar campanha
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        agency_id: ctx.agencyId,
        client_id: body.clientId || null,
        name: body.name,
        description: body.description || null,
        status: body.status || 'draft',
        start_date: body.startDate || null,
        end_date: body.endDate || null,
        budget: body.budget || null,
        platforms: body.platforms || [],
        goals: body.goals || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar campanha' }, { status: 500 });
  }
}

// Atualizar campanha
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const updateData: Record<string, any> = {};
    const fieldMap: Record<string, string> = {
      clientId: 'client_id', startDate: 'start_date', endDate: 'end_date',
    };

    for (const [key, value] of Object.entries(updates)) {
      updateData[fieldMap[key] || key] = value;
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar campanha' }, { status: 500 });
  }
}

// Deletar campanha
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await request.json();

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('agency_id', ctx.agencyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao deletar campanha' }, { status: 500 });
  }
}
