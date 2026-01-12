import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { useCredits } from '@/lib/credits';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { prompt, type = 'post', topic, template } = await request.json();

    // Determinar custo baseado no tipo
    const action = type === 'caption' ? 'generate_caption' : 
                   type === 'hashtags' ? 'generate_hashtags' : 
                   type === 'tiktok' ? 'generate_post' : 'generate_post';

    // Verificar e deduzir créditos
    const creditResult = await useCredits(user.id, action, `Geração de ${type}`);
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error, required: creditResult.required },
        { status: 402 }
      );
    }

    // Prompts específicos por tipo
    const systemPrompts: Record<string, string> = {
      post: `Você é um especialista em marketing de mídias sociais. 
Crie conteúdo engajador e profissional para redes sociais.
Inclua emojis relevantes e call-to-action quando apropriado.
Responda em português brasileiro.`,

      caption: `Você é um copywriter especialista em legendas para Instagram.
Crie legendas envolventes, com gancho inicial forte.
Use storytelling quando possível.
Inclua emojis estrategicamente.
Responda em português brasileiro.`,

      hashtags: `Você é um especialista em hashtags para redes sociais.
Gere uma lista de hashtags relevantes e estratégicas.
Inclua mix de hashtags populares e de nicho.
Formate como lista separada por espaços.
Responda apenas com as hashtags, sem explicações.`,

      tiktok: `Você é um especialista em conteúdo viral para TikTok.
Seu objetivo é criar conteúdo que viraliza no TikTok Brasil.
Você conhece todas as trends, formatos e técnicas de engajamento.
Sempre crie hooks que prendem nos primeiros 3 segundos.
Use linguagem jovem e dinâmica.
Responda SEMPRE em JSON válido com a seguinte estrutura:
{
  "hook": "frase de hook para os primeiros 3 segundos",
  "script": "roteiro completo com timestamps [0-3s], [3-8s], etc",
  "caption": "legenda para o vídeo com emojis",
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "cta": "call to action final"
}`,
    };

    // Handle TikTok content generation
    if (type === 'tiktok') {
      const templateContext = template ? `Use o formato de vídeo: ${template}` : '';
      const userPrompt = `Crie conteúdo viral para TikTok sobre: ${topic}\n${templateContext}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompts.tiktok },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.9,
      });

      const content = completion.choices[0]?.message?.content || '';
      
      try {
        const parsed = JSON.parse(content);
        return NextResponse.json({
          ...parsed,
          creditsUsed: creditResult.creditsUsed,
          creditsRemaining: creditResult.creditsRemaining,
        });
      } catch {
        // Fallback se não for JSON válido
        return NextResponse.json({
          hook: `POV: Você descobriu algo incrível sobre ${topic}`,
          script: content,
          caption: `🔥 ${topic} - Você precisa ver isso!`,
          hashtags: ['#fyp', '#viral', '#trending', '#foryou', '#tiktok'],
          cta: 'Salva e segue pra mais! 🚀',
          creditsUsed: creditResult.creditsUsed,
          creditsRemaining: creditResult.creditsRemaining,
        });
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompts[type] || systemPrompts.post },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      content,
      creditsUsed: creditResult.creditsUsed,
      creditsRemaining: creditResult.creditsRemaining,
    });
  } catch (error: any) {
    console.error('AI generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar conteúdo' },
      { status: 500 }
    );
  }
}
