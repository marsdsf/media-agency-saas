import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Listar grupos de hashtags
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
      .from('hashtag_groups')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .order('name');

    if (clientId) query = query.eq('client_id', clientId);

    const { data: groups, error } = await query;
    if (error) throw error;

    return NextResponse.json({ groups });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar hashtags' }, { status: 500 });
  }
}

// Criar grupo de hashtags
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const { data: group, error } = await supabase
      .from('hashtag_groups')
      .insert({
        agency_id: ctx.agencyId,
        client_id: body.clientId || null,
        name: body.name,
        hashtags: body.hashtags || [],
        category: body.category || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, group });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar grupo' }, { status: 500 });
  }
}

// Atualizar grupo
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const { data: group, error } = await supabase
      .from('hashtag_groups')
      .update(updates)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, group });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar grupo' }, { status: 500 });
  }
}

// Deletar grupo
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await request.json();

    const { error } = await supabase
      .from('hashtag_groups')
      .delete()
      .eq('id', id)
      .eq('agency_id', ctx.agencyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao deletar grupo' }, { status: 500 });
  }
}
