
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AIRequest {
  model: 'gpt-4o' | 'claude-4' | 'gemini-2.5-pro';
  task: 'layout_generation' | 'content_refinement' | 'visual_design' | 'menu_recommendation' | 'contextual_analysis';
  context: {
    vendor_id: string;
    session_id?: string;
    time_context?: string;
    location?: string;
    weather?: string;
    user_preferences?: any;
    menu_items?: any[];
    interaction_history?: any[];
  };
  prompt: string;
  config?: {
    temperature?: number;
    max_tokens?: number;
    fallback_model?: string;
    real_time?: boolean;
  };
}

interface AIResponse {
  model_used: string;
  content: string;
  task: string;
  processing_metadata: {
    tokens_used: number;
    model_version: string;
    timestamp: string;
    context_quality_score?: number;
    suggestions_count?: number;
  };
  layout_suggestions?: any;
  content_variations?: string[];
  confidence_score?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const aiRequest: AIRequest = await req.json();
    console.log('AI Router processing request:', { task: aiRequest.task, model: aiRequest.model, vendor_id: aiRequest.context.vendor_id });

    // Enhanced context analysis before processing
    const enrichedContext = await enrichContextualData(aiRequest.context);
    aiRequest.context = { ...aiRequest.context, ...enrichedContext };

    // Log the request for analytics and learning
    await logAIRequest(aiRequest);

    let response: AIResponse;
    
    // Model routing with intelligent fallbacks
    switch (aiRequest.model) {
      case 'gpt-4o':
        response = await processWithGPT4o(aiRequest);
        break;
      case 'claude-4':
      case 'gemini-2.5-pro':
        // Enhanced fallback with logging
        console.log(`${aiRequest.model} not yet configured, using GPT-4o with specialized prompting`);
        response = await processWithGPT4o({
          ...aiRequest,
          prompt: adaptPromptForModel(aiRequest.prompt, aiRequest.model, aiRequest.task)
        });
        response.model_used = `${aiRequest.model}-fallback-gpt4o`;
        break;
      default:
        throw new Error(`Unsupported model: ${aiRequest.model}`);
    }

    // Real-time processing for dynamic UI updates
    if (aiRequest.config?.real_time && aiRequest.task === 'layout_generation') {
      await publishRealTimeUpdate(aiRequest.context.vendor_id, response);
    }

    // Store successful AI interaction with enhanced metadata
    await storeAIResult(aiRequest, response);

    // Generate content variations for A/B testing
    if (shouldGenerateVariations(aiRequest.task)) {
      response.content_variations = await generateContentVariations(response.content, aiRequest.task);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Router error:', error);
    
    // Enhanced fallback handling
    try {
      const request = await req.clone().json();
      if (request.config?.fallback_model && request.config.fallback_model !== request.model) {
        console.log(`Attempting fallback to ${request.config.fallback_model}`);
        const fallbackResponse = await processWithGPT4o({
          ...request,
          model: 'gpt-4o',
          prompt: `[FALLBACK MODE] ${request.prompt}`
        });
        fallbackResponse.model_used = `${request.config.fallback_model}-fallback`;
        
        return new Response(JSON.stringify(fallbackResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (fallbackError) {
      console.error('Fallback processing failed:', fallbackError);
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      fallback_used: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processWithGPT4o(aiRequest: AIRequest): Promise<AIResponse> {
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = getEnhancedSystemPrompt(aiRequest.task, aiRequest.context);
  const contextualPrompt = buildEnhancedContextualPrompt(aiRequest);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contextualPrompt }
      ],
      temperature: aiRequest.config?.temperature || getOptimalTemperature(aiRequest.task),
      max_tokens: aiRequest.config?.max_tokens || getOptimalMaxTokens(aiRequest.task),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Calculate context quality score
  const contextQualityScore = calculateContextQuality(aiRequest.context);
  
  return {
    model_used: 'gpt-4o',
    content,
    task: aiRequest.task,
    processing_metadata: {
      tokens_used: data.usage?.total_tokens || 0,
      model_version: 'gpt-4o',
      timestamp: new Date().toISOString(),
      context_quality_score: contextQualityScore,
      suggestions_count: aiRequest.task === 'layout_generation' ? extractSuggestionsCount(content) : undefined
    },
    confidence_score: calculateConfidenceScore(content, aiRequest.task)
  };
}

async function enrichContextualData(context: any) {
  const enriched: any = {};
  
  // Time-based enrichment
  if (context.time_context) {
    enriched.time_insights = analyzeTimeContext(context.time_context);
  }
  
  // Location-based enrichment for Malta
  if (context.location) {
    enriched.location_insights = await getMaltaLocationInsights(context.location);
  }
  
  // Weather integration
  if (context.weather) {
    enriched.weather_recommendations = generateWeatherRecommendations(context.weather);
  }
  
  // Historical data analysis
  if (context.vendor_id) {
    enriched.vendor_insights = await getVendorPerformanceInsights(context.vendor_id);
  }
  
  return enriched;
}

function getEnhancedSystemPrompt(task: string, context: any): string {
  const basePrompts = {
    layout_generation: `You are the UX Orchestrator for ICUPA Malta, an AI-powered hospitality platform. You specialize in creating dynamic, contextually-aware restaurant menu layouts that maximize user engagement and order conversion.

Key capabilities:
- Generate JSON layout configurations optimized for Malta's hospitality culture
- Prioritize sections based on time, weather, and user behavior patterns
- Incorporate local Maltese expressions and cultural warmth
- Optimize for mobile-first experience with intuitive navigation

Context awareness: ${JSON.stringify(context.time_insights || {})}, Location: ${context.location || 'Malta'}`,
    
    content_refinement: `You are the Content Refinement Specialist for ICUPA Malta, focusing on tone, empathy, and authentic Maltese hospitality charm.

Refinement guidelines:
- Use warm, welcoming language that reflects Maltese hospitality
- Incorporate subtle local expressions when appropriate
- Ensure clarity and accessibility for international visitors
- Maintain professional yet friendly tone
- Consider cultural sensitivity and dietary customs`,
    
    visual_design: `You are the Visual Design AI for ICUPA Malta, optimizing layouts, animations, and visual hierarchy for restaurant interfaces.

Design principles:
- Mediterranean color palettes with warm, inviting tones
- Clean, modern layouts that work across devices
- Subtle animations that enhance rather than distract
- Visual hierarchy that guides users to key actions
- Accessibility-first design considerations`,
    
    menu_recommendation: `You are Kai, the AI Waiter for ICUPA Malta restaurants. You help guests discover perfect menu items with the warmth and knowledge of an experienced Maltese waiter.

Interaction style:
- Conversational and helpful, like a knowledgeable local friend
- Knowledgeable about Maltese cuisine and local preferences
- Suggest items based on context (time, weather, preferences)
- Always explain WHY you're recommending something
- Use gentle upselling when appropriate`,

    contextual_analysis: `You are the Contextual Analysis Engine for ICUPA Malta, processing environmental and behavioral data to optimize user experiences.

Analysis focus:
- Time-of-day patterns and meal preferences
- Weather impact on food and drink choices
- Location-specific dining behaviors in Malta
- User interaction patterns and preferences
- Seasonal trends and local events impact`
  };

  return basePrompts[task as keyof typeof basePrompts] || basePrompts.menu_recommendation;
}

function buildEnhancedContextualPrompt(aiRequest: AIRequest): string {
  let prompt = aiRequest.prompt;
  
  // Enhanced context integration
  const contextParts = [];
  
  if (aiRequest.context.time_context) {
    contextParts.push(`Time: ${aiRequest.context.time_context}`);
  }
  
  if (aiRequest.context.location && aiRequest.context.location !== 'Malta') {
    contextParts.push(`Location: ${aiRequest.context.location}, Malta`);
  }
  
  if (aiRequest.context.weather) {
    contextParts.push(`Weather: ${aiRequest.context.weather}`);
  }
  
  if (aiRequest.context.user_preferences) {
    contextParts.push(`User preferences: ${JSON.stringify(aiRequest.context.user_preferences)}`);
  }
  
  if (aiRequest.context.interaction_history?.length) {
    contextParts.push(`Recent interactions: ${JSON.stringify(aiRequest.context.interaction_history.slice(-5))}`);
  }
  
  if (contextParts.length > 0) {
    prompt += `\n\nContextual Information:\n${contextParts.join('\n')}`;
  }
  
  // Task-specific enhancements
  if (aiRequest.task === 'layout_generation') {
    prompt += '\n\nReturn a valid JSON object with the layout configuration. Focus on Malta hospitality warmth and mobile optimization.';
  }
  
  return prompt;
}

function adaptPromptForModel(prompt: string, model: string, task: string): string {
  const adaptations = {
    'claude-4': '[CLAUDE-4 STYLE] Focus on empathy and natural language flow. ',
    'gemini-2.5-pro': '[GEMINI VISUAL] Emphasize visual design and layout optimization. '
  };
  
  return (adaptations[model as keyof typeof adaptations] || '') + prompt;
}

function getOptimalTemperature(task: string): number {
  const temperatures = {
    layout_generation: 0.3,
    content_refinement: 0.4,
    visual_design: 0.5,
    menu_recommendation: 0.7,
    contextual_analysis: 0.2
  };
  
  return temperatures[task as keyof typeof temperatures] || 0.5;
}

function getOptimalMaxTokens(task: string): number {
  const tokens = {
    layout_generation: 1200,
    content_refinement: 800,
    visual_design: 1000,
    menu_recommendation: 600,
    contextual_analysis: 1500
  };
  
  return tokens[task as keyof typeof tokens] || 1000;
}

function analyzeTimeContext(timeContext: string) {
  const now = new Date();
  const hour = now.getHours();
  
  return {
    meal_period: getMealPeriod(hour),
    energy_level: getEnergyLevel(hour),
    social_context: getSocialContext(hour, now.getDay()),
    suggested_categories: getSuggestedCategories(hour)
  };
}

function getMealPeriod(hour: number): string {
  if (hour < 10) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'dinner';
  return 'late_night';
}

function getEnergyLevel(hour: number): string {
  if (hour < 6 || hour > 22) return 'low';
  if (hour > 10 && hour < 15) return 'high';
  if (hour > 18 && hour < 21) return 'high';
  return 'medium';
}

function getSocialContext(hour: number, dayOfWeek: number): string {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  if (isWeekend && hour > 18) return 'social_dining';
  if (hour > 11 && hour < 14) return 'business_lunch';
  if (hour > 17 && hour < 20) return 'happy_hour';
  return 'casual_dining';
}

function getSuggestedCategories(hour: number): string[] {
  if (hour < 10) return ['breakfast', 'coffee', 'pastries'];
  if (hour < 15) return ['lunch', 'salads', 'sandwiches', 'drinks'];
  if (hour < 18) return ['snacks', 'coffee', 'light_bites'];
  if (hour < 22) return ['dinner', 'mains', 'wine', 'cocktails'];
  return ['bar_snacks', 'cocktails', 'desserts'];
}

async function getMaltaLocationInsights(location: string) {
  // Malta-specific location insights
  const maltaAreas = {
    'Valletta': { tourist_heavy: true, upscale: true, cultural: true },
    'Sliema': { tourist_heavy: true, modern: true, shopping: true },
    'St. Julians': { nightlife: true, international: true, young_crowd: true },
    'Mdina': { historical: true, quiet: true, traditional: true },
    'Gozo': { rural: true, traditional: true, slow_food: true }
  };
  
  return maltaAreas[location as keyof typeof maltaAreas] || { general: true };
}

function generateWeatherRecommendations(weather: string) {
  const recommendations = {
    sunny: ['cold_drinks', 'ice_cream', 'salads', 'outdoor_seating'],
    rainy: ['hot_drinks', 'comfort_food', 'warm_soups', 'indoor_ambiance'],
    windy: ['warm_drinks', 'hearty_meals', 'indoor_dining'],
    hot: ['refreshing_drinks', 'light_meals', 'frozen_treats'],
    mild: ['balanced_menu', 'seasonal_specials', 'all_categories']
  };
  
  return recommendations[weather.toLowerCase() as keyof typeof recommendations] || recommendations.mild;
}

async function getVendorPerformanceInsights(vendorId: string) {
  try {
    const { data: analytics } = await supabase
      .from('analytics')
      .select('*')
      .eq('vendor_id', vendorId)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });
      
    if (!analytics?.length) return { trending_items: [], peak_hours: [], popular_categories: [] };
    
    return {
      trending_items: extractTrendingItems(analytics),
      peak_hours: extractPeakHours(analytics),
      popular_categories: extractPopularCategories(analytics)
    };
  } catch (error) {
    console.error('Error fetching vendor insights:', error);
    return { trending_items: [], peak_hours: [], popular_categories: [] };
  }
}

function extractTrendingItems(analytics: any[]): string[] {
  // Simplified trending analysis
  return analytics
    .filter(a => a.metric_type === 'item_orders')
    .sort((a, b) => b.metric_value - a.metric_value)
    .slice(0, 5)
    .map(a => a.metadata?.item_name || 'Unknown')
    .filter(name => name !== 'Unknown');
}

function extractPeakHours(analytics: any[]): string[] {
  return analytics
    .filter(a => a.metric_type === 'hourly_orders')
    .sort((a, b) => b.metric_value - a.metric_value)
    .slice(0, 3)
    .map(a => a.metadata?.hour || '12');
}

function extractPopularCategories(analytics: any[]): string[] {
  return analytics
    .filter(a => a.metric_type === 'category_orders')
    .sort((a, b) => b.metric_value - a.metric_value)
    .slice(0, 4)
    .map(a => a.metadata?.category || 'General');
}

function calculateContextQuality(context: any): number {
  let score = 0;
  const maxScore = 10;
  
  if (context.vendor_id) score += 2;
  if (context.time_context) score += 2;
  if (context.location) score += 1;
  if (context.weather) score += 1;
  if (context.user_preferences) score += 2;
  if (context.interaction_history?.length) score += 1;
  if (context.session_id) score += 1;
  
  return Math.round((score / maxScore) * 100);
}

function extractSuggestionsCount(content: string): number {
  try {
    const parsed = JSON.parse(content);
    return (parsed.menu_sections?.length || 0) + (parsed.promotional_zones?.length || 0);
  } catch {
    return 0;
  }
}

function calculateConfidenceScore(content: string, task: string): number {
  let score = 50; // Base score
  
  if (task === 'layout_generation') {
    try {
      const parsed = JSON.parse(content);
      if (parsed.hero_section) score += 15;
      if (parsed.menu_sections?.length > 0) score += 15;
      if (parsed.promotional_zones) score += 10;
      if (parsed.ui_enhancements) score += 10;
    } catch {
      score -= 20;
    }
  }
  
  if (content.length > 100) score += 10;
  if (content.length > 500) score += 10;
  
  return Math.min(100, Math.max(0, score));
}

async function publishRealTimeUpdate(vendorId: string, response: AIResponse) {
  try {
    const channel = supabase.channel(`vendor_${vendorId}_layout_updates`);
    
    await channel.send({
      type: 'broadcast',
      event: 'layout_update',
      payload: {
        vendor_id: vendorId,
        layout_data: response.content,
        timestamp: new Date().toISOString(),
        confidence_score: response.confidence_score
      }
    });
  } catch (error) {
    console.error('Real-time update failed:', error);
  }
}

function shouldGenerateVariations(task: string): boolean {
  return ['content_refinement', 'menu_recommendation'].includes(task);
}

async function generateContentVariations(content: string, task: string): Promise<string[]> {
  if (!openaiApiKey) return [];
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: `Generate 2 alternative versions of the following content for A/B testing. Keep the same meaning but vary the tone and style slightly. Return as JSON array.` 
          },
          { role: 'user', content }
        ],
        temperature: 0.8,
        max_tokens: 400,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const variations = JSON.parse(data.choices[0].message.content);
      return Array.isArray(variations) ? variations : [];
    }
  } catch (error) {
    console.error('Failed to generate content variations:', error);
  }
  
  return [];
}

async function logAIRequest(aiRequest: AIRequest) {
  try {
    await supabase.from('ai_waiter_logs').insert({
      vendor_id: aiRequest.context.vendor_id,
      guest_session_id: aiRequest.context.session_id || 'anonymous',
      message_type: aiRequest.task,
      content: JSON.stringify({
        model: aiRequest.model,
        prompt: aiRequest.prompt.substring(0, 500),
        context_summary: {
          time: aiRequest.context.time_context,
          location: aiRequest.context.location,
          has_preferences: !!aiRequest.context.user_preferences
        }
      }),
      ai_model_used: aiRequest.model,
      processing_metadata: {
        request_timestamp: new Date().toISOString(),
        task: aiRequest.task,
        config: aiRequest.config
      }
    });
  } catch (error) {
    console.error('Failed to log AI request:', error);
  }
}

async function storeAIResult(aiRequest: AIRequest, response: AIResponse) {
  try {
    if (aiRequest.task === 'layout_generation') {
      let layoutConfig;
      try {
        layoutConfig = JSON.parse(response.content);
      } catch {
        layoutConfig = { raw_content: response.content };
      }
      
      await supabase.from('layout_suggestions').insert({
        vendor_id: aiRequest.context.vendor_id,
        context_data: aiRequest.context as any,
        layout_config: layoutConfig as any,
        ai_model_used: response.model_used,
        effectiveness_score: response.confidence_score
      });
    }
    
    // Store in AI waiter logs for all interactions
    await supabase.from('ai_waiter_logs').insert({
      vendor_id: aiRequest.context.vendor_id,
      guest_session_id: aiRequest.context.session_id || 'anonymous',
      message_type: `${aiRequest.task}_result`,
      content: response.content.substring(0, 1000),
      ai_model_used: response.model_used,
      processing_metadata: response.processing_metadata as any,
      satisfaction_score: response.confidence_score
    });
  } catch (error) {
    console.error('Failed to store AI result:', error);
  }
}
