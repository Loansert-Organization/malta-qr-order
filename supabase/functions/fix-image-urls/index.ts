import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('🔧 FIXING BROKEN IMAGE URLS')
    console.log('===========================')

    // 1. Get all bars with website_url
    console.log('1. 📋 FETCHING BARS WITH URLS...')
    const { data: barsData, error } = await supabaseClient
      .from('bars')
      .select('id, name, website_url')
      .not('website_url', 'is', null)

    if (error) {
      console.error('❌ Error fetching bars:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`📊 Found ${barsData.length} bars with website_urls`)

    // 2. Fix malformed URLs
    console.log('2. 🔧 FIXING MALFORMED URLS...')
    
    let fixedCount = 0
    let skippedCount = 0
    const results = []
    
    for (const bar of barsData) {
      if (!bar.website_url) continue
      
      // Clean the URL by removing line breaks and extra spaces
      const originalUrl = bar.website_url
      const cleanedUrl = originalUrl
        .replace(/\s+/g, '') // Remove all whitespace including line breaks
        .replace(/\n/g, '')  // Remove newlines specifically
        .replace(/\r/g, '')  // Remove carriage returns
        .trim()

      // Check if URL was malformed
      if (originalUrl !== cleanedUrl) {
        console.log(`🔧 Fixing: ${bar.name}`)
        console.log(`   Original length: ${originalUrl.length}`)
        console.log(`   Cleaned length: ${cleanedUrl.length}`)
        
        // Update the bar with cleaned URL
        const { error: updateError } = await supabaseClient
          .from('bars')
          .update({ website_url: cleanedUrl })
          .eq('id', bar.id)

        if (updateError) {
          console.log(`   ❌ Update failed: ${updateError.message}`)
          results.push({
            bar: bar.name,
            status: 'failed',
            error: updateError.message
          })
        } else {
          console.log(`   ✅ Fixed successfully`)
          fixedCount++
          results.push({
            bar: bar.name,
            status: 'fixed',
            originalLength: originalUrl.length,
            cleanedLength: cleanedUrl.length
          })
        }
      } else {
        skippedCount++
      }
    }

    console.log(`📈 RESULTS:`)
    console.log(`✅ Fixed URLs: ${fixedCount}`)
    console.log(`⏭️ Already clean: ${skippedCount}`)

    // 3. Test sample URLs
    console.log('3. 🧪 TESTING SAMPLE FIXED URLS...')
    
    const { data: testBars, error: testError } = await supabaseClient
      .from('bars')
      .select('id, name, website_url')
      .not('website_url', 'is', null)
      .limit(5)

    const testResults = []
    if (!testError && testBars) {
      for (const bar of testBars) {
        console.log(`🔗 Testing: ${bar.name}`)
        
        try {
          const response = await fetch(bar.website_url, { 
            method: 'HEAD',
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; ICUPA/1.0)'
            }
          })
          
          const result = {
            bar: bar.name,
            url: bar.website_url,
            status: response.status,
            accessible: response.status === 200
          }
          
          testResults.push(result)
          console.log(`   ✅ Status: ${response.status} ${response.statusText}`)
          
          if (response.status === 200) {
            console.log(`   🎉 IMAGE ACCESSIBLE!`)
          }
        } catch (error) {
          console.log(`   ❌ Fetch Error: ${error.message}`)
          testResults.push({
            bar: bar.name,
            url: bar.website_url,
            error: error.message,
            accessible: false
          })
        }
      }
    }

    // 4. Final statistics
    console.log('4. 📊 GENERATING FINAL STATISTICS...')
    const { data: finalStats, error: statsError } = await supabaseClient
      .from('bars')
      .select('website_url, address')

    let statistics = {}
    if (!statsError && finalStats) {
      const totalBars = finalStats.length
      const withUrls = finalStats.filter(bar => bar.website_url).length
      const googleUrls = finalStats.filter(bar => 
        bar.website_url && bar.website_url.includes('googleusercontent.com')
      ).length
      
      statistics = {
        totalBars,
        withUrls,
        googleUrls,
        percentageWithUrls: ((withUrls/totalBars)*100).toFixed(1),
        percentageGoogleUrls: ((googleUrls/totalBars)*100).toFixed(1)
      }
      
      console.log(`📊 Total bars: ${totalBars}`)
      console.log(`🌐 With image URLs: ${withUrls} (${statistics.percentageWithUrls}%)`)
      console.log(`🗺️ Google Maps photos: ${googleUrls} (${statistics.percentageGoogleUrls}%)`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Image URLs fixed successfully',
        summary: {
          fixedCount,
          skippedCount,
          totalProcessed: barsData.length
        },
        results,
        testResults,
        statistics
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('❌ Critical error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}) 