'use client';

import { useState, useEffect } from 'react';
import { 
  User,
  Bell,
  Shield,
  Palette,
  Link2,
  Key,
  Camera,
  Save,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Check,
  ExternalLink,
  Globe,
  Moon,
  Sun,
  Clock,
  Mail,
  Smartphone,
  LogOut,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button, Card, Input, Badge, Tabs, Avatar } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useProfile, useSocialAccounts } from '@/hooks/useApiData';
import { useAuthStore } from '@/lib/store';

// Platform icon mapping (custom since some don't exist in lucide-react)
const FaTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const platformDefs = [
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok },
];

const notificationSettings = [
  { id: 'email_posts', label: 'Posts publicados', description: 'Receber email quando um post for publicado', enabled: true, type: 'email' },
  { id: 'email_fails', label: 'Falhas de publicação', description: 'Alertas quando um post falhar', enabled: true, type: 'email' },
  { id: 'email_credits', label: 'Créditos baixos', description: 'Aviso quando créditos estiverem acabando', enabled: true, type: 'email' },
  { id: 'push_posts', label: 'Posts publicados', description: 'Notificação push quando publicar', enabled: false, type: 'push' },
  { id: 'push_comments', label: 'Novos comentários', description: 'Alertas de novos comentários', enabled: true, type: 'push' },
  { id: 'weekly_report', label: 'Relatório semanal', description: 'Resumo semanal de performance', enabled: true, type: 'email' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const { data: profileData, loading: profileLoading } = useProfile();
  const { data: socialAccounts } = useSocialAccounts();
  const { user } = useAuthStore();
  const authProfile = user ? { fullName: user.name } : null;
  const agency = user ? { id: user.agency_id, name: user.agency_name, plan: user.plan || 'starter', aiCreditsUsed: user.credits || 0, aiCreditsLimit: user.creditsLimit || 2000 } : null;

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
  });

  useEffect(() => {
    if (profileData) {
      setProfileForm({
        name: profileData.profile?.full_name || authProfile?.fullName || '',
        email: profileData.profile?.email || '',
        phone: profileData.profile?.phone || '',
        company: agency?.name || '',
        website: (agency as any)?.website || '',
        timezone: profileData.profile?.timezone || 'America/Sao_Paulo',
        language: 'pt-BR',
      });
    }
  }, [profileData, authProfile, agency]);

  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [notifications, setNotifications] = useState(notificationSettings);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profileForm.name,
          phone: profileForm.phone,
          timezone: profileForm.timezone,
        }),
      });
    } catch (err) {
      console.error('Erro ao salvar:', err);
    }
    setSaving(false);
  };

  const connectedPlatforms = platformDefs.map(p => {
    const accountsList: any[] = (socialAccounts as any)?.accounts || (Array.isArray(socialAccounts) ? socialAccounts : []);
    const account = accountsList.find((a: any) => a.platform === p.id);
    return {
      ...p,
      connected: !!account,
      account: account?.username || account?.platform_username || null,
      color: account ? 'text-white' : 'text-gray-400',
    };
  });

  const toggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n)
    );
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'integrations', label: 'Integrações', icon: Link2 },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações</h1>
          <p className="text-gray-400 mt-1">Personalize sua experiência</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          leftIcon={saving ? undefined : <Save className="w-4 h-4" />}
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1a1a2e] pb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-1">
            <div className="text-center">
              <div className="relative inline-block">
                <Avatar size="xl" name={profileForm.name} />
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-r from-white to-gray-200 text-black hover:from-gray-200 hover:to-white transition-colors shadow-lg shadow-white/10">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-white mt-4">{profileForm.name || 'Sem nome'}</h3>
              <p className="text-gray-400 text-sm">{profileForm.email}</p>
              <Badge variant="info" className="mt-2">{agency?.plan || 'Free'}</Badge>
            </div>
            <div className="mt-6 pt-6 border-t border-[#1a1a2e] space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Membro desde</span>
                <span className="text-white">{(authProfile as any)?.created_at ? new Date((authProfile as any).created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '-'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Créditos usados</span>
                <span className="text-white">{(agency?.aiCreditsUsed || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Limite</span>
                <span className="text-white">{(agency?.aiCreditsLimit || 0).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-6">Informações do Perfil</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Input 
                label="Nome completo" 
                value={profileForm.name}
                onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
              />
              <Input 
                label="Email" 
                type="email"
                value={profileForm.email}
                disabled
              />
              <Input 
                label="Telefone" 
                value={profileForm.phone}
                onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
              />
              <Input 
                label="Empresa" 
                value={profileForm.company}
                disabled
              />
              <Input 
                label="Website" 
                value={profileForm.website}
                disabled
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fuso Horário</label>
                <select 
                  value={profileForm.timezone}
                  onChange={(e) => setProfileForm(p => ({ ...p, timezone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] text-white"
                >
                  <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="Europe/London">London (GMT+0)</option>
                  <option value="Europe/Paris">Paris (GMT+1)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-white/10">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Email</h3>
                <p className="text-sm text-gray-400">Notificações por email</p>
              </div>
            </div>
            <div className="space-y-4">
              {notifications.filter(n => n.type === 'email').map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a2e]">
                  <div>
                    <p className="text-white font-medium">{notification.label}</p>
                    <p className="text-sm text-gray-500">{notification.description}</p>
                  </div>
                  <button
                    onClick={() => toggleNotification(notification.id)}
                    className={cn(
                      'w-12 h-6 rounded-full transition-colors relative',
                      notification.enabled ? 'bg-white' : 'bg-gray-600'
                    )}
                  >
                    <div className={cn(
                      'absolute w-5 h-5 rounded-full top-0.5 transition-all',
                      notification.enabled ? 'left-6 bg-black' : 'left-0.5 bg-white'
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-white/10">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Push</h3>
                <p className="text-sm text-gray-400">Notificações no navegador</p>
              </div>
            </div>
            <div className="space-y-4">
              {notifications.filter(n => n.type === 'push').map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a2e]">
                  <div>
                    <p className="text-white font-medium">{notification.label}</p>
                    <p className="text-sm text-gray-500">{notification.description}</p>
                  </div>
                  <button
                    onClick={() => toggleNotification(notification.id)}
                    className={cn(
                      'w-12 h-6 rounded-full transition-colors relative',
                      notification.enabled ? 'bg-white' : 'bg-gray-600'
                    )}
                  >
                    <div className={cn(
                      'absolute w-5 h-5 rounded-full top-0.5 transition-all',
                      notification.enabled ? 'left-6 bg-black' : 'left-0.5 bg-white'
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Redes Sociais Conectadas</h3>
            <div className="space-y-4">
              {connectedPlatforms.map((platform) => (
                <div key={platform.id} className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a2e]">
                  <div className="flex items-center gap-4">
                    <div className={cn('p-2 rounded-lg bg-white/10', platform.color)}>
                      <platform.icon />
                    </div>
                    <div>
                      <p className="text-white font-medium">{platform.name}</p>
                      {platform.connected ? (
                        <p className="text-sm text-gray-400">{platform.account}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Não conectado</p>
                      )}
                    </div>
                  </div>
                  {platform.connected ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Conectado</Badge>
                      <Button variant="ghost" size="sm">Desconectar</Button>
                    </div>
                  ) : (
                    <Button size="sm" leftIcon={<ExternalLink className="w-4 h-4" />}>
                      Conectar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">API e Webhooks</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                <div className="flex gap-2">
                  <Input 
                    value="sk_live_••••••••••••••••••••••••" 
                    readOnly 
                    className="flex-1 font-mono"
                  />
                  <Button variant="secondary">Regenerar</Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Use esta chave para acessar a API</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Webhook URL</label>
                <Input 
                  placeholder="https://sua-url.com/webhook"
                />
                <p className="text-xs text-gray-500 mt-2">Receba eventos em tempo real</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Alterar Senha</h3>
            <div className="space-y-4 max-w-md">
              <Input label="Senha atual" type="password" />
              <Input label="Nova senha" type="password" />
              <Input label="Confirmar nova senha" type="password" />
              <Button leftIcon={<Key className="w-4 h-4" />}>
                Atualizar Senha
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Sessões Ativas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a2e]">
                <div className="flex items-center gap-4">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white">Chrome • Windows</p>
                    <p className="text-sm text-gray-500">São Paulo, Brasil • Agora</p>
                  </div>
                </div>
                <Badge variant="success">Atual</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a2e]">
                <div className="flex items-center gap-4">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white">Safari • iPhone</p>
                    <p className="text-sm text-gray-500">São Paulo, Brasil • 2h atrás</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-red-400">
                  Encerrar
                </Button>
              </div>
            </div>
            <Button variant="ghost" className="mt-4 text-red-400" leftIcon={<LogOut className="w-4 h-4" />}>
              Encerrar todas as outras sessões
            </Button>
          </Card>

          <Card className="p-6 border-red-500/30">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Zona de Perigo</h3>
            <p className="text-gray-400 text-sm mb-4">Ações irreversíveis</p>
            <Button variant="ghost" className="text-red-400" leftIcon={<Trash2 className="w-4 h-4" />}>
              Excluir minha conta
            </Button>
          </Card>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Tema</h3>
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {[
              { id: 'light', label: 'Claro', icon: Sun },
              { id: 'dark', label: 'Escuro', icon: Moon },
              { id: 'system', label: 'Sistema', icon: Globe },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setTheme(option.id as typeof theme)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                  theme === option.id 
                    ? 'border-white bg-white/10' 
                    : 'border-[#2a2a4a] hover:border-gray-600'
                )}
              >
                <option.icon className={cn(
                  'w-6 h-6',
                  theme === option.id ? 'text-white' : 'text-gray-400'
                )} />
                <span className={cn(
                  'text-sm font-medium',
                  theme === option.id ? 'text-white' : 'text-gray-400'
                )}>
                  {option.label}
                </span>
                {theme === option.id && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
