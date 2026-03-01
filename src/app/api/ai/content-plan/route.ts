import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { useCredits } from '@/lib/credits';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/ai/content-plan — Generate AI content plan/calendar
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { days = 7, regenerate = false } = body;

    // Check credits
    const creditResult = await useCredits(ctx.userId, 'generate_post', `Plano de conteúdo ${days} dias`);
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

    if (!profile) {
      return NextResponse.json(
        { error: 'Configure seu perfil de negócio primeiro' },
        { status: 400 }
      );
    }

    // Load products
    const { data: products } = await supabase
      .from('products')
      .select('id, name, description, category, features, tags, primary_image')
      .eq('agency_id', ctx.agencyId)
      .eq('is_active', true)
      .limit(20);

    // Load autopilot settings
    const { data: autopilot } = await supabase
      .from('autopilot_settings')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .maybeSingle();

    const contentMix = autopilot?.content_mix || { product: 40, tips: 25, engagement: 20, promotional: 15 };
    const postsPerDay = autopilot?.posts_per_day || 1;
    const totalPosts = days * postsPerDay;

    const productsList = (products || []).map((p) =>
      `- ${p.name}: ${p.description || ''} ${p.features?.length ? `(${p.features.join(', ')})` : ''}`
    ).join('\n');

    const pillars = (profile.content_pillars || []).map((p: any) =>
      `- ${p.name}: ${p.description} (${p.percentage}%)`
    ).join('\n') || 'Não definidos — sugerir automaticamente';

    const prompt = `Você é um estrategista de conteúdo para redes sociais especializado em pequenos negócios brasileiros.

NEGÓCIO:
- Nome: ${profile.business_name}
- Tipo: ${profile.business_type}
- Descrição: ${profile.business_description || 'Não informada'}
- Público-alvo: ${profile.target_audience || 'Geral'}
- Localização: ${profile.audience_location || 'Brasil'}
- Tom de voz: ${profile.brand_voice || 'profissional'}
- Estilo visual: ${profile.content_style || 'moderno e limpo'}

PRODUTOS/SERVIÇOS:
${productsList || 'Nenhum produto cadastrado — criar posts genéricos sobre o negócio'}

PILARES DE CONTEÚDO:
${pillars}

MIX DE CONTEÚDO DESEJADO:
- Posts de produto: ${contentMix.product}%
- Dicas e educação: ${contentMix.tips}%
- Engajamento (enquetes, perguntas): ${contentMix.engagement}%
- Promocional: ${contentMix.promotional}%

PLATAFORMAS: ${(profile.preferred_platforms || ['instagram']).join(', ')}

Gere um calendário com exatamente ${totalPosts} posts para os próximos ${days} dias.

Responda APENAS com um JSON válido no formato:
{
  "posts": [
    {
      "day": 1,
      "title": "título curto do post",
      "content": "legenda completa com emojis e CTA",
      "content_type": "post|carousel|reel|story",
      "content_pillar": "nome do pilar",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "media_prompt": "descrição detalhada da imagem ideal para este post",
      "product_name": "nome do produto (se aplicável, ou null)",
      "best_time": "09:00",
      "engagement_tip": "dica para maximizar engajamento"
    }
  ],
  "strategy_summary": "resumo da estratégia em 2-3 frases",
  "suggested_pillars": [
    {"name": "nome", "description": "descrição", "percentage": 30}
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você responde APENAS com JSON válido. Sem explicações extras.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4000,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    let plan;
    try {
      plan = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: 'Erro ao processar resposta da IA' }, { status: 500 });
    }

    // Save to content_calendar
    const startDate = new Date();
    const calendarEntries = (plan.posts || []).map((post: any) => {
      const postDate = new Date(startDate);
      postDate.setDate(postDate.getDate() + (post.day - 1));

      // Try to match product
      const matchedProduct = products?.find(
        (p) => p.name.toLowerCase() === post.product_name?.toLowerCase()
      );

      return {
        agency_id: ctx.agencyId,
        title: post.title,
        content: post.content,
        content_type: post.content_type || 'post',
        product_id: matchedProduct?.id || null,
        content_pillar: post.content_pillar,
        media_prompt: post.media_prompt,
        scheduled_date: postDate.toISOString().split('T')[0],
        scheduled_time: post.best_time || '09:00',
        platform: (profile.preferred_platforms || ['instagram'])[0],
        status: 'planned',
        ai_generated: true,
        ai_model: 'gpt-4o-mini',
        hashtags: post.hashtags || [],
      };
    });

    if (regenerate) {
      // Delete existing planned content
      await supabase
        .from('content_calendar')
        .delete()
        .eq('agency_id', ctx.agencyId)
        .eq('status', 'planned');
    }

    if (calendarEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('content_calendar')
        .insert(calendarEntries);
      if (insertError) console.error('Calendar insert error:', insertError);
    }

    // Update content pillars if suggested
    if (plan.suggested_pillars?.length > 0 && (!profile.content_pillars || profile.content_pillars.length === 0)) {
      await supabase
        .from('business_profiles')
        .update({ content_pillars: plan.suggested_pillars })
        .eq('id', profile.id);
    }

    // Log generation
    await supabase.from('generated_content_history').insert({
      agency_id: ctx.agencyId,
      content_type: 'calendar',
      input_data: { days, totalPosts, businessType: profile.business_type },
      output_data: plan,
      model_used: 'gpt-4o-mini',
      tokens_used: completion.usage?.total_tokens || 0,
      credits_used: creditResult.creditsUsed || 1,
    });

    return NextResponse.json({
      plan,
      postsCreated: calendarEntries.length,
      creditsUsed: creditResult.creditsUsed,
      creditsRemaining: creditResult.creditsRemaining,
    });
  } catch (error: any) {
    console.error('Content plan error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao gerar plano' }, { status: 500 });
  }
}
