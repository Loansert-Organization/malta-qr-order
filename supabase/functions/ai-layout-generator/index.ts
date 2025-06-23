
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { openai } from '../_shared/openai.ts';
import { gemini } from '../_shared/gemini.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LayoutRequest {
  vendorId: string;
  contextData: {
    timeOfDay: string;
    dayOfWeek: string;
    weather?: string;
    location?: string;
    userPreferences?: any;
    menuItems?: any[];
  };
  layoutType: 'hero' | 'menu' | 'promo' | 'full';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎨 AI Layout Generator request received');
    
    const { vendorId, contextData, layoutType }: LayoutRequest = await req.json();
    
    console.log(`Generating ${layoutType} layout for vendor:`, vendorId);
    console.log('Context:', contextData);
    
    // Create Malta-specific layout prompt
    const layoutPrompt = createMaltaLayoutPrompt(contextData, layoutType);
    
    // Use GPT-4o for initial layout structure
    const gptResponse = await openai.chat([
      {
        role: 'system',
        content: `You are an expert UI/UX designer specializing in Malta hospitality layouts. 
        Generate dynamic, contextual layouts that enhance user experience for bars and restaurants.
        Always respond with valid JSON structure only.`
      },
      {
        role: 'user',
        content: layoutPrompt
      }
    ], { model: 'gpt-4o', temperature: 0.3 });
    
    let baseLayout;
    try {
      baseLayout = JSON.parse(gptResponse.text());
    } catch (parseError) {
      console.error('Failed to parse GPT response as JSON');
      baseLayout = createFallbackLayout(layoutType);
    }
    
    // Use Gemini for visual enhancements
    const visualPrompt = `Enhance this UI layout with Malta-themed visual elements:
    Layout: ${JSON.stringify(baseLayout)}
    Context: ${JSON.stringify(contextData)}
    
    Add appropriate colors, animations, and visual styling. Return JSON only.`;
    
    const geminiResponse = await gemini.chat([
      {
        role: 'user',
        parts: [{ text: visualPrompt }]
      }
    ]);
    
    let enhancedLayout;
    try {
      enhancedLayout = JSON.parse(geminiResponse.text());
    } catch (parseError) {
      console.error('Failed to parse Gemini response, using base layout');
      enhancedLayout = baseLayout;
    }
    
    // Final layout optimization
    const finalLayout = optimizeLayoutForMalta(enhancedLayout, contextData);
    
    console.log('✅ Layout generated successfully');
    
    return new Response(
      JSON.stringify({
        success: true,
        layout: finalLayout,
        metadata: {
          generated_by: ['gpt-4o', 'gemini-2.5-pro'],
          context_used: contextData,
          layout_type: layoutType,
          timestamp: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Error in ai-layout-generator:', error);
    
    // Return fallback layout
    const fallbackLayout = createFallbackLayout('full');
    
    return new Response(
      JSON.stringify({
        success: false,
        layout: fallbackLayout,
        error: error.message,
        fallback: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

function createMaltaLayoutPrompt(contextData: any, layoutType: string): string {
  const { timeOfDay, dayOfWeek, weather, location } = contextData;
  
  return `Generate a ${layoutType} layout for a Malta hospitality app with these requirements:

CONTEXT:
- Time: ${timeOfDay}
- Day: ${dayOfWeek}
- Weather: ${weather || 'sunny'}
- Location: ${location || 'Malta'}

LAYOUT REQUIREMENTS:
- Must be responsive and mobile-first
- Include Malta cultural elements (colors: blue, white, gold)
- Optimize for ${timeOfDay} usage patterns
- Consider local preferences and habits

${layoutType === 'hero' ? `
HERO SECTION:
- Dynamic banner based on time/weather
- Call-to-action appropriate for ${timeOfDay}
- Featured items relevant to current context
` : ''}

${layoutType === 'menu' ? `
MENU LAYOUT:
- Categories organized by popularity for ${dayOfWeek}
- Visual emphasis on items popular during ${timeOfDay}
- Easy navigation and filtering
` : ''}

${layoutType === 'promo' ? `
PROMOTIONAL LAYOUT:
- Time-sensitive offers
- Malta-specific promotions
- Visual hierarchy for urgency
` : ''}

Return ONLY valid JSON with this structure:
{
  "sections": [...],
  "styling": {...},
  "interactions": [...],
  "animations": [...]
}`;
}

function createFallbackLayout(layoutType: string) {
  return {
    sections: [
      {
        type: 'hero',
        title: 'Welcome to ICUPA Malta',
        subtitle: 'Your Digital Hospitality Experience',
        background: 'linear-gradient(135deg, #0066cc, #003d7a)'
      },
      {
        type: 'menu',
        title: 'Popular Items',
        layout: 'grid',
        columns: 2
      },
      {
        type: 'cta',
        text: 'Start Ordering',
        style: 'primary'
      }
    ],
    styling: {
      primaryColor: '#0066cc',
      secondaryColor: '#ffffff',
      accentColor: '#ffd700'
    },
    interactions: [
      'tap',
      'swipe',
      'voice'
    ],
    animations: [
      'fadeIn',
      'slideUp'
    ]
  };
}

function optimizeLayoutForMalta(layout: any, contextData: any): any {
  // Add Malta-specific optimizations
  if (contextData.timeOfDay === 'evening') {
    layout.styling = {
      ...layout.styling,
      theme: 'dark',
      primaryColor: '#1a365d',
      accentColor: '#ffd700'
    };
  }
  
  if (contextData.weather === 'sunny') {
    layout.suggestions = [
      'Cold Drinks Section',
      'Outdoor Seating Available',
      'Fresh Salads & Light Meals'
    ];
  }
  
  // Add Malta language support
  layout.localization = {
    maltese_available: true,
    italian_support: true,
    english_default: true
  };
  
  return layout;
}
