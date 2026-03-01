-- =============================================
-- MIGRAÇÃO: TABELAS DE IA AVANÇADA
-- Execute este SQL no Supabase SQL Editor
-- Adiciona suporte ao ecossistema de IA automatizado
-- =============================================

-- 1. TABELA DE CONFIGURAÇÃO DO AUTOPILOT
CREATE TABLE IF NOT EXISTS public.ai_autopilot_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  platforms TEXT[] DEFAULT ARRAY['instagram'],
  frequency JSONB DEFAULT '{"instagram": 3}',
  content_pillars TEXT[] DEFAULT '{}',
  tone TEXT DEFAULT 'profissional',
  auto_approve BOOLEAN DEFAULT false,
  auto_post BOOLEAN DEFAULT false,
  preferred_times JSONB DEFAULT '{}',
  image_generation BOOLEAN DEFAULT true,
  provider TEXT DEFAULT 'auto',
  description TEXT DEFAULT '',
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agency_id, client_id)
);

-- 2. TABELA DE OPERAÇÕES DE VÍDEO (async)
CREATE TABLE IF NOT EXISTS public.ai_video_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  operation_id TEXT, -- Gemini operation ID
  prompt TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  video_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE FEEDBACK DE CONTEÚDO IA
CREATE TABLE IF NOT EXISTS public.ai_content_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  approved BOOLEAN,
  edited BOOLEAN DEFAULT false,
  edits JSONB DEFAULT '{}',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_autopilot_agency ON public.ai_autopilot_configs(agency_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_enabled ON public.ai_autopilot_configs(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_video_ops_agency ON public.ai_video_operations(agency_id);
CREATE INDEX IF NOT EXISTS idx_video_ops_status ON public.ai_video_operations(status) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_feedback_post ON public.ai_content_feedback(post_id);
CREATE INDEX IF NOT EXISTS idx_feedback_agency ON public.ai_content_feedback(agency_id);

-- 5. RLS POLICIES
ALTER TABLE public.ai_autopilot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_video_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_feedback ENABLE ROW LEVEL SECURITY;

-- Autopilot configs: agency members can manage
CREATE POLICY "autopilot_select" ON public.ai_autopilot_configs FOR SELECT
  USING (agency_id IN (
    SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid() AND active = true
  ));
CREATE POLICY "autopilot_insert" ON public.ai_autopilot_configs FOR INSERT
  WITH CHECK (agency_id IN (
    SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid() AND active = true AND role IN ('owner', 'admin', 'manager')
  ));
CREATE POLICY "autopilot_update" ON public.ai_autopilot_configs FOR UPDATE
  USING (agency_id IN (
    SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid() AND active = true AND role IN ('owner', 'admin', 'manager')
  ));
CREATE POLICY "autopilot_delete" ON public.ai_autopilot_configs FOR DELETE
  USING (agency_id IN (
    SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid() AND active = true AND role IN ('owner', 'admin')
  ));

-- Video operations: agency members can view, users can create their own
CREATE POLICY "video_ops_select" ON public.ai_video_operations FOR SELECT
  USING (agency_id IN (
    SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid() AND active = true
  ));
CREATE POLICY "video_ops_insert" ON public.ai_video_operations FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "video_ops_update" ON public.ai_video_operations FOR UPDATE
  USING (user_id = auth.uid() OR agency_id IN (
    SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid() AND active = true AND role IN ('owner', 'admin')
  ));

-- Content feedback: agency members
CREATE POLICY "feedback_select" ON public.ai_content_feedback FOR SELECT
  USING (agency_id IN (
    SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid() AND active = true
  ));
CREATE POLICY "feedback_insert" ON public.ai_content_feedback FOR INSERT
  WITH CHECK (agency_id IN (
    SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid() AND active = true
  ));

-- Service role bypass for cron jobs
CREATE POLICY "autopilot_service" ON public.ai_autopilot_configs FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "video_ops_service" ON public.ai_video_operations FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "feedback_service" ON public.ai_content_feedback FOR ALL
  USING (auth.role() = 'service_role');

-- 6. TRIGGER AUTO-UPDATE updated_at
CREATE OR REPLACE FUNCTION update_ai_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_autopilot_updated
  BEFORE UPDATE ON public.ai_autopilot_configs
  FOR EACH ROW EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER trigger_video_ops_updated
  BEFORE UPDATE ON public.ai_video_operations
  FOR EACH ROW EXECUTE FUNCTION update_ai_updated_at();

-- 7. ADD campaign_id TO POSTS (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'campaign_id'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;
    CREATE INDEX idx_posts_campaign ON public.posts(campaign_id);
  END IF;
END $$;

-- 8. ADD approved_by AND approved_at TO POSTS (if not exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN approved_by UUID REFERENCES auth.users(id);
    ALTER TABLE public.posts ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END $$;

-- 9. STORAGE BUCKET for AI generated content
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-generated', 'ai-generated', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "ai_storage_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ai-generated' AND auth.role() IN ('authenticated', 'service_role'));
CREATE POLICY "ai_storage_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'ai-generated');
CREATE POLICY "ai_storage_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'ai-generated' AND auth.role() = 'service_role');

-- Done!
-- Novas tabelas: ai_autopilot_configs, ai_video_operations, ai_content_feedback
-- Novas colunas em posts: campaign_id, approved_by, approved_at
-- Novo bucket de storage: ai-generated
