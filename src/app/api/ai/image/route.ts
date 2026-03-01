import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { useCredits } from '@/lib/credits';
import { generateImage } from '@/lib/ai-providers';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { prompt, style, size, quality, provider, clientId } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 });
    }

    // Deduzir créditos (imagem = 50 créditos)
    const creditResult = await useCredits(ctx.userId, 'generate_image', 'Geração de imagem IA');
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error, required: creditResult.required },
        { status: 402 }
      );
    }

    // Buscar brand assets para contexto
    const supabase = await createClient();
    let brandContext = '';
    if (clientId) {
      const { data: brand } = await supabase
        .from('brand_assets')
        .select('colors, fonts, tone_of_voice, brand_voice_guidelines')
        .eq('client_id', clientId)
        .eq('agency_id', ctx.agencyId)
        .single();

      if (brand) {
        const colors = brand.colors ? `Brand colors: ${JSON.stringify(brand.colors)}. ` : '';
        const tone = brand.tone_of_voice ? `Tone: ${brand.tone_of_voice}. ` : '';
        brandContext = `${colors}${tone}Use the brand identity consistently. `;
      }
    }

    const enhancedPrompt = brandContext
      ? `${brandContext}Create: ${prompt}`
      : prompt;

    const result = await generateImage({
      provider: provider || 'auto',
      prompt: enhancedPrompt,
      style: style || 'vivid',
      size: size || '1024x1024',
      quality: quality || 'standard',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Falha ao gerar imagem' }, { status: 500 });
    }

    // Salvar na media_library automaticamente
    for (const img of result.images) {
      // Se for URL (OpenAI), salvar referência. Se base64 (Gemini), salvar direto
      const isBase64 = img.url.startsWith('data:');
      
      if (isBase64) {
        // Upload base64 to Supabase Storage
        const base64Data = img.url.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `ai-generated/${ctx.agencyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;

        const { data: uploaded } = await supabase.storage
          .from('media')
          .upload(fileName, buffer, { contentType: 'image/png' });

        if (uploaded) {
          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(fileName);

          img.url = publicUrl;
        }
      }

      // Registrar na media_library
      await supabase.from('media_library').insert({
        agency_id: ctx.agencyId,
        file_url: img.url,
        file_type: 'image',
        file_name: `ai-image-${Date.now()}.png`,
        file_size: 0,
        tags: ['ai-generated', provider || 'auto'],
        metadata: {
          prompt,
          revisedPrompt: img.revisedPrompt,
          provider: result.provider,
          style,
          size,
          quality,
        },
        created_by: ctx.userId,
      });
    }

    return NextResponse.json({
      success: true,
      images: result.images,
      provider: result.provider,
      creditsUsed: creditResult.creditsUsed,
      creditsRemaining: creditResult.creditsRemaining,
    });
  } catch (error: any) {
    console.error('AI image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar imagem' },
      { status: 500 }
    );
  }
}
