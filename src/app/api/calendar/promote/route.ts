import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { moderateContent, validateForPlatform } from '@/lib/content-moderation';

/**
 * Content Calendar → Posts Bridge API
 * 
 * Promotes planned calendar entries into publishable posts.
 * Bridges the gap between content_calendar and posts tables.
 */

// GET: Fetch calendar entries ready for promotion
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ready';
    const limit = parseInt(searchParams.get('limit') || '30');

    const { data: entries, error } = await supabase
      .from('content_calendar')
      .select('*')
      .eq('agency_id', ctx.agencyId)
      .eq('status', status)
      .order('scheduled_date', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ entries: entries || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Promote calendar entries to publishable posts
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const supabase = await createClient();
    const { calendarEntryIds, socialAccountId, scheduleImmediate } = await request.json();

    if (!calendarEntryIds?.length) {
      return NextResponse.json({ error: 'IDs de entradas do calendário obrigatórios' }, { status: 400 });
    }

    // Fetch entries
    const { data: entries, error: fetchError } = await supabase
      .from('content_calendar')
      .select('*')
      .in('id', calendarEntryIds)
      .eq('agency_id', ctx.agencyId);

    if (fetchError) throw fetchError;
    if (!entries?.length) {
      return NextResponse.json({ error: 'Entradas não encontradas' }, { status: 404 });
    }

    // Fetch target account if provided
    let targetAccount: any = null;
    if (socialAccountId) {
      const { data: acc } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('id', socialAccountId)
        .eq('agency_id', ctx.agencyId)
        .single();
      targetAccount = acc;
    }

    const results: { calendarId: string; postId?: string; success: boolean; error?: string }[] = [];

    for (const entry of entries) {
      try {
        // Content moderation
        const moderation = moderateContent(entry.content || '');
        if (!moderation.approved) {
          results.push({
            calendarId: entry.id,
            success: false,
            error: `Conteúdo bloqueado: ${moderation.flags.map((f: any) => f.reason).join(', ')}`,
          });
          
          // Update calendar status
          await supabase.from('content_calendar')
            .update({ status: 'failed', metadata: { ...(entry.metadata || {}), moderation_flags: moderation.flags } })
            .eq('id', entry.id);
          continue;
        }

        // Determine platform from entry or account
        const platform = entry.platform || targetAccount?.platform || 'instagram';

        // Platform validation
        if (targetAccount) {
          const validation = validateForPlatform(entry.content || '', platform);
          if (!validation.valid) {
            results.push({
              calendarId: entry.id,
              success: false,
              error: `Validação: ${validation.errors.join(', ')}`,
            });
            continue;
          }
        }

        // Compute scheduled_at from entry's scheduled_date + scheduled_time
        let scheduledAt: string | null = null;
        if (entry.scheduled_date) {
          const time = entry.scheduled_time || '10:00';
          scheduledAt = `${entry.scheduled_date}T${time}:00.000Z`;
        }

        // Create post from calendar entry
        const { data: post, error: insertError } = await supabase
          .from('posts')
          .insert({
            agency_id: ctx.agencyId,
            created_by: ctx.userId,
            social_account_id: socialAccountId || null,
            content: entry.content,
            media_urls: entry.media_urls || [],
            hashtags: entry.hashtags || [],
            platform,
            scheduled_at: scheduleImmediate ? scheduledAt : null,
            status: scheduleImmediate && scheduledAt ? 'scheduled' : 'draft',
            ai_generated: entry.ai_generated || false,
            metadata: {
              from_calendar: true,
              calendar_entry_id: entry.id,
              content_type: entry.content_type,
              product_id: entry.product_id,
            },
          })
          .select('id')
          .single();

        if (insertError) throw insertError;

        // Update calendar entry status
        await supabase.from('content_calendar')
          .update({
            status: 'approved',
            metadata: { ...(entry.metadata || {}), promoted_to_post: post?.id, promoted_at: new Date().toISOString() },
          })
          .eq('id', entry.id);

        results.push({ calendarId: entry.id, postId: post?.id, success: true });
      } catch (err: any) {
        results.push({ calendarId: entry.id, success: false, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      promoted: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
