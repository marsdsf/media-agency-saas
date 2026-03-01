-- =============================================
-- MIGRAÇÃO FASE 2 — Tabelas complementares
-- Execute APÓS a migration-multitenant.sql
-- =============================================

-- =============================================
-- FIX: Renomear scheduled_for -> scheduled_at (padronizar com API)
-- =============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'scheduled_for'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'scheduled_at'
  ) THEN
    ALTER TABLE public.posts RENAME COLUMN scheduled_for TO scheduled_at;
  END IF;
END $$;

-- =============================================
-- TABELA: approval_tokens (Tokens de aprovação)
-- =============================================
CREATE TABLE IF NOT EXISTS public.approval_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  action TEXT, -- 'approve' or 'reject' (filled when used)
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approval_tokens_token ON public.approval_tokens(token);
CREATE INDEX idx_approval_tokens_post ON public.approval_tokens(post_id);

-- =============================================
-- TABELA: social_accounts (Contas de redes sociais)
-- =============================================
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,

  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'threads')),
  platform_user_id TEXT,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  
  -- OAuth tokens
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Page/Account specific (Facebook Pages, LinkedIn Companies)
  page_id TEXT,
  page_name TEXT,
  
  -- Metrics cache
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'expired', 'error')),
  last_synced_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_accounts_agency ON public.social_accounts(agency_id);
CREATE INDEX idx_social_accounts_client ON public.social_accounts(client_id);
CREATE INDEX idx_social_accounts_platform ON public.social_accounts(platform);

-- =============================================
-- TABELA: automations (Regras de automação)
-- =============================================
CREATE TABLE IF NOT EXISTS public.automations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('post_published', 'post_approved', 'post_rejected', 'new_follower', 'new_message', 'scheduled', 'webhook', 'manual')),
  trigger_config JSONB DEFAULT '{}',
  
  action_type TEXT NOT NULL CHECK (action_type IN ('send_email', 'send_whatsapp', 'create_post', 'update_status', 'notify_team', 'webhook', 'ai_generate')),
  action_config JSONB DEFAULT '{}',
  
  conditions JSONB DEFAULT '[]', -- Array of conditions: [{field, operator, value}]
  
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automations_agency ON public.automations(agency_id);
CREATE INDEX idx_automations_trigger ON public.automations(trigger_type);

-- =============================================
-- TABELA: campaigns (Campanhas)
-- =============================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT CHECK (objective IN ('awareness', 'engagement', 'traffic', 'conversions', 'leads', 'sales', 'other')),
  
  start_date DATE,
  end_date DATE,
  
  budget DECIMAL(12, 2) DEFAULT 0,
  spent DECIMAL(12, 2) DEFAULT 0,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  
  platforms TEXT[] DEFAULT '{}',
  
  metrics JSONB DEFAULT '{}', -- {reach, impressions, clicks, conversions, ctr, cpc, cpm}
  
  created_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_agency ON public.campaigns(agency_id);
CREATE INDEX idx_campaigns_client ON public.campaigns(client_id);

-- =============================================
-- TABELA: templates (Templates de conteúdo)
-- =============================================
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('post', 'story', 'reel', 'carousel', 'ad', 'email', 'other')),
  
  content TEXT, -- Template text with {{variables}}
  variables JSONB DEFAULT '[]', -- [{name, type, default}]
  
  media_urls TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  
  hashtags TEXT[] DEFAULT '{}',
  
  is_public BOOLEAN DEFAULT false, -- Shared templates
  use_count INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_agency ON public.templates(agency_id);
CREATE INDEX idx_templates_category ON public.templates(category);

-- =============================================
-- TABELA: media_library (Biblioteca de mídia)
-- =============================================
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'gif', 'document', 'audio')),
  mime_type TEXT,
  file_size INTEGER, -- bytes
  
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- seconds for video/audio
  
  alt_text TEXT,
  tags TEXT[] DEFAULT '{}',
  
  folder TEXT DEFAULT 'root',
  
  storage_path TEXT, -- Supabase Storage path
  
  uploaded_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_library_agency ON public.media_library(agency_id);
CREATE INDEX idx_media_library_client ON public.media_library(client_id);
CREATE INDEX idx_media_library_type ON public.media_library(type);

-- =============================================
-- TABELA: brand_assets (Assets de marca)
-- =============================================
CREATE TABLE IF NOT EXISTS public.brand_assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('logo', 'color', 'font', 'template', 'guideline', 'icon', 'pattern')),
  name TEXT NOT NULL,
  value TEXT, -- hex color, font name, or URL
  
  file_url TEXT,
  thumbnail_url TEXT,
  
  metadata JSONB DEFAULT '{}', -- {variations: [...], usage: '...'}
  
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brand_assets_agency ON public.brand_assets(agency_id);
CREATE INDEX idx_brand_assets_client ON public.brand_assets(client_id);

-- =============================================
-- TABELA: competitors (Competidores)
-- =============================================
CREATE TABLE IF NOT EXISTS public.competitors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  
  social_profiles JSONB DEFAULT '{}', -- {instagram: '@handle', facebook: 'url', ...}
  
  -- Cached metrics
  followers JSONB DEFAULT '{}', -- {instagram: 1000, facebook: 2000, ...}
  engagement_rate DECIMAL(5, 2),
  
  notes TEXT,
  
  last_analyzed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitors_agency ON public.competitors(agency_id);
CREATE INDEX idx_competitors_client ON public.competitors(client_id);

-- =============================================
-- TABELA: analytics_snapshots (Snapshots de analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  
  platform TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  date DATE NOT NULL,
  
  metrics JSONB NOT NULL DEFAULT '{}', 
  -- {reach, impressions, engagement, clicks, followers, following, 
  --  posts_count, likes, comments, shares, saves, profile_views, 
  --  stories_views, reels_views, video_views}
  
  top_posts JSONB DEFAULT '[]', -- [{post_id, reach, engagement}]
  
  demographics JSONB DEFAULT '{}', -- {age: {...}, gender: {...}, location: {...}}
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_snapshots_agency ON public.analytics_snapshots(agency_id);
CREATE INDEX idx_analytics_snapshots_date ON public.analytics_snapshots(date);
CREATE INDEX idx_analytics_snapshots_platform ON public.analytics_snapshots(platform);
CREATE UNIQUE INDEX idx_analytics_unique ON public.analytics_snapshots(agency_id, client_id, social_account_id, platform, period, date);

-- =============================================
-- TABELA: conversations (Conversas do inbox)
-- =============================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  
  -- External contact info
  contact_name TEXT NOT NULL,
  contact_avatar TEXT,
  contact_platform_id TEXT, -- platform-specific user ID
  
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'whatsapp', 'email')),
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived', 'spam')),
  is_starred BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Assignment
  assigned_to UUID REFERENCES public.profiles(id),
  
  -- Tags
  tags TEXT[] DEFAULT '{}',
  
  -- Counters
  unread_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  
  metadata JSONB DEFAULT '{}', -- {thread_id, parent_id, etc.}
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_agency ON public.conversations(agency_id);
CREATE INDEX idx_conversations_platform ON public.conversations(platform);
CREATE INDEX idx_conversations_status ON public.conversations(status);

-- =============================================
-- TABELA: messages (Mensagens individuais)
-- =============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  
  sender_type TEXT NOT NULL CHECK (sender_type IN ('contact', 'agent', 'system', 'ai')),
  sender_id UUID, -- profile id if agent
  sender_name TEXT,
  
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'audio', 'file', 'location', 'reaction')),
  
  media_url TEXT,
  
  -- External message ID (from platform API)
  external_id TEXT,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- AI metadata
  ai_generated BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3, 2),
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- =============================================
-- TABELA: hashtag_groups (Grupos de hashtags)
-- =============================================
CREATE TABLE IF NOT EXISTS public.hashtag_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  
  category TEXT,
  avg_reach INTEGER DEFAULT 0,
  
  use_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hashtag_groups_agency ON public.hashtag_groups(agency_id);

-- =============================================
-- TABELA: link_pages (Link in bio pages)
-- =============================================
CREATE TABLE IF NOT EXISTS public.link_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  avatar_url TEXT,
  background_type TEXT DEFAULT 'solid' CHECK (background_type IN ('solid', 'gradient', 'image')),
  background_value TEXT DEFAULT '#0a0a0a',
  
  links JSONB NOT NULL DEFAULT '[]', -- [{title, url, icon, clicks, active}]
  
  social_links JSONB DEFAULT '{}', -- {instagram: url, twitter: url, ...}
  
  theme JSONB DEFAULT '{}', -- {font, buttonStyle, buttonColor, textColor}
  
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_link_pages_slug ON public.link_pages(slug);
CREATE INDEX idx_link_pages_agency ON public.link_pages(agency_id);

-- =============================================
-- TABELA: reports (Relatórios gerados)
-- =============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  type TEXT DEFAULT 'monthly' CHECK (type IN ('weekly', 'monthly', 'quarterly', 'annual', 'custom', 'campaign')),
  
  period_start DATE,
  period_end DATE,
  
  data JSONB DEFAULT '{}', -- Raw report data
  
  file_url TEXT, -- Generated PDF URL
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'sent', 'error')),
  
  sent_to TEXT[] DEFAULT '{}', -- Email addresses
  sent_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_agency ON public.reports(agency_id);
CREATE INDEX idx_reports_client ON public.reports(client_id);

-- =============================================
-- TABELA: content_calendar (Eventos do calendário)
-- =============================================
CREATE TABLE IF NOT EXISTS public.content_calendar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  
  type TEXT DEFAULT 'event' CHECK (type IN ('event', 'holiday', 'deadline', 'meeting', 'launch', 'campaign')),
  
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  
  color TEXT DEFAULT '#7c3aed',
  
  -- Link to post if applicable
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  
  recurring JSONB, -- {frequency: 'weekly', interval: 1, until: '2026-12-31'}
  
  created_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_calendar_agency ON public.content_calendar(agency_id);
CREATE INDEX idx_content_calendar_dates ON public.content_calendar(start_date, end_date);

-- =============================================
-- TABELA: credit_transactions (Transações de créditos IA)
-- =============================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  
  amount INTEGER NOT NULL, -- positive = credit, negative = debit
  type TEXT NOT NULL CHECK (type IN ('usage', 'purchase', 'bonus', 'refund', 'reset')),
  
  description TEXT,
  
  -- Reference to what used the credits
  entity_type TEXT, -- 'ai_chat', 'ai_generate', 'ai_image', etc.
  entity_id TEXT,
  
  balance_after INTEGER, -- Running balance
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_agency ON public.credit_transactions(agency_id);

-- =============================================
-- TABELA: ai_conversations (Conversas com IA)
-- =============================================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  title TEXT DEFAULT 'Nova conversa',
  
  messages JSONB NOT NULL DEFAULT '[]', -- [{role, content, timestamp}]
  
  model TEXT DEFAULT 'gpt-4',
  total_tokens INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_agency ON public.ai_conversations(agency_id);
CREATE INDEX idx_ai_conversations_user ON public.ai_conversations(user_id);

-- =============================================
-- ROW LEVEL SECURITY for new tables
-- =============================================
ALTER TABLE public.approval_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtag_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policies — Agency-scoped access
CREATE POLICY "agency_access" ON public.social_accounts FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.automations FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.campaigns FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.templates FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.media_library FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.brand_assets FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.competitors FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.analytics_snapshots FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.conversations FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.hashtag_groups FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.link_pages FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.reports FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.content_calendar FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.credit_transactions FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "agency_access" ON public.ai_conversations FOR ALL USING (agency_id = public.get_user_agency_id());

-- Messages: accessible if conversation belongs to user's agency
CREATE POLICY "agency_messages" ON public.messages FOR ALL
  USING (conversation_id IN (SELECT id FROM public.conversations WHERE agency_id = public.get_user_agency_id()));

-- Approval tokens: public read (for token-based approval), agency write
CREATE POLICY "public_token_read" ON public.approval_tokens FOR SELECT USING (true);
CREATE POLICY "service_token_write" ON public.approval_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "service_token_update" ON public.approval_tokens FOR UPDATE USING (true);

-- =============================================
-- GRANTS for new tables
-- =============================================
GRANT ALL ON public.approval_tokens TO postgres, service_role;
GRANT ALL ON public.social_accounts TO postgres, service_role;
GRANT ALL ON public.automations TO postgres, service_role;
GRANT ALL ON public.campaigns TO postgres, service_role;
GRANT ALL ON public.templates TO postgres, service_role;
GRANT ALL ON public.media_library TO postgres, service_role;
GRANT ALL ON public.brand_assets TO postgres, service_role;
GRANT ALL ON public.competitors TO postgres, service_role;
GRANT ALL ON public.analytics_snapshots TO postgres, service_role;
GRANT ALL ON public.conversations TO postgres, service_role;
GRANT ALL ON public.messages TO postgres, service_role;
GRANT ALL ON public.hashtag_groups TO postgres, service_role;
GRANT ALL ON public.link_pages TO postgres, service_role;
GRANT ALL ON public.reports TO postgres, service_role;
GRANT ALL ON public.content_calendar TO postgres, service_role;
GRANT ALL ON public.credit_transactions TO postgres, service_role;
GRANT ALL ON public.ai_conversations TO postgres, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.approval_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.automations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_snapshots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hashtag_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.link_pages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_calendar TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credit_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_conversations TO authenticated;

-- Triggers for updated_at
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON public.automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_media_library_updated_at BEFORE UPDATE ON public.media_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_brand_assets_updated_at BEFORE UPDATE ON public.brand_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON public.competitors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_hashtag_groups_updated_at BEFORE UPDATE ON public.hashtag_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_link_pages_updated_at BEFORE UPDATE ON public.link_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON public.content_calendar FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- Add social_account_id FK to posts (if not exists)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'social_account_id'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Add hashtags column to posts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'hashtags'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN hashtags TEXT[] DEFAULT '{}';
  END IF;
END
$$;

-- =============================================
-- Supabase Storage Buckets (run via Supabase Dashboard or API)
-- =============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('brand-assets', 'brand-assets', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- CREATE POLICY "Agency can upload media" ON storage.objects FOR INSERT WITH CHECK (
--   bucket_id IN ('media', 'brand-assets', 'avatars') AND
--   auth.uid() IS NOT NULL
-- );

-- CREATE POLICY "Public can view public media" ON storage.objects FOR SELECT USING (
--   bucket_id IN ('media', 'brand-assets', 'avatars')
-- );

-- =============================================
-- VERIFICAÇÃO
-- =============================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
