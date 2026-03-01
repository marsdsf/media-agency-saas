import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateCsrfToken, getSupabaseAdmin } from '@/lib/auth';

// Callback do Instagram/Facebook OAuth
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state'); // CSRF token containing userId

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=${error}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=invalid_request`
    );
  }

  // Validate CSRF token
  const userId = validateCsrfToken(state);
  if (!userId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=invalid_state`
    );
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Get user's agency_id
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('agency_id')
      .eq('id', userId)
      .single();

    if (!profile?.agency_id) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=no_agency`
      );
    }

    const agencyId = profile.agency_id;

    // Trocar code por access_token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${process.env.META_APP_ID}` +
      `&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/social/instagram/callback` +
      `&client_secret=${process.env.META_APP_SECRET}` +
      `&code=${code}`
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    // Obter token de longa duração
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${process.env.META_APP_ID}` +
      `&client_secret=${process.env.META_APP_SECRET}` +
      `&fb_exchange_token=${tokenData.access_token}`
    );

    const longLivedData = await longLivedResponse.json();

    // Buscar páginas do Facebook conectadas
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedData.access_token}`
    );

    const pagesData = await pagesResponse.json();

    // Para cada página, buscar conta do Instagram conectada
    for (const page of pagesData.data || []) {
      // Buscar Instagram Business Account conectado à página
      const igResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?` +
        `fields=instagram_business_account{id,username,profile_picture_url,name}` +
        `&access_token=${page.access_token}`
      );

      const igData = await igResponse.json();

      if (igData.instagram_business_account) {
        const igAccount = igData.instagram_business_account;

        // Salvar conta do Instagram no banco (multi-tenant)
        await supabaseAdmin
          .from('social_accounts')
          .upsert({
            agency_id: agencyId,
            platform: 'instagram',
            platform_user_id: igAccount.id,
            username: igAccount.username,
            display_name: igAccount.name,
            avatar_url: igAccount.profile_picture_url,
            access_token: page.access_token,
            token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            is_active: true,
          }, {
            onConflict: 'agency_id,platform,platform_user_id'
          });
      }

      // Também salvar página do Facebook
      await supabaseAdmin
        .from('social_accounts')
        .upsert({
          agency_id: agencyId,
          platform: 'facebook',
          platform_user_id: page.id,
          username: page.name,
          display_name: page.name,
          access_token: page.access_token,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          is_active: true,
        }, {
          onConflict: 'agency_id,platform,platform_user_id'
        });
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=instagram_connected`
    );
  } catch (error) {
    console.error('Instagram OAuth error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=oauth_failed`
    );
  }
}
