import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Listar automações
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: automations, error } = await supabase
      .from('automations')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ automations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar automações' }, { status: 500 });
  }
}

// Criar automação
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const { data: automation, error } = await supabase
      .from('automations')
      .insert({
        agency_id: ctx.agencyId,
        name: body.name,
        description: body.description || null,
        trigger_type: body.triggerType, // schedule, event, webhook
        trigger_config: body.triggerConfig || {},
        actions: body.actions || [],
        is_active: body.isActive !== false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, automation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar automação' }, { status: 500 });
  }
}

// Atualizar automação
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const fieldMap: Record<string, string> = {
      triggerType: 'trigger_type', triggerConfig: 'trigger_config',
      isActive: 'is_active',
    };

    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      updateData[fieldMap[key] || key] = value;
    }

    const { data: automation, error } = await supabase
      .from('automations')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, automation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar automação' }, { status: 500 });
  }
}

// Deletar automação
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await request.json();

    const { error } = await supabase
      .from('automations')
      .delete()
      .eq('id', id)
      .eq('agency_id', ctx.agencyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao deletar automação' }, { status: 500 });
  }
}
