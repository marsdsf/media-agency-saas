-- =============================================
-- MIGRAÇÃO COMPLETA MULTI-TENANT
-- Execute este SQL no Supabase SQL Editor
-- ATENÇÃO: Isso vai apagar dados existentes!
-- =============================================

-- 1. REMOVER TABELAS ANTIGAS (se existirem)
DROP TABLE IF EXISTS public.invitations CASCADE;
DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.credit_transactions CASCADE;
DROP TABLE IF EXISTS public.ai_conversations CASCADE;
DROP TABLE IF EXISTS public.analytics_reports CASCADE;
DROP TABLE IF EXISTS public.analytics_snapshots CASCADE;
DROP TABLE IF EXISTS public.brand_assets CASCADE;
DROP TABLE IF EXISTS public.media_library CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.content_calendar CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.social_accounts CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.agencies CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.competitor_analytics CASCADE;
DROP TABLE IF EXISTS public.competitors CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;

-- 2. REMOVER TRIGGERS E FUNÇÕES ANTIGAS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at();
DROP FUNCTION IF EXISTS public.get_user_agency_id();
DROP FUNCTION IF EXISTS public.get_user_role();

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA: agencies (Agências - Tenants)
-- =============================================
CREATE TABLE public.agencies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  owner_id UUID NOT NULL,
  
  -- Plano e limites
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise', 'custom')),
  max_clients INTEGER DEFAULT 5,
  max_team_members INTEGER DEFAULT 2,
  ai_credits_limit INTEGER DEFAULT 2000,
  ai_credits_used INTEGER DEFAULT 0,
  
  -- Payment Gateways
  payment_gateway TEXT DEFAULT 'stripe' CHECK (payment_gateway IN ('stripe', 'asaas', 'mercadopago')),
  
  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Asaas
  asaas_customer_id TEXT,
  asaas_subscription_id TEXT,
  
  -- Mercado Pago
  mercadopago_customer_id TEXT,
  mercadopago_subscription_id TEXT,
  
  -- Status comum
  subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'pending', 'past_due', 'cancelled', 'incomplete')),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  
  -- Configurações
  settings JSONB DEFAULT '{}',
  
  -- White-label
  custom_domain TEXT,
  brand_colors JSONB DEFAULT '{"primary": "#ffffff", "secondary": "#0a0a0a"}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: profiles (Usuários)
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  
  -- Tipo de usuário
  role TEXT DEFAULT 'agency_owner' CHECK (role IN ('super_admin', 'agency_owner', 'agency_admin', 'agency_member', 'client')),
  
  -- Associação com agência
  agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  
  -- Permissões granulares
  permissions TEXT[] DEFAULT '{}',
  
  -- Settings do usuário
  settings JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "in_app": true}',
  
  last_login_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: clients (Clientes de cada agência)
-- =============================================
CREATE TABLE public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  description TEXT,
  
  -- Portal access
  portal_enabled BOOLEAN DEFAULT false,
  portal_user_id UUID REFERENCES auth.users(id),
  portal_password_hash TEXT,
  
  -- Social media handles
  social_handles JSONB DEFAULT '{}',
  
  -- Notes internas
  notes TEXT,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'churned', 'prospect')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agency_id, slug)
);

-- =============================================
-- TABELA: social_accounts (Contas sociais)
-- =============================================
CREATE TABLE public.social_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'linkedin', 'twitter', 'youtube', 'pinterest')),
  platform_user_id TEXT NOT NULL,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agency_id, platform, platform_user_id)
);

-- =============================================
-- TABELA: posts
-- =============================================
CREATE TABLE public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
  campaign_id UUID,
  
  content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT CHECK (media_type IN ('image', 'video', 'carousel', 'story', 'reel', 'text')),
  
  platform TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'scheduled', 'published', 'failed', 'rejected')),
  
  -- Approval workflow
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  approval_notes TEXT,
  
  created_by UUID REFERENCES public.profiles(id),
  
  -- AI
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  
  -- Post metrics
  metrics JSONB DEFAULT '{}',
  
  -- External post ID (from social platform)
  external_post_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: campaigns
-- =============================================
CREATE TABLE public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#8B5CF6',
  
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  budget DECIMAL(10,2) DEFAULT 0,
  spent DECIMAL(10,2) DEFAULT 0,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  
  goals JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK now that campaigns exists
ALTER TABLE public.posts ADD CONSTRAINT posts_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;

-- =============================================
-- TABELA: content_calendar
-- =============================================
CREATE TABLE public.content_calendar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  
  event_type TEXT NOT NULL CHECK (event_type IN ('post', 'campaign', 'holiday', 'meeting', 'deadline', 'note')),
  
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  
  color TEXT,
  
  -- Links
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  
  recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  
  created_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: templates
-- =============================================
CREATE TABLE public.templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  
  platform TEXT,
  media_type TEXT,
  
  is_global BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: media_library
-- =============================================
CREATE TABLE public.media_library (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'audio', 'document', 'gif')),
  mime_type TEXT,
  file_size INTEGER DEFAULT 0,
  
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  
  folder TEXT DEFAULT 'root',
  tags TEXT[] DEFAULT '{}',
  
  alt_text TEXT,
  
  uploaded_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: brand_assets
-- =============================================
CREATE TABLE public.brand_assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  
  -- Brand identity
  colors JSONB DEFAULT '[]',
  fonts JSONB DEFAULT '[]',
  logos JSONB DEFAULT '[]',
  
  -- Tone of voice
  tone_of_voice TEXT,
  brand_voice_guidelines TEXT,
  
  -- Visual guidelines
  visual_guidelines TEXT,
  dos_and_donts JSONB DEFAULT '{"dos": [], "donts": []}',
  
  -- Target audience
  target_audience JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agency_id, client_id)
);

-- =============================================
-- TABELA: analytics_reports
-- =============================================
CREATE TABLE public.analytics_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  
  report_type TEXT DEFAULT 'monthly' CHECK (report_type IN ('weekly', 'monthly', 'quarterly', 'custom', 'campaign')),
  
  date_from TIMESTAMPTZ NOT NULL,
  date_to TIMESTAMPTZ NOT NULL,
  
  -- Report data
  data JSONB DEFAULT '{}',
  
  -- PDF
  pdf_url TEXT,
  
  -- Sharing
  shared_with_client BOOLEAN DEFAULT false,
  shared_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'sent', 'archived')),
  
  generated_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: ai_conversations
-- =============================================
CREATE TABLE public.ai_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  agent_type TEXT DEFAULT 'general',
  title TEXT,
  
  messages JSONB DEFAULT '[]',
  
  is_archived BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: credit_transactions
-- =============================================
CREATE TABLE public.credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('usage', 'purchase', 'subscription', 'bonus', 'refund')),
  action TEXT,
  description TEXT,
  
  balance_after INTEGER,
  
  -- Reference to what used the credits
  reference_type TEXT,
  reference_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: activity_log
-- =============================================
CREATE TABLE public.activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES public.clients(id),
  
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: notifications
-- =============================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  action_url TEXT,
  
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: invitations
-- =============================================
CREATE TABLE public.invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  
  email TEXT NOT NULL,
  role TEXT DEFAULT 'agency_member',
  permissions TEXT[] DEFAULT '{}',
  token TEXT UNIQUE NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  
  invited_by UUID REFERENCES public.profiles(id),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: competitors
-- =============================================
CREATE TABLE public.competitors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  website TEXT,
  
  social_handles JSONB DEFAULT '{}',
  
  notes TEXT,
  
  last_analyzed_at TIMESTAMPTZ,
  analysis_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: hashtag_groups
-- =============================================
CREATE TABLE public.hashtag_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  category TEXT,
  
  is_favorite BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: link_pages (Link-in-bio)
-- =============================================
CREATE TABLE public.link_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  
  theme JSONB DEFAULT '{"bg": "#000000", "text": "#ffffff", "accent": "#8B5CF6"}',
  
  links JSONB DEFAULT '[]',
  social_links JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT true,
  
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: automations
-- =============================================
CREATE TABLE public.automations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('schedule', 'event', 'webhook', 'approval', 'metric')),
  trigger_config JSONB DEFAULT '{}',
  
  actions JSONB DEFAULT '[]',
  
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_profiles_agency_id ON public.profiles(agency_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_clients_agency_id ON public.clients(agency_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_social_accounts_agency_id ON public.social_accounts(agency_id);
CREATE INDEX idx_social_accounts_client_id ON public.social_accounts(client_id);
CREATE INDEX idx_social_accounts_platform ON public.social_accounts(platform);
CREATE INDEX idx_posts_agency_id ON public.posts(agency_id);
CREATE INDEX idx_posts_client_id ON public.posts(client_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_scheduled_for ON public.posts(scheduled_for);
CREATE INDEX idx_posts_campaign_id ON public.posts(campaign_id);
CREATE INDEX idx_campaigns_agency_id ON public.campaigns(agency_id);
CREATE INDEX idx_campaigns_client_id ON public.campaigns(client_id);
CREATE INDEX idx_content_calendar_agency_id ON public.content_calendar(agency_id);
CREATE INDEX idx_content_calendar_start_date ON public.content_calendar(start_date);
CREATE INDEX idx_templates_agency_id ON public.templates(agency_id);
CREATE INDEX idx_media_library_agency_id ON public.media_library(agency_id);
CREATE INDEX idx_media_library_folder ON public.media_library(folder);
CREATE INDEX idx_brand_assets_client_id ON public.brand_assets(client_id);
CREATE INDEX idx_analytics_reports_agency_id ON public.analytics_reports(agency_id);
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_credit_transactions_agency_id ON public.credit_transactions(agency_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_activity_log_agency_id ON public.activity_log(agency_id);
CREATE INDEX idx_competitors_agency_id ON public.competitors(agency_id);
CREATE INDEX idx_hashtag_groups_agency_id ON public.hashtag_groups(agency_id);
CREATE INDEX idx_link_pages_slug ON public.link_pages(slug);
CREATE INDEX idx_automations_agency_id ON public.automations(agency_id);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper: get user's agency_id
CREATE OR REPLACE FUNCTION public.get_user_agency_id()
RETURNS UUID AS $$
  SELECT agency_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: get user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Atomic credit deduction (prevents race conditions)
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_agency_id UUID,
  p_amount INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT ai_credits_used, ai_credits_limit INTO v_current, v_limit
  FROM public.agencies WHERE id = p_agency_id FOR UPDATE;
  
  -- Check if unlimited (-1) or has enough credits
  IF v_limit = -1 OR (v_current + p_amount) <= v_limit THEN
    UPDATE public.agencies 
    SET ai_credits_used = ai_credits_used + p_amount
    WHERE id = p_agency_id;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset monthly credits
CREATE OR REPLACE FUNCTION public.reset_agency_credits(p_agency_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.agencies SET ai_credits_used = 0 WHERE id = p_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON public.content_calendar FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_media_library_updated_at BEFORE UPDATE ON public.media_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_brand_assets_updated_at BEFORE UPDATE ON public.brand_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_analytics_reports_updated_at BEFORE UPDATE ON public.analytics_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON public.competitors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_hashtag_groups_updated_at BEFORE UPDATE ON public.hashtag_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_link_pages_updated_at BEFORE UPDATE ON public.link_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON public.automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtag_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Agencies
CREATE POLICY "Agency owners can manage their agency" ON public.agencies
  FOR ALL USING (owner_id = auth.uid() OR id = public.get_user_agency_id());

-- Profiles
CREATE POLICY "Users can view profiles in same agency" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR agency_id = public.get_user_agency_id());
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Clients
CREATE POLICY "Agency members can manage clients" ON public.clients
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Social Accounts
CREATE POLICY "Agency members can manage social accounts" ON public.social_accounts
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Posts
CREATE POLICY "Agency members can manage posts" ON public.posts
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Campaigns
CREATE POLICY "Agency members can manage campaigns" ON public.campaigns
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Content Calendar
CREATE POLICY "Agency members can manage calendar" ON public.content_calendar
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Templates
CREATE POLICY "Agency members or global" ON public.templates
  FOR SELECT USING (is_global = true OR agency_id = public.get_user_agency_id());
CREATE POLICY "Agency members can manage templates" ON public.templates
  FOR INSERT WITH CHECK (agency_id = public.get_user_agency_id());
CREATE POLICY "Agency members can update templates" ON public.templates
  FOR UPDATE USING (agency_id = public.get_user_agency_id());
CREATE POLICY "Agency members can delete templates" ON public.templates
  FOR DELETE USING (agency_id = public.get_user_agency_id());

-- Media Library
CREATE POLICY "Agency members can manage media" ON public.media_library
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Brand Assets
CREATE POLICY "Agency members can manage brand assets" ON public.brand_assets
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Analytics Reports
CREATE POLICY "Agency members can manage reports" ON public.analytics_reports
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- AI Conversations
CREATE POLICY "Users can manage own conversations" ON public.ai_conversations
  FOR ALL USING (user_id = auth.uid());

-- Credit Transactions
CREATE POLICY "Agency members can view transactions" ON public.credit_transactions
  FOR SELECT USING (agency_id = public.get_user_agency_id());
CREATE POLICY "Service role can insert transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (true);

-- Activity Log
CREATE POLICY "Agency access" ON public.activity_log
  FOR SELECT USING (agency_id = public.get_user_agency_id());
CREATE POLICY "Service role can insert activity" ON public.activity_log
  FOR INSERT WITH CHECK (true);

-- Notifications
CREATE POLICY "User notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Invitations
CREATE POLICY "Agency access invitations" ON public.invitations
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Competitors
CREATE POLICY "Agency members can manage competitors" ON public.competitors
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Hashtag Groups
CREATE POLICY "Agency members can manage hashtag groups" ON public.hashtag_groups
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Link Pages
CREATE POLICY "Agency members can manage link pages" ON public.link_pages
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Automations
CREATE POLICY "Agency members can manage automations" ON public.automations
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agencies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_calendar TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_conversations TO authenticated;
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT SELECT ON public.activity_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hashtag_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.link_pages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.automations TO authenticated;

-- =============================================
-- SEED: Global Templates
-- =============================================
INSERT INTO public.templates (name, description, category, content, is_global, platform) VALUES
('Post Educativo', 'Template para posts educativos', 'education', '📚 [TÍTULO DO POST]\n\n[Ponto 1]\n[Ponto 2]\n[Ponto 3]\n\n💡 Salve esse post para consultar depois!\n\n#educação #dicas #aprendizado', true, 'instagram'),
('Antes e Depois', 'Template para mostrar transformação', 'transformation', '🔄 ANTES vs DEPOIS\n\nAntes: [descreva o problema]\nDepois: [descreva a solução]\n\nO que mudou? [explique a transformação]\n\n#antesedepois #transformação #resultado', true, 'instagram'),
('Carrossel Tips', 'Template para carrossel de dicas', 'tips', 'Slide 1: [TÍTULO IMPACTANTE] 🎯\nSlide 2: Dica 1 - [conteúdo]\nSlide 3: Dica 2 - [conteúdo]\nSlide 4: Dica 3 - [conteúdo]\nSlide 5: CTA - [Salve e compartilhe!]', true, 'instagram'),
('Story Enquete', 'Template para story com enquete', 'engagement', '📊 Me conta!\n\n[PERGUNTA]\n\nOpção A: [resposta 1]\nOpção B: [resposta 2]\n\n👆 Vote na enquete!', true, 'instagram'),
('Post LinkedIn', 'Template profissional para LinkedIn', 'professional', '[HOOK - primeira linha impactante]\n\n[Parágrafo contexto]\n\n[Lista de pontos]\n• Ponto 1\n• Ponto 2\n• Ponto 3\n\n[CTA + pergunta engajadora]\n\n#linkedin #networking #carreira', true, 'linkedin'),
('Thread Twitter', 'Template para thread no Twitter/X', 'thread', '🧵 THREAD: [ASSUNTO]\n\n1/ [Introdução hook]\n\n2/ [Ponto 1]\n\n3/ [Ponto 2]\n\n4/ [Ponto 3]\n\n5/ [Conclusão + CTA]\n\nSe gostou, RT e segue 🙏', true, 'twitter'),
('Roteiro TikTok', 'Template para roteiro de TikTok', 'video', '🎬 ROTEIRO TIKTOK\n\n[0-3s] HOOK: [frase impactante]\n[3-8s] CONTEXTO: [explique o problema]\n[8-20s] CONTEÚDO: [desenvolva a solução]\n[20-25s] CTA: [o que o viewer deve fazer]\n\n🎵 Sugestão de áudio: [trend audio]', true, 'tiktok'),
('Promoção', 'Template para posts promocionais', 'promo', '🔥 [OFERTA IMPERDÍVEL!]\n\n[Produto/Serviço]\n\n✅ Benefício 1\n✅ Benefício 2\n✅ Benefício 3\n\n💰 De R$[preço] por apenas R$[preço]\n⏰ Oferta por tempo limitado!\n\n🔗 Link na bio\n\n#promoção #oferta #desconto', true, 'instagram');

-- =============================================
-- STORAGE BUCKET for media
-- =============================================
-- Run this in a separate SQL or via Supabase Dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- =============================================
-- VERIFICAÇÃO
-- =============================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
