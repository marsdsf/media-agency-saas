// Multi-AI Provider Abstraction Layer
// Suporta OpenAI (GPT-4o, DALL-E 3) e Google Gemini (text, images, video)

import OpenAI from 'openai';

// === Types ===

export interface AIProvider {
  id: 'openai' | 'gemini';
  name: string;
}

export interface TextGenerationOptions {
  provider?: 'openai' | 'gemini' | 'auto';
  model?: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: 'text' | 'json';
}

export interface ImageGenerationOptions {
  provider?: 'openai' | 'gemini' | 'auto';
  prompt: string;
  style?: 'natural' | 'vivid';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  n?: number;
}

export interface VideoGenerationOptions {
  provider?: 'gemini';
  prompt: string;
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  style?: string;
}

export interface AITextResult {
  success: boolean;
  content: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  error?: string;
}

export interface AIImageResult {
  success: boolean;
  images: { url: string; revisedPrompt?: string }[];
  provider: string;
  error?: string;
}

export interface AIVideoResult {
  success: boolean;
  videoUrl?: string;
  status: 'completed' | 'processing' | 'failed';
  provider: string;
  operationId?: string;
  error?: string;
}

// === OpenAI Client ===
function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

// === Gemini Client (via REST API) ===
function getGeminiKey(): string | null {
  return process.env.GEMINI_API_KEY || null;
}

// === Text Generation ===
export async function generateText(options: TextGenerationOptions): Promise<AITextResult> {
  const provider = options.provider === 'auto' || !options.provider
    ? (getOpenAI() ? 'openai' : getGeminiKey() ? 'gemini' : null)
    : options.provider;

  if (!provider) {
    return { success: false, content: '', provider: 'none', model: 'none', error: 'Nenhum provedor de IA configurado' };
  }

  try {
    if (provider === 'openai') {
      return await generateTextOpenAI(options);
    } else {
      return await generateTextGemini(options);
    }
  } catch (error: any) {
    // Fallback: try the other provider
    if (options.provider === 'auto' || !options.provider) {
      try {
        if (provider === 'openai' && getGeminiKey()) {
          return await generateTextGemini(options);
        } else if (provider === 'gemini' && getOpenAI()) {
          return await generateTextOpenAI(options);
        }
      } catch {
        // Both failed
      }
    }
    return { success: false, content: '', provider, model: 'unknown', error: error.message };
  }
}

async function generateTextOpenAI(options: TextGenerationOptions): Promise<AITextResult> {
  const openai = getOpenAI();
  if (!openai) throw new Error('OpenAI not configured');

  const model = options.model || 'gpt-4o-mini';
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: options.systemPrompt },
      { role: 'user', content: options.userPrompt },
    ],
    max_tokens: options.maxTokens || 2000,
    temperature: options.temperature ?? 0.8,
    ...(options.responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {}),
  });

  const content = completion.choices[0]?.message?.content || '';
  return {
    success: true,
    content,
    provider: 'openai',
    model,
    tokensUsed: completion.usage?.total_tokens,
  };
}

async function generateTextGemini(options: TextGenerationOptions): Promise<AITextResult> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('Gemini not configured');

  const model = options.model || 'gemini-2.0-flash';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: options.systemPrompt }] },
        contents: [{ parts: [{ text: options.userPrompt }] }],
        generationConfig: {
          maxOutputTokens: options.maxTokens || 2000,
          temperature: options.temperature ?? 0.8,
          ...(options.responseFormat === 'json' ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Gemini error');

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return {
    success: true,
    content,
    provider: 'gemini',
    model,
    tokensUsed: data.usageMetadata?.totalTokenCount,
  };
}

// === Image Generation ===
export async function generateImage(options: ImageGenerationOptions): Promise<AIImageResult> {
  const provider = options.provider === 'auto' || !options.provider
    ? (getOpenAI() ? 'openai' : getGeminiKey() ? 'gemini' : null)
    : options.provider;

  if (!provider) {
    return { success: false, images: [], provider: 'none', error: 'Nenhum provedor de IA configurado' };
  }

  try {
    if (provider === 'openai') {
      return await generateImageOpenAI(options);
    } else {
      return await generateImageGemini(options);
    }
  } catch (error: any) {
    // Fallback
    if (options.provider === 'auto' || !options.provider) {
      try {
        if (provider === 'openai' && getGeminiKey()) return await generateImageGemini(options);
        if (provider === 'gemini' && getOpenAI()) return await generateImageOpenAI(options);
      } catch { /* both failed */ }
    }
    return { success: false, images: [], provider, error: error.message };
  }
}

async function generateImageOpenAI(options: ImageGenerationOptions): Promise<AIImageResult> {
  const openai = getOpenAI();
  if (!openai) throw new Error('OpenAI not configured');

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: options.prompt,
    n: 1, // DALL-E 3 only supports n=1
    size: options.size || '1024x1024',
    quality: options.quality || 'standard',
    style: options.style || 'vivid',
  });

  const images = (response.data || []).map((img) => ({
    url: img.url || '',
    revisedPrompt: img.revised_prompt,
  }));

  return { success: true, images, provider: 'openai' };
}

async function generateImageGemini(options: ImageGenerationOptions): Promise<AIImageResult> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('Gemini not configured');

  // Gemini Imagen 3 via generateImages endpoint
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: options.prompt }],
        parameters: {
          sampleCount: options.n || 1,
          aspectRatio: options.size === '1792x1024' ? '16:9' : options.size === '1024x1792' ? '9:16' : '1:1',
        },
      }),
    }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Gemini Imagen error');

  const images = (data.predictions || []).map((pred: any) => ({
    url: `data:image/png;base64,${pred.bytesBase64Encoded}`,
    revisedPrompt: undefined,
  }));

  return { success: true, images, provider: 'gemini' };
}

// === Video Generation ===
export async function generateVideo(options: VideoGenerationOptions): Promise<AIVideoResult> {
  const apiKey = getGeminiKey();

  if (!apiKey) {
    return { success: false, status: 'failed', provider: 'none', error: 'Gemini API key required for video generation' };
  }

  try {
    // Gemini Veo 2 para geração de vídeo
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{
            prompt: options.prompt,
          }],
          parameters: {
            aspectRatio: options.aspectRatio || '9:16',
            durationSeconds: options.duration || 8,
            personGeneration: 'allow_adult',
          },
        }),
      }
    );

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message || 'Veo video generation error');
    }

    // Video generation is async — returns operation name
    if (data.name) {
      return {
        success: true,
        status: 'processing',
        provider: 'gemini',
        operationId: data.name,
      };
    }

    // If synchronous result
    const videoData = data.predictions?.[0];
    if (videoData?.bytesBase64Encoded) {
      return {
        success: true,
        status: 'completed',
        videoUrl: `data:video/mp4;base64,${videoData.bytesBase64Encoded}`,
        provider: 'gemini',
      };
    }

    return { success: false, status: 'failed', provider: 'gemini', error: 'No video data returned' };
  } catch (error: any) {
    return { success: false, status: 'failed', provider: 'gemini', error: error.message };
  }
}

// Check video generation status (for async operations)
export async function checkVideoStatus(operationId: string): Promise<AIVideoResult> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    return { success: false, status: 'failed', provider: 'gemini', error: 'Gemini not configured' };
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operationId}?key=${apiKey}`
    );
    const data = await res.json();

    if (data.done) {
      const video = data.response?.predictions?.[0];
      return {
        success: true,
        status: 'completed',
        videoUrl: video ? `data:video/mp4;base64,${video.bytesBase64Encoded}` : undefined,
        provider: 'gemini',
        operationId,
      };
    }

    return {
      success: true,
      status: 'processing',
      provider: 'gemini',
      operationId,
    };
  } catch (error: any) {
    return { success: false, status: 'failed', provider: 'gemini', error: error.message };
  }
}

// === Content Pipeline Helpers ===

// Gerar texto + imagem juntos (pipeline completo)
export async function generateContentPipeline(params: {
  description: string;
  platform: string;
  brandVoice?: string;
  targetAudience?: string;
  previousPosts?: string[];
  imageStyle?: string;
}): Promise<{
  text: AITextResult;
  image: AIImageResult | null;
  hashtags: string[];
}> {
  const { description, platform, brandVoice, targetAudience, previousPosts, imageStyle } = params;

  const platformContext: Record<string, string> = {
    instagram: 'Instagram post. Use emojis, storytelling, CTA. Max 2200 chars. Linguagem visual e engajadora.',
    facebook: 'Facebook post. Conversacional, informativo. Pode ser mais longo. Use perguntas ao público.',
    linkedin: 'LinkedIn post. Tom profissional mas acessível. Insights de mercado. Use formatação com bullets.',
    twitter: 'Twitter/X post. Máximo 280 caracteres. Direto ao ponto. Tom viral.',
    tiktok: 'TikTok caption. Curta e impactante. Use trends e gírias atuais. Hooks nos primeiros 3 segundos.',
    youtube: 'YouTube description. SEO otimizado. Timestamps. Links e CTAs.',
  };

  const memoryContext = previousPosts?.length
    ? `\n\nPosts anteriores para referência de tom e estilo:\n${previousPosts.slice(-5).map((p, i) => `${i + 1}. ${p.substring(0, 100)}`).join('\n')}`
    : '';

  const brandContext = brandVoice
    ? `\n\nVoz da marca: ${brandVoice}`
    : '';

  const audienceContext = targetAudience
    ? `\n\nPúblico-alvo: ${targetAudience}`
    : '';

  // Gerar texto
  const textResult = await generateText({
    provider: 'auto',
    systemPrompt: `Você é um especialista em marketing de mídias sociais para o mercado brasileiro.
Crie conteúdo para: ${platformContext[platform] || 'Rede social genérica.'}
${brandContext}${audienceContext}${memoryContext}

REGRAS:
- Responda SEMPRE em português brasileiro
- Inclua emojis estratégicos
- Seja autêntico e engajador
- Adapte o tom para a plataforma
- Inclua call-to-action`,
    userPrompt: `Crie um post sobre: ${description}

Responda em JSON com esta estrutura:
{
  "content": "texto do post completo",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "imagePrompt": "prompt em inglês para gerar a imagem ideal para este post",
  "bestTime": "melhor horário sugerido para postar (ex: 18:30)",
  "hook": "frase de gancho inicial"
}`,
    responseFormat: 'json',
    temperature: 0.85,
  });

  let parsedContent: any = {};
  try {
    parsedContent = JSON.parse(textResult.content);
  } catch {
    parsedContent = { content: textResult.content, hashtags: [], imagePrompt: '' };
  }

  // Gerar imagem se houver prompt
  let imageResult: AIImageResult | null = null;
  const imgPrompt = parsedContent.imagePrompt;
  if (imgPrompt) {
    const styleContext = imageStyle || 'modern, professional social media visual';
    imageResult = await generateImage({
      provider: 'auto',
      prompt: `${imgPrompt}. Style: ${styleContext}. High quality, vibrant colors, social media optimized.`,
      size: platform === 'instagram' ? '1024x1024' : platform === 'tiktok' ? '1024x1792' : '1792x1024',
      quality: 'hd',
    });
  }

  return {
    text: { ...textResult, content: parsedContent.content || textResult.content },
    image: imageResult,
    hashtags: parsedContent.hashtags || [],
  };
}
