'use client';

import { useState } from 'react';
import { 
  FileText, Download, Eye, Calendar, BarChart3, TrendingUp,
  Users, Heart, MessageSquare, Share2, Clock, Settings,
  Palette, Check, Sparkles, ArrowRight, Globe, Instagram,
  Facebook, Twitter, Linkedin, Mail, Loader2
} from 'lucide-react';
import { useClients } from '@/hooks/useApiData';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  preview: string;
}

const templates: ReportTemplate[] = [
  {
    id: 'executive',
    name: 'Relatório Executivo',
    description: 'Visão geral de alto nível para decisores',
    sections: ['resumo', 'metricas-chave', 'crescimento', 'recomendacoes'],
    preview: '📊'
  },
  {
    id: 'performance',
    name: 'Relatório de Performance',
    description: 'Análise detalhada de métricas e engajamento',
    sections: ['metricas', 'engajamento', 'alcance', 'melhores-posts', 'comparativo'],
    preview: '📈'
  },
  {
    id: 'content',
    name: 'Relatório de Conteúdo',
    description: 'Análise de posts publicados e performance',
    sections: ['posts-publicados', 'tipos-conteudo', 'hashtags', 'horarios'],
    preview: '📝'
  },
  {
    id: 'competitor',
    name: 'Análise de Concorrentes',
    description: 'Comparativo com principais concorrentes',
    sections: ['benchmark', 'share-of-voice', 'gaps', 'oportunidades'],
    preview: '🎯'
  }
];

interface Client {
  id: string;
  name: string;
  logo: string;
  platforms: string[];
}

export default function ReportGeneratorPage() {
  const { data: clientsData } = useClients();
  const apiClients: any[] = clientsData?.clients || [];
  const demoClients: Client[] = apiClients.length > 0
    ? apiClients.map((c: any) => ({
        id: c.id,
        name: c.name || c.company,
        logo: (c.name || c.company || '?')[0].toUpperCase(),
        platforms: c.platforms || ['instagram'],
      }))
    : [
        { id: '1', name: 'Loja Fashion', logo: '👗', platforms: ['instagram', 'facebook'] },
        { id: '2', name: 'Academia XYZ', logo: '💪', platforms: ['instagram'] },
        { id: '3', name: 'Restaurante ABC', logo: '🍽️', platforms: ['instagram', 'facebook'] },
        { id: '4', name: 'Tech Startup', logo: '🚀', platforms: ['linkedin', 'twitter'] },
      ];

export default function ReportGeneratorPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customization, setCustomization] = useState({
    primaryColor: '#8B5CF6',
    includeComments: true,
    includeTips: true,
    whiteLabel: true,
    logoUrl: '',
    companyName: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
    setReportReady(true);
    setStep(4);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            Gerador de Relatórios PDF
          </h1>
          <p className="text-gray-400 mt-1">
            Crie relatórios profissionais white-label para seus clientes
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[
          { num: 1, label: 'Cliente' },
          { num: 2, label: 'Template' },
          { num: 3, label: 'Customizar' },
          { num: 4, label: 'Download' }
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              step >= s.num 
                ? 'bg-violet-500/20 text-violet-400' 
                : 'bg-[#1a1a1a] text-gray-500'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                step > s.num ? 'bg-violet-500 text-white' :
                step === s.num ? 'bg-violet-500/30 text-violet-400 border border-violet-500' :
                'bg-[#252525] text-gray-500'
              }`}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className="font-medium">{s.label}</span>
            </div>
            {i < 3 && (
              <ArrowRight className="w-5 h-5 text-gray-600 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-6">
        {/* Step 1: Select Client */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Selecione o Cliente</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {demoClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedClient === client.id
                      ? 'bg-violet-500/20 border-violet-500'
                      : 'bg-[#252525] border-[#333] hover:border-[#444]'
                  }`}
                >
                  <div className="text-3xl mb-2">{client.logo}</div>
                  <p className="font-medium text-white">{client.name}</p>
                  <div className="flex gap-1 mt-2">
                    {client.platforms.map(p => {
                      const icons: Record<string, React.ElementType> = {
                        instagram: Instagram,
                        facebook: Facebook,
                        twitter: Twitter,
                        linkedin: Linkedin
                      };
                      const Icon = icons[p] || Globe;
                      return <Icon key={p} className="w-4 h-4 text-gray-400" />;
                    })}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedClient}
                className="flex items-center gap-2 px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Template */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Escolha o Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'bg-violet-500/20 border-violet-500'
                      : 'bg-[#252525] border-[#333] hover:border-[#444]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{template.preview}</span>
                    <h3 className="font-semibold text-white">{template.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.sections.map(section => (
                      <span key={section} className="px-2 py-0.5 bg-[#333] text-gray-400 text-xs rounded">
                        {section}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Date Range */}
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Período</label>
              <div className="flex gap-2">
                {[
                  { id: '7d', label: '7 dias' },
                  { id: '30d', label: '30 dias' },
                  { id: '90d', label: '90 dias' },
                  { id: 'custom', label: 'Personalizado' }
                ].map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setDateRange(period.id as typeof dateRange)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      dateRange === period.id
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500'
                        : 'bg-[#252525] text-gray-400 border border-[#333] hover:border-[#444]'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedTemplate}
                className="flex items-center gap-2 px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Customization */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Personalize o Relatório</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branding */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-300 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Branding
                </h3>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Cor Principal</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customization.primaryColor}
                      onChange={(e) => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-12 h-12 rounded-lg cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={customization.primaryColor}
                      onChange={(e) => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="px-3 py-2 bg-[#252525] border border-[#333] rounded-lg text-white w-32"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nome da Empresa (White-label)</label>
                  <input
                    type="text"
                    value={customization.companyName}
                    onChange={(e) => setCustomization(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Sua Agência"
                    className="w-full px-4 py-3 bg-[#252525] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">URL do Logo</label>
                  <input
                    type="text"
                    value={customization.logoUrl}
                    onChange={(e) => setCustomization(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-[#252525] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-300 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Opções
                </h3>

                <label className="flex items-center justify-between p-4 bg-[#252525] rounded-lg cursor-pointer">
                  <div>
                    <p className="text-white">Modo White-label</p>
                    <p className="text-sm text-gray-400">Remove marca MediaAI do relatório</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={customization.whiteLabel}
                    onChange={(e) => setCustomization(prev => ({ ...prev, whiteLabel: e.target.checked }))}
                    className="w-5 h-5 rounded accent-violet-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-[#252525] rounded-lg cursor-pointer">
                  <div>
                    <p className="text-white">Incluir Comentários</p>
                    <p className="text-sm text-gray-400">Análise dos melhores comentários</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={customization.includeComments}
                    onChange={(e) => setCustomization(prev => ({ ...prev, includeComments: e.target.checked }))}
                    className="w-5 h-5 rounded accent-violet-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-[#252525] rounded-lg cursor-pointer">
                  <div>
                    <p className="text-white">Incluir Recomendações IA</p>
                    <p className="text-sm text-gray-400">Sugestões automáticas de melhoria</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={customization.includeTips}
                    onChange={(e) => setCustomization(prev => ({ ...prev, includeTips: e.target.checked }))}
                    className="w-5 h-5 rounded accent-violet-500"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={generateReport}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando Relatório...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Gerar Relatório
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Download */}
        {step === 4 && reportReady && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Relatório Pronto!</h2>
              <p className="text-gray-400 mt-2">
                Seu relatório foi gerado com sucesso
              </p>
            </div>

            {/* Preview Card */}
            <div className="max-w-md mx-auto bg-[#252525] rounded-xl p-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <FileText className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    Relatório {templates.find(t => t.id === selectedTemplate)?.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {demoClients.find(c => c.id === selectedClient)?.name} • Últimos {dateRange === '7d' ? '7' : dateRange === '30d' ? '30' : '90'} dias
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors">
                  <Download className="w-4 h-4" />
                  Baixar PDF
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#333] text-white rounded-lg hover:bg-[#444] transition-colors">
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3 pt-4">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                Enviar por Email
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedClient('');
                  setSelectedTemplate('');
                  setReportReady(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-violet-400 hover:text-violet-300 transition-colors"
              >
                Criar Outro Relatório
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
          <div className="p-2 bg-blue-500/20 rounded-lg w-fit mb-3">
            <Palette className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="font-semibold text-white mb-1">100% White-Label</h3>
          <p className="text-sm text-gray-400">
            Personalize cores, logo e remova qualquer menção ao MediaAI
          </p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
          <div className="p-2 bg-violet-500/20 rounded-lg w-fit mb-3">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <h3 className="font-semibold text-white mb-1">Insights com IA</h3>
          <p className="text-sm text-gray-400">
            Recomendações automáticas baseadas em análise de dados
          </p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
          <div className="p-2 bg-green-500/20 rounded-lg w-fit mb-3">
            <Clock className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="font-semibold text-white mb-1">Agendamento</h3>
          <p className="text-sm text-gray-400">
            Envie relatórios automaticamente toda semana ou mês
          </p>
        </div>
      </div>
    </div>
  );
}
