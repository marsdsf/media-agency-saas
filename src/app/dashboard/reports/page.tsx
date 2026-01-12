'use client';

import { useState } from 'react';
import { 
  FileText,
  Download,
  Send,
  Calendar,
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Clock,
  CheckCircle,
  Plus,
  Settings,
  Mail,
  FileDown,
  Palette
} from 'lucide-react';
import { Button, Card, Badge, Input, Select } from '@/lib/ui';
import { cn } from '@/lib/utils';

interface Report {
  id: string;
  name: string;
  client: string;
  period: string;
  createdAt: string;
  status: 'ready' | 'generating' | 'scheduled';
  type: 'weekly' | 'monthly' | 'custom';
}

const mockReports: Report[] = [
  { id: '1', name: 'Relatório Semanal', client: 'TechStore Brasil', period: '06/01 - 12/01', createdAt: '2026-01-12', status: 'ready', type: 'weekly' },
  { id: '2', name: 'Relatório Mensal Dezembro', client: 'StartupAI', period: 'Dezembro 2025', createdAt: '2026-01-02', status: 'ready', type: 'monthly' },
  { id: '3', name: 'Relatório de Campanha', client: 'Moda Express', period: '01/12 - 31/12', createdAt: '2026-01-05', status: 'ready', type: 'custom' },
  { id: '4', name: 'Relatório Semanal', client: 'Beach Club', period: '13/01 - 19/01', createdAt: '2026-01-13', status: 'scheduled', type: 'weekly' },
];

const reportMetrics = {
  totalReach: 125840,
  engagement: 8420,
  followers: 1250,
  posts: 24,
};

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Relatórios</h1>
          <p className="text-gray-400 mt-1">Gere e envie relatórios automáticos para seus clientes</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreating(true)}>
          Novo Relatório
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Input placeholder="Buscar relatórios..." className="flex-1" />
            <Select
              options={[
                { value: 'all', label: 'Todos os tipos' },
                { value: 'weekly', label: 'Semanal' },
                { value: 'monthly', label: 'Mensal' },
                { value: 'custom', label: 'Personalizado' },
              ]}
            />
          </div>

          {mockReports.map((report) => (
            <Card
              key={report.id}
              className={cn(
                'group p-5 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 transition-all duration-300',
                selectedReport?.id === report.id && 'ring-2 ring-white border-white/50'
              )}
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-white to-gray-200 transition-transform duration-300 group-hover:scale-110">
                    <FileText className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{report.name}</h3>
                    <p className="text-sm text-gray-400">{report.client}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {report.period}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      report.status === 'ready' ? 'success' :
                      report.status === 'generating' ? 'warning' : 'info'
                    }
                  >
                    {report.status === 'ready' ? 'Pronto' :
                     report.status === 'generating' ? 'Gerando...' : 'Agendado'}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1a1a1a]">
                <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                  Download PDF
                </Button>
                <Button variant="ghost" size="sm" leftIcon={<Send className="w-4 h-4" />}>
                  Enviar por Email
                </Button>
                <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                  Visualizar
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Report Preview / Settings */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Prévia do Relatório</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Eye className="w-4 h-4" />
                    Alcance
                  </div>
                  <p className="text-xl font-bold text-white">{reportMetrics.totalReach.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Heart className="w-4 h-4" />
                    Engajamento
                  </div>
                  <p className="text-xl font-bold text-white">{reportMetrics.engagement.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    Novos Seguidores
                  </div>
                  <p className="text-xl font-bold text-white">+{reportMetrics.followers}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <FileText className="w-4 h-4" />
                    Posts
                  </div>
                  <p className="text-xl font-bold text-white">{reportMetrics.posts}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Report Settings */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Configurações</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0a]">
                <div className="flex items-center gap-3">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">White Label</span>
                </div>
                <Badge variant="success">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0a]">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Envio Automático</span>
                </div>
                <Badge variant="success">Semanal</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0a]">
                <div className="flex items-center gap-3">
                  <FileDown className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Formato</span>
                </div>
                <Badge>PDF</Badge>
              </div>
            </div>
          </Card>

          {/* Scheduled Reports */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Agendamentos</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Próximo relatório</span>
                <span className="text-white">19/01/2026</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Frequência</span>
                <span className="text-white">Semanal</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Destinatário</span>
                <span className="text-white">cliente@email.com</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
