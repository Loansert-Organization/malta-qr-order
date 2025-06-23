
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PosterRequest {
  vendorId: string;
  template: 'qr' | 'promotional' | 'menu';
  data: {
    businessName: string;
    qrCodeUrl?: string;
    logoUrl?: string;
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
    text?: {
      title?: string;
      subtitle?: string;
      description?: string;
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎨 Poster Generator request received');
    
    const { vendorId, template, data }: PosterRequest = await req.json();
    
    console.log(`Generating ${template} poster for vendor:`, vendorId);
    
    // Generate poster based on template
    const posterData = await generatePosterSVG(template, data);
    
    // Store poster in database
    const { data: poster, error: dbError } = await supabase
      .from('posters')
      .insert({
        vendor_id: vendorId,
        template_name: template,
        poster_data: posterData,
        file_type: 'svg'
      })
      .select()
      .single();
    
    if (dbError) throw dbError;
    
    console.log('✅ Poster generated and stored successfully');
    
    return new Response(
      JSON.stringify({
        success: true,
        poster: {
          id: poster.id,
          template: template,
          data: posterData,
          download_url: `data:image/svg+xml;base64,${btoa(posterData.svg)}`
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Error in generate-poster:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function generatePosterSVG(template: string, data: any) {
  const { businessName, qrCodeUrl, logoUrl, colors, text } = data;
  
  // Default Malta theme colors
  const defaultColors = {
    primary: '#0066cc',
    secondary: '#ffffff',
    accent: '#ffd700'
  };
  
  const posterColors = { ...defaultColors, ...colors };
  
  switch (template) {
    case 'qr':
      return generateQRPoster(businessName, qrCodeUrl, posterColors, logoUrl);
    case 'promotional':
      return generatePromotionalPoster(businessName, text, posterColors, logoUrl);
    case 'menu':
      return generateMenuPoster(businessName, text, posterColors, logoUrl);
    default:
      return generateQRPoster(businessName, qrCodeUrl, posterColors, logoUrl);
  }
}

function generateQRPoster(businessName: string, qrCodeUrl: string, colors: any, logoUrl?: string) {
  const svg = `
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="600" fill="url(#bg)"/>
      
      <!-- Header -->
      <rect x="20" y="20" width="360" height="80" fill="${colors.accent}" rx="10"/>
      <text x="200" y="45" text-anchor="middle" fill="${colors.primary}" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
        ICUPA MALTA
      </text>
      <text x="200" y="70" text-anchor="middle" fill="${colors.primary}" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
        ${businessName}
      </text>
      
      <!-- QR Code Placeholder -->
      <rect x="100" y="150" width="200" height="200" fill="white" rx="10"/>
      <rect x="110" y="160" width="180" height="180" fill="#000" rx="5"/>
      <text x="200" y="260" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">
        QR CODE
      </text>
      
      <!-- Instructions -->
      <text x="200" y="400" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
        Scan to Order
      </text>
      <text x="200" y="430" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">
        1. Point your camera at the QR code
      </text>
      <text x="200" y="450" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">
        2. Tap the notification to open
      </text>
      <text x="200" y="470" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">
        3. Browse our menu and order
      </text>
      
      <!-- Footer -->
      <text x="200" y="520" text-anchor="middle" fill="${colors.accent}" font-family="Arial, sans-serif" font-size="12">
        Powered by ICUPA Malta
      </text>
      <text x="200" y="540" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12">
        Digital Hospitality Experience
      </text>
    </svg>
  `;
  
  return {
    svg,
    template: 'qr',
    colors,
    businessName
  };
}

function generatePromotionalPoster(businessName: string, text: any, colors: any, logoUrl?: string) {
  const title = text?.title || 'Special Offer';
  const subtitle = text?.subtitle || 'Limited Time Only';
  const description = text?.description || 'Check out our amazing deals!';
  
  const svg = `
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="promoBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${colors.primary};stop-opacity:1" />
        </radialGradient>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="600" fill="url(#promoBg)"/>
      
      <!-- Business Name -->
      <text x="200" y="80" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="28" font-weight="bold">
        ${businessName}
      </text>
      
      <!-- Title -->
      <text x="200" y="200" text-anchor="middle" fill="${colors.accent}" font-family="Arial, sans-serif" font-size="36" font-weight="bold">
        ${title}
      </text>
      
      <!-- Subtitle -->
      <text x="200" y="250" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20">
        ${subtitle}
      </text>
      
      <!-- Description -->
      <text x="200" y="320" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16">
        ${description}
      </text>
      
      <!-- Call to Action -->
      <rect x="100" y="400" width="200" height="60" fill="${colors.accent}" rx="30"/>
      <text x="200" y="440" text-anchor="middle" fill="${colors.primary}" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
        Order Now!
      </text>
      
      <!-- Footer -->
      <text x="200" y="520" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12">
        Scan QR Code or Visit Our App
      </text>
    </svg>
  `;
  
  return {
    svg,
    template: 'promotional',
    colors,
    businessName,
    text
  };
}

function generateMenuPoster(businessName: string, text: any, colors: any, logoUrl?: string) {
  const svg = `
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="400" height="600" fill="${colors.secondary}"/>
      
      <!-- Header -->
      <rect x="0" y="0" width="400" height="100" fill="${colors.primary}"/>
      <text x="200" y="35" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
        ${businessName}
      </text>
      <text x="200" y="65" text-anchor="middle" fill="${colors.accent}" font-family="Arial, sans-serif" font-size="16">
        Digital Menu Available
      </text>
      
      <!-- Menu Categories -->
      <text x="50" y="150" fill="${colors.primary}" font-family="Arial, sans-serif" font-size="20" font-weight="bold">
        🍕 Starters & Appetizers
      </text>
      <text x="50" y="200" fill="${colors.primary}" font-family="Arial, sans-serif" font-size="20" font-weight="bold">
        🍝 Main Courses
      </text>
      <text x="50" y="250" fill="${colors.primary}" font-family="Arial, sans-serif" font-size="20" font-weight="bold">
        🍰 Desserts
      </text>
      <text x="50" y="300" fill="${colors.primary}" font-family="Arial, sans-serif" font-size="20" font-weight="bold">
        🍹 Beverages & Cocktails
      </text>
      
      <!-- QR Code area -->
      <rect x="150" y="350" width="100" height="100" fill="white" stroke="${colors.primary}" stroke-width="2" rx="5"/>
      <text x="200" y="410" text-anchor="middle" fill="${colors.primary}" font-family="Arial, sans-serif" font-size="12">
        QR MENU
      </text>
      
      <!-- Instructions -->
      <text x="200" y="480" text-anchor="middle" fill="${colors.primary}" font-family="Arial, sans-serif" font-size="14">
        Scan for Full Menu & Ordering
      </text>
      
      <!-- Footer -->
      <rect x="0" y="520" width="400" height="80" fill="${colors.primary}"/>
      <text x="200" y="550" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">
        Powered by ICUPA Malta
      </text>
      <text x="200" y="570" text-anchor="middle" fill="${colors.accent}" font-family="Arial, sans-serif" font-size="12">
        Smart Hospitality Solutions
      </text>
    </svg>
  `;
  
  return {
    svg,
    template: 'menu',
    colors,
    businessName
  };
}
