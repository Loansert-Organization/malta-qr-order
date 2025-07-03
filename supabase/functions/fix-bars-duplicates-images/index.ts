import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BarRecord {
  id: string;
  name: string;
  address: string;
  google_place_id: string;
  photo_url?: string;
  photo_ref?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  contact_number?: string;
  created_at: string;
}

interface DuplicateGroup {
  originalId: string;
  duplicateIds: string[];
  reason: string;
  name: string;
}

// Calculate string similarity using Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const matrix = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null)
  );
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength;
}

// Clean address for comparison
function normalizeAddress(address: string): string {
  if (!address) return '';
  return address.toLowerCase()
    .replace(/\b(malta|kigali|rwanda)\b/gi, '')
    .replace(/[.,#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Clean name for comparison  
function normalizeName(name: string): string {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/[&'".,-]/g, ' ')
    .replace(/\b(restaurant|bar|cafe|bistro|lounge|club)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Get Google Maps photo URL
async function getGoogleMapsPhotoUrl(placeId: string, apiKey: string): Promise<string | null> {
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${apiKey}`;
    const response = await fetch(detailsUrl);
    const data = await response.json();
    
    if (data.result?.photos?.[0]?.photo_reference) {
      const photoRef = data.result.photos[0].photo_reference;
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${apiKey}`;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching photo for place ${placeId}:`, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!googleMapsApiKey) {
      throw new Error('Google Maps API key not configured');
    }

    console.log('🚀 Starting comprehensive bars cleanup and image restoration...');

    // Step 1: Fetch all bars
    const { data: allBars, error: fetchError } = await supabaseClient
      .from('bars')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;

    console.log(`�� Found ${allBars?.length || 0} total bars in database`);

    // Step 2: Find duplicates using multiple criteria
    const duplicateGroups: DuplicateGroup[] = [];
    const barsToDelete: string[] = [];
    const processedBars = new Set<string>();

    for (let i = 0; i < allBars.length; i++) {
      const bar1 = allBars[i] as BarRecord;
      if (processedBars.has(bar1.id)) continue;

      const duplicates: string[] = [];
      
      for (let j = i + 1; j < allBars.length; j++) {
        const bar2 = allBars[j] as BarRecord;
        if (processedBars.has(bar2.id)) continue;

        let isDuplicate = false;
        let reason = '';

        // Check 1: Exact Google Place ID match
        if (bar1.google_place_id && bar2.google_place_id && 
            bar1.google_place_id === bar2.google_place_id) {
          isDuplicate = true;
          reason = 'Same Google Place ID';
        }
        
        // Check 2: High name similarity + address similarity
        else if (bar1.name && bar2.name && bar1.address && bar2.address) {
          const nameSimilarity = calculateSimilarity(
            normalizeName(bar1.name),
            normalizeName(bar2.name)
          );
          const addressSimilarity = calculateSimilarity(
            normalizeAddress(bar1.address),
            normalizeAddress(bar2.address)
          );
          
          if (nameSimilarity > 0.9 && addressSimilarity > 0.8) {
            isDuplicate = true;
            reason = `High similarity (name: ${Math.round(nameSimilarity * 100)}%, address: ${Math.round(addressSimilarity * 100)}%)`;
          }
        }

        // Check 3: Exact name match in same general area
        else if (bar1.name && bar2.name && 
                 normalizeName(bar1.name) === normalizeName(bar2.name)) {
          const addressSim = calculateSimilarity(
            normalizeAddress(bar1.address || ''),
            normalizeAddress(bar2.address || '')
          );
          
          if (addressSim > 0.6) {
            isDuplicate = true;
            reason = `Exact name match with similar address (${Math.round(addressSim * 100)}% address similarity)`;
          }
        }

        if (isDuplicate) {
          duplicates.push(bar2.id);
          processedBars.add(bar2.id);
        }
      }

      if (duplicates.length > 0) {
        duplicateGroups.push({
          originalId: bar1.id,
          duplicateIds: duplicates,
          reason,
          name: bar1.name
        });
        
        barsToDelete.push(...duplicates);
        processedBars.add(bar1.id);
      }
    }

    console.log(`🔍 Found ${duplicateGroups.length} groups of duplicates (${barsToDelete.length} bars to remove)`);

    // Step 3: Delete duplicates
    let deletedCount = 0;
    if (barsToDelete.length > 0) {
      const { error: deleteError } = await supabaseClient
        .from('bars')
        .delete()
        .in('id', barsToDelete);

      if (deleteError) {
        console.error('Error deleting duplicates:', deleteError);
      } else {
        deletedCount = barsToDelete.length;
        console.log(`✅ Deleted ${deletedCount} duplicate bars`);
      }
    }

    // Step 4: Fetch remaining bars without images
    const { data: barsWithoutImages, error: noImageError } = await supabaseClient
      .from('bars')
      .select('*')
      .is('photo_url', null)
      .not('google_place_id', 'is', null);

    if (noImageError) throw noImageError;

    console.log(`📸 Found ${barsWithoutImages?.length || 0} bars without images`);

    // Step 5: Restore missing images from Google Maps
    let imagesRestored = 0;
    if (barsWithoutImages && barsWithoutImages.length > 0) {
      for (const bar of barsWithoutImages) {
        try {
          const photoUrl = await getGoogleMapsPhotoUrl(bar.google_place_id, googleMapsApiKey);
          
          if (photoUrl) {
            const { error: updateError } = await supabaseClient
              .from('bars')
              .update({ 
                photo_url: photoUrl,
                updated_at: new Date().toISOString()
              })
              .eq('id', bar.id);

            if (!updateError) {
              imagesRestored++;
              console.log(`📸 Restored image for: ${bar.name}`);
            }
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Error restoring image for ${bar.name}:`, error);
        }
      }
    }

    console.log(`✅ Restored ${imagesRestored} bar images`);

    // Step 6: Update ClientHome to display images
    const { data: finalBars, error: finalError } = await supabaseClient
      .from('bars')
      .select('id, name, photo_url')
      .not('photo_url', 'is', null)
      .limit(10);

    if (finalError) throw finalError;

    // Step 7: Log the operation
    await supabaseClient
      .from('bar_fetch_logs')
      .insert({
        operation_type: 'comprehensive_cleanup_and_image_restore',
        total_bars_processed: allBars?.length || 0,
        bars_updated: imagesRestored,
        new_bars_added: 0,
        errors_count: 0,
        status: 'completed',
        error_details: {
          duplicates_removed: deletedCount,
          duplicate_groups: duplicateGroups,
          images_restored: imagesRestored,
          bars_with_images: finalBars?.length || 0
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        operation: 'comprehensive_cleanup_and_image_restore',
        duplicates_removed: deletedCount,
        duplicate_groups: duplicateGroups.length,
        images_restored: imagesRestored,
        remaining_bars: (allBars?.length || 0) - deletedCount,
        bars_with_images: finalBars?.length || 0,
        details: {
          duplicate_groups: duplicateGroups,
          sample_bars_with_images: finalBars?.slice(0, 5).map(b => ({
            name: b.name,
            has_image: !!b.photo_url
          }))
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in comprehensive cleanup:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        operation: 'comprehensive_cleanup_and_image_restore'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
