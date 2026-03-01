import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { useCredits } from '@/lib/credits';
import { generateText } from '@/lib/ai-providers';
import { loadBrandMemory, buildBrandAwarePrompt } from '@/lib/ai-memory';
import { createClient } from '@/lib/supabase/server';

// AI Campaign Planner - Cria campanhas completas multi-plataforma
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const {
      goal,              // Objetivo da campanha
      clientId,
      platforms,         // Plataformas
      duration,          // Duração em dias (default: 7)
      budget,            // Orçamento (opcional)
      targetAudience,    // Público-alvo específico
      tone,              // Tom da campanha
      provider,          // AI provider
    } = await request.json();

    if (!goal) {
      return NextResponse.json({ error: 'Objetivo da campanha é obrigatório' }, { status: 400 });
    }

    // Deduzir créditos (campanha = custo premium)
    const cr1 = await useCredits(ctx.userId, 'generate_post', 'Planejamento de campanha IA');
    const cr2 = await useCredits(ctx.userId, 'generate_post', 'Planejamento de campanha IA');
    if (!cr1.success || !cr2.success) {
      return NextResponse.json({ error: cr1.error || cr2.error }, { status: 402 });
    }

    const targetPlatforms = platforms?.length ? platforms : ['instagram', 'facebook'];
    const campaignDays = duration || 7;

    // Carregar memória de marca
    const memory = await loadBrandMemory(ctx.agencyId, clientId);

    // Fase 1: Gerar estratégia da campanha
    const strategyResult = await generateText({
      provider: provider || 'auto',
      systemPrompt: `Você é um estrategista de marketing digital sênior especializado em campanhas para social media no Brasil.
${memory.brandVoice ? `Voz da marca: ${memory.brandVoice}` : ''}
${memory.targetAudience ? `Público-alvo geral: ${memory.targetAudience}` : ''}`,
      userPrompt: `Crie uma estratégia de campanha completa:

OBJETIVO: ${goal}
PLATAFORMAS: ${targetPlatforms.join(', ')}
DURAÇÃO: ${campaignDays} dias
${budget ? `ORÇAMENTO: R$ ${budget}` : ''}
${targetAudience ? `PÚBLICO-ALVO: ${targetAudience}` : ''}
${tone ? `TOM: ${tone}` : ''}

Responda em JSON:
{
  "campaignName": "nome criativo da campanha",
  "objective": "objetivo SMART",
  "strategy": "estratégia geral em 2-3 frases",
  "targetAudience": {
    "demographics": "perfil demográfico",
    "interests": ["interesse1", "interesse2"],
    "painPoints": ["dor1", "dor2"]
  },
  "phases": [
    {
      "name": "nome da fase (ex: Awareness, Consideration, Conversion)",
      "days": [1, 2, 3],
      "description": "o que acontece nesta fase"
    }
  ],
  "contentPlan": [
    {
      "day": 1,
      "platform": "instagram",
      "type": "carrossel|reels|imagem|stories|texto",
      "title": "título do post",
      "briefing": "briefing detalhado do conteúdo",
      "cta": "call to action",
      "mood": "tom/sentimento",
      "phase": "awareness|consideration|conversion"
    }
  ],
  "kpis": ["kpi1", "kpi2"],
  "hashtags": ["#hashtag1", "#hashtag2"],
  "adSuggestions": [
    {
      "platform": "plataforma",
      "format": "formato do anúncio",
      "budget": "orçamento sugerido",
      "targeting": "segmentação",
      "copy": "texto do anúncio"
    }
  ]
}`,
      responseFormat: 'json',
      temperature: 0.8,
    });

    let strategy: any = {};
    try {
      strategy = JSON.parse(strategyResult.content);
    } catch {
      return NextResponse.json({ error: 'Falha ao gerar estratégia. Tente novamente.' }, { status: 500 });
    }

    const supabase = await createClient();

    // Criar a campanha no banco
    const { data: campaign } = await supabase
      .from('campaigns')
      .insert({
        agency_id: ctx.agencyId,
        client_id: clientId || null,
        name: strategy.campaignName || goal,
        description: strategy.strategy || goal,
        status: 'draft',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + campaignDays * 24 * 60 * 60 * 1000).toISOString(),
        platforms: targetPlatforms,
        budget: budget || null,
        metadata: {
          ai_generated: true,
          ai_provider: strategyResult.provider,
          objective: strategy.objective,
          target_audience: strategy.targetAudience,
          phases: strategy.phases,
          kpis: strategy.kpis,
          ad_suggestions: strategy.adSuggestions,
        },
        created_by: ctx.userId,
      })
      .select('id')
      .single();

    // Fase 2: Gerar conteúdo para cada item do plano
    const contentPlan = strategy.contentPlan || [];
    const generatedPosts: any[] = [];

    for (const item of contentPlan) {
      const cr = await useCredits(ctx.userId, 'generate_post', 'Post de campanha IA');
      if (!cr.success) break;

      const platform = item.platform || targetPlatforms[0];
      const systemPrompt = buildBrandAwarePrompt(memory, platform);

      const postResult = await generateText({
        provider: provider || 'auto',
        systemPrompt: `${systemPrompt}\n\nCampanha: ${strategy.campaignName}\nFase: ${item.phase || 'awareness'}`,
        userPrompt: `Crie o conteúdo completo para este post de campanha:

Tipo: ${item.type}
Briefing: ${item.briefing}
CTA: ${item.cta}
Tom: ${item.mood}
Hashtags da campanha: ${(strategy.hashtags || []).join(' ')}

Responda em JSON:
{
  "content": "texto completo do post",
  "hashtags": ["hashtag1", "hashtag2"],
  "imagePrompt": "prompt para gerar imagem ideal"
}`,
        responseFormat: 'json',
        temperature: 0.85,
      });

      let parsed: any = {};
      try {
        parsed = JSON.parse(postResult.content);
      } catch {
        parsed = { content: item.briefing, hashtags: strategy.hashtags || [] };
      }

      // Calcular data de agendamento
      const scheduleDate = new Date();
      scheduleDate.setDate(scheduleDate.getDate() + (item.day || 1));
      scheduleDate.setHours(18, 0, 0, 0);

      const postData = {
        agency_id: ctx.agencyId,
        client_id: clientId || null,
        content: parsed.content || item.briefing,
        platform,
        status: 'draft', // Campanhas começam como rascunho para aprovação
        scheduled_at: scheduleDate.toISOString(),
        hashtags: parsed.hashtags || strategy.hashtags || [],
        media_urls: [],
        campaign_id: campaign?.id || null,
        created_by: ctx.userId,
        metadata: {
          ai_generated: true,
          campaign_name: strategy.campaignName,
          phase: item.phase,
          type: item.type,
          mood: item.mood,
          cta: item.cta,
          image_prompt: parsed.imagePrompt,
        },
      };

      const { data: savedPost } = await supabase
        .from('posts')
        .insert(postData)
        .select('id')
        .single();

      generatedPosts.push({
        id: savedPost?.id,
        content: parsed.content,
        platform,
        day: item.day,
        phase: item.phase,
        type: item.type,
        scheduledAt: scheduleDate.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign?.id,
        name: strategy.campaignName,
        objective: strategy.objective,
        strategy: strategy.strategy,
        targetAudience: strategy.targetAudience,
        phases: strategy.phases,
        kpis: strategy.kpis,
        adSuggestions: strategy.adSuggestions,
        hashtags: strategy.hashtags,
      },
      posts: generatedPosts,
      totalPosts: generatedPosts.length,
    });
  } catch (error: any) {
    console.error('AI Campaign Planner error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro no planejador de campanhas' },
      { status: 500 }
    );
  }
}
