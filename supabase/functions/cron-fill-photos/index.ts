import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  try {
    // Verify this is a scheduled job request
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
      return new Response('Unauthorized', { status: 401 })
    }

    console.log('Starting photo fill CRON job...')

    // Get all bars without photos
    const { data: barsWithoutPhotos, error } = await supabase
      .from('bars')
      .select('id, name')
      .or('photos_fetched.is.null,photos_fetched.eq.false')
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch bars: ${error.message}`)
    }

    console.log(`Found ${barsWithoutPhotos?.length || 0} bars without photos`)

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0
    }

    // Process each bar
    for (const bar of barsWithoutPhotos || []) {
      try {
        console.log(`Processing bar: ${bar.name} (${bar.id})`)
        
        // Call the fetch-bar-photos function
        const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-bar-photos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ barId: bar.id })
        })

        const result = await response.json()
        results.processed++

        if (result.status === 'done') {
          results.successful++
          console.log(`✓ Uploaded ${result.uploaded} photos for ${bar.name}`)
        } else if (result.status === 'skipped') {
          results.skipped++
          console.log(`→ Skipped ${bar.name}: ${result.message}`)
        } else {
          results.failed++
          console.log(`✗ Failed for ${bar.name}: ${result.message}`)
        }

        // Rate limiting: wait 1 second between bars
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        results.failed++
        console.error(`Error processing bar ${bar.id}:`, error)
      }
    }

    // Log job completion
    await supabase
      .from('system_logs')
      .insert({
        component: 'cron-fill-photos',
        log_type: 'cron_job',
        message: `Photo fill job completed`,
        metadata: results,
        severity: 'info'
      })

    console.log('Photo fill CRON job completed:', results)

    return new Response(
      JSON.stringify({
        success: true,
        results
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('CRON job error:', error)
    
    // Log error
    await supabase
      .from('system_logs')
      .insert({
        component: 'cron-fill-photos',
        log_type: 'cron_job_error',
        message: error.message,
        severity: 'error'
      })

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}) 