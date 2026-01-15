'use client';

import { useState } from 'react';
import { 
  Sparkles, TrendingUp, TrendingDown, Eye, Heart, MessageSquare,
  Share2, Bookmark, Clock, Calendar, Target, AlertTriangle,
  CheckCircle, BarChart3, Zap, ArrowUp, ArrowDown, Info,
  Instagram, Facebook, Twitter, Linkedin, ChevronDown
} from 'lucide-react';

interface PredictionResult {
  score: number;
  engagement: {
    likes: { min: number; max: number; predicted: number };
    comments: { min: number; max: number; predicted: number };
    shares: { min: number; max: number; predicted: number };
    saves: { min: number; max: number; predicted: number };
  };
  reach: { min: number; max: number; predicted: number };
  bestTimes: string[];
  improvements: {
    type: 'hashtag' | 'content' | 'timing' | 'format';
    suggestion: string;
    impact: number;
  }[];
  sentimentScore: number;
  viralPotential: number;
}

export default function PredictPage() {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const analyzePrediction = async () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate prediction based on content
    const wordCount = content.split(' ').length;
    const hasHashtags = content.includes('#');
    const hasEmoji = /[\u{1F600}-\u{1F64F}]/u.test(content);
    const hasQuestion = content.includes('?');
    const hasCTA = content.toLowerCase().includes('link') || content.toLowerCase().includes('clique');
    
    let baseScore = 60;
    if (hasHashtags) baseScore += 10;
    if (hasEmoji) baseScore += 8;
    if (hasQuestion) baseScore += 5;
    if (hasCTA) baseScore += 7;
    if (wordCount > 50 && wordCount < 150) baseScore += 5;
    
    const score = Math.min(baseScore + Math.random() * 10, 95);
    
    setPrediction({
      score,
      engagement: {
        likes: { min: 120, max: 450, predicted: Math.round(250 * (score / 70)) },
        comments: { min: 8, max: 45, predicted: Math.round(25 * (score / 70)) },
        shares: { min: 5, max: 30, predicted: Math.round(15 * (score / 70)) },
        saves: { min: 20, max: 80, predicted: Math.round(45 * (score / 70)) },
      },
      reach: { min: 1500, max: 8000, predicted: Math.round(4500 * (score / 70)) },
      bestTimes: ['09:00', '12:30', '18:00', '21:00'],
      improvements: [
        !hasHashtags ? { type: 'hashtag', suggestion: 'Adicione 3-5 hashtags relevantes para aumentar o alcance', impact: 15 } : null,
        !hasEmoji ? { type: 'content', suggestion: 'Use emojis para tornar o conteúdo mais atrativo', impact: 10 } : null,
        !hasQuestion ? { type: 'content', suggestion: 'Inclua uma pergunta para estimular comentários', impact: 12 } : null,
        !hasCTA ? { type: 'content', suggestion: 'Adicione um call-to-action claro', impact: 8 } : null,
        { type: 'timing', suggestion: 'Poste às 12:30 para melhor engajamento neste dia', impact: 5 },
      ].filter(Boolean) as PredictionResult['improvements'],
      sentimentScore: 75 + Math.random() * 20,
      viralPotential: score > 80 ? 65 + Math.random() * 25 : 20 + Math.random() * 30
    });
    
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          Previsão de Performance com IA
        </h1>
        <p className="text-gray-400 mt-1">
          Analise seu conteúdo antes de publicar e descubra o potencial de engajamento
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Platform Selector */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
            <label className="block text-sm font-medium text-gray-400 mb-3">
              PLATAFORMA
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'instagram', icon: Instagram, label: 'Instagram' },
                { id: 'facebook', icon: Facebook, label: 'Facebook' },
                { id: 'twitter', icon: Twitter, label: 'Twitter' },
                { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                    platform === p.id
                      ? 'bg-violet-500/20 border-violet-500 text-violet-400'
                      : 'border-[#333] text-gray-400 hover:border-[#444]'
                  }`}
                >
                  <p.icon className="w-5 h-5" />
                  <span className="text-xs">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
            <label className="block text-sm font-medium text-gray-400 mb-3">
              CONTEÚDO DO POST
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Cole ou digite o conteúdo do seu post aqui..."
              rows={8}
              className="w-full px-4 py-3 bg-[#252525] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-500">
                {content.length} caracteres | {content.split(' ').filter(w => w).length} palavras
              </span>
              <button
                onClick={analyzePrediction}
                disabled={!content.trim() || isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analisar Performance
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-violet-500/10 rounded-xl p-4 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-violet-400" />
              <span className="font-medium text-violet-400">Dicas para melhor previsão</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Inclua hashtags que você pretende usar</li>
              <li>• Adicione emojis para análise de sentimento</li>
              <li>• Cole o texto completo incluindo CTAs</li>
              <li>• Quanto mais detalhado, mais precisa a análise</li>
            </ul>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {prediction ? (
            <>
              {/* Score Card */}
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Score de Performance</h3>
                  <span className="text-sm text-gray-400">Baseado em IA</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreBgColor(prediction.score)} p-1`}>
                    <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center">
                      <div className="text-center">
                        <span className={`text-4xl font-bold ${getScoreColor(prediction.score)}`}>
                          {Math.round(prediction.score)}
                        </span>
                        <p className="text-xs text-gray-400">de 100</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">Sentimento</span>
                        <span className="text-green-400">{Math.round(prediction.sentimentScore)}%</span>
                      </div>
                      <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${prediction.sentimentScore}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">Potencial Viral</span>
                        <span className="text-violet-400">{Math.round(prediction.viralPotential)}%</span>
                      </div>
                      <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                          style={{ width: `${prediction.viralPotential}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Predictions */}
              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
                <h3 className="font-semibold text-white mb-4">Engajamento Estimado</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Curtidas', icon: Heart, data: prediction.engagement.likes, color: 'text-red-400' },
                    { label: 'Comentários', icon: MessageSquare, data: prediction.engagement.comments, color: 'text-blue-400' },
                    { label: 'Compartilhamentos', icon: Share2, data: prediction.engagement.shares, color: 'text-green-400' },
                    { label: 'Salvamentos', icon: Bookmark, data: prediction.engagement.saves, color: 'text-yellow-400' },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-[#252525] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <metric.icon className={`w-4 h-4 ${metric.color}`} />
                        <span className="text-sm text-gray-400">{metric.label}</span>
                      </div>
                      <p className="text-xl font-bold text-white">{metric.data.predicted}</p>
                      <p className="text-xs text-gray-500">
                        {metric.data.min} - {metric.data.max}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 bg-[#252525] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-violet-400" />
                    <span className="text-sm text-gray-400">Alcance Estimado</span>
                  </div>
                  <p className="text-xl font-bold text-white">{prediction.reach.predicted.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {prediction.reach.min.toLocaleString()} - {prediction.reach.max.toLocaleString()} contas
                  </p>
                </div>
              </div>

              {/* Best Times */}
              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
                <h3 className="font-semibold text-white mb-3">Melhores Horários</h3>
                <div className="flex gap-2">
                  {prediction.bestTimes.map((time, i) => (
                    <div 
                      key={i}
                      className={`flex-1 p-3 rounded-lg text-center ${
                        i === 0 ? 'bg-violet-500/20 border border-violet-500/50' : 'bg-[#252525]'
                      }`}
                    >
                      <Clock className={`w-4 h-4 mx-auto mb-1 ${i === 0 ? 'text-violet-400' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${i === 0 ? 'text-violet-400' : 'text-gray-300'}`}>
                        {time}
                      </span>
                      {i === 0 && <p className="text-xs text-violet-400 mt-1">Recomendado</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              {prediction.improvements.length > 0 && (
                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
                  <h3 className="font-semibold text-white mb-3">Sugestões de Melhoria</h3>
                  <div className="space-y-2">
                    {prediction.improvements.map((improvement, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-[#252525] rounded-lg">
                        <div className="p-1.5 bg-yellow-500/20 rounded">
                          <Zap className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-300">{improvement.suggestion}</p>
                          <p className="text-xs text-green-400 mt-1">
                            +{improvement.impact}% de engajamento estimado
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[#1a1a1a] rounded-xl p-12 border border-[#333] flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-violet-500/20 rounded-full mb-4">
                <BarChart3 className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Analise seu conteúdo
              </h3>
              <p className="text-gray-400 max-w-sm">
                Cole o texto do seu post e nossa IA vai prever o engajamento 
                e sugerir melhorias antes de você publicar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
