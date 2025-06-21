import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to calculate string similarity (Levenshtein distance)
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : (maxLen - matrix[len1][len2]) / maxLen;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all bars
    const { data: allBars, error } = await supabaseClient
      .from('bars')
      .select('*')
      .order('created_at', { ascending: true }); // Keep older entries

    if (error) {
      throw error;
    }

    const duplicatesFound: any[] = [];
    const barsToDelete: string[] = [];
    
    // Find duplicates using multiple criteria
    for (let i = 0; i < allBars.length; i++) {
      for (let j = i + 1; j < allBars.length; j++) {
        const bar1 = allBars[i];
        const bar2 = allBars[j];
        
        let isDuplicate = false;
        let reason = '';
        
        // Check for exact Google Place ID match
        if (bar1.google_place_id && bar2.google_place_id && 
            bar1.google_place_id === bar2.google_place_id) {
          isDuplicate = true;
          reason = 'Same Google Place ID';
        }
        
        // Check for high name similarity + same address
        else if (bar1.name && bar2.name && bar1.address && bar2.address) {
          const nameSimilarity = calculateSimilarity(
            bar1.name.toLowerCase().trim(),
            bar2.name.toLowerCase().trim()
          );
          const addressSimilarity = calculateSimilarity(
            bar1.address.toLowerCase().trim(),
            bar2.address.toLowerCase().trim()
          );
          
          if (nameSimilarity > 0.85 && addressSimilarity > 0.8) {
            isDuplicate = true;
            reason = `High similarity (name: ${Math.round(nameSimilarity * 100)}%, address: ${Math.round(addressSimilarity * 100)}%)`;
          }
        }
        
        if (isDuplicate) {
          // Keep the bar with higher data quality score, or the older one if scores are equal
          const keepBar = bar1.data_quality_score >= bar2.data_quality_score ? bar1 : bar2;
          const deleteBar = keepBar === bar1 ? bar2 : bar1;
          
          duplicatesFound.push({
            kept: {
              id: keepBar.id,
              name: keepBar.name,
              quality_score: keepBar.data_quality_score
            },
            deleted: {
              id: deleteBar.id,
              name: deleteBar.name,
              quality_score: deleteBar.data_quality_score
            },
            reason
          });
          
          if (!barsToDelete.includes(deleteBar.id)) {
            barsToDelete.push(deleteBar.id);
          }
        }
      }
    }

    // Delete duplicates
    let deletedCount = 0;
    if (barsToDelete.length > 0) {
      const { error: deleteError } = await supabaseClient
        .from('bars')
        .delete()
        .in('id', barsToDelete);

      if (deleteError) {
        throw deleteError;
      }
      deletedCount = barsToDelete.length;
    }

    // Log the cleanup operation
    await supabaseClient
      .from('bar_fetch_logs')
      .insert({
        operation_type: 'cleanup_duplicates',
        total_bars_processed: allBars.length,
        bars_updated: 0,
        new_bars_added: 0,
        errors_count: 0,
        status: 'completed',
        error_details: {
          duplicates_found: duplicatesFound,
          duplicates_removed: deletedCount
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        duplicates_removed: deletedCount,
        duplicates_found: duplicatesFound.length,
        details: duplicatesFound,
        remaining_bars: allBars.length - deletedCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in cleanup-duplicate-bars function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
