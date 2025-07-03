import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

console.log(`🚀 Function "recheck-menu-presence" up and running!`);

// This function runs on a schedule to ensure the 'has_menu' flag on the 'bars' table is accurate.
// It iterates through all bars, checks if menu items exist for each, and corrects the flag if necessary.
// To schedule this function to run daily, use the following Supabase CLI command:
// supabase functions deploy recheck-menu-presence --schedule "0 0 * * *"

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
);

serve(async (_req) => {
  try {
    console.log('Cron job "recheck-menu-presence" started.');
    // 1. Get all bars with their ID and current 'has_menu' status.
    const { data: bars, error: barsError } = await supabaseAdmin
      .from('bars')
      .select('id, has_menu');

    if (barsError) {
      console.error('Error fetching bars:', barsError.message);
      throw barsError;
    }

    let updates = 0;
    console.log(`Found ${bars.length} bars to check.`);

    for (const bar of bars) {
      // 2. For each bar, count its menu items.
      const { count, error: countError } = await supabaseAdmin
        .from('menu_items')
        .select('id', { count: 'exact', head: true })
        .eq('bar_id', bar.id);

      if (countError) {
        console.error(`Error counting menu items for bar ${bar.id}:`, countError.message);
        continue; // Skip to the next bar on error
      }

      const hasMenuItems = (count ?? 0) > 0;

      // 3. If the stored 'has_menu' flag is incorrect, update it.
      if (bar.has_menu !== hasMenuItems) {
        const { error: updateError } = await supabaseAdmin
          .from('bars')
          .update({ has_menu: hasMenuItems })
          .eq('id', bar.id);
        
        if (updateError) {
          console.error(`Error updating bar ${bar.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated bar ${bar.id}: has_menu set to ${hasMenuItems}`);
          updates++;
        }
      }
    }

    const summary = `Recheck complete. ${updates} bars updated.`;
    console.log(summary);
    
    return new Response(JSON.stringify({ message: summary }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Fatal error in cron job:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 