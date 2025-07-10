// ✨ Refactored by Cursor – Audit Phase 2: Security Headers & Rate Limiting
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  createSecureResponse, 
  createErrorResponse, 
  handleCORS, 
  EdgeRateLimit,
  validateRequestSize,
  validateContentType,
  sanitizeInput
} from '../_shared/security.ts';
import { openai } from '../_shared/openai.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AIWaiterRequest {
  message: string;
  vendor_id: string;
  guest_session_id: string;
  conversation_context?: Record<string, unknown>;
  user_preferences?: Record<string, unknown>;
}

interface AIWaiterResponse {
  response: string;
  suggestions?: Array<{
    type: string;
    item_id?: string;
    title: string;
    description: string;
    price?: number;
  }>;
  processing_time_ms: number;
  conversation_id: string;
  success: boolean;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  try {
    // Security validations
    if (!validateRequestSize(req, 50 * 1024)) { // 50KB max
      return createErrorResponse('Request too large', 413);
    }

    if (!validateContentType(req, ['application/json'])) {
      return createErrorResponse('Invalid content type', 415);
    }

    // Rate limiting: 10 requests per minute per client
    const rateLimitResult = await EdgeRateLimit.check(req, {
      maxRequests: 10,
      windowMs: 60 * 1000 // 1 minute
    });

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    const startTime = Date.now();
    let body: AIWaiterRequest;

    try {
      const rawBody = await req.json();
      body = sanitizeInput(rawBody) as AIWaiterRequest;
    } catch {
      return createErrorResponse('Invalid JSON request body', 400);
    }

    // Validate required fields
    if (!body.message || !body.vendor_id || !body.guest_session_id) {
      return createErrorResponse(
        'Missing required fields: message, vendor_id, guest_session_id',
        400
      );
    }

    // Validate message length
    if (body.message.length > 1000) {
      return createErrorResponse('Message too long (max 1000 characters)', 400);
    }

    console.log('🤖 AI Waiter Chat - Processing message:', {
      vendor_id: body.vendor_id,
      session_id: body.guest_session_id,
      message_length: body.message.length
    });

    // Get vendor and menu context
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, name, business_name')
      .eq('id', body.vendor_id)
      .single();

    if (vendorError || !vendor) {
      return createErrorResponse('Vendor not found', 404);
    }

    // Get menu items for context
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select(`
        id, name, price, category, available,
        menus!inner(vendor_id)
      `)
      .eq('menus.vendor_id', body.vendor_id)
      .eq('available', true)
      .limit(50);

    if (menuError) {
      console.warn('Could not fetch menu items:', menuError);
    }

    // Build AI context
    const systemPrompt = `You are Kai, the AI waiter for ${vendor.name}. You are helpful, friendly, and knowledgeable about the menu. 

VENDOR INFO:
- Name: ${vendor.name}
- Business Name: ${vendor.business_name || vendor.name}

AVAILABLE MENU ITEMS:
${(menuItems || []).map(item => 
  `- ${item.name} (€${item.price}) [Category: ${item.category || 'General'}]`
).join('\n')}

Guidelines:
1. Be conversational and helpful
2. Recommend menu items based on user preferences
3. Provide accurate pricing information
4. Ask clarifying questions when needed
5. Keep responses concise but informative
6. If asked about items not on the menu, politely explain they're not available
7. Use emojis sparingly and appropriately
8. Always be positive about the available options

User's message: "${body.message}"`;

    // Call OpenAI
    let aiResponse: string;
    let processingTime: number;

    try {
      const completion = await openai.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: body.message }
      ], {
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 300
      });

      aiResponse = completion.text();
      processingTime = Date.now() - startTime;
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      // Fallback response
      aiResponse = "I'm having trouble connecting to my knowledge base right now. However, I'd be happy to help you with your order! What type of food are you in the mood for today?";
      processingTime = Date.now() - startTime;
    }

    // Generate conversation ID
    const conversationId = crypto.randomUUID();

    // Log the conversation to database
    try {
      await supabase.from('ai_waiter_logs').insert({
        content: body.message,
        message_type: 'user_message',
        guest_session_id: body.guest_session_id,
        vendor_id: body.vendor_id,
        conversation_id: conversationId,
        processing_metadata: {
          model_used: 'gpt-4o',
          processing_time_ms: processingTime,
          message_length: body.message.length,
          response_length: aiResponse.length,
          timestamp: new Date().toISOString()
        },
        ai_model_used: 'gpt-4o'
      });

      await supabase.from('ai_waiter_logs').insert({
        content: aiResponse,
        message_type: 'ai_response',
        guest_session_id: body.guest_session_id,
        vendor_id: body.vendor_id,
        conversation_id: conversationId,
        processing_metadata: {
          model_used: 'gpt-4o',
          processing_time_ms: processingTime,
          tokens_estimated: Math.ceil(aiResponse.length / 4),
          timestamp: new Date().toISOString()
        },
        ai_model_used: 'gpt-4o'
      });
    } catch (logError) {
      console.warn('Failed to log conversation:', logError);
      // Continue execution even if logging fails
    }

    // Extract menu item suggestions from the response
    const suggestions = (menuItems || [])
      .filter(item => 
        aiResponse.toLowerCase().includes(item.name.toLowerCase()) ||
        (item.category && aiResponse.toLowerCase().includes(item.category.toLowerCase()))
      )
      .slice(0, 3)
      .map(item => ({
        type: 'menu_item',
        item_id: item.id,
        title: item.name,
        description: `Delicious ${item.category || 'dish'}`,
        price: item.price
      }));

    const response: AIWaiterResponse = {
      response: aiResponse,
      suggestions,
      processing_time_ms: processingTime,
      conversation_id: conversationId,
      success: true
    };

    return createSecureResponse(response, 200, {
      'X-Processing-Time': `${processingTime}ms`,
      'X-Suggestions-Count': suggestions.length.toString(),
      'X-Rate-Limit-Remaining': rateLimitResult.remainingRequests.toString(),
      'X-Rate-Limit-Reset': new Date(rateLimitResult.resetTime).toISOString()
    });

  } catch (error) {
    console.error('❌ AI Waiter Chat error:', error);
    
    return createErrorResponse(
      'Internal server error. Please try again.',
      500,
      'INTERNAL_ERROR'
    );
  }
});
