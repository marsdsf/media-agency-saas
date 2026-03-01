'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
  Star,
  Loader2
} from 'lucide-react';
import { Button, Card, Badge } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useCalendarEvents } from '@/hooks/useApiData';
import { usePostsStore } from '@/lib/store';

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

interface CalendarPost {
  id: string;
  title: string;
  platform: string;
  time: string;
  status: string;
}

interface CalendarDay {
  date: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  posts: CalendarPost[];
  holiday?: string;
}

// Brazilian holidays (computed dynamically per year)
function getHolidays(year: number): Record<string, string> {
  return {
    [`${year}-01-01`]: '🎉 Ano Novo',
    [`${year}-03-08`]: '👩 Dia da Mulher',
    [`${year}-04-21`]: '🇧🇷 Tiradentes',
    [`${year}-05-01`]: '👷 Dia do Trabalho',
    [`${year}-06-12`]: '❤️ Dia dos Namorados',
    [`${year}-09-07`]: '🇧🇷 Independência',
    [`${year}-10-12`]: '👧 Dia das Crianças',
    [`${year}-11-02`]: '🕯️ Finados',
    [`${year}-11-15`]: '🇧🇷 Proclamação da República',
    [`${year}-12-25`]: '🎄 Natal',
  };
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const { posts } = usePostsStore();

  // Compute date range for the current month view
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const { data: calendarData, loading } = useCalendarEvents(startStr, endStr);

  const holidays = useMemo(() => getHolidays(year), [year]);

  // Build a map of date → posts from both calendar events & posts store
  const postsByDate = useMemo(() => {
    const map: Record<string, CalendarPost[]> = {};

    // From posts store (persisted posts)
    posts.forEach(p => {
      if (!p.scheduledAt) return;
      const dateStr = new Date(p.scheduledAt).toISOString().split('T')[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push({
        id: p.id,
        title: p.content?.substring(0, 40) || 'Sem título',
        platform: p.platforms?.[0] || 'instagram',
        time: new Date(p.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: p.status,
      });
    });

    // From calendar API (calendar events)
    if (calendarData?.events) {
      calendarData.events.forEach((e: any) => {
        const dateStr = new Date(e.event_date || e.start_date).toISOString().split('T')[0];
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push({
          id: e.id,
          title: e.title || 'Evento',
          platform: e.platform || 'calendar',
          time: e.start_time || '00:00',
          status: e.status || 'scheduled',
        });
      });
    }

    return map;
  }, [posts, calendarData]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const yr = date.getFullYear();
    const mo = date.getMonth();
    const firstDay = new Date(yr, mo, 1);
    const lastDay = new Date(yr, mo + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: CalendarDay[] = [];
    const today = new Date();

    const prevMonth = new Date(yr, mo, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonthDays - i,
        dateStr: '',
        isCurrentMonth: false,
        isToday: false,
        posts: [],
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: i,
        dateStr,
        isCurrentMonth: true,
        isToday: today.getDate() === i && today.getMonth() === mo && today.getFullYear() === yr,
        posts: postsByDate[dateStr] || [],
        holiday: holidays[dateStr],
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        dateStr: '',
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

  // Stats from posts
  const monthPosts = posts.filter(p => {
    if (!p.scheduledAt) return false;
    const d = new Date(p.scheduledAt);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const scheduledCount = monthPosts.filter(p => p.status === 'scheduled').length;
  const publishedCount = monthPosts.filter(p => p.status === 'published').length;
  const draftCount = monthPosts.filter(p => p.status === 'draft').length;

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
                <span className="text-white font-semibold">{scheduledCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Posts publicados</span>
                <span className="text-white font-semibold">{publishedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Rascunhos</span>
                <span className="text-white font-semibold">{draftCount}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
