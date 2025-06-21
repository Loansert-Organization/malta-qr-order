
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

const openaiClient = new OpenAIClient(openaiApiKey!);
const dbOps = new DatabaseOperations(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      vendorSlug, 
      guestSessionId, 
      language = 'en', 
      locationContext 
    }: MaltaAIWaiterRequest = await req.json();
    
    // Get vendor and menu data
    const vendor = await dbOps.getVendorData(vendorSlug);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const menuItems = vendor.menus[0]?.menu_items || [];
    
    // Create system prompts
    const systemPrompts = createSystemPrompts(
      vendor.name,
      vendor.location || 'Malta',
      menuItems,
      locationContext
    );

    // Build contextual information
    const contextualInfo = ContextProcessor.buildContextualInfo(message, locationContext);
    const timeContext = ContextProcessor.getTimeContext();

    // Prepare GPT messages
    const gptMessages = [
      {
        role: 'system',
        content: systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.en
      },
      { role: 'user', content: contextualInfo }
    ];

    // Get AI response
    const gptResponse = await openaiClient.callOpenAI(gptMessages, 'gpt-4o');

    // Extract suggested items and generate layout
    const suggestedItems = ContextProcessor.extractSuggestedItems(gptResponse, menuItems);
    const layoutSuggestions = ContextProcessor.generateLayoutSuggestions(locationContext);

    // Log interactions
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
        malta_features: layoutSuggestions
      },
      suggestedItems
    );

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
    console.error('Error in malta-ai-waiter:', error);
    
    const fallbackMessages = getFallbackMessages();
    const { language = 'en' } = await req.json().catch(() => ({}));
    
    const errorResponse: AIWaiterResponse = {
      response: fallbackMessages[language as keyof typeof fallbackMessages] || fallbackMessages.en,
      suggestions: [],
      layoutHints: {}
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
