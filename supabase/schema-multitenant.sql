-- =============================================
-- SCHEMA MULTI-TENANT - AGÊNCIA DE MÍDIA SAAS
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA: agencies (Agências - Tenants principais)
-- =============================================
CREATE TABLE public.agencies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- para URL: app.mediaai.com/agencia-x
  logo_url TEXT,
  primary_color TEXT DEFAULT '#8B5CF6',
  secondary_color TEXT DEFAULT '#6366F1',
  custom_domain TEXT UNIQUE, -- white-label: dashboard.agencia-x.com
  
  -- Dono da agência
  owner_id UUID NOT NULL,
  
  -- Plano e limites
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise', 'custom')),
  max_clients INTEGER DEFAULT 5,
  max_team_members INTEGER DEFAULT 2,
  max_social_accounts_per_client INTEGER DEFAULT 3,
  credits_total INTEGER DEFAULT 1000,
  credits_used INTEGER DEFAULT 0,
  
  -- Stripe
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'trialing',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  
  -- Configurações
  settings JSONB DEFAULT '{}',
  features JSONB DEFAULT '{"ai_agents": true, "white_label": false, "api_access": false}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: profiles (Usuários - todos os tipos)
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  
  -- Tipo de usuário
  role TEXT DEFAULT 'client' CHECK (role IN ('super_admin', 'agency_owner', 'agency_member', 'client')),
  
  -- Associação com agência (NULL para super_admin)
  agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  
  -- Permissões dentro da agência (para agency_member)
  agency_role TEXT CHECK (agency_role IN ('admin', 'manager', 'editor', 'viewer')),
  
  -- Para clientes: configurações específicas
  client_settings JSONB DEFAULT '{}',
  
  -- Notificações
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  invited_by UUID REFERENCES public.profiles(id),
  invited_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar foreign key após criar profiles
ALTER TABLE public.agencies 
ADD CONSTRAINT fk_agencies_owner 
FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;

-- =============================================
-- TABELA: clients (Clientes de cada agência)
-- =============================================
CREATE TABLE public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  
  -- Dados do cliente (empresa/pessoa)
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  notes TEXT,
  
  -- Usuário associado (se o cliente tiver acesso ao portal)
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  portal_access BOOLEAN DEFAULT false,
  
  -- Status e contrato
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'churned', 'prospect')),
  contract_value DECIMAL(10,2),
  contract_start DATE,
  contract_end DATE,
  
  -- Tags e organização
  tags TEXT[] DEFAULT '{}',
  color TEXT DEFAULT '#6366F1',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: social_accounts (Contas de redes sociais)
-- =============================================
CREATE TABLE public.social_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'linkedin', 'twitter', 'youtube', 'pinterest', 'threads')),
  platform_user_id TEXT NOT NULL,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  followers_count INTEGER DEFAULT 0,
  
  -- Tokens (criptografados em produção)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agency_id, platform, platform_user_id)
);

-- =============================================
-- TABELA: posts (Posts/Conteúdo)
-- =============================================
CREATE TABLE public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  
  -- Conteúdo
  content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT CHECK (media_type IN ('image', 'video', 'carousel', 'story', 'reel', 'text')),
  hashtags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  link TEXT,
  
  -- Agendamento
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- Status e workflow
  status TEXT DEFAULT 'draft' CHECK (status IN ('idea', 'draft', 'pending_approval', 'approved', 'scheduled', 'publishing', 'published', 'failed', 'rejected')),
  
  -- Aprovação do cliente
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Criado por
  created_by UUID REFERENCES public.profiles(id),
  
  -- Publicação
  platform_post_id TEXT,
  platform_url TEXT,
  error_message TEXT,
  
  -- Métricas
  engagement JSONB DEFAULT '{"likes": 0, "comments": 0, "shares": 0, "saves": 0, "reach": 0, "impressions": 0}',
  
  -- IA
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: content_calendar (Calendário)
-- =============================================
CREATE TABLE public.content_calendar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  
  -- Associação com posts
  post_ids UUID[] DEFAULT '{}',
  
  -- Tipo de evento
  event_type TEXT DEFAULT 'post' CHECK (event_type IN ('post', 'campaign', 'holiday', 'meeting', 'deadline', 'note')),
  
  color TEXT DEFAULT '#8B5CF6',
  all_day BOOLEAN DEFAULT false,
  recurring TEXT, -- daily, weekly, monthly
  
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: campaigns (Campanhas)
-- =============================================
CREATE TABLE public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Métricas agregadas
  metrics JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: templates (Templates de conteúdo)
-- =============================================
CREATE TABLE public.templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  
  -- Conteúdo do template
  content TEXT,
  media_url TEXT,
  variables JSONB DEFAULT '{}', -- {{cliente_nome}}, {{produto}}, etc
  
  -- Metadados
  platform TEXT,
  post_type TEXT,
  
  -- Compartilhamento
  is_global BOOLEAN DEFAULT false, -- disponível para todas as agências
  is_public BOOLEAN DEFAULT false,
  uses_count INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: media_library (Biblioteca de mídia)
-- =============================================
CREATE TABLE public.media_library (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'gif', 'audio', 'document')),
  file_size INTEGER,
  mime_type TEXT,
  
  -- Organização
  folder TEXT DEFAULT 'root',
  tags TEXT[] DEFAULT '{}',
  
  -- Dimensões (para imagens/vídeos)
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- em segundos para vídeos
  
  -- Thumbnails
  thumbnail_url TEXT,
  
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: brand_assets (Identidade visual do cliente)
-- =============================================
CREATE TABLE public.brand_assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  
  -- Cores
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  colors JSONB DEFAULT '[]',
  
  -- Fontes
  primary_font TEXT,
  secondary_font TEXT,
  fonts JSONB DEFAULT '[]',
  
  -- Logos
  logo_primary TEXT,
  logo_secondary TEXT,
  logo_icon TEXT,
  logos JSONB DEFAULT '[]',
  
  -- Tom de voz
  brand_voice TEXT,
  tone_keywords TEXT[] DEFAULT '{}',
  
  -- Guia de estilo
  style_guide_url TEXT,
  guidelines TEXT,
  
  -- Hashtags padrão
  default_hashtags TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: analytics_reports (Relatórios)
-- =============================================
CREATE TABLE public.analytics_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  report_type TEXT DEFAULT 'monthly' CHECK (report_type IN ('weekly', 'monthly', 'quarterly', 'custom', 'campaign')),
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Dados do relatório
  data JSONB DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'sent', 'viewed')),
  
  -- Compartilhamento com cliente
  shared_at TIMESTAMPTZ,
  share_link TEXT UNIQUE,
  viewed_at TIMESTAMPTZ,
  
  -- PDF gerado
  pdf_url TEXT,
  
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: ai_conversations (Conversas com IA)
-- =============================================
CREATE TABLE public.ai_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  agent_type TEXT DEFAULT 'general' CHECK (agent_type IN ('general', 'content', 'strategy', 'ads', 'analytics', 'copywriter', 'designer')),
  
  title TEXT,
  messages JSONB DEFAULT '[]',
  
  -- Contexto da conversa
  context JSONB DEFAULT '{}',
  
  -- Créditos usados
  credits_used INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: credit_transactions (Uso de créditos)
-- =============================================
CREATE TABLE public.credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  amount INTEGER NOT NULL, -- positivo = adição, negativo = uso
  type TEXT NOT NULL CHECK (type IN ('subscription', 'purchase', 'usage', 'refund', 'bonus', 'adjustment')),
  
  action TEXT, -- 'generate_post', 'ai_chat', etc
  description TEXT,
  
  -- Referência
  reference_type TEXT, -- 'post', 'conversation', etc
  reference_id UUID,
  
  balance_after INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: notifications (Notificações)
-- =============================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  type TEXT NOT NULL, -- 'post_approved', 'client_added', 'payment_failed', etc
  title TEXT NOT NULL,
  message TEXT,
  
  -- Link para ação
  action_url TEXT,
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Metadados
  data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: activity_log (Log de atividades)
-- =============================================
CREATE TABLE public.activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  
  action TEXT NOT NULL, -- 'post.created', 'client.updated', etc
  entity_type TEXT, -- 'post', 'client', 'campaign', etc
  entity_id UUID,
  
  -- Detalhes da mudança
  changes JSONB DEFAULT '{}',
  
  -- IP e user agent (para segurança)
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: invitations (Convites pendentes)
-- =============================================
CREATE TABLE public.invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('agency_member', 'client')),
  agency_role TEXT, -- para agency_member
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE, -- para client
  
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  
  invited_by UUID REFERENCES public.profiles(id) NOT NULL,
  accepted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Função para criar perfil após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'agency_owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
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
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_brand_assets_updated_at BEFORE UPDATE ON public.brand_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Helper function para pegar agency_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_agency_id()
RETURNS UUID AS $$
  SELECT agency_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function para verificar role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies para agencies
CREATE POLICY "Agency owners can manage their agency" ON public.agencies
  FOR ALL USING (owner_id = auth.uid() OR id = public.get_user_agency_id());

-- Policies para profiles
CREATE POLICY "Users can view profiles in same agency" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR 
    agency_id = public.get_user_agency_id() OR
    public.get_user_role() = 'super_admin'
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Policies para clients
CREATE POLICY "Agency members can manage clients" ON public.clients
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Policies para social_accounts
CREATE POLICY "Agency members can manage social accounts" ON public.social_accounts
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Policies para posts
CREATE POLICY "Agency members can manage posts" ON public.posts
  FOR ALL USING (agency_id = public.get_user_agency_id());

-- Clientes podem ver e aprovar seus posts
CREATE POLICY "Clients can view and approve their posts" ON public.posts
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM public.clients c 
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update post status for approval" ON public.posts
  FOR UPDATE USING (
    client_id IN (
      SELECT c.id FROM public.clients c 
      WHERE c.user_id = auth.uid()
    )
  );

-- Policies para outras tabelas (similar pattern)
CREATE POLICY "Agency access" ON public.content_calendar FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "Agency access" ON public.campaigns FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "Agency access" ON public.templates FOR ALL USING (agency_id = public.get_user_agency_id() OR is_global = true);
CREATE POLICY "Agency access" ON public.media_library FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "Agency access" ON public.brand_assets FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "Agency access" ON public.analytics_reports FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "Agency access" ON public.ai_conversations FOR ALL USING (agency_id = public.get_user_agency_id());
CREATE POLICY "Agency access" ON public.credit_transactions FOR SELECT USING (agency_id = public.get_user_agency_id());
CREATE POLICY "User notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Agency access" ON public.activity_log FOR SELECT USING (agency_id = public.get_user_agency_id());
CREATE POLICY "Agency access" ON public.invitations FOR ALL USING (agency_id = public.get_user_agency_id());

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_profiles_agency_id ON public.profiles(agency_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_clients_agency_id ON public.clients(agency_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_social_accounts_agency_id ON public.social_accounts(agency_id);
CREATE INDEX idx_social_accounts_client_id ON public.social_accounts(client_id);
CREATE INDEX idx_posts_agency_id ON public.posts(agency_id);
CREATE INDEX idx_posts_client_id ON public.posts(client_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_scheduled_at ON public.posts(scheduled_at);
CREATE INDEX idx_content_calendar_date ON public.content_calendar(date);
CREATE INDEX idx_campaigns_client_id ON public.campaigns(client_id);
CREATE INDEX idx_media_library_agency_id ON public.media_library(agency_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_activity_log_agency_id ON public.activity_log(agency_id);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Templates globais de exemplo
INSERT INTO public.templates (name, description, category, content, is_global, platform, post_type) VALUES
('Lançamento de Produto', 'Template para anunciar novos produtos', 'produto', '🚀 NOVIDADE! {{produto_nome}} chegou!\n\n{{descricao}}\n\n✨ Benefícios:\n{{beneficios}}\n\n📦 Disponível agora!\n\n#lancamento #novidade #{{marca}}', true, 'instagram', 'carousel'),
('Depoimento de Cliente', 'Compartilhar feedback positivo', 'social_proof', '"{{depoimento}}"\n\n- {{cliente_nome}}\n\nObrigado pela confiança! 💜\n\n#depoimento #clientefeliz #{{marca}}', true, 'instagram', 'image'),
('Dica do Dia', 'Conteúdo educativo', 'educativo', '💡 DICA DO DIA\n\n{{dica_titulo}}\n\n{{dica_conteudo}}\n\nSalva esse post pra não esquecer! 📌\n\n#dica #conhecimento #{{nicho}}', true, 'instagram', 'carousel'),
('Bastidores', 'Mostrar behind the scenes', 'bastidores', '📸 BASTIDORES\n\n{{descricao}}\n\nVocês gostam de ver como funciona por aqui?\n\n#bastidores #behindthescenes #rotina', true, 'instagram', 'video'),
('Promoção', 'Anunciar ofertas e descontos', 'promocao', '🔥 PROMOÇÃO IMPERDÍVEL!\n\n{{produto}} com {{desconto}}% OFF!\n\nDe: R$ {{preco_original}}\nPor: R$ {{preco_promocional}}\n\n⏰ Só até {{data_fim}}!\n\n#promocao #oferta #desconto', true, 'instagram', 'image');
