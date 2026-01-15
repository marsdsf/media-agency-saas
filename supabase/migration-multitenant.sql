-- =============================================
-- MIGRAÇÃO PARA MULTI-TENANT
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

-- Remover tabelas do schema antigo (se existirem)
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.competitor_analytics CASCADE;
DROP TABLE IF EXISTS public.competitors CASCADE;

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
  role TEXT DEFAULT 'agency_owner' CHECK (role IN ('super_admin', 'agency_owner', 'agency_member', 'client')),
  
  -- Associação com agência
  agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  
  -- Permissões
  permissions TEXT[] DEFAULT '{}',
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
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
  
  -- Portal access
  portal_enabled BOOLEAN DEFAULT false,
  portal_user_id UUID REFERENCES auth.users(id),
  
  -- Social accounts (JSON)
  social_accounts JSONB DEFAULT '[]',
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'churned', 'prospect')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agency_id, slug)
);

-- =============================================
-- TABELA: posts
-- =============================================
CREATE TABLE public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT CHECK (media_type IN ('image', 'video', 'carousel', 'story', 'reel', 'text')),
  
  platform TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'scheduled', 'published', 'failed', 'rejected')),
  
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_by UUID REFERENCES public.profiles(id),
  
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  
  metrics JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: notifications
-- =============================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  action_url TEXT,
  
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: invitations
-- =============================================
CREATE TABLE public.invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  
  email TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',
  token TEXT UNIQUE NOT NULL,
  
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  
  invited_by UUID REFERENCES public.profiles(id),
  accepted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_profiles_agency_id ON public.profiles(agency_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_clients_agency_id ON public.clients(agency_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_posts_agency_id ON public.posts(agency_id);
CREATE INDEX idx_posts_client_id ON public.posts(client_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_activity_log_agency_id ON public.activity_log(agency_id);

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

-- Triggers para updated_at
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION public.get_user_agency_id()
RETURNS UUID AS $$
  SELECT agency_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies para agencies
CREATE POLICY "Agency owners can manage their agency" ON public.agencies
  FOR ALL USING (owner_id = auth.uid() OR id = public.get_user_agency_id());

-- Policies para profiles
CREATE POLICY "Users can view profiles in same agency" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR agency_id = public.get_user_agency_id());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Policies para clients
CREATE POLICY "Agency members can manage clients" ON public.clients
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Policies para posts
CREATE POLICY "Agency members can manage posts" ON public.posts
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Policies para activity_log
CREATE POLICY "Agency access" ON public.activity_log 
  FOR SELECT USING (agency_id = public.get_user_agency_id());

CREATE POLICY "Service role can insert activity" ON public.activity_log
  FOR INSERT WITH CHECK (true);

-- Policies para notifications
CREATE POLICY "User notifications" ON public.notifications 
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Policies para invitations
CREATE POLICY "Agency access" ON public.invitations 
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Permissões para authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agencies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT ON public.activity_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;

-- =============================================
-- VERIFICAÇÃO
-- =============================================
-- Executar isso para verificar se tudo foi criado:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
