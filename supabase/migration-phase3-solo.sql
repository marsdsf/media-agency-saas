-- =============================================
-- MIGRAÇÃO FASE 3 — Modo Solo / Usuário Comum
-- Suporte a usuários individuais (não-agências)
-- Execute APÓS migration-phase2.sql
-- =============================================

-- =============================================
-- Adicionar campo account_type nas agências
-- 'agency' = agência tradicional
-- 'solo' = usuário individual / empreendedor
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'agencies' AND column_name = 'account_type'
  ) THEN
    ALTER TABLE public.agencies ADD COLUMN account_type TEXT DEFAULT 'agency' CHECK (account_type IN ('agency', 'solo'));
  END IF;
END $$;

-- =============================================
-- TABELA: business_profiles (Perfil do negócio do usuário solo)
-- =============================================
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Business Info
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN (
    'ecommerce', 'restaurante', 'salao_beleza', 'academia', 'clinica', 
    'loja_roupa', 'pet_shop', 'imobiliaria', 'consultoria', 'freelancer',
    'artesanato', 'educacao', 'tecnologia', 'saude', 'alimentacao',
    'moda', 'fitness', 'beleza', 'servicos', 'varejo', 'outro'
  )),
  business_description TEXT,
  
  -- Target Audience
  target_audience TEXT, -- "Mulheres 25-40, classe B, interessadas em moda"
  audience_age_range TEXT, -- "25-40"
  audience_gender TEXT CHECK (audience_gender IN ('all', 'male', 'female', 'other')),
  audience_location TEXT, -- "São Paulo, SP"
  audience_interests TEXT[], -- ["moda", "beleza", "lifestyle"]
  
  -- Brand Identity
  brand_voice TEXT CHECK (brand_voice IN (
    'profissional', 'casual', 'divertido', 'inspirador', 
    'educativo', 'luxuoso', 'jovem', 'tecnico', 'amigavel'
  )),
  brand_colors TEXT[], -- ["#FF5733", "#333333"]
  logo_url TEXT,
  
  -- Social Media Preferences
  preferred_platforms TEXT[] DEFAULT '{"instagram"}',
  posting_frequency TEXT DEFAULT 'daily' CHECK (posting_frequency IN ('daily', '3x_week', '5x_week', 'twice_daily', 'weekly')),
  preferred_post_times TEXT[] DEFAULT '{"09:00", "18:00"}', -- horários preferidos
  
  -- Content Strategy (AI-generated)
  content_pillars JSONB DEFAULT '[]', -- [{name, description, percentage}]
  content_style TEXT, -- "minimalista", "colorido", "clean"
  hashtag_groups JSONB DEFAULT '[]',
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_business_profiles_agency ON public.business_profiles(agency_id);

-- =============================================
-- TABELA: products (Catálogo de produtos)
-- =============================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  
  -- Media
  images TEXT[] DEFAULT '{}', -- URLs das imagens
  primary_image TEXT, -- imagem principal
  
  -- Product details
  features TEXT[], -- ["100% algodão", "Feito à mão"]
  tags TEXT[] DEFAULT '{}',
  
  -- AI metadata
  ai_description TEXT, -- descrição gerada por IA
  ai_hashtags TEXT[], -- hashtags sugeridas pela IA
  ai_captions JSONB DEFAULT '[]', -- legendas pré-geradas
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Posting stats
  posts_generated INTEGER DEFAULT 0,
  last_posted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_agency ON public.products(agency_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_active ON public.products(is_active);

-- =============================================
-- TABELA: content_calendar (Calendário gerado por IA)
-- =============================================
CREATE TABLE IF NOT EXISTS public.content_calendar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  
  -- Content info
  title TEXT NOT NULL,
  content TEXT, -- legenda gerada
  content_type TEXT DEFAULT 'post' CHECK (content_type IN ('post', 'story', 'reel', 'carousel', 'video')),
  
  -- Associations
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  content_pillar TEXT,
  
  -- Media
  media_urls TEXT[] DEFAULT '{}',
  media_prompt TEXT, -- prompt para gerar imagem via IA
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time TIME DEFAULT '09:00',
  platform TEXT NOT NULL DEFAULT 'instagram',
  
  -- Status
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'generating', 'ready', 'approved', 'published', 'failed', 'skipped')),
  
  -- AI metadata
  ai_generated BOOLEAN DEFAULT true,
  ai_model TEXT,
  ai_prompt TEXT,
  hashtags TEXT[] DEFAULT '{}',
  
  -- Engagement prediction
  predicted_engagement DECIMAL(5, 2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_calendar_agency ON public.content_calendar(agency_id);
CREATE INDEX idx_content_calendar_date ON public.content_calendar(scheduled_date);
CREATE INDEX idx_content_calendar_status ON public.content_calendar(status);

-- =============================================
-- TABELA: autopilot_settings (Configurações do piloto automático)
-- =============================================
CREATE TABLE IF NOT EXISTS public.autopilot_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  is_enabled BOOLEAN DEFAULT false,
  
  -- Posting rules
  posts_per_day INTEGER DEFAULT 1,
  post_times TEXT[] DEFAULT '{"09:00", "18:00"}',
  platforms TEXT[] DEFAULT '{"instagram"}',
  
  -- Content rules
  auto_hashtags BOOLEAN DEFAULT true,
  auto_caption BOOLEAN DEFAULT true,
  include_products BOOLEAN DEFAULT true,
  include_tips BOOLEAN DEFAULT true,
  include_promotions BOOLEAN DEFAULT true,
  
  -- Approval
  require_approval BOOLEAN DEFAULT true,
  auto_approve_after_hours INTEGER, -- auto-aprovar após N horas sem resposta
  
  -- Schedule
  active_days TEXT[] DEFAULT '{"mon", "tue", "wed", "thu", "fri"}', -- dias ativos
  pause_until TIMESTAMPTZ,
  
  -- Content mix (percentages)
  content_mix JSONB DEFAULT '{"product": 40, "tips": 25, "engagement": 20, "promotional": 15}',
  
  -- AI settings
  creativity_level DECIMAL(3, 2) DEFAULT 0.7, -- 0 = conservador, 1 = criativo
  use_trends BOOLEAN DEFAULT true,
  
  last_generated_at TIMESTAMPTZ,
  next_generation_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: generated_content_history (Histórico de conteúdo gerado)
-- =============================================
CREATE TABLE IF NOT EXISTS public.generated_content_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  
  content_type TEXT NOT NULL, -- 'post', 'caption', 'hashtags', 'calendar', 'image_prompt'
  input_data JSONB DEFAULT '{}', -- dados de entrada (prompt, product_id, etc)
  output_data JSONB DEFAULT '{}', -- resultado gerado
  
  model_used TEXT,
  tokens_used INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  
  rating INTEGER, -- 1-5 user rating
  was_used BOOLEAN DEFAULT false, -- se o conteúdo foi efetivamente usado
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_generated_history_agency ON public.generated_content_history(agency_id);
CREATE INDEX idx_generated_history_type ON public.generated_content_history(content_type);

-- =============================================
-- RLS Policies
-- =============================================
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopilot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content_history ENABLE ROW LEVEL SECURITY;

-- Business Profiles
CREATE POLICY "business_profiles_agency_access" ON public.business_profiles
  FOR ALL USING (
    agency_id IN (SELECT agency_id FROM public.profiles WHERE id = auth.uid())
  );

-- Products
CREATE POLICY "products_agency_access" ON public.products
  FOR ALL USING (
    agency_id IN (SELECT agency_id FROM public.profiles WHERE id = auth.uid())
  );

-- Content Calendar
CREATE POLICY "content_calendar_agency_access" ON public.content_calendar
  FOR ALL USING (
    agency_id IN (SELECT agency_id FROM public.profiles WHERE id = auth.uid())
  );

-- Autopilot Settings
CREATE POLICY "autopilot_settings_agency_access" ON public.autopilot_settings
  FOR ALL USING (
    agency_id IN (SELECT agency_id FROM public.profiles WHERE id = auth.uid())
  );

-- Generated Content History
CREATE POLICY "generated_history_agency_access" ON public.generated_content_history
  FOR ALL USING (
    agency_id IN (SELECT agency_id FROM public.profiles WHERE id = auth.uid())
  );
