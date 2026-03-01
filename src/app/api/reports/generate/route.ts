import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Gerar PDF de relatório
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = await createClient();
    const { reportId, clientId, periodStart, periodEnd, sections } = await request.json();

    // Se reportId, buscar dados existentes
    let reportData: Record<string, any> = {};
    let clientName = '';
    let agencyName = '';
    let reportTitle = 'Relatório de Performance';

    // Buscar dados da agência
    const { data: agency } = await supabase
      .from('agencies')
      .select('name')
      .eq('id', ctx.agencyId)
      .single();

    agencyName = agency?.name || 'Agência';

    if (reportId) {
      const { data: report } = await supabase
        .from('analytics_reports')
        .select('*, clients(name)')
        .eq('id', reportId)
        .eq('agency_id', ctx.agencyId)
        .single();

      if (report) {
        reportData = report.data || {};
        clientName = report.clients?.name || '';
        reportTitle = report.title || reportTitle;
      }
    }

    // Buscar dados do cliente se especificado
    if (clientId && !clientName) {
      const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .eq('agency_id', ctx.agencyId)
        .single();

      clientName = client?.name || '';
    }

    // Buscar métricas reais do período
    const start = periodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = periodEnd || new Date().toISOString();

    // Posts no período
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .gte('created_at', start)
      .lte('created_at', end)
      .eq(clientId ? 'client_id' : 'agency_id', clientId || ctx.agencyId);

    const totalPosts = posts?.length || 0;
    const publishedPosts = posts?.filter((p) => p.status === 'published').length || 0;
    const scheduledPosts = posts?.filter((p) => p.status === 'scheduled').length || 0;

    // Calcular engajamento (se disponível no metadata)
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalReach = 0;

    posts?.forEach((p) => {
      if (p.metadata) {
        totalLikes += p.metadata.likes || 0;
        totalComments += p.metadata.comments || 0;
        totalShares += p.metadata.shares || 0;
        totalReach += p.metadata.reach || 0;
      }
    });

    // Distribuição por plataforma
    const platformCounts: Record<string, number> = {};
    posts?.forEach((p) => {
      const platform = p.platform || 'sem_plataforma';
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });

    // Se reportData tem dados armazenados, usar como complemento
    const metrics = reportData.metrics || {};
    const finalLikes = totalLikes || metrics.likes || 0;
    const finalComments = totalComments || metrics.comments || 0;
    const finalShares = totalShares || metrics.shares || 0;
    const finalReach = totalReach || metrics.reach || 0;
    const engagementRate = metrics.engagementRate || (finalReach > 0 ? (((finalLikes + finalComments + finalShares) / finalReach) * 100).toFixed(2) : '0.00');

    // === GERAR PDF ===
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Cores
    const primaryColor: [number, number, number] = [124, 58, 237]; // violet-600
    const darkColor: [number, number, number] = [30, 30, 30];
    const grayColor: [number, number, number] = [120, 120, 120];

    // === CAPA ===
    // Background header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 80, 'F');

    // Logo / Agency name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text(agencyName, margin, 35);

    doc.setFontSize(12);
    doc.text('Relatório de Performance Digital', margin, 50);

    // Período
    const startFormatted = format(new Date(start), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const endFormatted = format(new Date(end), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    doc.setFontSize(10);
    doc.text(`Período: ${startFormatted} — ${endFormatted}`, margin, 65);

    y = 100;

    // Título do relatório
    doc.setTextColor(...darkColor);
    doc.setFontSize(22);
    doc.text(reportTitle, margin, y);
    y += 10;

    if (clientName) {
      doc.setTextColor(...grayColor);
      doc.setFontSize(14);
      doc.text(`Cliente: ${clientName}`, margin, y);
      y += 10;
    }

    // Linha separadora
    y += 5;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    // === RESUMO EXECUTIVO ===
    const includeSections = sections || ['summary', 'content', 'engagement', 'platforms', 'recommendations'];

    if (includeSections.includes('summary')) {
      doc.setTextColor(...primaryColor);
      doc.setFontSize(16);
      doc.text('Resumo Executivo', margin, y);
      y += 10;

      doc.setTextColor(...darkColor);
      doc.setFontSize(11);

      const summaryItems = [
        `Total de conteúdos criados: ${totalPosts}`,
        `Conteúdos publicados: ${publishedPosts}`,
        `Conteúdos agendados: ${scheduledPosts}`,
        `Alcance total estimado: ${finalReach.toLocaleString('pt-BR')}`,
        `Taxa de engajamento: ${engagementRate}%`,
      ];

      summaryItems.forEach((item) => {
        doc.text(`• ${item}`, margin + 5, y);
        y += 7;
      });
      y += 10;
    }

    // === MÉTRICAS DE CONTEÚDO ===
    if (includeSections.includes('content')) {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(...primaryColor);
      doc.setFontSize(16);
      doc.text('Métricas de Conteúdo', margin, y);
      y += 12;

      // Cards de métricas (simulados com retângulos)
      const cardWidth = (pageWidth - 2 * margin - 15) / 4;
      const metricCards = [
        { label: 'Posts', value: totalPosts.toString() },
        { label: 'Curtidas', value: finalLikes.toLocaleString('pt-BR') },
        { label: 'Comentários', value: finalComments.toLocaleString('pt-BR') },
        { label: 'Compartilhamentos', value: finalShares.toLocaleString('pt-BR') },
      ];

      metricCards.forEach((card, i) => {
        const x = margin + i * (cardWidth + 5);

        // Card background
        doc.setFillColor(245, 243, 255);
        doc.roundedRect(x, y, cardWidth, 30, 3, 3, 'F');

        // Value
        doc.setTextColor(...primaryColor);
        doc.setFontSize(18);
        doc.text(card.value, x + cardWidth / 2, y + 14, { align: 'center' });

        // Label
        doc.setTextColor(...grayColor);
        doc.setFontSize(8);
        doc.text(card.label, x + cardWidth / 2, y + 24, { align: 'center' });
      });

      y += 45;
    }

    // === ENGAJAMENTO ===
    if (includeSections.includes('engagement')) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(...primaryColor);
      doc.setFontSize(16);
      doc.text('Análise de Engajamento', margin, y);
      y += 12;

      doc.setTextColor(...darkColor);
      doc.setFontSize(11);

      const engagementData = [
        ['Métrica', 'Valor', 'Média/Post'],
        ['Curtidas', finalLikes.toLocaleString('pt-BR'), publishedPosts ? Math.round(finalLikes / publishedPosts).toString() : '0'],
        ['Comentários', finalComments.toLocaleString('pt-BR'), publishedPosts ? Math.round(finalComments / publishedPosts).toString() : '0'],
        ['Compartilhamentos', finalShares.toLocaleString('pt-BR'), publishedPosts ? Math.round(finalShares / publishedPosts).toString() : '0'],
        ['Alcance', finalReach.toLocaleString('pt-BR'), publishedPosts ? Math.round(finalReach / publishedPosts).toString() : '0'],
      ];

      // Tabela simples
      const colWidths = [70, 50, 50];
      engagementData.forEach((row, rowIndex) => {
        if (rowIndex === 0) {
          doc.setFillColor(124, 58, 237);
          doc.rect(margin, y - 5, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
        } else {
          if (rowIndex % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, y - 5, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
          }
          doc.setTextColor(...darkColor);
          doc.setFontSize(10);
        }

        let x = margin;
        row.forEach((cell, colIndex) => {
          doc.text(cell, x + 3, y);
          x += colWidths[colIndex];
        });
        y += 8;
      });

      y += 15;
    }

    // === PLATAFORMAS ===
    if (includeSections.includes('platforms')) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(...primaryColor);
      doc.setFontSize(16);
      doc.text('Distribuição por Plataforma', margin, y);
      y += 12;

      const platformEntries = Object.entries(platformCounts);
      if (platformEntries.length > 0) {
        const barMaxWidth = 100;
        const maxCount = Math.max(...platformEntries.map(([, c]) => c));

        platformEntries.forEach(([platform, count]) => {
          // Platform name
          doc.setTextColor(...darkColor);
          doc.setFontSize(10);
          const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);
          doc.text(platformLabel, margin, y);

          // Bar
          const barWidth = maxCount > 0 ? (count / maxCount) * barMaxWidth : 0;
          doc.setFillColor(...primaryColor);
          doc.roundedRect(margin + 45, y - 4, barWidth, 5, 1, 1, 'F');

          // Count
          doc.setTextColor(...grayColor);
          doc.text(`${count} posts`, margin + 45 + barWidth + 5, y);

          y += 10;
        });
      } else {
        doc.setTextColor(...grayColor);
        doc.setFontSize(10);
        doc.text('Nenhum dado de plataforma disponível', margin, y);
        y += 10;
      }

      y += 10;
    }

    // === RECOMENDAÇÕES ===
    if (includeSections.includes('recommendations')) {
      if (y > 210) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(...primaryColor);
      doc.setFontSize(16);
      doc.text('Recomendações', margin, y);
      y += 12;

      doc.setTextColor(...darkColor);
      doc.setFontSize(10);

      const recommendations = reportData.recommendations || generateRecommendations(totalPosts, publishedPosts, engagementRate, platformCounts);

      recommendations.forEach((rec: string, i: number) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, pageWidth - 2 * margin - 10);
        doc.text(lines, margin + 5, y);
        y += lines.length * 5 + 3;
      });
    }

    // === RODAPÉ ===
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setTextColor(...grayColor);
      doc.setFontSize(8);
      doc.text(
        `${agencyName} — Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        margin,
        285
      );
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 285, { align: 'right' });
    }

    // Gerar buffer do PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Salvar no Supabase Storage
    const fileName = `reports/${ctx.agencyId}/${Date.now()}_${reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    let pdfUrl = '';
    if (!uploadError) {
      const { data: publicUrl } = supabase.storage.from('media').getPublicUrl(fileName);
      pdfUrl = publicUrl.publicUrl;
    }

    // Atualizar relatório no banco se existir
    if (reportId) {
      await supabase
        .from('analytics_reports')
        .update({
          pdf_url: pdfUrl,
          status: 'completed',
          data: {
            ...reportData,
            metrics: {
              totalPosts,
              publishedPosts,
              likes: finalLikes,
              comments: finalComments,
              shares: finalShares,
              reach: finalReach,
              engagementRate,
            },
            platformCounts,
            generatedAt: new Date().toISOString(),
          },
        })
        .eq('id', reportId)
        .eq('agency_id', ctx.agencyId);
    }

    // Retornar PDF como download ou URL
    const returnType = new URL(request.url).searchParams.get('return') || 'url';

    if (returnType === 'download') {
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${reportTitle}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      pdfUrl,
      metrics: {
        totalPosts,
        publishedPosts,
        likes: finalLikes,
        comments: finalComments,
        shares: finalShares,
        reach: finalReach,
        engagementRate,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar PDF' },
      { status: 500 }
    );
  }
}

// Gerar recomendações automáticas baseadas nas métricas
function generateRecommendations(
  totalPosts: number,
  publishedPosts: number,
  engagementRate: string | number,
  platformCounts: Record<string, number>
): string[] {
  const recommendations: string[] = [];
  const rate = typeof engagementRate === 'string' ? parseFloat(engagementRate) : engagementRate;

  if (totalPosts < 10) {
    recommendations.push(
      'Aumentar a frequência de publicações. Recomendamos pelo menos 3-4 posts por semana para manter engajamento consistente.'
    );
  }

  if (publishedPosts < totalPosts * 0.7) {
    recommendations.push(
      'Muitos conteúdos estão em rascunho. Revisar e publicar conteúdos pendentes para aproveitar o planejamento feito.'
    );
  }

  if (rate < 2) {
    recommendations.push(
      'A taxa de engajamento está abaixo da média do mercado (2-3%). Investir em conteúdos mais interativos como enquetes, carrosséis e vídeos curtos.'
    );
  } else if (rate > 5) {
    recommendations.push(
      'Excelente taxa de engajamento! Manter a estratégia atual e documentar os tipos de conteúdo que performam melhor.'
    );
  }

  const platforms = Object.keys(platformCounts);
  if (platforms.length === 1) {
    recommendations.push(
      'Diversificar a presença em plataformas. Considerar expandir para Instagram Reels, TikTok ou LinkedIn para atingir audiências diferentes.'
    );
  }

  if (platforms.includes('instagram') && !platforms.includes('tiktok')) {
    recommendations.push(
      'Considerar reaproveitamento de conteúdo do Instagram para TikTok, adaptando formato e duração para maximizar alcance.'
    );
  }

  recommendations.push(
    'Analisar os melhores horários de publicação baseado no engajamento e ajustar o calendário de conteúdo.'
  );

  recommendations.push(
    'Implementar A/B testing nos textos e criativos para otimizar conversões ao longo do próximo período.'
  );

  return recommendations;
}
