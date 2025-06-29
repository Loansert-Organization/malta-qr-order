import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, serviceKey)

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY')!

interface Payload {
  session_id?: string
  bar_id: string
  message: string
  user_id?: string | null
}

async function getOrCreateSession(barId: string, userId: string | null, existing?: string) {
  if (existing) return existing
  const { data, error } = await supabase
    .from('ai_waiter_sessions')
    .insert({ bar_id: barId, user_id: userId })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

async function insertMessage(sessionId: string, role: 'user' | 'assistant', content: string, meta: any = {}) {
  await supabase.from('ai_waiter_messages').insert({
    session_id: sessionId,
    role,
    content,
    processing_metadata: meta,
  })
}

async function chatCompletion(prompt: string) {
  const t0 = performance.now()
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are Kai-Waiter, a friendly digital waiter.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  })
  const json = await res.json()
  const t1 = performance.now()
  return { text: json.choices[0].message.content.trim(), latency: t1 - t0, tokens: json.usage.total_tokens }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const body = (await req.json()) as Payload
    if (!body.bar_id || !body.message) throw new Error('bar_id and message required')

    const sessionId = await getOrCreateSession(body.bar_id, body.user_id ?? null, body.session_id)

    // log user message
    await insertMessage(sessionId, 'user', body.message)

    // call openai
    const { text, latency, tokens } = await chatCompletion(body.message)

    // insert assistant message
    await insertMessage(sessionId, 'assistant', text, { latency_ms: latency, total_tokens: tokens })

    // store system log
    await supabase.from('system_logs').insert({
      action_type: 'ai_waiter_chat',
      metadata: { session_id: sessionId, latency_ms: latency, tokens },
    })

    return new Response(JSON.stringify({ session_id: sessionId, reply: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
}) 