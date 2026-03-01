import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { useCredits } from '@/lib/credits';
import { generateText } from '@/lib/ai-providers';
import { loadBrandMemory, buildBrandAwarePrompt, analyzeBestPostingTimes } from '@/lib/ai-memory';
import { createClient } from '@/lib/supabase/server';

// AI Smart Scheduler - Preenche o calendário automaticamente
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const {
      clientId,
      platforms,         // ['instagram', 'facebook', ...]
      startDate,         // Data início (ISO string)
      endDate,           // Data fim (ISO string)
      postsPerWeek,      // Posts por semana por plataforma (default: 3)
      themes,            // Temas/pilares de conteúdo (opcional)
      includeImages,     // Gerar imagens? (default: true)
      provider,          // 'openai' | 'gemini' | 'auto'
    } = await request.json();

    const targetPlatforms = platforms?.length ? platforms : ['instagram'];
    const frequency = postsPerWeek || 3;
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 semana

    // Calcular total de posts necessários
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const weeksCount = Math.max(1, Math.ceil(daysDiff / 7));
    const totalPostsPerPlatform = weeksCount * frequency;
    const totalPosts = totalPostsPerPlatform * targetPlatforms.length;

    if (totalPosts > 50) {
      return NextResponse.json({
        error: 'Máximo de 50 posts por vez. Reduza o período ou frequência.',
      }, { status: 400 });
    }

    // Carregar contexto
    const memory = await loadBrandMemory(ctx.agencyId, clientId);
    const bestTimes = await analyzeBestPostingTimes(ctx.agencyId, clientId);

    // Gerar plano de conteúdo com IA
    const contentPillars = themes?.length
      ? themes
      : memory.contentPillars.length
        ? memory.contentPillars
        : ['dicas práticas', 'bastidores', 'cases de sucesso', 'tendências', 'engajamento'];

    // Primeiro: gerar o plano editorial
    const planResult = await generateText({
      provider: provider || 'auto',
      systemPrompt: buildBrandAwarePrompt(memory, targetPlatforms[0]),
      userPrompt: `Crie um calendário editorial detalhado para ${totalPostsPerPlatform} posts.
Período: ${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')}
Plataformas: ${targetPlatforms.join(', ')}
Frequência: ${frequency} posts por semana por plataforma
Pilares de conteúdo: ${contentPillars.join(', ')}

Responda em JSON:
{
  "calendar": [
    {
      "day": 1,
      "theme": "pilar de conteúdo",
      "title": "título do post",
      "description": "descrição breve do conteúdo",
      "platform": "plataforma",
      "type": "carrossel|imagem|reels|texto|stories",
      "mood": "inspirador|educativo|divertido|informativo|vendas"
    }
  ]
}

Distribua os pilares de conteúdo de forma equilibrada. Varie os tipos de post.
Organize por dias sequenciais (dia 1, 2, 3, etc.)`,
      responseFormat: 'json',
      temperature: 0.8,
    });

    let plan: any = {};
    try {
      plan = JSON.parse(planResult.content);
    } catch {
      return NextResponse.json({
        error: 'Falha ao gerar plano de conteúdo. Tente novamente.',
      }, { status: 500 });
    }

    const calendarItems = plan.calendar || [];
    if (calendarItems.length === 0) {
      return NextResponse.json({
        error: 'Nenhum item no calendário gerado.',
      }, { status: 500 });
    }

    const supabase = await createClient();
    const generatedPosts: any[] = [];

    // Gerar conteúdo para cada item do calendário
    for (let idx = 0; idx < calendarItems.length; idx++) {
      const item = calendarItems[idx];

      // Verificar créditos
      const cr = await useCredits(ctx.userId, 'generate_post', 'Smart Scheduler IA');
      if (!cr.success) {
        // Retornar o que foi gerado até agora
        return NextResponse.json({
          success: true,
          partial: true,
          posts: generatedPosts,
          totalPlanned: calendarItems.length,
          totalGenerated: generatedPosts.length,
          message: `Créditos insuficientes. Gerados ${generatedPosts.length} de ${calendarItems.length} posts.`,
        });
      }

      const platform = item.platform || targetPlatforms[idx % targetPlatforms.length];
      const systemPrompt = buildBrandAwarePrompt(memory, platform);

      const postResult = await generateText({
        provider: provider || 'auto',
        systemPrompt,
        userPrompt: `Crie o conteúdo completo para este post:
Tema: ${item.theme || 'geral'}
Título/Ideia: ${item.title || item.description}
Tipo: ${item.type || 'imagem'}
Tom: ${item.mood || 'profissional'}
Plataforma: ${platform}

Responda em JSON:
{
  "content": "texto completo do post com emojis e formatação",
  "hashtags": ["hashtag1", "hashtag2"],
  "imagePrompt": "prompt detalhado para gerar imagem",
  "cta": "call to action"
}`,
        responseFormat: 'json',
        temperature: 0.85,
      });

      let parsed: any = {};
      try {
        parsed = JSON.parse(postResult.content);
      } catch {
        parsed = { content: item.description || item.title, hashtags: [] };
      }

      // Calcular data de agendamento
      const scheduleDate = new Date(start);
      scheduleDate.setDate(scheduleDate.getDate() + (item.day || idx));

      const platTimes = bestTimes[platform] || ['09:00', '12:00', '18:00'];
      const timesToUse = platTimes[idx % platTimes.length] || '18:00';
      const [hours, minutes] = timesToUse.split(':').map(Number);
      scheduleDate.setHours(hours || 18, minutes || 0, 0, 0);

      // Evitar agendar no passado
      if (scheduleDate.getTime() < Date.now()) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      const postData = {
        agency_id: ctx.agencyId,
        client_id: clientId || null,
        content: parsed.content || item.description,
        platform,
        status: 'scheduled',
        scheduled_at: scheduleDate.toISOString(),
        hashtags: parsed.hashtags || [],
        media_urls: [],
        created_by: ctx.userId,
        metadata: {
          ai_generated: true,
          ai_provider: postResult.provider,
          pipeline: 'smart_scheduler',
          theme: item.theme,
          type: item.type,
          mood: item.mood,
          image_prompt: parsed.imagePrompt,
          cta: parsed.cta,
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
        scheduledAt: scheduleDate.toISOString(),
        theme: item.theme,
        type: item.type,
        mood: item.mood,
      });
    }

    return NextResponse.json({
      success: true,
      posts: generatedPosts,
      totalGenerated: generatedPosts.length,
      period: { start: start.toISOString(), end: end.toISOString() },
      platforms: targetPlatforms,
    });
  } catch (error: any) {
    console.error('AI Smart Scheduler error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro no agendador inteligente' },
      { status: 500 }
    );
  }
}
