'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Logo } from '@/components/Logo';
import { 
  LayoutDashboard,
  FolderKanban,
  Bot,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Zap,
  User,
  Bell,
  Search,
  Menu,
  X,
  BarChart3,
  FileText,
  CalendarDays,
  FileBarChart,
  Image,
  Hash,
  Palette,
  TrendingUp,
  Users,
  MessageCircle,
  UserPlus,
  Link2,
  Megaphone,
  UsersRound,
  Music,
  Sparkles,
  CheckCircle,
  Eye
} from 'lucide-react';
import { Button, Avatar, Badge } from '@/lib/ui';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/dashboard/clients', icon: Users, badge: 'Novo' },
  { name: 'Agendador', href: '/dashboard/scheduler', icon: Calendar },
  { name: 'Calendário', href: '/dashboard/calendar', icon: CalendarDays },
  { name: 'TikTok Studio', href: '/dashboard/tiktok', icon: Music },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Relatórios', href: '/dashboard/reports', icon: FileBarChart },
  { name: 'Gerar PDF', href: '/dashboard/report-generator', icon: FileText, badge: 'Pro' },
  { name: 'Previsão IA', href: '/dashboard/predict', icon: Sparkles, badge: 'IA' },
  { name: 'Aprovações', href: '/dashboard/approvals', icon: CheckCircle, badge: 'Novo' },
  { name: 'Automações', href: '/dashboard/automations', icon: Zap },
  { name: 'Concorrência', href: '/dashboard/competitors', icon: Eye },
  { name: 'Templates', href: '/dashboard/templates', icon: FileText },
  { name: 'Biblioteca', href: '/dashboard/media', icon: Image },
  { name: 'Hashtags', href: '/dashboard/hashtags', icon: Hash },
  { name: 'Brand Kit', href: '/dashboard/brand', icon: Palette },
  { name: 'Tendências', href: '/dashboard/trends', icon: TrendingUp },
  { name: 'Inbox', href: '/dashboard/inbox', icon: MessageCircle },
  { name: 'Influenciadores', href: '/dashboard/influencers', icon: UserPlus },
  { name: 'Link in Bio', href: '/dashboard/links', icon: Link2 },
  { name: 'Anúncios', href: '/dashboard/ads', icon: Megaphone },
  { name: 'Projetos', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Agentes IA', href: '/dashboard/agents', icon: Bot },
  { name: 'Equipe', href: '/dashboard/team', icon: UsersRound },
  { name: 'Planos', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications(user?.id);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-[#0a0a0a] border-r border-[#1a1a1a]
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#1a1a1a]">
            <Link href="/dashboard">
              <Logo size="md" />
            </Link>
          </div>

          {/* Credits */}
          <div className="group p-4 mx-4 mt-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Créditos</span>
              <Zap className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            </div>
            <div className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
              {user?.credits != null ? user.credits.toLocaleString('pt-BR') : '—'}
            </div>
            <div className="w-full bg-[#1a1a1a] rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-white to-gray-300 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${user?.creditsLimit ? Math.min(100, ((user.credits || 0) / user.creditsLimit) * 100) : 50}%` }} 
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-white text-black font-semibold shadow-lg shadow-white/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`} />
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs bg-white text-black rounded-full font-semibold animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-[#1a1a1a]">
            <div className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-white/5">
              <Avatar name={user?.name || 'User'} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-gray-200 transition-colors">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'user@email.com'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 justify-start text-gray-400 hover:text-red-400"
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            {/* Mobile Menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-white" />
                <input
                  type="text"
                  placeholder="Buscar posts, campanhas..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 focus:shadow-lg focus:shadow-white/5 transition-all duration-300"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-white text-black text-[10px] font-bold rounded-full px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 top-12 w-80 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
                        <h3 className="text-sm font-semibold text-white">Notificações</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => markAllAsRead()}
                            className="text-xs text-gray-500 hover:text-white transition-colors"
                          >
                            Marcar todas como lidas
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500 text-sm">
                            Nenhuma notificação
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => {
                                if (!notif.read) markAsRead(notif.id);
                                if (notif.action_url) router.push(notif.action_url);
                                setNotifOpen(false);
                              }}
                              className={`w-full text-left p-4 border-b border-[#111] hover:bg-white/5 transition-colors ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                            >
                              <div className="flex items-start gap-2">
                                {!notif.read && <span className="w-2 h-2 bg-white rounded-full mt-1.5 flex-shrink-0" />}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white font-medium truncate">{notif.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
