import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { useCredits } from '@/lib/credits';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/ai/auto-post — Generate a single post from product or topic
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { productId, topic, contentType = 'post', platform = 'instagram', style } = body;

    const creditResult = await useCredits(ctx.userId, 'generate_post', 'Auto-post IA');
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error, required: creditResult.required },
        { status: 402 }
      );
    }

    // Load business profile
    const { data: profile } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .single();

    let productInfo = '';
    let product = null;

    if (productId) {
      const { data: prod } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('agency_id', ctx.agencyId)
        .single();

      if (prod) {
        product = prod;
        productInfo = `
PRODUTO PARA DESTACAR:
- Nome: ${prod.name}
- Descrição: ${prod.description || ''}
- Preço: ${prod.price ? `R$ ${prod.price}` : 'Não informado'}
- Preço promocional: ${prod.sale_price ? `R$ ${prod.sale_price}` : 'N/A'}
- Características: ${(prod.features || []).join(', ')}
- Categoria: ${prod.category || 'Geral'}`;
      }
    }

    const topicInfo = topic ? `\nTÓPICO SOLICITADO: ${topic}` : '';

    const contentTypeMap: Record<string, string> = {
      post: 'post para feed (legenda completa com 150-300 palavras)',
      carousel: 'carousel (5-7 slides, cada slide com título curto e texto)',
      reel: 'roteiro de Reels/vídeo curto (até 60s, com timestamps)',
      story: 'sequência de 3-5 stories com texto curto e CTA',
    };

    const prompt = `Você é um especialista em criação de conteúdo para ${platform} no Brasil.

NEGÓCIO: ${profile?.business_name || 'Meu Negócio'}
TIPO: ${profile?.business_type || 'varejo'}
DESCRIÇÃO: ${profile?.business_description || ''}
PÚBLICO: ${profile?.target_audience || 'Público geral'}
TOM DE VOZ: ${profile?.brand_voice || 'profissional'}
${productInfo}
${topicInfo}

Crie um ${contentTypeMap[contentType] || 'post para feed'}.
${style ? `ESTILO VISUAL: ${style}` : ''}

Responda APENAS com JSON:
{
  "title": "título curto (para organização interna)",
  "content": "legenda/texto completo com emojis e CTA",
  "hashtags": ["#hashtag1", "#hashtag2", ...até 20],
  "media_prompt": "descrição detalhada da imagem/vídeo ideal para este post — cores, composição, estilo, elementos visuais",
  "slides": [{"title": "título", "text": "texto"}] (APENAS se for carousel, senão null),
  "script_timestamps": [{"time": "0-3s", "action": "ação"}] (APENAS se for reel, senão null),
  "stories": [{"text": "texto", "cta": "CTA"}] (APENAS se for story, senão null),
  "engagement_tip": "dica para aumentar o engajamento deste post",
  "best_time": "melhor horário para postar (HH:MM)"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Responda APENAS com JSON válido. Conteúdo em português brasileiro.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.85,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    let generated;
    try {
      generated = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: 'Erro ao processar resposta da IA' }, { status: 500 });
    }

    // Update product stats
    if (product) {
      await supabase
        .from('products')
        .update({
          posts_generated: (product.posts_generated || 0) + 1,
          ai_hashtags: generated.hashtags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);
    }

    // Save to history
    await supabase.from('generated_content_history').insert({
      agency_id: ctx.agencyId,
      content_type: contentType,
      input_data: { productId, topic, platform, style },
      output_data: generated,
      model_used: 'gpt-4o-mini',
      tokens_used: completion.usage?.total_tokens || 0,
      credits_used: creditResult.creditsUsed || 1,
    });

    return NextResponse.json({
      post: generated,
      creditsUsed: creditResult.creditsUsed,
      creditsRemaining: creditResult.creditsRemaining,
    });
  } catch (error: any) {
    console.error('Auto-post error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao gerar post' }, { status: 500 });
  }
}
