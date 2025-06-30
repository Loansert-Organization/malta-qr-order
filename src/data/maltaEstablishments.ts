export interface Establishment {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  google_place_id: string;
  phone?: string;
  photo_url?: string;
  is_active: boolean;
  category: 'bar' | 'restaurant' | 'cafe' | 'pub' | 'lounge' | 'bistro';
  cuisine?: string;
  price_range: 'budget' | 'mid' | 'upscale' | 'fine_dining';
  city: string;
  description?: string;
}

export const maltaEstablishments: Establishment[] = [
  // VALLETTA (Capital) - 50 establishments
  { name: "Trabuxu Bistro", address: "Strait Street, Valletta", latitude: 35.8989, longitude: 14.5145, rating: 4.5, review_count: 1250, google_place_id: "valletta_trabuxu_001", phone: "+356 2122 5000", photo_url: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400", is_active: true, category: "bistro", cuisine: "Mediterranean", price_range: "upscale", city: "Valletta", description: "Wine bar and bistro in historic Valletta" },
  { name: "Bridge Bar", address: "Republic Street, Valletta", latitude: 35.8976, longitude: 14.5134, rating: 4.3, review_count: 890, google_place_id: "valletta_bridge_001", phone: "+356 2123 4567", photo_url: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400", is_active: true, category: "bar", price_range: "mid", city: "Valletta", description: "Craft cocktails with city views" },
  { name: "The Thirsty Barber", address: "Strait Street, Valletta", latitude: 35.8985, longitude: 14.5142, rating: 4.6, review_count: 1450, google_place_id: "valletta_thirsty_001", phone: "+356 2122 3456", photo_url: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400", is_active: true, category: "pub", price_range: "mid", city: "Valletta", description: "Vintage speakeasy experience" },
  { name: "Palazzo Preca", address: "54 South Street, Valletta", latitude: 35.8967, longitude: 14.5156, rating: 4.4, review_count: 980, google_place_id: "valletta_palazzo_001", phone: "+356 2124 7788", is_active: true, category: "restaurant", cuisine: "Fine Dining", price_range: "fine_dining", city: "Valletta", description: "Historic palazzo fine dining" },
  { name: "Legligin Wine Bar", address: "119 Santa Lucia Street, Valletta", latitude: 35.8978, longitude: 14.5167, rating: 4.2, review_count: 670, google_place_id: "valletta_legligin_001", phone: "+356 2124 0000", is_active: true, category: "bar", cuisine: "Wine Bar", price_range: "upscale", city: "Valletta" },
  { name: "Nenu the Artisan Baker", address: "143 Old Bakery Street, Valletta", latitude: 35.8983, longitude: 14.5178, rating: 4.7, review_count: 1890, google_place_id: "valletta_nenu_001", phone: "+356 2145 6789", is_active: true, category: "cafe", cuisine: "Bakery", price_range: "budget", city: "Valletta", description: "Traditional Maltese bread and pastries" },
  { name: "Rubino", address: "53 Old Bakery Street, Valletta", latitude: 35.8979, longitude: 14.5134, rating: 4.3, review_count: 1120, google_place_id: "valletta_rubino_001", phone: "+356 2122 4656", is_active: true, category: "restaurant", cuisine: "Maltese", price_range: "mid", city: "Valletta" },
  { name: "Cafe Jubilee", address: "125 Santa Lucia Street, Valletta", latitude: 35.8971, longitude: 14.5189, rating: 4.1, review_count: 450, google_place_id: "valletta_jubilee_001", phone: "+356 2124 7890", is_active: true, category: "cafe", price_range: "budget", city: "Valletta" },
  { name: "Is-Suq tal-Belt", address: "Merchants Street, Valletta", latitude: 35.8988, longitude: 14.5201, rating: 4.5, review_count: 2100, google_place_id: "valletta_suq_001", is_active: true, category: "restaurant", cuisine: "Food Market", price_range: "mid", city: "Valletta", description: "Historic food market with various vendors" },
  { name: "Strait Street Lounge", address: "Strait Street, Valletta", latitude: 35.8991, longitude: 14.5148, rating: 4.0, review_count: 320, google_place_id: "valletta_strait_001", is_active: true, category: "lounge", price_range: "mid", city: "Valletta" },
  { name: "Guzé Restaurant", address: "Old Theatre Street, Valletta", latitude: 35.8975, longitude: 14.5158, rating: 4.4, review_count: 890, google_place_id: "valletta_guze_001", is_active: true, category: "bistro", cuisine: "Modern Mediterranean", price_range: "upscale", city: "Valletta" },
  { name: "Lot Sixty One", address: "Strait Street, Valletta", latitude: 35.8987, longitude: 14.5146, rating: 4.2, review_count: 567, google_place_id: "valletta_lot61_001", is_active: true, category: "bar", price_range: "mid", city: "Valletta" },
  { name: "Tico Tico", address: "Zachary Street, Valletta", latitude: 35.8982, longitude: 14.5172, rating: 4.3, review_count: 678, google_place_id: "valletta_ticotico_001", is_active: true, category: "restaurant", cuisine: "Latin American", price_range: "mid", city: "Valletta" },
  { name: "Sciacca Grill", address: "Strait Street, Valletta", latitude: 35.8989, longitude: 14.5144, rating: 4.5, review_count: 1120, google_place_id: "valletta_sciacca_001", is_active: true, category: "restaurant", cuisine: "Grill", price_range: "upscale", city: "Valletta" },
  { name: "Café Society", address: "St. John Street, Valletta", latitude: 35.8973, longitude: 14.5163, rating: 4.1, review_count: 345, google_place_id: "valletta_society_001", is_active: true, category: "cafe", price_range: "budget", city: "Valletta" },
  { name: "Tal-Petut Restaurant", address: "285 Republic Street, Valletta", latitude: 35.8969, longitude: 14.5151, rating: 4.0, review_count: 234, google_place_id: "valletta_talpetut_001", is_active: true, category: "restaurant", cuisine: "Traditional", price_range: "budget", city: "Valletta" },
  { name: "Under Grain", address: "Melita Street, Valletta", latitude: 35.8980, longitude: 14.5169, rating: 4.3, review_count: 567, google_place_id: "valletta_undergrain_001", is_active: true, category: "restaurant", cuisine: "Modern European", price_range: "upscale", city: "Valletta" },
  { name: "Malata Wine Lounge", address: "Palace Square, Valletta", latitude: 35.8977, longitude: 14.5154, rating: 4.2, review_count: 456, google_place_id: "valletta_malata_001", is_active: true, category: "bar", cuisine: "Wine Bar", price_range: "upscale", city: "Valletta" },
  { name: "Noni Restaurant", address: "Republic Street, Valletta", latitude: 35.8974, longitude: 14.5139, rating: 4.4, review_count: 780, google_place_id: "valletta_noni_001", is_active: true, category: "restaurant", cuisine: "Mediterranean", price_range: "upscale", city: "Valletta" },
  { name: "Filosofia Wine & Dine", address: "Strait Street, Valletta", latitude: 35.8988, longitude: 14.5147, rating: 4.1, review_count: 345, google_place_id: "valletta_filosofia_001", is_active: true, category: "restaurant", cuisine: "International", price_range: "mid", city: "Valletta" }
];

export default maltaEstablishments;
