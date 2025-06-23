
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, TrendingUp, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HeatmapData {
  location: string;
  orders: number;
  revenue: number;
  lat: number;
  lng: number;
  vendors: string[];
}

const LiveOrderHeatmap: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchHeatmapData();
    // Set up real-time subscription
    const subscription = supabase
      .channel('order-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchHeatmapData()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchHeatmapData = async () => {
    try {
      // Fetch recent orders with vendor location data
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendors!inner(name, location, location_text)
        `)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process data for heatmap
      const locationMap = new Map<string, HeatmapData>();
      let ordersTotal = 0;
      let revenueTotal = 0;

      orders?.forEach(order => {
        const location = order.vendors.location_text || order.vendors.location || 'Unknown';
        const revenue = parseFloat(order.total_amount?.toString() || '0');
        
        ordersTotal++;
        revenueTotal += revenue;

        if (locationMap.has(location)) {
          const existing = locationMap.get(location)!;
          existing.orders++;
          existing.revenue += revenue;
          if (!existing.vendors.includes(order.vendors.name)) {
            existing.vendors.push(order.vendors.name);
          }
        } else {
          // Mock coordinates for Malta locations
          const coords = getMaltaCoordinates(location);
          locationMap.set(location, {
            location,
            orders: 1,
            revenue,
            lat: coords.lat,
            lng: coords.lng,
            vendors: [order.vendors.name]
          });
        }
      });

      setHeatmapData(Array.from(locationMap.values()));
      setTotalOrders(ordersTotal);
      setTotalRevenue(revenueTotal);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock function to get Malta coordinates - in real app this would use geocoding
  const getMaltaCoordinates = (location: string) => {
    const maltaLocations: { [key: string]: { lat: number; lng: number } } = {
      'Valletta': { lat: 35.8989, lng: 14.5146 },
      'St. Julian\'s': { lat: 35.9179, lng: 14.4851 },
      'Sliema': { lat: 35.9123, lng: 14.5019 },
      'Bugibba': { lat: 35.9526, lng: 14.4093 },
      'Mellieha': { lat: 35.9578, lng: 14.3625 },
      'Mdina': { lat: 35.8858, lng: 14.4025 },
      'Victoria': { lat: 36.0444, lng: 14.2394 },
      'Marsaxlokk': { lat: 35.8406, lng: 14.5431 }
    };

    return maltaLocations[location] || { lat: 35.9375, lng: 14.3754 }; // Default to Malta center
  };

  const getIntensityColor = (orders: number) => {
    if (orders >= 20) return 'bg-red-500';
    if (orders >= 10) return 'bg-orange-500';
    if (orders >= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-300 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders (24h)</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue (24h)</p>
                <p className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Locations</p>
                <p className="text-2xl font-bold">{heatmapData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">
                  €{totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Order Heatmap - Malta
          </CardTitle>
          <CardDescription>
            Real-time visualization of order activity across Malta (Last 24 hours)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8" style={{ minHeight: '400px' }}>
            {/* Malta Outline (Simplified) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative" style={{ width: '300px', height: '200px' }}>
                {/* Malta Island Shape (Simplified Rectangle) */}
                <div className="absolute inset-0 border-2 border-gray-400 rounded-lg bg-gray-100 opacity-30"></div>
                
                {/* Location Markers */}
                {heatmapData.map((location, index) => {
                  const intensity = Math.min(location.orders / 5, 1); // Normalize intensity
                  const size = Math.max(20, location.orders * 2); // Size based on orders
                  
                  return (
                    <div
                      key={index}
                      className={`absolute rounded-full ${getIntensityColor(location.orders)} opacity-70 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:opacity-90 transition-all duration-200`}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${(index % 3) * 30 + 25}%`, // Distribute across width
                        top: `${Math.floor(index / 3) * 25 + 25}%`, // Distribute across height
                      }}
                      title={`${location.location}: ${location.orders} orders, €${location.revenue.toFixed(2)}`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                        {location.orders}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {heatmapData.map((location, index) => (
              <Card key={index} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{location.location}</h4>
                    <div className={`w-3 h-3 rounded-full ${getIntensityColor(location.orders)}`}></div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Orders:</span> {location.orders}</p>
                    <p><span className="font-medium">Revenue:</span> €{location.revenue.toFixed(2)}</p>
                    <p><span className="font-medium">Vendors:</span> {location.vendors.join(', ')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {heatmapData.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent orders to display</p>
              <p className="text-sm">Order data will appear here when customers place orders</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveOrderHeatmap;
