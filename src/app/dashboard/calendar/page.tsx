'use client';

import { useState } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  MoreVertical,
  Filter,
  Grid3X3,
  List,
  Gift,
  Star
} from 'lucide-react';
import { Button, Card, Badge } from '@/lib/ui';
import { cn } from '@/lib/utils';

const FaTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const platformIcons: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: FaTiktok,
};

const platformColors: Record<string, string> = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  facebook: 'bg-blue-600',
  twitter: 'bg-sky-500',
  linkedin: 'bg-blue-700',
  tiktok: 'bg-black',
};

interface ScheduledPost {
  id: string;
  title: string;
  platform: string;
  time: string;
  status: 'scheduled' | 'published' | 'draft';
}

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  posts: ScheduledPost[];
  holiday?: string;
}

const holidays: Record<string, string> = {
  '2026-01-01': '🎉 Ano Novo',
  '2026-02-14': '❤️ Dia dos Namorados',
  '2026-02-16': '🎭 Carnaval',
  '2026-02-17': '🎭 Carnaval',
  '2026-03-08': '👩 Dia da Mulher',
  '2026-04-03': '🐰 Sexta-feira Santa',
  '2026-04-05': '🐰 Páscoa',
  '2026-04-21': '🇧🇷 Tiradentes',
  '2026-05-01': '👷 Dia do Trabalho',
  '2026-05-10': '👩‍👧 Dia das Mães',
  '2026-06-12': '❤️ Dia dos Namorados BR',
  '2026-08-09': '👨‍👧 Dia dos Pais',
  '2026-09-07': '🇧🇷 Independência',
  '2026-10-12': '👧 Dia das Crianças',
  '2026-11-02': '🕯️ Finados',
  '2026-11-15': '🇧🇷 Proclamação da República',
  '2026-11-27': '🦃 Black Friday',
  '2026-12-25': '🎄 Natal',
};

const mockPosts: Record<string, ScheduledPost[]> = {
  '2026-01-12': [
    { id: '1', title: 'Post de lançamento', platform: 'instagram', time: '09:00', status: 'scheduled' },
    { id: '2', title: 'Artigo LinkedIn', platform: 'linkedin', time: '14:00', status: 'scheduled' },
  ],
  '2026-01-13': [
    { id: '3', title: 'Reels tutorial', platform: 'instagram', time: '18:00', status: 'scheduled' },
  ],
  '2026-01-14': [
    { id: '4', title: 'Trend TikTok', platform: 'tiktok', time: '20:00', status: 'draft' },
    { id: '5', title: 'Story interativo', platform: 'instagram', time: '12:00', status: 'scheduled' },
    { id: '6', title: 'Post Facebook', platform: 'facebook', time: '10:00', status: 'scheduled' },
  ],
  '2026-01-15': [
    { id: '7', title: 'Thread Twitter', platform: 'twitter', time: '11:00', status: 'scheduled' },
  ],
  '2026-01-18': [
    { id: '8', title: 'Carrossel dicas', platform: 'instagram', time: '19:00', status: 'scheduled' },
  ],
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 11));
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: CalendarDay[] = [];
    const today = new Date();

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: false,
        posts: [],
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday: today.getDate() === i && today.getMonth() === month && today.getFullYear() === year,
        posts: mockPosts[dateStr] || [],
        holiday: holidays[dateStr],
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
        posts: [],
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);

  const upcomingHolidays = Object.entries(holidays)
    .filter(([date]) => new Date(date) >= new Date())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Calendário Editorial</h1>
          <p className="text-gray-400 mt-1">Visualize e organize todo seu conteúdo</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#1a1a1a] rounded-xl p-1">
            <button
              onClick={() => setView('month')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                view === 'month' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('week')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                view === 'week' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Novo Post
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <Button variant="ghost" onClick={() => setCurrentDate(new Date())}>
                Hoje
              </Button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => (
                <div
                  key={i}
                  onClick={() => day.isCurrentMonth && setSelectedDay(day)}
                  className={cn(
                    'min-h-[100px] p-2 rounded-xl border transition-all cursor-pointer group',
                    day.isCurrentMonth
                      ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-white/20 hover:bg-white/5'
                      : 'bg-transparent border-transparent opacity-30',
                    day.isToday && 'ring-2 ring-white border-white/50',
                    selectedDay?.date === day.date && day.isCurrentMonth && 'border-white/50 bg-white/10'
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className={cn(
                      'text-sm font-medium',
                      day.isToday ? 'text-white bg-white text-black w-6 h-6 rounded-full flex items-center justify-center' : 
                      day.isCurrentMonth ? 'text-gray-300' : 'text-gray-600'
                    )}>
                      {day.date}
                    </span>
                    {day.holiday && (
                      <span className="text-xs" title={day.holiday}>
                        {day.holiday.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  
                  {/* Posts */}
                  <div className="space-y-1">
                    {day.posts.slice(0, 2).map((post) => {
                      const Icon = platformIcons[post.platform];
                      return (
                        <div
                          key={post.id}
                          className={cn(
                            'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs truncate',
                            post.status === 'draft' ? 'bg-gray-500/20 text-gray-400' : 'bg-white/10 text-white'
                          )}
                        >
                          <Icon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{post.time}</span>
                        </div>
                      );
                    })}
                    {day.posts.length > 2 && (
                      <div className="text-xs text-gray-500 pl-1">
                        +{day.posts.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Day Details */}
          {selectedDay && selectedDay.posts.length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Dia {selectedDay.date}
              </h3>
              <div className="space-y-3">
                {selectedDay.posts.map((post) => {
                  const Icon = platformIcons[post.platform];
                  return (
                    <div key={post.id} className="group flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0a] hover:bg-white/5 transition-all">
                      <div className={cn('p-2 rounded-lg', platformColors[post.platform])}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{post.title}</p>
                        <p className="text-xs text-gray-500">{post.time}</p>
                      </div>
                      <Badge variant={post.status === 'scheduled' ? 'success' : 'default'}>
                        {post.status === 'scheduled' ? 'Agendado' : 'Rascunho'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Upcoming Holidays */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Datas Comemorativas</h3>
            </div>
            <div className="space-y-3">
              {upcomingHolidays.map(([date, name]) => (
                <div key={date} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all">
                  <span className="text-sm text-white">{name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Este Mês</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Posts agendados</span>
                <span className="text-white font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Posts publicados</span>
                <span className="text-white font-semibold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Rascunhos</span>
                <span className="text-white font-semibold">3</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
