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
  Palette,
  Loader2
} from 'lucide-react';
import { Button, Card, Badge, Input, Select } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useReports, useClients, useApiMutation } from '@/hooks/useApiData';

export default function ReportsPage() {
  const { data: reports, loading, refetch } = useReports();
  const { data: clients } = useClients();
  const createMutation = useApiMutation('/api/reports', 'POST');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newReport, setNewReport] = useState({ name: '', clientId: '', type: 'weekly', period: '' });

  const reportsList: any[] = (reports as any)?.reports || (Array.isArray(reports) ? reports : []);

  const handleCreateReport = async () => {
    if (!newReport.name || !newReport.clientId) return;
    await createMutation.mutate({
      name: newReport.name,
      client_id: newReport.clientId,
      type: newReport.type,
      period: newReport.period,
    });
    setNewReport({ name: '', clientId: '', type: 'weekly', period: '' });
    setIsCreating(false);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

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

          {reportsList.map((report: any) => (
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
                    <h3 className="font-semibold text-white">{report.name || report.title}</h3>
                    <p className="text-sm text-gray-400">{report.clients?.name || 'Sem cliente'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {report.period || report.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {report.created_at ? new Date(report.created_at).toLocaleDateString('pt-BR') : '-'}
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
                     report.status === 'generating' ? 'Gerando...' : report.status || 'Pronto'}
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
          {reportsList.length === 0 && (
            <div className="py-16 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum relatório criado ainda</p>
              <Button className="mt-4" onClick={() => setIsCreating(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Criar Primeiro Relatório
              </Button>
            </div>
          )}
        </div>

        {/* Report Preview / Settings */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Prévia do Relatório</h3>
            {selectedReport?.data ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Eye className="w-4 h-4" />
                    Alcance
                  </div>
                  <p className="text-xl font-bold text-white">{(selectedReport.data.totalReach || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Heart className="w-4 h-4" />
                    Engajamento
                  </div>
                  <p className="text-xl font-bold text-white">{(selectedReport.data.engagement || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    Novos Seguidores
                  </div>
                  <p className="text-xl font-bold text-white">+{(selectedReport.data.followers || 0)}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <FileText className="w-4 h-4" />
                    Posts
                  </div>
                  <p className="text-xl font-bold text-white">{(selectedReport.data.posts || 0)}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Selecione um relatório para ver a prévia</p>
            )}
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
              <h3 className="text-lg font-semibold text-white">Resumo</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total de relatórios</span>
                <span className="text-white">{reportsList.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Formato</span>
                <span className="text-white">PDF</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Report Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Novo Relatório</h2>
            <div className="space-y-4">
              <Input
                label="Nome"
                placeholder="Relatório Semanal"
                value={newReport.name}
                onChange={(e) => setNewReport(r => ({ ...r, name: e.target.value }))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cliente</label>
                <select
                  value={newReport.clientId}
                  onChange={(e) => setNewReport(r => ({ ...r, clientId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white"
                >
                  <option value="">Selecione...</option>
                  {((clients as any)?.clients || (Array.isArray(clients) ? clients : [])).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport(r => ({ ...r, type: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white"
                >
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              <Input
                label="Período"
                placeholder="Ex: Janeiro 2026"
                value={newReport.period}
                onChange={(e) => setNewReport(r => ({ ...r, period: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" className="flex-1" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateReport}
                disabled={!newReport.name || !newReport.clientId || createMutation.loading}
              >
                {createMutation.loading ? 'Criando...' : 'Criar Relatório'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
