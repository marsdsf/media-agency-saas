import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface ScheduledPost {
  id: string;
  content: string;
  platforms: Platform[];
  scheduledAt: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'published' | 'failed' | 'rejected';
  media?: MediaItem[];
  hashtags: string[];
  campaign?: string;
  clientId?: string;
  aiGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export type Platform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'pinterest';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  color: string;
  postsCount: number;
}

// Auth Store
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  agency_id?: string;
  agency_name?: string;
  plan?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Erro ao fazer login');
          }
          
          set({
            user: {
              id: data.user.id,
              name: data.profile?.full_name || data.user.user_metadata?.name || data.user.email.split('@')[0],
              email: data.user.email,
              avatar: data.profile?.avatar_url || data.user.user_metadata?.avatar_url,
              role: data.profile?.role || 'agency_member',
              agency_id: data.profile?.agency_id,
              agency_name: data.agency?.name,
              plan: data.agency?.plan,
            },
            token: data.session?.access_token || 'authenticated',
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
          console.error('Logout error:', e);
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },
      refreshUser: async () => {
        try {
          const response = await fetch('/api/user/profile');
          const data = await response.json();
          if (data.profile) {
            const current = get().user;
            set({
              user: {
                ...current,
                id: data.profile.id,
                name: data.profile.fullName || current?.name || '',
                email: data.profile.email || current?.email || '',
                avatar: data.profile.avatarUrl,
                role: data.profile.role,
                agency_id: data.profile.agencyId,
                agency_name: data.agency?.name,
                plan: data.agency?.plan,
              },
            });
          }
        } catch (e) {
          console.error('Refresh user error:', e);
        }
      },
    }),
    { name: 'auth-storage' }
  )
);

// Posts Store — syncs with API
interface PostsState {
  posts: ScheduledPost[];
  campaigns: Campaign[];
  isLoading: boolean;
  selectedDate: Date | null;
  viewMode: 'calendar' | 'list' | 'kanban';
  selectedClientId: string | null;
  
  // Actions
  fetchPosts: (clientId?: string) => Promise<void>;
  addPost: (post: Omit<ScheduledPost, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePost: (id: string, data: Partial<ScheduledPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  duplicatePost: (id: string) => void;
  setSelectedDate: (date: Date | null) => void;
  setViewMode: (mode: 'calendar' | 'list' | 'kanban') => void;
  setSelectedClientId: (id: string | null) => void;
  getPostsByDate: (date: Date) => ScheduledPost[];
  getPostsByPlatform: (platform: Platform) => ScheduledPost[];
  getPostsByCampaign: (campaignId: string) => ScheduledPost[];
}

export const usePostsStore = create<PostsState>()(
  persist(
    (set, get) => ({
      posts: [],
      campaigns: [],
      isLoading: false,
      selectedDate: null,
      viewMode: 'calendar',
      selectedClientId: null,

      fetchPosts: async (clientId?: string) => {
        set({ isLoading: true });
        try {
          const params = new URLSearchParams();
          if (clientId) params.set('clientId', clientId);
          const response = await fetch(`/api/posts?${params.toString()}`);
          const data = await response.json();
          if (data.posts) {
            const mappedPosts: ScheduledPost[] = data.posts.map((p: any) => ({
              id: p.id,
              content: p.content || '',
              platforms: [p.platform],
              scheduledAt: p.scheduled_for || p.created_at,
              status: p.status,
              hashtags: p.hashtags || [],
              campaign: p.campaign_id,
              clientId: p.client_id,
              aiGenerated: p.ai_generated,
              createdAt: p.created_at,
              updatedAt: p.updated_at,
              media: (p.media_urls || []).map((url: string, i: number) => ({
                id: `media-${i}`,
                type: 'image' as const,
                url,
              })),
            }));
            set({ posts: mappedPosts });
          }
        } catch (error) {
          console.error('Error fetching posts:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addPost: async (postData) => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: postData.content,
              platform: postData.platforms[0] || 'instagram',
              hashtags: postData.hashtags,
              scheduledFor: postData.scheduledAt || null,
              status: postData.status || 'draft',
              clientId: postData.clientId || null,
              campaignId: postData.campaign || null,
              mediaUrls: postData.media?.map(m => m.url) || [],
              aiGenerated: postData.aiGenerated || false,
            }),
          });
          const data = await response.json();
          if (data.post) {
            const newPost: ScheduledPost = {
              ...postData,
              id: data.post.id,
              createdAt: data.post.created_at,
              updatedAt: data.post.updated_at,
            };
            set((state) => ({ posts: [...state.posts, newPost] }));
          }
        } catch (error) {
          console.error('Error adding post:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updatePost: async (id, data) => {
        try {
          await fetch('/api/posts', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id,
              content: data.content,
              status: data.status,
              hashtags: data.hashtags,
              scheduledFor: data.scheduledAt,
              mediaUrls: data.media?.map(m => m.url),
            }),
          });
          set((state) => ({
            posts: state.posts.map((post) =>
              post.id === id
                ? { ...post, ...data, updatedAt: new Date().toISOString() }
                : post
            ),
          }));
        } catch (error) {
          console.error('Error updating post:', error);
        }
      },

      deletePost: async (id) => {
        try {
          await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
          set((state) => ({
            posts: state.posts.filter((post) => post.id !== id),
          }));
        } catch (error) {
          console.error('Error deleting post:', error);
        }
      },

      duplicatePost: (id) => {
        const post = get().posts.find((p) => p.id === id);
        if (post) {
          // Create a draft copy via API
          get().addPost({
            content: post.content,
            platforms: post.platforms,
            scheduledAt: '',
            status: 'draft',
            hashtags: post.hashtags,
            campaign: post.campaign,
            clientId: post.clientId,
          });
        }
      },

      setSelectedDate: (date) => set({ selectedDate: date }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSelectedClientId: (id) => set({ selectedClientId: id }),

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

// Notifications Store
interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (data.notifications) {
        set({
          notifications: data.notifications,
          unreadCount: data.notifications.filter((n: Notification) => !n.read).length,
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  },

  markAsRead: async (id) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Error marking notification:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error marking all notifications:', error);
    }
  },
}));
