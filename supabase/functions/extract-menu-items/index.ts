
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const vendorId = formData.get('vendor_id') as string;

    if (!file) {
      throw new Error('No file provided');
    }

    let base64Content: string;
    let mimeType: string;

    if (file.type === 'application/pdf') {
      // For PDFs, we'll use OCR functionality
      const arrayBuffer = await file.arrayBuffer();
      base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      mimeType = 'application/pdf';
    } else {
      // For images
      const arrayBuffer = await file.arrayBuffer();
      base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      mimeType = file.type;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that extracts menu items from restaurant menus. 
            Extract menu items and return them as a JSON array with the following structure:
            {
              "items": [
                {
                  "name": "Item Name",
                  "description": "Item description with ingredients/allergens",
                  "price": 12.50,
                  "category": "Category (e.g., Starters, Mains, Drinks, Desserts)",
                  "popular": false,
                  "prep_time": "15 min",
                  "available": true
                }
              ]
            }
            
            Guidelines:
            - Extract ALL menu items you can identify
            - Infer categories logically
            - Convert prices to euros (€) if in other currencies
            - Mark items as popular if they seem featured/highlighted
            - Estimate prep times based on dish complexity
            - Provide helpful descriptions including key ingredients
            - Set all items as available by default`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract all menu items from this menu:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Content}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      }),
    });

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No response from AI');
    }

    const content = data.choices[0].message.content;
    
    // Try to parse JSON from the response
    let extractedItems;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedItems = JSON.parse(jsonMatch[0]);
      } else {
        extractedItems = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Could not parse AI response as JSON');
    }

    console.log('Extracted items:', extractedItems);

    return new Response(JSON.stringify(extractedItems), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-menu-items function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      items: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
