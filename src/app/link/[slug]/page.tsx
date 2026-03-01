import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import LinkPageClient from './client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { data: page } = await supabase
    .from('link_pages')
    .select('title, bio')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!page) return { title: 'Página não encontrada' };

  return {
    title: page.title,
    description: page.bio || `Links de ${page.title}`,
  };
}

export default async function LinkBioPage({ params }: Props) {
  const { slug } = await params;

  const { data: page, error } = await supabase
    .from('link_pages')
    .select('title, slug, bio, avatar_url, theme, links, social_links')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !page) {
    notFound();
  }

  return <LinkPageClient page={page} />;
}
