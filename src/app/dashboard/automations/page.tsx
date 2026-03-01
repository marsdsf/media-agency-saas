'use client';

import { useState } from 'react';
import { 
  Zap, Plus, Play, Pause, Trash2, Settings, Clock, 
  Instagram, Facebook, Linkedin, Twitter, Youtube,
  TrendingUp, MessageSquare, Heart, Share2, Users,
  Calendar, Tag, Image, FileText, Bell, CheckCircle,
  ArrowRight, Copy, Edit, MoreVertical, Sparkles, Loader2
} from 'lucide-react';
import { useAutomations, useApiMutation } from '@/hooks/useApiData';

const triggerTypes = [
  { id: 'new_comment', type: 'new_comment', name: 'Novo Comentário', icon: MessageSquare, color: 'bg-blue-500' },
  { id: 'new_follower', type: 'new_follower', name: 'Novo Seguidor', icon: Users, color: 'bg-green-500' },
  { id: 'story_mention', type: 'story_mention', name: 'Menção em Story', icon: Share2, color: 'bg-pink-500' },
  { id: 'dm_received', type: 'dm_received', name: 'DM Recebida', icon: MessageSquare, color: 'bg-purple-500' },
  { id: 'post_published', type: 'post_published', name: 'Post Publicado', icon: FileText, color: 'bg-orange-500' },
  { id: 'schedule', type: 'schedule', name: 'Agendamento', icon: Clock, color: 'bg-yellow-500' },
  { id: 'engagement_drop', type: 'engagement_drop', name: 'Queda de Engajamento', icon: TrendingUp, color: 'bg-red-500' },
  { id: 'sentiment_analysis', type: 'sentiment_analysis', name: 'Análise de Sentimento', icon: Sparkles, color: 'bg-violet-500' },
];

const actionTypes = [
  { id: 'reply_comment', name: 'Responder Comentário', icon: MessageSquare },
  { id: 'send_dm', name: 'Enviar DM', icon: MessageSquare },
  { id: 'repost', name: 'Republicar Post', icon: Share2 },
  { id: 'repost_story', name: 'Repostar Story', icon: Share2 },
  { id: 'like', name: 'Curtir', icon: Heart },
  { id: 'follow', name: 'Seguir', icon: Users },
  { id: 'add_to_list', name: 'Adicionar à Lista', icon: Tag },
  { id: 'notify_team', name: 'Notificar Equipe', icon: Bell },
  { id: 'hide_comment', name: 'Ocultar Comentário', icon: Trash2 },
  { id: 'create_task', name: 'Criar Tarefa', icon: CheckCircle },
];

export default function AutomationsPage() {
  const { data, loading, refetch } = useAutomations();
  const createMutation = useApiMutation('/api/automations', 'POST');
  const toggleMutation = useApiMutation('/api/automations', 'PATCH');
  const deleteMutation = useApiMutation('/api/automations', 'DELETE');

  const automations: any[] = data?.automations || [];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<any>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState('');

  const toggleAutomation = async (id: string, currentActive: boolean) => {
    await toggleMutation.mutate({ id, isActive: !currentActive });
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutate({ id });
    refetch();
  };

  const handleCreate = async () => {
    if (!newName || !selectedTrigger) return;
    await createMutation.mutate({
      name: newName,
      description: newDesc,
      triggerType: selectedTrigger,
      triggerConfig: {},
      actions: [],
      isActive: false,
    });
    setNewName('');
    setNewDesc('');
    setSelectedTrigger('');
    setShowCreateModal(false);
    refetch();
  };

  const totalRuns = automations.reduce((sum, a) => sum + (a.runs_count || 0), 0);
  const activeCount = automations.filter(a => a.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            Automações Inteligentes
          </h1>
          <p className="text-gray-400 mt-1">
            Automatize tarefas repetitivas e economize horas de trabalho
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nova Automação
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{automations.length}</p>
              <p className="text-sm text-gray-400">Total de Automações</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Play className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{activeCount}</p>
              <p className="text-sm text-gray-400">Ativas</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalRuns.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Execuções Totais</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">~47h</p>
              <p className="text-sm text-gray-400">Horas Economizadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Automation Templates */}
      <div className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 rounded-xl p-4 border border-violet-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="font-semibold text-white">Templates Populares</h3>
          </div>
          <button className="text-sm text-violet-400 hover:text-violet-300">
            Ver todos →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: 'Auto DM Boas-vindas', desc: 'Engaje novos seguidores', uses: '2.3k' },
            { name: 'Resposta FAQ', desc: 'Responda perguntas comuns', uses: '1.8k' },
            { name: 'Repost UGC', desc: 'Compartilhe conteúdo de fãs', uses: '1.2k' },
          ].map((template, i) => (
            <button
              key={i}
              className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-[#333] hover:border-violet-500/50 transition-colors text-left"
            >
              <div>
                <p className="font-medium text-white">{template.name}</p>
                <p className="text-sm text-gray-400">{template.desc}</p>
              </div>
              <span className="text-xs text-gray-500">{template.uses} usos</span>
            </button>
          ))}
        </div>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white">Suas Automações</h3>
        {automations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Zap className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Nenhuma automação criada</p>
            <p className="text-sm mt-1">Crie sua primeira automação para economizar tempo</p>
          </div>
        )}
        {automations.map((automation) => {
          const trigger = triggerTypes.find(t => t.type === automation.trigger_type) || triggerTypes[0];
          const TriggerIcon = trigger.icon;
          const actions = automation.actions || [];
          
          return (
            <div
              key={automation.id}
              className={`bg-[#1a1a1a] rounded-xl p-4 border transition-all ${
                automation.is_active ? 'border-green-500/30' : 'border-[#333]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${trigger.color}`}>
                    <TriggerIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{automation.name}</h4>
                      {automation.is_active && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Ativa
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{automation.description}</p>
                    
                    {/* Flow visualization */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="px-2 py-1 bg-[#252525] rounded text-xs text-gray-300">
                        {trigger.name}
                      </span>
                      {actions.length > 0 && <ArrowRight className="w-4 h-4 text-gray-500" />}
                      {actions.map((action: any, i: number) => {
                        const actionType = actionTypes.find(a => a.id === (action.type || action));
                        return (
                          <span key={i} className="px-2 py-1 bg-[#252525] rounded text-xs text-gray-300">
                            {actionType?.name || action.type || action}
                          </span>
                        );
                      })}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>Criado em {new Date(automation.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAutomation(automation.id, automation.is_active)}
                    className={`p-2 rounded-lg transition-colors ${
                      automation.is_active 
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                        : 'bg-[#252525] text-gray-400 hover:text-white'
                    }`}
                  >
                    {automation.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="p-2 bg-[#252525] text-gray-400 rounded-lg hover:text-white transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(automation.id)}
                    className="p-2 bg-[#252525] text-gray-400 rounded-lg hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#333]">
              <h2 className="text-xl font-bold text-white">Nova Automação</h2>
              <p className="text-gray-400 mt-1">Configure nome, descrição e gatilho</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Nome</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Auto-resposta em comentários"
                  className="w-full bg-[#252525] border border-[#333] rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Descrição</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="O que essa automação faz?"
                  className="w-full bg-[#252525] border border-[#333] rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">GATILHO</h3>
                <div className="grid grid-cols-2 gap-3">
                  {triggerTypes.map((trigger) => {
                    const Icon = trigger.icon;
                    return (
                      <button
                        key={trigger.id}
                        onClick={() => setSelectedTrigger(trigger.type)}
                        className={`flex items-center gap-3 p-4 bg-[#252525] rounded-xl border transition-colors text-left ${
                          selectedTrigger === trigger.type ? 'border-violet-500' : 'border-[#333] hover:border-violet-500/50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${trigger.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-white">{trigger.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#333] flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName || !selectedTrigger || createMutation.loading}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {createMutation.loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Criar Automação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
