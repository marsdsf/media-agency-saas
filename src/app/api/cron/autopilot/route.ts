import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText, generateImage } from '@/lib/ai-providers';
import { loadBrandMemory, buildBrandAwarePrompt, analyzeBestPostingTimes } from '@/lib/ai-memory';

// CRON: Executa a cada hora para gerar conteúdo automaticamente 
// para clientes com autopilot ativado
// Vercel Cron: 0 * * * * (a cada hora)

export async function GET(request: Request) {
  // Verificar cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Buscar todos os autopilots ativos
    const { data: configs } = await supabase
      .from('ai_autopilot_configs')
      .select('*, agencies(ai_credits_limit, ai_credits_used, plan)')
      .eq('enabled', true);

    if (!configs?.length) {
      return NextResponse.json({ message: 'Nenhum autopilot ativo', processed: 0 });
    }

    let totalGenerated = 0;

    for (const config of configs) {
      try {
        // Verificar se a agência tem créditos
        const agency = config.agencies;
        if (!agency) continue;

        const availableCredits = agency.ai_credits_limit === -1
          ? Infinity
          : agency.ai_credits_limit - agency.ai_credits_used;

        if (availableCredits < 20) continue; // Precisa de pelo menos 20 créditos

        // Verificar se já tem posts suficientes agendados para os próximos 3 dias
        const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        const { data: scheduledPosts, error: schedErr } = await supabase
          .from('posts')
          .select('id')
          .eq('agency_id', config.agency_id)
          .eq('client_id', config.client_id || '')
          .eq('status', 'scheduled')
          .gte('scheduled_at', new Date().toISOString())
          .lte('scheduled_at', threeDaysLater);

        // Se já tem posts suficientes para 3 dias, pular
        const platforms = config.platforms || ['instagram'];
        const weeklyFreq = config.frequency || { instagram: 3 };
        const totalWeekly = platforms.reduce((sum: number, p: string) => sum + (weeklyFreq[p] || 3), 0);
        const expectedFor3Days = Math.ceil(totalWeekly * 3 / 7);

        if ((scheduledPosts?.length || 0) >= expectedFor3Days) continue;

        // Precisamos gerar mais posts
        const postsNeeded = Math.max(1, expectedFor3Days - (scheduledPosts?.length || 0));
        const postsToGenerate = Math.min(postsNeeded, 5); // Max 5 por execução

        // Carregar memória de marca (usando admin client)
        const memory = await loadBrandMemoryAdmin(supabase, config.agency_id, config.client_id);
        const bestTimes = await analyzeBestTimesAdmin(supabase, config.agency_id, config.client_id);

        const contentPillars = config.content_pillars?.length
          ? config.content_pillars
          : ['dicas práticas', 'tendências', 'bastidores', 'engajamento'];

        for (let i = 0; i < postsToGenerate; i++) {
          const platform = platforms[i % platforms.length];
          const pillar = contentPillars[i % contentPillars.length];

          // Gerar conteúdo
          const textResult = await generateText({
            provider: config.provider || 'auto',
            systemPrompt: buildAutopilotPrompt(memory, platform, config.tone),
            userPrompt: `Crie um post original sobre o pilar "${pillar}".
${config.description ? `Contexto: ${config.description}` : ''}

Responda em JSON:
{
  "content": "texto completo do post",
  "hashtags": ["hashtag1", "hashtag2"],
  "imagePrompt": "prompt para imagem"
}`,
            responseFormat: 'json',
            temperature: 0.9,
          });

          let parsed: any = {};
          try {
            parsed = JSON.parse(textResult.content);
          } catch {
            parsed = { content: textResult.content, hashtags: [] };
          }

          // Calcular horário de agendamento
          const scheduleDate = new Date();
          scheduleDate.setDate(scheduleDate.getDate() + 1 + Math.floor(i / platforms.length));
          const platTimes = bestTimes[platform] || ['18:00'];
          const timeSlot = platTimes[i % platTimes.length] || '18:00';
          const [h, m] = timeSlot.split(':').map(Number);
          scheduleDate.setHours(h || 18, m || 0, 0, 0);

          // Gerar imagem se configurado
          let imageUrl: string | null = null;
          if (config.image_generation && parsed.imagePrompt) {
            try {
              const imgResult = await generateImage({
                provider: config.provider || 'auto',
                prompt: parsed.imagePrompt + '. Professional social media visual.',
                size: platform === 'instagram' ? '1024x1024' : '1792x1024',
              });

              if (imgResult.success && imgResult.images[0]) {
                const img = imgResult.images[0];
                if (img.url.startsWith('data:')) {
                  const base64 = img.url.split(',')[1];
                  const buffer = Buffer.from(base64, 'base64');
                  const fname = `autopilot/${config.agency_id}/${Date.now()}-${i}.png`;
                  const { data: up } = await supabase.storage
                    .from('media')
                    .upload(fname, buffer, { contentType: 'image/png' });
                  if (up) {
                    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fname);
                    imageUrl = publicUrl;
                  }
                } else {
                  imageUrl = img.url;
                }
              }
            } catch { /* continuar sem imagem */ }
          }

          // Status: auto_approve = 'scheduled', senão 'draft' para revisão
          const status = config.auto_approve ? 'scheduled' : 'draft';

          await supabase.from('posts').insert({
            agency_id: config.agency_id,
            client_id: config.client_id || null,
            content: parsed.content || pillar,
            platform,
            status,
            scheduled_at: scheduleDate.toISOString(),
            hashtags: parsed.hashtags || [],
            media_urls: imageUrl ? [imageUrl] : [],
            created_by: config.updated_by,
            metadata: {
              ai_generated: true,
              pipeline: 'autopilot',
              pillar,
              ai_provider: textResult.provider,
              auto_approved: config.auto_approve,
            },
          });

          // Deduzir créditos
          await supabase.rpc('deduct_credits', {
            p_agency_id: config.agency_id,
            p_amount: 10, // 10 créditos por post
          });

          totalGenerated++;
        }
      } catch (err) {
        console.error(`Autopilot error for agency ${config.agency_id}:`, err);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      processed: configs.length,
      totalGenerated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Autopilot cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Versão admin da loadBrandMemory (sem createClient de server)
async function loadBrandMemoryAdmin(supabase: any, agencyId: string, clientId?: string) {
  const brandQuery = supabase
    .from('brand_assets')
    .select('*')
    .eq('agency_id', agencyId);

  if (clientId) brandQuery.eq('client_id', clientId);
  const { data: brand } = await brandQuery.maybeSingle();

  const { data: recentPosts } = await supabase
    .from('posts')
    .select('content, platform, metadata')
    .eq('agency_id', agencyId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(10);

  return {
    brandVoice: brand?.brand_voice_guidelines || '',
    toneOfVoice: brand?.tone_of_voice || '',
    targetAudience: brand?.target_audience ? JSON.stringify(brand.target_audience) : '',
    contentPillars: brand?.metadata?.content_pillars || [],
    keywords: brand?.metadata?.keywords || [],
    bestPosts: (recentPosts || []).slice(0, 5).map((p: any) => p.content?.substring(0, 150)),
  };
}

async function analyzeBestTimesAdmin(supabase: any, agencyId: string, clientId?: string) {
  const query = supabase
    .from('posts')
    .select('published_at, platform')
    .eq('agency_id', agencyId)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .limit(100);

  if (clientId) query.eq('client_id', clientId);
  const { data: posts } = await query;

  if (!posts?.length) {
    return {
      instagram: ['09:00', '12:00', '18:00', '21:00'],
      facebook: ['09:00', '13:00', '16:00'],
      linkedin: ['08:00', '10:00', '17:00'],
      twitter: ['08:00', '12:00', '17:00'],
      tiktok: ['07:00', '12:00', '19:00', '22:00'],
    };
  }

  const times: Record<string, string[]> = {};
  const hourCounts: Record<string, Record<string, number>> = {};

  posts.forEach((p: any) => {
    if (!p.published_at) return;
    const h = new Date(p.published_at).getHours().toString().padStart(2, '0') + ':00';
    const pl = p.platform || 'instagram';
    if (!hourCounts[pl]) hourCounts[pl] = {};
    hourCounts[pl][h] = (hourCounts[pl][h] || 0) + 1;
  });

  Object.entries(hourCounts).forEach(([pl, hours]) => {
    times[pl] = Object.entries(hours)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 4)
      .map(([h]) => h);
  });

  return times;
}

function buildAutopilotPrompt(memory: any, platform: string, tone?: string) {
  const platformMap: Record<string, string> = {
    instagram: 'Instagram. Use emojis, storytelling e CTA. Max 2200 chars.',
    facebook: 'Facebook. Tom conversacional, perguntas engajadoras.',
    linkedin: 'LinkedIn. Tom profissional, insights de mercado.',
    twitter: 'Twitter/X. Max 280 chars, direto ao ponto.',
    tiktok: 'TikTok. Linguagem jovem, hooks impactantes.',
  };

  return `Você é um criador de conteúdo especialista em ${platformMap[platform] || 'redes sociais.'}
${memory.brandVoice ? `Voz da marca: ${memory.brandVoice}` : ''}
${memory.toneOfVoice ? `Tom: ${memory.toneOfVoice}` : tone ? `Tom: ${tone}` : ''}
${memory.targetAudience ? `Público: ${memory.targetAudience}` : ''}
${memory.bestPosts?.length ? `Posts de referência:\n${memory.bestPosts.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}` : ''}
RESPONDA SEMPRE EM PORTUGUÊS BRASILEIRO.`;
}
