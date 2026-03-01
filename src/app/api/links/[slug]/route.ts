import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Public route - no auth required
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { data: page, error } = await supabase
      .from('link_pages')
      .select('title, slug, bio, avatar_url, theme, links, social_links, is_active')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !page) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }

    // Track page view (fire and forget)
    supabase
      .from('link_page_views')
      .insert({ slug, viewed_at: new Date().toISOString() })
      .then(() => {});

    return NextResponse.json({ page });
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
