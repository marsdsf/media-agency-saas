import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { useCredits } from '@/lib/credits';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Agentes especializados
const AGENTS = {
  general: {
    name: 'Assistente Geral',
    systemPrompt: `Você é um assistente de marketing digital especializado em redes sociais.
Ajude o usuário com estratégias, conteúdo e dúvidas sobre marketing.
Seja objetivo e prático nas respostas.
Responda em português brasileiro.`,
  },
  content: {
    name: 'Criador de Conteúdo',
    systemPrompt: `Você é um especialista em criação de conteúdo para redes sociais.
Ajude a criar posts, legendas, roteiros de vídeo e ideias de conteúdo.
Seja criativo e engajador.
Responda em português brasileiro.`,
  },
  strategy: {
    name: 'Estrategista',
    systemPrompt: `Você é um estrategista de marketing digital.
Ajude com planejamento, calendário editorial, análise de métricas e growth hacking.
Forneça insights baseados em dados e tendências.
Responda em português brasileiro.`,
  },
  ads: {
    name: 'Especialista em Ads',
    systemPrompt: `Você é um especialista em anúncios pagos (Meta Ads, TikTok Ads, Google Ads).
Ajude com segmentação, copywriting para ads, otimização de campanhas e ROI.
Responda em português brasileiro.`,
  },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { message, agentType = 'general', conversationId } = await request.json();

    // Verificar créditos
    const creditResult = await useCredits(user.id, 'ai_chat', 'Chat com IA');
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 402 });
    }

    const agent = AGENTS[agentType as keyof typeof AGENTS] || AGENTS.general;

    // Buscar histórico da conversa
    let messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [];

    if (conversationId) {
      const { data: conversation } = await supabase
        .from('ai_conversations')
        .select('messages')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (conversation) {
        messages = conversation.messages || [];
      }
    }

    // Adicionar system prompt e nova mensagem
    const fullMessages = [
      { role: 'system' as const, content: agent.systemPrompt },
      ...messages.slice(-10), // Últimas 10 mensagens para contexto
      { role: 'user' as const, content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: fullMessages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || '';

    // Atualizar histórico
    const newMessages = [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: reply },
    ];

    let newConversationId = conversationId;

    if (conversationId) {
      await supabase
        .from('ai_conversations')
        .update({ messages: newMessages })
        .eq('id', conversationId);
    } else {
      const { data: newConv } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          agent_type: agentType,
          messages: newMessages,
        })
        .select('id')
        .single();

      newConversationId = newConv?.id;
    }

    return NextResponse.json({
      success: true,
      reply,
      conversationId: newConversationId,
      creditsRemaining: creditResult.creditsRemaining,
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro no chat' },
      { status: 500 }
    );
  }
}
