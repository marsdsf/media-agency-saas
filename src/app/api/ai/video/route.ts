import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { useCredits } from '@/lib/credits';
import { generateVideo, checkVideoStatus } from '@/lib/ai-providers';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { prompt, duration, aspectRatio, style, clientId } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 });
    }

    // Vídeo custa mais créditos (100)
    const creditResult = await useCredits(ctx.userId, 'generate_image', 'Geração de vídeo IA');
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error, required: creditResult.required },
        { status: 402 }
      );
    }
    // Cobrar 2x para vídeo (total 100 créditos)
    await useCredits(ctx.userId, 'generate_image', 'Geração de vídeo IA (complemento)');

    // Buscar contexto de marca
    const supabase = await createClient();
    let brandContext = '';
    if (clientId) {
      const { data: brand } = await supabase
        .from('brand_assets')
        .select('tone_of_voice, brand_voice_guidelines, target_audience')
        .eq('client_id', clientId)
        .eq('agency_id', ctx.agencyId)
        .single();

      if (brand) {
        brandContext = brand.tone_of_voice ? ` Style: ${brand.tone_of_voice}.` : '';
      }
    }

    const result = await generateVideo({
      prompt: `${prompt}.${brandContext} High quality, professional social media video.`,
      duration: duration || 8,
      aspectRatio: aspectRatio || '9:16',
      style: style || 'dynamic',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Falha ao gerar vídeo' }, { status: 500 });
    }

    // Se a geração é assíncrona, salvar operação para polling
    if (result.status === 'processing' && result.operationId) {
      await supabase.from('ai_video_operations').insert({
        agency_id: ctx.agencyId,
        user_id: ctx.userId,
        operation_id: result.operationId,
        prompt,
        status: 'processing',
        metadata: { duration, aspectRatio, style, clientId },
      });
    }

    // Se completado, salvar na media library
    if (result.status === 'completed' && result.videoUrl) {
      const isBase64 = result.videoUrl.startsWith('data:');
      let finalUrl = result.videoUrl;

      if (isBase64) {
        const base64Data = result.videoUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `ai-video/${ctx.agencyId}/${Date.now()}.mp4`;

        const { data: uploaded } = await supabase.storage
          .from('media')
          .upload(fileName, buffer, { contentType: 'video/mp4' });

        if (uploaded) {
          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(fileName);
          finalUrl = publicUrl;
        }
      }

      await supabase.from('media_library').insert({
        agency_id: ctx.agencyId,
        file_url: finalUrl,
        file_type: 'video',
        file_name: `ai-video-${Date.now()}.mp4`,
        file_size: 0,
        tags: ['ai-generated', 'video', 'gemini'],
        metadata: { prompt, provider: 'gemini', duration, aspectRatio },
        created_by: ctx.userId,
      });
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      videoUrl: result.videoUrl,
      operationId: result.operationId,
      provider: result.provider,
      creditsUsed: (creditResult.creditsUsed || 0) * 2,
      creditsRemaining: creditResult.creditsRemaining,
    });
  } catch (error: any) {
    console.error('AI video generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar vídeo' },
      { status: 500 }
    );
  }
}

// GET - verificar status de vídeo em processamento
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const operationId = request.nextUrl.searchParams.get('operationId');
    if (!operationId) {
      // Listar todas as operações pendentes
      const supabase = await createClient();
      const { data } = await supabase
        .from('ai_video_operations')
        .select('*')
        .eq('agency_id', ctx.agencyId)
        .eq('status', 'processing')
        .order('created_at', { ascending: false });

      return NextResponse.json({ operations: data || [] });
    }

    const result = await checkVideoStatus(operationId);

    if (result.status === 'completed' && result.videoUrl) {
      // Atualizar operação e salvar vídeo
      const supabase = await createClient();
      await supabase
        .from('ai_video_operations')
        .update({ status: 'completed', video_url: result.videoUrl })
        .eq('operation_id', operationId);

      // Salvar na media library
      await supabase.from('media_library').insert({
        agency_id: ctx.agencyId,
        file_url: result.videoUrl,
        file_type: 'video',
        file_name: `ai-video-${Date.now()}.mp4`,
        file_size: 0,
        tags: ['ai-generated', 'video', 'gemini'],
        metadata: { operationId, provider: 'gemini' },
        created_by: ctx.userId,
      });
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      videoUrl: result.videoUrl,
      operationId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
