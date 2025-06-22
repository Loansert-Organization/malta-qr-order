
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAIClient } from './openaiClient.ts';
import { DatabaseOperations } from './databaseOperations.ts';
import { ContextProcessor } from './contextProcessor.ts';
import { createSystemPrompts } from './systemPrompts.ts';
import { getFallbackMessages } from './fallbackMessages.ts';
import { MaltaAIWaiterRequest, AIWaiterResponse } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Initialize clients
const openaiClient = new OpenAIClient(openaiApiKey!);
const dbOps = new DatabaseOperations(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 Malta AI Waiter request received');
    
    const { 
      message, 
      vendorSlug, 
      guestSessionId, 
      language = 'en', 
      locationContext 
    }: MaltaAIWaiterRequest = await req.json();
    
    console.log('Request details:', { vendorSlug, guestSessionId, language, message: message.substring(0, 50) + '...' });
    
    // Get vendor and menu data
    const vendor = await dbOps.getVendorData(vendorSlug);
    if (!vendor) {
      throw new Error(`Vendor not found: ${vendorSlug}`);
    }

    console.log('✅ Vendor found:', vendor.name);
    const menuItems = vendor.menus[0]?.menu_items || [];
    console.log('📋 Menu items loaded:', menuItems.length);
    
    // Create Malta-specific system prompts
    const systemPrompts = createSystemPrompts(
      vendor.name,
      vendor.location || 'Malta',
      menuItems,
      locationContext
    );

    // Build contextual information with Malta context
    const contextualInfo = ContextProcessor.buildMaltaContextualInfo(
      message, 
      locationContext, 
      vendor.location
    );
    const timeContext = ContextProcessor.getTimeContext();

    console.log('🧠 Calling GPT-4o with Malta context...');
    
    // Prepare GPT messages with Malta-specific context
    const gptMessages = [
      {
        role: 'system',
        content: systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.en
      },
      { 
        role: 'user', 
        content: contextualInfo 
      }
    ];

    // Get AI response from GPT-4o
    const gptResponse = await openaiClient.callOpenAI(gptMessages, 'gpt-4o');
    console.log('🎯 GPT-4o response received');

    // Extract suggested items and generate Malta-themed layout
    const suggestedItems = ContextProcessor.extractSuggestedItems(gptResponse, menuItems);
    const layoutSuggestions = ContextProcessor.generateMaltaLayoutSuggestions(
      locationContext, 
      timeContext,
      vendor.location
    );

    console.log('💡 Suggestions generated:', suggestedItems.length, 'items');

    // Log interaction for analytics
    await dbOps.logInteraction(
      vendor.id,
      guestSessionId,
      'user',
      message,
      'malta-enhanced-gpt4o',
      {
        language,
        location_context: locationContext,
        time_context: timeContext,
        vendor_location: vendor.location,
        malta_features: true,
        nearby_venues: locationContext?.nearbyBars?.length || 0
      }
    );

    await dbOps.logInteraction(
      vendor.id,
      guestSessionId,
      'assistant',
      gptResponse,
      'malta-enhanced-gpt4o',
      {
        language,
        malta_features: layoutSuggestions,
        suggestions_count: suggestedItems.length
      },
      suggestedItems
    );

    console.log('📊 Interactions logged successfully');

    const response: AIWaiterResponse = {
      response: gptResponse,
      suggestions: suggestedItems,
      layoutHints: layoutSuggestions
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Error in malta-ai-waiter:', error);
    
    const fallbackMessages = getFallbackMessages();
    let language = 'en';
    
    try {
      const requestData = await req.json();
      language = requestData.language || 'en';
    } catch (parseError) {
      console.error('Could not parse request for fallback language');
    }
    
    const errorResponse: AIWaiterResponse = {
      response: fallbackMessages[language as keyof typeof fallbackMessages] || fallbackMessages.en,
      suggestions: [],
      layoutHints: {
        maltaTheme: true,
        cardStyle: 'vertical',
        highlight: 'popular'
      }
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
