import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Listar relatórios
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
      .from('analytics_reports')
      .select('*, clients(id, name)')
      .eq('agency_id', ctx.agencyId)
      .order('created_at', { ascending: false });

    if (clientId) query = query.eq('client_id', clientId);

    const { data: reports, error } = await query;
    if (error) throw error;

    return NextResponse.json({ reports });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar relatórios' }, { status: 500 });
  }
}

// Criar relatório
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const { data: report, error } = await supabase
      .from('analytics_reports')
      .insert({
        agency_id: ctx.agencyId,
        client_id: body.clientId || null,
        created_by: ctx.userId,
        title: body.title,
        type: body.type || 'monthly',
        period_start: body.periodStart,
        period_end: body.periodEnd,
        data: body.data || {},
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar relatório' }, { status: 500 });
  }
}

// Atualizar relatório
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const fieldMap: Record<string, string> = {
      clientId: 'client_id', periodStart: 'period_start',
      periodEnd: 'period_end', pdfUrl: 'pdf_url',
    };

    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      updateData[fieldMap[key] || key] = value;
    }

    const { data: report, error } = await supabase
      .from('analytics_reports')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar relatório' }, { status: 500 });
  }
}

// Deletar relatório
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await request.json();

    const { error } = await supabase
      .from('analytics_reports')
      .delete()
      .eq('id', id)
      .eq('agency_id', ctx.agencyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao deletar relatório' }, { status: 500 });
  }
}
