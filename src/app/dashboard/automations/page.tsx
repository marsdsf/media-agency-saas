'use client';

import { useState } from 'react';
import { 
  Zap, Plus, Play, Pause, Trash2, Settings, Clock, 
  Instagram, Facebook, Linkedin, Twitter, Youtube,
  TrendingUp, MessageSquare, Heart, Share2, Users,
  Calendar, Tag, Image, FileText, Bell, CheckCircle,
  ArrowRight, Copy, Edit, MoreVertical, Sparkles
} from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: string;
    conditions: Record<string, any>;
  };
  actions: {
    type: string;
    config: Record<string, any>;
  }[];
  isActive: boolean;
  runsCount: number;
  lastRun?: string;
  createdAt: string;
}

const demoAutomations: Automation[] = [
  {
    id: '1',
    name: 'Auto-resposta em comentários',
    description: 'Responde automaticamente comentários com perguntas sobre preço',
    trigger: {
      type: 'new_comment',
      conditions: { keywords: ['preço', 'valor', 'quanto custa'] }
    },
    actions: [
      { type: 'reply_comment', config: { message: 'Olá! 😊 Enviamos os valores no seu DM!' } },
      { type: 'send_dm', config: { template: 'price_list' } }
    ],
    isActive: true,
    runsCount: 234,
    lastRun: '2026-01-15T10:30:00',
    createdAt: '2026-01-01T00:00:00'
  },
  {
    id: '2',
    name: 'Repost de Stories com menção',
    description: 'Reposta automaticamente stories que mencionam a marca',
    trigger: {
      type: 'story_mention',
      conditions: { accounts: ['@cliente1', '@cliente2'] }
    },
    actions: [
      { type: 'repost_story', config: { addSticker: true } },
      { type: 'send_dm', config: { message: 'Obrigado por compartilhar! ❤️' } }
    ],
    isActive: true,
    runsCount: 89,
    lastRun: '2026-01-15T09:15:00',
    createdAt: '2026-01-05T00:00:00'
  },
  {
    id: '3',
    name: 'Evergreen Content Recycler',
    description: 'Republica posts de sucesso automaticamente a cada 30 dias',
    trigger: {
      type: 'schedule',
      conditions: { interval: '30d', minEngagement: 5 }
    },
    actions: [
      { type: 'repost', config: { platforms: ['instagram', 'facebook'], varyCaption: true } }
    ],
    isActive: false,
    runsCount: 12,
    lastRun: '2026-01-10T14:00:00',
    createdAt: '2025-12-15T00:00:00'
  },
  {
    id: '4',
    name: 'Novo seguidor → Mensagem de boas-vindas',
    description: 'Envia DM personalizada para novos seguidores',
    trigger: {
      type: 'new_follower',
      conditions: { minFollowers: 100 }
    },
    actions: [
      { type: 'send_dm', config: { template: 'welcome', delay: '5m' } },
      { type: 'add_to_list', config: { list: 'leads' } }
    ],
    isActive: true,
    runsCount: 567,
    lastRun: '2026-01-15T11:45:00',
    createdAt: '2026-01-01T00:00:00'
  },
  {
    id: '5',
    name: 'Alerta de crise (comentários negativos)',
    description: 'Notifica equipe quando detecta sentimento negativo',
    trigger: {
      type: 'sentiment_analysis',
      conditions: { sentiment: 'negative', threshold: 0.7 }
    },
    actions: [
      { type: 'notify_team', config: { channels: ['slack', 'email'] } },
      { type: 'hide_comment', config: { autoHide: false } }
    ],
    isActive: true,
    runsCount: 23,
    lastRun: '2026-01-14T16:30:00',
    createdAt: '2026-01-08T00:00:00'
  }
];

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
  const [automations, setAutomations] = useState<Automation[]>(demoAutomations);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
  };

  const totalRuns = automations.reduce((sum, a) => sum + a.runsCount, 0);
  const activeCount = automations.filter(a => a.isActive).length;

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
        {automations.map((automation) => {
          const trigger = triggerTypes.find(t => t.type === automation.trigger.type) || triggerTypes[0];
          const TriggerIcon = trigger.icon;
          
          return (
            <div
              key={automation.id}
              className={`bg-[#1a1a1a] rounded-xl p-4 border transition-all ${
                automation.isActive ? 'border-green-500/30' : 'border-[#333]'
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
                      {automation.isActive && (
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
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                      {automation.actions.map((action, i) => {
                        const actionType = actionTypes.find(a => a.id === action.type);
                        return (
                          <span key={i} className="px-2 py-1 bg-[#252525] rounded text-xs text-gray-300">
                            {actionType?.name || action.type}
                          </span>
                        );
                      })}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>{automation.runsCount} execuções</span>
                      {automation.lastRun && (
                        <span>Última: {new Date(automation.lastRun).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAutomation(automation.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      automation.isActive 
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                        : 'bg-[#252525] text-gray-400 hover:text-white'
                    }`}
                  >
                    {automation.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="p-2 bg-[#252525] text-gray-400 rounded-lg hover:text-white transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-[#252525] text-gray-400 rounded-lg hover:text-white transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-[#252525] text-gray-400 rounded-lg hover:text-red-400 transition-colors">
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
              <p className="text-gray-400 mt-1">Escolha um gatilho para começar</p>
            </div>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">GATILHOS DISPONÍVEIS</h3>
              <div className="grid grid-cols-2 gap-3">
                {triggerTypes.map((trigger) => {
                  const Icon = trigger.icon;
                  return (
                    <button
                      key={trigger.id}
                      className="flex items-center gap-3 p-4 bg-[#252525] rounded-xl border border-[#333] hover:border-violet-500/50 transition-colors text-left"
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
            <div className="p-6 border-t border-[#333] flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
