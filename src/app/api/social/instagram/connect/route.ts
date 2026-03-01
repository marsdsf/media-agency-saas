import { NextRequest, NextResponse } from 'next/server';
import { getUserContext, generateCsrfToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Generate CSRF token with user context (prevents state injection)
  const state = generateCsrfToken(ctx.userId);

  // Construir URL de autorização do Instagram/Facebook
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_comments',
    'instagram_manage_insights',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'business_management',
  ].join(',');

  const authUrl = 
    `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${process.env.META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/social/instagram/callback`)}` +
    `&scope=${scopes}` +
    `&state=${state}` +
    `&response_type=code`;

  return NextResponse.json({ url: authUrl });
}
