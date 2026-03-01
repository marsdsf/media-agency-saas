import { NextRequest, NextResponse } from 'next/server';
import { getUserContext, hasPermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Listar clientes da agência
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
      .from('clients')
      .select('*, social_accounts(id, platform, username, avatar_url)')
      .eq('agency_id', ctx.agencyId)
      .order('name');

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: clients, error } = await query;

    if (error) throw error;

    return NextResponse.json({ clients });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar clientes' },
      { status: 500 }
    );
  }
}

// Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!hasPermission(ctx, 'clients.create')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const supabase = await createClient();

    // Check client limit
    const { count } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', ctx.agencyId)
      .eq('status', 'active');

    const { data: agency } = await supabase
      .from('agencies')
      .select('max_clients')
      .eq('id', ctx.agencyId)
      .single();

    if (agency && agency.max_clients !== -1 && (count || 0) >= agency.max_clients) {
      return NextResponse.json(
        { error: 'Limite de clientes atingido. Faça upgrade do plano.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        agency_id: ctx.agencyId,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        website: body.website || null,
        industry: body.industry || null,
        brand_color: body.brandColor || null,
        logo_url: body.logoUrl || null,
        notes: body.notes || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, client });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar cliente' },
      { status: 500 }
    );
  }
}

// Atualizar cliente
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const updateData: Record<string, any> = {};
    const allowedFields = ['name', 'email', 'phone', 'website', 'industry', 'brand_color', 'logo_url', 'notes', 'status'];
    const camelToSnake: Record<string, string> = {
      brandColor: 'brand_color',
      logoUrl: 'logo_url',
    };

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = camelToSnake[key] || key;
      if (allowedFields.includes(dbKey)) {
        updateData[dbKey] = value;
      }
    }

    const { data: client, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, client });
  } catch (error: any) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar cliente' },
      { status: 500 }
    );
  }
}

// Deletar cliente (soft delete via status)
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!hasPermission(ctx, 'clients.delete')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const supabase = await createClient();
    const { id } = await request.json();

    const { error } = await supabase
      .from('clients')
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('agency_id', ctx.agencyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar cliente' },
      { status: 500 }
    );
  }
}
