import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Listar mídia da agência
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // image, video, document
    const clientId = searchParams.get('client_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('media_library')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('type', type);
    if (clientId) query = query.eq('client_id', clientId);

    const { data: media, error } = await query;
    if (error) throw error;

    return NextResponse.json({ media });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar mídia' }, { status: 500 });
  }
}

// Upload de mídia (metadata - file upload happens on client via Supabase Storage)
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const { data: media, error } = await supabase
      .from('media_library')
      .insert({
        agency_id: ctx.agencyId,
        client_id: body.clientId || null,
        uploaded_by: ctx.userId,
        name: body.name,
        type: body.type || 'image',
        url: body.url,
        thumbnail_url: body.thumbnailUrl || null,
        size_bytes: body.sizeBytes || 0,
        mime_type: body.mimeType || null,
        width: body.width || null,
        height: body.height || null,
        tags: body.tags || [],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, media });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao salvar mídia' }, { status: 500 });
  }
}

// Atualizar metadados da mídia
export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    const updateData: Record<string, any> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;

    const { data: media, error } = await supabase
      .from('media_library')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, media });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar mídia' }, { status: 500 });
  }
}

// Deletar mídia
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await request.json();

    // Get the media URL to delete from storage
    const { data: media } = await supabase
      .from('media_library')
      .select('url')
      .eq('id', id)
      .eq('agency_id', ctx.agencyId)
      .single();

    // Delete from database
    const { error } = await supabase
      .from('media_library')
      .delete()
      .eq('id', id)
      .eq('agency_id', ctx.agencyId);

    if (error) throw error;

    // Try to delete from storage (non-blocking)
    if (media?.url) {
      const path = media.url.split('/storage/v1/object/public/media/')[1];
      if (path) {
        supabase.storage.from('media').remove([path]).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao deletar mídia' }, { status: 500 });
  }
}
