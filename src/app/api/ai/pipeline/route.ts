import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { useCredits } from '@/lib/credits';
import { generateText, generateImage } from '@/lib/ai-providers';
import { loadBrandMemory, buildBrandAwarePrompt, analyzeBestPostingTimes } from '@/lib/ai-memory';
import { createClient } from '@/lib/supabase/server';

// Pipeline completo: descrição → texto + imagem + hashtags + agendamento
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const {
      description,      // Descrição do que o usuário quer
      platforms,         // ['instagram', 'facebook', ...]
      clientId,          // Cliente (opcional)
      generateImages,    // Gerar imagens? (default: true)
      autoSchedule,      // Agendar automaticamente? (default: false)
      campaignId,        // ID da campanha (opcional)
      count,             // Quantos posts gerar (default: 1)
      imageProvider,     // 'openai' | 'gemini' | 'auto'
      textProvider,      // 'openai' | 'gemini' | 'auto'
    } = await request.json();

    if (!description) {
      return NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 });
    }

    const targetPlatforms = platforms?.length ? platforms : ['instagram'];
    const postsToGenerate = Math.min(count || 1, 10);
    const shouldGenerateImages = generateImages !== false;

    // Deduzir créditos por post gerado
    const totalCredits = postsToGenerate * targetPlatforms.length;
    for (let i = 0; i < totalCredits; i++) {
      const cr = await useCredits(ctx.userId, 'generate_post', 'Pipeline de conteúdo IA');
      if (!cr.success) {
        return NextResponse.json({
          error: cr.error,
          postsGenerated: i,
          message: `Gerados ${i} de ${totalCredits} posts antes de créditos acabarem`,
        }, { status: 402 });
      }
    }

    // Carregar memória/contexto da marca
    const memory = await loadBrandMemory(ctx.agencyId, clientId);
    const bestTimes = await analyzeBestPostingTimes(ctx.agencyId, clientId);

    const supabase = await createClient();
    const generatedPosts: any[] = [];

    for (let i = 0; i < postsToGenerate; i++) {
      for (const platform of targetPlatforms) {
        const systemPrompt = buildBrandAwarePrompt(memory, platform);

        // Gerar conteúdo de texto
        const variationHint = postsToGenerate > 1 
          ? `\nEsta é a variação ${i + 1} de ${postsToGenerate}. Crie conteúdo DIFERENTE das outras variações.`
          : '';

        const textResult = await generateText({
          provider: textProvider || 'auto',
          systemPrompt,
          userPrompt: `Crie um post sobre: ${description}${variationHint}

Responda em JSON:
{
  "content": "texto completo do post",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "imagePrompt": "prompt em inglês detalhado para gerar a imagem ideal (se aplicável)",
  "bestTimeSlot": "melhor horário para postar (ex: 18:00)",
  "hook": "frase de abertura/gancho",
  "cta": "call to action",
  "mood": "humor/sentimento do post (ex: inspirador, educativo, divertido)"
}`,
          responseFormat: 'json',
          temperature: 0.85 + (i * 0.03), // Variar temperatura para diversidade
        });

        let parsed: any = {};
        try {
          parsed = JSON.parse(textResult.content);
        } catch {
          parsed = {
            content: textResult.content,
            hashtags: memory.preferredHashtags.slice(0, 10),
            imagePrompt: description,
            hook: '',
            cta: '',
          };
        }

        // Gerar imagem se solicitado
        let imageUrl: string | null = null;
        if (shouldGenerateImages && parsed.imagePrompt) {
          try {
            // Deduzir créditos para imagem
            const imgCredit = await useCredits(ctx.userId, 'generate_image', 'Imagem pipeline IA');
            if (imgCredit.success) {
              const imageResult = await generateImage({
                provider: imageProvider || 'auto',
                prompt: `${parsed.imagePrompt}. Professional social media image, high quality, vibrant.`,
                size: platform === 'instagram' ? '1024x1024' : '1792x1024',
                quality: 'standard',
              });

              if (imageResult.success && imageResult.images[0]) {
                const img = imageResult.images[0];
                // Upload se base64
                if (img.url.startsWith('data:')) {
                  const base64Data = img.url.split(',')[1];
                  const buffer = Buffer.from(base64Data, 'base64');
                  const fileName = `pipeline/${ctx.agencyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;

                  const { data: uploaded } = await supabase.storage
                    .from('media')
                    .upload(fileName, buffer, { contentType: 'image/png' });

                  if (uploaded) {
                    const { data: { publicUrl } } = supabase.storage
                      .from('media')
                      .getPublicUrl(fileName);
                    imageUrl = publicUrl;
                  }
                } else {
                  imageUrl = img.url;
                }
              }
            }
          } catch (imgError) {
            console.error('Image generation failed in pipeline:', imgError);
            // Continuar sem imagem
          }
        }

        // Determinar horário de agendamento
        let scheduledAt: string | null = null;
        if (autoSchedule) {
          const platTimes = bestTimes[platform] || ['18:00'];
          const timeSlot = parsed.bestTimeSlot || platTimes[i % platTimes.length] || '18:00';
          const scheduleDate = new Date();
          scheduleDate.setDate(scheduleDate.getDate() + 1 + Math.floor(i / targetPlatforms.length));
          const [hours, minutes] = timeSlot.split(':').map(Number);
          scheduleDate.setHours(hours || 18, minutes || 0, 0, 0);
          scheduledAt = scheduleDate.toISOString();
        }

        // Criar o post no banco
        const postData = {
          agency_id: ctx.agencyId,
          client_id: clientId || null,
          content: parsed.content || description,
          platform,
          status: autoSchedule ? 'scheduled' : 'draft',
          scheduled_at: scheduledAt,
          hashtags: parsed.hashtags || [],
          media_urls: imageUrl ? [imageUrl] : [],
          campaign_id: campaignId || null,
          created_by: ctx.userId,
          metadata: {
            ai_generated: true,
            ai_provider: textResult.provider,
            ai_model: textResult.model,
            hook: parsed.hook,
            cta: parsed.cta,
            mood: parsed.mood,
            image_prompt: parsed.imagePrompt,
            pipeline: true,
            description_original: description,
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
          hashtags: parsed.hashtags,
          imageUrl,
          scheduledAt,
          hook: parsed.hook,
          cta: parsed.cta,
          mood: parsed.mood,
          provider: textResult.provider,
        });
      }
    }

    return NextResponse.json({
      success: true,
      posts: generatedPosts,
      totalGenerated: generatedPosts.length,
      autoScheduled: autoSchedule,
    });
  } catch (error: any) {
    console.error('AI Pipeline error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro no pipeline de IA' },
      { status: 500 }
    );
  }
}
