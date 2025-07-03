import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateFoodImagePrompt } from '../_shared/imagePrompter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MenuItem {
  name: string;
  description?: string;
  price?: number;
  category: string;
  image_url?: string;
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

    const { website_url, bar_id } = await req.json()

    // Create automation job
    const { data: job } = await supabaseClient
      .from('automation_jobs')
      .insert({
        job_type: 'menu_scrape',
        status: 'running',
        target_url: website_url,
        bar_id: bar_id,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    console.log('🚀 Starting menu extraction for:', website_url)

    // Step 1: Scrape website for menu links
    const menuLinks = await scrapeMenuLinks(website_url)
    console.log('🔍 Found menu links:', menuLinks.length)

    let totalItems = 0;
    const aiModelsUsed = [];
    const startTime = Date.now();

    // Step 2: Process each menu link
    for (const menuLink of menuLinks) {
      try {
        console.log('📄 Processing menu:', menuLink)
        
        // Download menu content
        const menuContent = await downloadMenuContent(menuLink)
        
        // Step 3: Extract with GPT-4o
        const rawItems = await extractMenuWithGPT4o(menuContent, menuLink)
        aiModelsUsed.push('gpt-4o')
        
        // Step 4: Clean with Claude-4
        const cleanedItems = await cleanMenuWithClaude(rawItems)
        aiModelsUsed.push('claude-4')
        
        // Step 5: Enhance layout with Gemini
        const finalItems = await enhanceMenuWithGemini(cleanedItems)
        aiModelsUsed.push('gemini-2.5-pro')
        
        // Step 6: Save to database
        for (const item of finalItems) {
          await supabaseClient
            .from('menu_items')
            .insert({
              bar_id: bar_id,
              name: item.name,
              description: item.description,
              price: item.price,
              category: item.category,
              source_url: menuLink,
              image_url: item.image_url
            })
          totalItems++;
        }

        // Step 7: Generate missing images
        await generateMissingImages(finalItems, bar_id, supabaseClient)
        
      } catch (error) {
        console.error('❌ Error processing menu link:', menuLink, error)
      }
    }

    const processingTime = Date.now() - startTime;

    // Log the scraping operation
    await supabaseClient
      .from('menu_scraping_logs')
      .insert({
        automation_job_id: job.id,
        bar_id: bar_id,
        website_url: website_url,
        menu_links_found: menuLinks,
        ai_models_used: [...new Set(aiModelsUsed)],
        items_extracted: totalItems,
        success_rate: totalItems > 0 ? 100 : 0,
        processing_time_ms: processingTime
      })

    // Update job status
    await supabaseClient
      .from('automation_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress_data: { items_extracted: totalItems }
      })
      .eq('id', job.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        items_extracted: totalItems,
        processing_time_ms: processingTime,
        job_id: job.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Menu extraction failed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function scrapeMenuLinks(websiteUrl: string): Promise<string[]> {
  try {
    const response = await fetch(websiteUrl)
    const html = await response.text()
    
    // Look for menu-related links
    const menuLinks: string[] = []
    const linkRegex = /<a[^>]*href=["']([^"']*(?:menu|carte|food|drink)[^"']*)["'][^>]*>/gi
    let match
    
    while ((match = linkRegex.exec(html)) !== null) {
      let link = match[1]
      if (link.startsWith('/')) {
        link = new URL(link, websiteUrl).href
      }
      if (link.startsWith('http')) {
        menuLinks.push(link)
      }
    }
    
    // If no menu links found, try the main page
    if (menuLinks.length === 0) {
      menuLinks.push(websiteUrl)
    }
    
    return [...new Set(menuLinks)] // Remove duplicates
  } catch (error) {
    console.error('❌ Error scraping menu links:', error)
    return [websiteUrl] // Fallback to main URL
  }
}

async function downloadMenuContent(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const contentType = response.headers.get('content-type') || ''
    
    if (contentType.includes('application/pdf')) {
      // For PDF files, we'll need to convert to text
      // This is a simplified approach - in production, use a PDF parser
      return `PDF content from ${url} - requires PDF parsing`
    } else {
      // HTML content
      return await response.text()
    }
  } catch (error) {
    console.error('❌ Error downloading menu content:', error)
    return ''
  }
}

async function extractMenuWithGPT4o(content: string, sourceUrl: string): Promise<MenuItem[]> {
  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert menu extraction agent. Parse restaurant menus and extract items with structured data.`
          },
          {
            role: 'user',
            content: `Extract menu items from this content: ${content.substring(0, 4000)}
            
            Return a JSON array of items with this structure:
            {
              "name": "Item name",
              "description": "Brief description",
              "price": 12.50,
              "category": "starter|main|drink|dessert|other"
            }
            
            Only return valid JSON array, no other text.`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    })

    const result = await openaiResponse.json()
    const menuText = result.choices[0]?.message?.content || '[]'
    
    try {
      return JSON.parse(menuText)
    } catch {
      console.warn('⚠️ GPT-4o returned invalid JSON, using fallback')
      return []
    }
  } catch (error) {
    console.error('❌ GPT-4o extraction failed:', error)
    return []
  }
}

async function cleanMenuWithClaude(items: MenuItem[]): Promise<MenuItem[]> {
  try {
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('CLAUDE_API_KEY') || '',
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Clean and organize this menu data. Remove duplicates, fix categories, and ensure consistent formatting:
            
            ${JSON.stringify(items)}
            
            Return only the cleaned JSON array, no other text.`
          }
        ]
      })
    })

    const result = await claudeResponse.json()
    const cleanedText = result.content[0]?.text || '[]'
    
    try {
      return JSON.parse(cleanedText)
    } catch {
      console.warn('⚠️ Claude returned invalid JSON, using original')
      return items
    }
  } catch (error) {
    console.error('❌ Claude cleaning failed:', error)
    return items // Return original if cleaning fails
  }
}

async function enhanceMenuWithGemini(items: MenuItem[]): Promise<MenuItem[]> {
  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Enhance this menu data with better categorization and descriptions:
            
            ${JSON.stringify(items)}
            
            Improve categories and descriptions while keeping the same structure. Return only JSON array.`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000
        }
      })
    })

    const result = await geminiResponse.json()
    const enhancedText = result.candidates[0]?.content?.parts[0]?.text || '[]'
    
    try {
      return JSON.parse(enhancedText)
    } catch {
      console.warn('⚠️ Gemini returned invalid JSON, using original')
      return items
    }
  } catch (error) {
    console.error('❌ Gemini enhancement failed:', error)
    return items
  }
}

async function generateMissingImages(items: MenuItem[], barId: string, supabaseClient: any) {
  for (const item of items) {
    if (!item.image_url) {
      try {
        // Generate image with DALL-E
        const prompt = await generateFoodImagePrompt(Deno.env.get('OPENAI_API_KEY') ?? '', item.name, item.description)

        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt,
            size: '1024x1024',
            quality: 'hd',
            style: 'vivid',
            n: 1
          })
        })

        const imageResult = await imageResponse.json()
        const imageUrl = imageResult.data[0]?.url

        if (imageUrl) {
          // Update the menu item with the generated image
          await supabaseClient
            .from('menu_items')
            .update({ image_url: imageUrl })
            .eq('bar_id', barId)
            .eq('name', item.name)
        }
      } catch (error) {
        console.error('❌ Image generation failed for:', item.name, error)
      }
    }
  }
}
