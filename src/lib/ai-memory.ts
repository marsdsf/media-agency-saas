// AI Memory & Brand Context System
// Armazena e recupera o contexto de marca, preferências, e histórico de performance
// para personalizar todas as gerações de IA

import { createClient } from '@/lib/supabase/server';

export interface BrandMemory {
  brandVoice: string;
  toneOfVoice: string;
  targetAudience: string;
  colors: string[];
  visualStyle: string;
  doList: string[];
  dontList: string[];
  keywords: string[];
  competitors: string[];
  contentPillars: string[];
  bestPerformingPosts: ContentMemory[];
  preferredHashtags: string[];
  postingPreferences: PostingPreferences;
}

export interface ContentMemory {
  content: string;
  platform: string;
  engagement: number;
  type: string;
  postedAt: string;
}

export interface PostingPreferences {
  preferredTimes: Record<string, string[]>; // platform -> times
  frequency: Record<string, number>; // platform -> posts per week
  autoApprove: boolean;
  autoPost: boolean;
}

// Carregar a memória completa de uma marca/cliente
export async function loadBrandMemory(agencyId: string, clientId?: string): Promise<BrandMemory> {
  const supabase = await createClient();

  // 1. Buscar brand assets
  const brandQuery = supabase
    .from('brand_assets')
    .select('*')
    .eq('agency_id', agencyId);

  if (clientId) {
    brandQuery.eq('client_id', clientId);
  }

  const { data: brand } = await brandQuery.maybeSingle();

  // 2. Buscar posts com melhor performance (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const postsQuery = supabase
    .from('posts')
    .select('content, platform, metadata, published_at')
    .eq('agency_id', agencyId)
    .eq('status', 'published')
    .gte('published_at', thirtyDaysAgo.toISOString())
    .order('published_at', { ascending: false })
    .limit(20);

  if (clientId) {
    postsQuery.eq('client_id', clientId);
  }

  const { data: recentPosts } = await postsQuery;

  // 3. Buscar hashtags mais usadas
  const hashtagQuery = supabase
    .from('posts')
    .select('hashtags')
    .eq('agency_id', agencyId)
    .eq('status', 'published')
    .not('hashtags', 'is', null);

  if (clientId) {
    hashtagQuery.eq('client_id', clientId);
  }

  const { data: hashtagPosts } = await hashtagQuery;

  // Consolidar hashtags
  const hashtagCount: Record<string, number> = {};
  hashtagPosts?.forEach((post) => {
    (post.hashtags || []).forEach((h: string) => {
      hashtagCount[h] = (hashtagCount[h] || 0) + 1;
    });
  });
  const preferredHashtags = Object.entries(hashtagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([h]) => h);

  // 4. Buscar configuração de autopilot
  const { data: autopilot } = await supabase
    .from('ai_autopilot_configs')
    .select('*')
    .eq('agency_id', agencyId)
    .eq('client_id', clientId || '')
    .maybeSingle();

  // 5. Construir memória
  const bestPosts: ContentMemory[] = (recentPosts || [])
    .sort((a, b) => {
      const engA = a.metadata?.engagement_score || 0;
      const engB = b.metadata?.engagement_score || 0;
      return engB - engA;
    })
    .slice(0, 10)
    .map((p) => ({
      content: p.content?.substring(0, 200) || '',
      platform: p.platform || 'instagram',
      engagement: p.metadata?.engagement_score || 0,
      type: p.metadata?.type || 'post',
      postedAt: p.published_at || '',
    }));

  return {
    brandVoice: brand?.brand_voice_guidelines || '',
    toneOfVoice: brand?.tone_of_voice || '',
    targetAudience: typeof brand?.target_audience === 'object'
      ? JSON.stringify(brand.target_audience)
      : brand?.target_audience || '',
    colors: brand?.colors || [],
    visualStyle: brand?.metadata?.visual_style || 'moderno e profissional',
    doList: brand?.metadata?.do_list || [],
    dontList: brand?.metadata?.dont_list || [],
    keywords: brand?.metadata?.keywords || [],
    competitors: brand?.metadata?.competitors || [],
    contentPillars: brand?.metadata?.content_pillars || [],
    bestPerformingPosts: bestPosts,
    preferredHashtags,
    postingPreferences: {
      preferredTimes: autopilot?.preferred_times || {},
      frequency: autopilot?.frequency || {},
      autoApprove: autopilot?.auto_approve || false,
      autoPost: autopilot?.auto_post || false,
    },
  };
}

// Construir system prompt enriquecido com memória de marca
export function buildBrandAwarePrompt(memory: BrandMemory, platform: string): string {
  const sections: string[] = [
    'Você é um assistente de marketing digital especializado em criar conteúdo para redes sociais no Brasil.',
  ];

  if (memory.brandVoice) {
    sections.push(`VOZ DA MARCA: ${memory.brandVoice}`);
  }

  if (memory.toneOfVoice) {
    sections.push(`TOM: ${memory.toneOfVoice}`);
  }

  if (memory.targetAudience) {
    sections.push(`PÚBLICO-ALVO: ${memory.targetAudience}`);
  }

  if (memory.contentPillars.length > 0) {
    sections.push(`PILARES DE CONTEÚDO: ${memory.contentPillars.join(', ')}`);
  }

  if (memory.keywords.length > 0) {
    sections.push(`PALAVRAS-CHAVE IMPORTANTES: ${memory.keywords.join(', ')}`);
  }

  if (memory.doList.length > 0) {
    sections.push(`SEMPRE FAÇA: ${memory.doList.join('; ')}`);
  }

  if (memory.dontList.length > 0) {
    sections.push(`NUNCA FAÇA: ${memory.dontList.join('; ')}`);
  }

  if (memory.bestPerformingPosts.length > 0) {
    const topPosts = memory.bestPerformingPosts.slice(0, 5);
    sections.push(
      `POSTS COM MELHOR PERFORMANCE (use como referência de estilo):\n${topPosts
        .map((p, i) => `${i + 1}. [${p.platform}] ${p.content}`)
        .join('\n')}`
    );
  }

  if (memory.preferredHashtags.length > 0) {
    sections.push(`HASHTAGS PREFERIDAS: ${memory.preferredHashtags.slice(0, 15).join(' ')}`);
  }

  const platformInstructions: Record<string, string> = {
    instagram: 'PLATAFORMA: Instagram. Use emojis, storytelling, CTA. Max 2200 chars. Quebre linhas para legibilidade.',
    facebook: 'PLATAFORMA: Facebook. Tom conversacional, perguntas, conteúdo compartilhável.',
    linkedin: 'PLATAFORMA: LinkedIn. Tom profissional, insights de mercado, bullets points.',
    twitter: 'PLATAFORMA: Twitter/X. Max 280 chars. Direto ao ponto. Tom viral.',
    tiktok: 'PLATAFORMA: TikTok. Linguagem jovem, trends, hooks nos 3 primeiros segundos.',
    youtube: 'PLATAFORMA: YouTube. SEO otimizado, timestamps, descrição completa.',
  };

  sections.push(platformInstructions[platform] || 'Crie conteúdo engajador para redes sociais.');
  sections.push('RESPONDA SEMPRE EM PORTUGUÊS BRASILEIRO.');

  return sections.join('\n\n');
}

// Salvar feedback do conteúdo (para aprendizado)
export async function saveContentFeedback(
  agencyId: string,
  postId: string,
  feedback: {
    approved: boolean;
    edited: boolean;
    edits?: string;
    rating?: number;
    notes?: string;
  }
): Promise<void> {
  const supabase = await createClient();

  await supabase.from('ai_content_feedback').insert({
    agency_id: agencyId,
    post_id: postId,
    approved: feedback.approved,
    edited: feedback.edited,
    edits: feedback.edits,
    rating: feedback.rating,
    notes: feedback.notes,
  });

  // Atualizar post metadata com feedback
  const { data: post } = await supabase
    .from('posts')
    .select('metadata')
    .eq('id', postId)
    .single();

  if (post) {
    await supabase
      .from('posts')
      .update({
        metadata: {
          ...post.metadata,
          ai_feedback: feedback,
        },
      })
      .eq('id', postId);
  }
}

// Analisar padrões de melhor horário para postar
export async function analyzeBestPostingTimes(
  agencyId: string,
  clientId?: string,
  platform?: string
): Promise<Record<string, string[]>> {
  const supabase = await createClient();

  const query = supabase
    .from('posts')
    .select('published_at, platform, metadata')
    .eq('agency_id', agencyId)
    .eq('status', 'published')
    .not('published_at', 'is', null);

  if (clientId) query.eq('client_id', clientId);
  if (platform) query.eq('platform', platform);

  const { data: posts } = await query;

  if (!posts?.length) {
    // Retornar horários padrão baseados em research
    return {
      instagram: ['09:00', '12:00', '18:00', '21:00'],
      facebook: ['09:00', '13:00', '16:00'],
      linkedin: ['08:00', '10:00', '17:00'],
      twitter: ['08:00', '12:00', '17:00', '20:00'],
      tiktok: ['07:00', '12:00', '19:00', '22:00'],
      youtube: ['14:00', '16:00', '20:00'],
    };
  }

  // Agrupar por plataforma e horário
  const timeScores: Record<string, Record<string, { count: number; totalEngagement: number }>> = {};

  posts.forEach((post) => {
    if (!post.published_at) return;
    const date = new Date(post.published_at);
    const hour = date.getHours().toString().padStart(2, '0') + ':00';
    const plat = post.platform || 'instagram';

    if (!timeScores[plat]) timeScores[plat] = {};
    if (!timeScores[plat][hour]) timeScores[plat][hour] = { count: 0, totalEngagement: 0 };

    timeScores[plat][hour].count += 1;
    timeScores[plat][hour].totalEngagement += post.metadata?.engagement_score || 0;
  });

  // Pegar os melhores horários por engajamento médio
  const bestTimes: Record<string, string[]> = {};

  Object.entries(timeScores).forEach(([plat, hours]) => {
    const sorted = Object.entries(hours)
      .map(([hour, data]) => ({
        hour,
        avgEngagement: data.totalEngagement / data.count,
        count: data.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);

    bestTimes[plat] = sorted.slice(0, 4).map((t) => t.hour);
  });

  return bestTimes;
}
