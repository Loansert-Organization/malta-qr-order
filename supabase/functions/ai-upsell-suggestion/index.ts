import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

async function generateSuggestion(cartItems: any[], barId: string) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('Missing OPENAI_API_KEY');

  // Build prompt
  const prompt = `You are a smart AI waiter for a bar. The guest has selected:\n${cartItems
    .map((i) => `- ${i.name}`)
    .join('\n')}.\n\nBased on this, suggest 1-2 items (JSON) that pair well or are commonly ordered together. Keep each suggestion under 20 words. JSON format: [{\"id\":\"menu-item-id\",\"title\":\"Title\",\"description\":\"Text\"}]`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an AI waiter that boosts sales with helpful pairings.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  const json = await response.json();
  const choice = json.choices?.[0]?.message?.content || '[]';

  let suggestions;
  try {
    suggestions = JSON.parse(choice);
  } catch {
    suggestions = [];
  }

  return suggestions.slice(0, 2);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { cartItems, barId, userId } = await req.json();
    if (!cartItems || !Array.isArray(cartItems)) {
      throw new Error('cartItems array required');
    }

    const suggestions = await generateSuggestion(cartItems, barId);

    // Log
    await supabase.from('ai_upsell_logs').insert({
      user_id: userId || null,
      bar_id: barId,
      cart_items: cartItems,
      suggestions,
    });

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Upsell error', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 