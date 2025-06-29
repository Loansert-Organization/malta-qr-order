import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { bar_id, cart_items } = await req.json()
    if (!bar_id || !Array.isArray(cart_items)) throw new Error('bar_id & cart_items[] required')

    // fetch top items for bar (popularity)
    const { data: orders } = await supabase
      .from('orders')
      .select('items')
      .eq('bar_id', bar_id)
      .eq('status', 'confirmed')
      .limit(100)

    const counts: Record<string, number> = {}
    orders?.forEach((o) => {
      o.items.forEach((i: any) => (counts[i.id] = (counts[i.id] || 0) + i.quantity))
    })
    const top = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id)

    const prompt = `Cart: ${cart_items.map((c: any) => c.name).join(', ')}. Top combos: ${top.join(', ')}. Suggest 1-2 menu item IDs that pair well (JSON array of ids).`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [ { role: 'user', content: prompt } ],
        temperature: 0.7,
        max_tokens: 60
      })
    })
    const j = await res.json()
    let suggestions: string[] = []
    try { suggestions = JSON.parse(j.choices[0].message.content) } catch {}

    return new Response(JSON.stringify({ suggestions }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
}) 