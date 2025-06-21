
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthIssue {
  type: string;
  description: string;
  bar_id?: string;
  severity: 'low' | 'medium' | 'high';
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

    const issues: HealthIssue[] = [];
    let issuesFixed = 0;

    // Check 1: Find bars with missing essential data
    const { data: barsWithIssues } = await supabaseClient
      .from('bars')
      .select('*')
      .or('name.is.null,address.is.null,google_place_id.is.null');

    barsWithIssues?.forEach(bar => {
      if (!bar.name || bar.name.trim() === '') {
        issues.push({
          type: 'missing_name',
          description: `Bar ${bar.id} has missing or empty name`,
          bar_id: bar.id,
          severity: 'high'
        });
      }
      if (!bar.address) {
        issues.push({
          type: 'missing_address',
          description: `Bar ${bar.name || bar.id} has missing address`,
          bar_id: bar.id,
          severity: 'medium'
        });
      }
      if (!bar.google_place_id) {
        issues.push({
          type: 'missing_place_id',
          description: `Bar ${bar.name || bar.id} has missing Google Place ID`,
          bar_id: bar.id,
          severity: 'high'
        });
      }
    });

    // Check 2: Find potential duplicates by name similarity
    const { data: allBars } = await supabaseClient
      .from('bars')
      .select('id, name, address');

    const duplicates = new Map<string, string[]>();
    allBars?.forEach(bar => {
      const normalizedName = bar.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
      if (normalizedName.length > 3) {
        if (!duplicates.has(normalizedName)) {
          duplicates.set(normalizedName, []);
        }
        duplicates.get(normalizedName)?.push(bar.id);
      }
    });

    duplicates.forEach((ids, name) => {
      if (ids.length > 1) {
        issues.push({
          type: 'potential_duplicate',
          description: `Potential duplicates found for "${name}": ${ids.length} bars`,
          severity: 'medium'
        });
      }
    });

    // Check 3: Data quality scores
    const { data: lowQualityBars } = await supabaseClient
      .from('bars')
      .select('id, name, data_quality_score')
      .lt('data_quality_score', 50);

    lowQualityBars?.forEach(bar => {
      issues.push({
        type: 'low_quality_score',
        description: `Bar ${bar.name || bar.id} has low quality score: ${bar.data_quality_score}`,
        bar_id: bar.id,
        severity: 'low'
      });
    });

    // Check 4: Stale data (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: staleBars } = await supabaseClient
      .from('bars')
      .select('id, name, updated_at')
      .lt('updated_at', thirtyDaysAgo.toISOString());

    if (staleBars && staleBars.length > 0) {
      issues.push({
        type: 'stale_data',
        description: `${staleBars.length} bars have not been updated in over 30 days`,
        severity: 'medium'
      });
    }

    // Auto-fix: Recalculate data quality scores
    const { data: barsToUpdate } = await supabaseClient
      .from('bars')
      .select('*');

    for (const bar of barsToUpdate || []) {
      let qualityScore = 0;
      
      if (bar.name && bar.name.trim() !== '') qualityScore += 20;
      if (bar.address && bar.address.trim() !== '') qualityScore += 20;
      if (bar.contact_number && bar.contact_number.trim() !== '') qualityScore += 15;
      if (bar.rating !== null && bar.rating !== undefined) qualityScore += 15;
      if (bar.review_count && bar.review_count > 0) qualityScore += 15;
      if (bar.location_gps) qualityScore += 15;

      if (qualityScore !== bar.data_quality_score) {
        await supabaseClient
          .from('bars')
          .update({ data_quality_score: qualityScore })
          .eq('id', bar.id);
        issuesFixed++;
      }
    }

    // Log health check results
    await supabaseClient
      .from('bar_fetch_logs')
      .insert({
        operation_type: 'health_check',
        total_bars_processed: allBars?.length || 0,
        errors_count: issues.length,
        status: 'completed',
        error_details: { issues, issues_fixed: issuesFixed }
      });

    return new Response(
      JSON.stringify({
        success: true,
        issues_found: issues.length,
        issues_fixed: issuesFixed,
        issues: issues,
        summary: {
          high_severity: issues.filter(i => i.severity === 'high').length,
          medium_severity: issues.filter(i => i.severity === 'medium').length,
          low_severity: issues.filter(i => i.severity === 'low').length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in health-check-bars function:', error);
    
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
