import { google } from 'googleapis';
import { supabase } from '@/lib/api';

export async function fetchBarFromGoogle(barName: string) {
  const maps = google.maps({
    version: 'v3',
    auth: process.env.GOOGLE_MAPS_API_KEY
  });
  const res = await maps.places.textSearch({ query: barName + ' Malta' });
  const place = res.data.results?.[0];
  if (!place) return null;
  const { formatted_address, name, place_id, geometry } = place;
  const location = `${geometry.location.lat},${geometry.location.lng}`;
  const { data, error } = await supabase
    .from('bars')
    .update({
      name,
      address: formatted_address,
      location_gps: location,
      google_place_id: place_id
    })
    .eq('name', barName);
  return { data, error };
}
