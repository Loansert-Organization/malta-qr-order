import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
// Supabase Cloud does not allow secrets starting with "SUPABASE_", so fall back to SERVICE_ROLE_KEY
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface FetchBarPhotosRequest {
  barId: string
}

async function fetchBarPhotos(barId: string): Promise<{ status: string; uploaded: number; message?: string }> {
  try {
    // Check if bar exists
    const { data: bar, error: barError } = await supabase
      .from('bars')
      .select('id, name, google_place_id')
      .eq('id', barId)
      .single()

    if (barError || !bar) {
      console.error('Bar lookup failed:', barError)
      return { status: 'error', uploaded: 0, message: `Bar lookup failed: ${barError?.message || 'not found'}` }
    }

    // Check if photos already exist
    const { data: existingPhotos, error: photosError } = await supabase
      .from('bar_photos')
      .select('id')
      .eq('bar_id', barId)
      .limit(1)

    if (existingPhotos && existingPhotos.length > 0) {
      return { status: 'skipped', uploaded: 0, message: 'Photos already present' }
    }

    // Get google_place_id if missing
    let placeId = bar.google_place_id

    if (!placeId) {
      // Find place using Google Places API
      const searchQuery = encodeURIComponent(`${bar.name} Malta`)
      const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchQuery}&inputtype=textquery&locationbias=circle:50000@35.8989,14.5146&fields=place_id&key=${GOOGLE_API_KEY}`
      
      const findPlaceResponse = await fetch(findPlaceUrl)
      const findPlaceData = await findPlaceResponse.json()

      if (findPlaceData.candidates && findPlaceData.candidates.length > 0) {
        placeId = findPlaceData.candidates[0].place_id

        // Update bar with google_place_id
        await supabase
          .from('bars')
          .update({ google_place_id: placeId })
          .eq('id', barId)
      } else {
        await logError(barId, 'No Google Place found for bar')
        return { status: 'error', uploaded: 0, message: 'No Google Place found' }
      }
    }

    // Fetch place details to get photos
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_API_KEY}`
    const detailsResponse = await fetch(detailsUrl)
    const detailsData = await detailsResponse.json()

    if (!detailsData.result?.photos || detailsData.result.photos.length === 0) {
      await logError(barId, 'No photos available from Google Places')
      return { status: 'error', uploaded: 0, message: 'No photos available' }
    }

    // Process up to 6 photos
    const photosToProcess = detailsData.result.photos.slice(0, 6)
    let uploadedCount = 0

    for (const photo of photosToProcess) {
      try {
        const photoRef = photo.photo_reference
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`
        
        // Fetch the image
        const imageResponse = await fetch(photoUrl)
        if (!imageResponse.ok) continue

        const imageBlob = await imageResponse.blob()
        const arrayBuffer = await imageBlob.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        // Generate unique filename
        const fileName = `${crypto.randomUUID()}.jpg`
        const filePath = `bar_photos/${barId}/${fileName}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('bar-photos')
          .upload(filePath, uint8Array, {
            contentType: 'image/jpeg',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('bar-photos')
          .getPublicUrl(filePath)

        // Insert into bar_photos table
        const { error: insertError } = await supabase
          .from('bar_photos')
          .insert({
            bar_id: barId,
            url: publicUrl,
            original_url: photoUrl,
            source: 'google_places',
            created_at: new Date().toISOString()
          })

        if (!insertError) {
          uploadedCount++
        }

        // Rate limiting: wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Error processing photo:', error)
      }
    }

    // You can add a flag column (e.g., has_photos) later; for now we just return

    return { status: 'done', uploaded: uploadedCount }
  } catch (error) {
    await logError(barId, error.message || 'Unknown error')
    return { status: 'error', uploaded: 0, message: error.message }
  }
}

async function logError(barId: string, reason: string) {
  try {
    await supabase
      .from('photo_errors')
      .insert({
        bar_id: barId,
        reason: reason,
        timestamp: new Date().toISOString()
      })
  } catch (e) {
    console.error('Failed to log error:', e)
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { barId }: FetchBarPhotosRequest = await req.json()

    if (!barId) {
      return new Response(
        JSON.stringify({ error: 'barId is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const result = await fetchBarPhotos(barId)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 