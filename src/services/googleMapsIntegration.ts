import { supabase } from '@/integrations/supabase/client';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCVbVWLFl5O2TdL7zDAjM08ws9D6IxPEFw';

interface MaltaBarData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  review_count?: number;
  google_place_id: string;
  phone?: string;
  photo_url?: string;
  is_active: boolean;
}

export class GoogleMapsIntegrationService {
  private apiKey: string;

  constructor() {
    this.apiKey = GOOGLE_MAPS_API_KEY;
  }

  async addSampleMaltaBars(): Promise<{ success: boolean; count: number }> {
    const sampleBars: MaltaBarData[] = [
      {
        name: 'Trabuxu Bistro',
        address: 'Strait Street, Valletta, Malta',
        latitude: 35.8989,
        longitude: 14.5145,
        rating: 4.5,
        review_count: 1250,
        google_place_id: 'sample_trabuxu_valletta',
        photo_url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400',
        is_active: true
      },
      {
        name: 'Bridge Bar',
        address: 'Republic Street, Valletta, Malta',
        latitude: 35.8976,
        longitude: 14.5134,
        rating: 4.3,
        review_count: 890,
        google_place_id: 'sample_bridge_valletta',
        photo_url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400',
        is_active: true
      },
      {
        name: 'Hugo\'s Lounge',
        address: 'Strand, Sliema, Malta',
        latitude: 35.9042,
        longitude: 14.5019,
        rating: 4.4,
        review_count: 980,
        google_place_id: 'sample_hugos_sliema',
        photo_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
        is_active: true
      },
      {
        name: 'Sky Club Malta',
        address: 'Portomaso Marina, St. Julian\'s, Malta',
        latitude: 35.9198,
        longitude: 14.4925,
        rating: 4.7,
        review_count: 865,
        google_place_id: 'sample_skyclub_stjulians',
        photo_url: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=400',
        is_active: true
      },
      {
        name: 'Medina Restaurant & Bar',
        address: 'Holy Cross Street, Mdina, Malta',
        latitude: 35.8859,
        longitude: 14.4035,
        rating: 4.5,
        review_count: 1320,
        google_place_id: 'sample_medina_mdina',
        photo_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
        is_active: true
      }
    ];

    try {
      let success = 0;
      for (const bar of sampleBars) {
        const { error } = await supabase
          .from('bars')
          .upsert({
            name: bar.name,
            address: bar.address,
            latitude: bar.latitude,
            longitude: bar.longitude,
            rating: bar.rating,
            review_count: bar.review_count,
            google_place_id: bar.google_place_id,
            photo_url: bar.photo_url,
            is_active: bar.is_active
          }, {
            onConflict: 'google_place_id',
            ignoreDuplicates: false
          });

        if (!error) {
          success++;
        }
      }

      return { success: success > 0, count: success };
    } catch (error) {
      console.error('Error adding sample bars:', error);
      return { success: false, count: 0 };
    }
  }

  async initializeDatabaseWithBars(): Promise<{ success: boolean; details: any }> {
    try {
      const result = await this.addSampleMaltaBars();
      
      if (result.success) {
        await supabase.from('system_logs').insert({
          log_type: 'data_initialization',
          component: 'google_maps_integration',
          message: `Malta bars data initialized: ${result.count} bars added`,
          severity: 'info'
        });
      }

      return {
        success: result.success,
        details: {
          message: 'Malta bars data initialized',
          bars_added: result.count
        }
      };
    } catch (error) {
      return {
        success: false,
        details: { error: error.message }
      };
    }
  }
}

export const googleMapsService = new GoogleMapsIntegrationService();
