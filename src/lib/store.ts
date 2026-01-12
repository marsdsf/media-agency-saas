import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface ScheduledPost {
  id: string;
  content: string;
  platforms: Platform[];
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  media?: MediaItem[];
  hashtags: string[];
  campaign?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export type Platform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  color: string;
  postsCount: number;
}

// Auth Store
interface AuthState {
  user: { id: string; name: string; email: string; avatar?: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Simulated login
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (email && password) {
          set({
            user: { id: '1', name: 'Designer', email },
            token: 'demo-token',
            isAuthenticated: true,
          });
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage' }
  )
);

// Posts Store
interface PostsState {
  posts: ScheduledPost[];
  campaigns: Campaign[];
  isLoading: boolean;
  selectedDate: Date | null;
  viewMode: 'calendar' | 'list' | 'kanban';
  
  // Actions
  addPost: (post: Omit<ScheduledPost, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePost: (id: string, data: Partial<ScheduledPost>) => void;
  deletePost: (id: string) => void;
  duplicatePost: (id: string) => void;
  setSelectedDate: (date: Date | null) => void;
  setViewMode: (mode: 'calendar' | 'list' | 'kanban') => void;
  getPostsByDate: (date: Date) => ScheduledPost[];
  getPostsByPlatform: (platform: Platform) => ScheduledPost[];
  getPostsByCampaign: (campaignId: string) => ScheduledPost[];
}

// Demo posts
const demoPosts: ScheduledPost[] = [
  {
    id: '1',
    content: '🚀 Novidade incrível chegando! Prepare-se para revolucionar sua forma de trabalhar. #inovação #tecnologia #futuro',
    platforms: ['instagram', 'facebook'],
    scheduledAt: '2026-01-12T10:00:00',
    status: 'scheduled',
    hashtags: ['inovação', 'tecnologia', 'futuro'],
    campaign: 'lancamento-produto',
    createdAt: '2026-01-10T15:00:00',
    updatedAt: '2026-01-10T15:00:00',
  },
  {
    id: '2',
    content: '💡 5 dicas para aumentar sua produtividade em 2026:\n\n1. Automatize tarefas repetitivas\n2. Use IA para criar conteúdo\n3. Organize seu calendário\n4. Defina prioridades claras\n5. Faça pausas estratégicas',
    platforms: ['linkedin', 'twitter'],
    scheduledAt: '2026-01-12T14:30:00',
    status: 'scheduled',
    hashtags: ['produtividade', 'dicas', '2026'],
    createdAt: '2026-01-10T16:00:00',
    updatedAt: '2026-01-10T16:00:00',
  },
  {
    id: '3',
    content: '✨ Black Friday chegou mais cedo! Descontos de até 70% em todos os planos. Use o cupom BLACKAI70',
    platforms: ['instagram', 'facebook', 'twitter'],
    scheduledAt: '2026-01-13T09:00:00',
    status: 'scheduled',
    hashtags: ['blackfriday', 'desconto', 'promocao'],
    campaign: 'black-friday',
    createdAt: '2026-01-11T10:00:00',
    updatedAt: '2026-01-11T10:00:00',
  },
  {
    id: '4',
    content: 'Bastidores do nosso time em ação! 🎬 Veja como criamos conteúdo que engaja.',
    platforms: ['instagram', 'tiktok'],
    scheduledAt: '2026-01-14T18:00:00',
    status: 'draft',
    hashtags: ['bastidores', 'equipe', 'conteudo'],
    createdAt: '2026-01-11T11:00:00',
    updatedAt: '2026-01-11T11:00:00',
  },
];

const demoCampaigns: Campaign[] = [
  { id: 'lancamento-produto', name: 'Lançamento Produto X', color: '#8B5CF6', postsCount: 5 },
  { id: 'black-friday', name: 'Black Friday 2026', color: '#F59E0B', postsCount: 12 },
  { id: 'conteudo-educativo', name: 'Conteúdo Educativo', color: '#10B981', postsCount: 8 },
];

export const usePostsStore = create<PostsState>()(
  persist(
    (set, get) => ({
      posts: demoPosts,
      campaigns: demoCampaigns,
      isLoading: false,
      selectedDate: null,
      viewMode: 'calendar',

      addPost: (postData) => {
        const newPost: ScheduledPost = {
          ...postData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ posts: [...state.posts, newPost] }));
      },

      updatePost: (id, data) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === id
              ? { ...post, ...data, updatedAt: new Date().toISOString() }
              : post
          ),
        }));
      },

      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== id),
        }));
      },

      duplicatePost: (id) => {
        const post = get().posts.find((p) => p.id === id);
        if (post) {
          const newPost: ScheduledPost = {
            ...post,
            id: Date.now().toString(),
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({ posts: [...state.posts, newPost] }));
        }
      },

      setSelectedDate: (date) => set({ selectedDate: date }),
      setViewMode: (mode) => set({ viewMode: mode }),

      getPostsByDate: (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return get().posts.filter(
          (post) => post.scheduledAt.split('T')[0] === dateStr
        );
      },

      getPostsByPlatform: (platform) => {
        return get().posts.filter((post) => post.platforms.includes(platform));
      },

      getPostsByCampaign: (campaignId) => {
        return get().posts.filter((post) => post.campaign === campaignId);
      },
    }),
    { name: 'posts-storage' }
  )
);
