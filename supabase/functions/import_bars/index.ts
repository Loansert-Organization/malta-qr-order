import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, serviceKey)

const GOOGLE_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')!
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY')

interface Region { name: string; lat: number; lon: number; radius: number }
const REGIONS: Region[] = [
  { name: 'Malta', lat: 35.9375, lon: 14.3754, radius: 35000 },
  { name: 'Gozo', lat: 36.046, lon: 14.239, radius: 15000 },
  { name: 'Rwanda', lat: -1.9403, lon: 29.8739, radius: 60000 },
]

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function fetchJSON(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`)
  return res.json()
}

async function getTagline(name: string): Promise<string | null> {
  if (!OPENAI_KEY) return null
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Create a catchy 6–8 word tagline for a bar or restaurant.' },
          { role: 'user', content: name }
        ],
        temperature: 0.8,
        max_tokens: 20
      })
    })
    const j = await res.json()
    return j.choices?.[0]?.message?.content?.trim() || null
  } catch (_e) {
    return null
  }
}

async function importRegion(region: Region) {
  let pageToken = ''
  let imported = 0
  for (let page = 0; page < 3; page++) {
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    url.searchParams.set('keyword', 'bar|restaurant')
    url.searchParams.set('location', `${region.lat},${region.lon}`)
    url.searchParams.set('radius', String(region.radius))
    url.searchParams.set('key', GOOGLE_KEY)
    if (pageToken) url.searchParams.set('pagetoken', pageToken)
    const data = await fetchJSON(url.toString())
    for (const place of data.results) {
      try {
        const exists = await supabase.from('bars').select('id').eq('google_place_id', place.place_id).maybeSingle()
        if (exists.data) continue
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,geometry,rating,user_ratings_total,photos&key=${GOOGLE_KEY}`
        const details = await fetchJSON(detailsUrl)
        const d = details.result
        let photoUrl: string | null = null
        let photoRef: string | null = null
        if (d.photos?.length) {
          photoRef = d.photos[0].photo_reference
          const photoFetch = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_KEY}`
          const resp = await fetch(photoFetch)
          if (resp.ok) {
            const array = new Uint8Array(await resp.arrayBuffer())
            const filename = `${place.place_id}.jpg`
            const { error } = await supabase.storage.from('bar_photos').upload(filename, array, { upsert: true, contentType: 'image/jpeg' })
            if (!error) {
              const { data: signed } = await supabase.storage.from('bar_photos').createSignedUrl(filename, 60 * 60 * 24 * 7)
              photoUrl = signed.signedUrl
            }
          }
        }
        const tagline = await getTagline(d.name)
        await supabase.from('bars').insert({
          google_place_id: place.place_id,
          name: d.name,
          country: region.name,
          address: d.formatted_address,
          latitude: d.geometry.location.lat,
          longitude: d.geometry.location.lng,
          phone: d.formatted_phone_number,
          rating: d.rating,
          user_ratings_total: d.user_ratings_total,
          photo_ref: photoRef,
          photo_url: photoUrl,
          tagline,
        })
        imported++
      } catch (e) {
        console.error('import error', e)
      }
    }
    if (!data.next_page_token) break
    pageToken = data.next_page_token
    await sleep(2200) // Google requirement ~2s
  }
  return imported
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const results: Record<string, number> = {}
    for (const region of REGIONS) {
      const n = await importRegion(region)
      results[region.name] = n
    }
    return new Response(JSON.stringify({ imported: results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
}) 