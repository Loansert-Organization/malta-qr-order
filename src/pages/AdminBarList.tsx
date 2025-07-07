import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Phone, 
  Globe,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';

interface Bar {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  website?: string;
  logo?: string;
  categories: string[];
  tags: string[];
  confirmed: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  menu_count: number;
  order_count: number;
}

const AdminBarList: React.FC = () => {
  const [bars, setBars] = useState<Bar[]>([]);
  const [filteredBars, setFilteredBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data
  const mockBars: Bar[] = [
    {
      id: '1',
      name: 'The Blue Bar',
      address: '123 Main Street',
      city: 'Valletta',
      country: 'Malta',
      phone: '+356 2123 4567',
      website: 'https://thebluebar.mt',
      logo: 'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=BB',
      categories: ['Bar', 'Restaurant'],
      tags: ['Live Music', 'Outdoor Seating'],
      confirmed: true,
      active: true,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z',
      menu_count: 45,
      order_count: 127
    },
    {
      id: '2',
      name: 'Cafe Luna',
      address: '456 Republic Street',
      city: 'Sliema',
      country: 'Malta',
      phone: '+356 2123 4568',
      website: 'https://cafeluna.mt',
      logo: 'https://via.placeholder.com/100x100/10B981/FFFFFF?text=CL',
      categories: ['Cafe', 'Restaurant'],
      tags: ['Coffee', 'WiFi', 'Family Friendly'],
      confirmed: true,
      active: true,
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-18T16:45:00Z',
      menu_count: 32,
      order_count: 89
    },
    {
      id: '3',
      name: 'The Grand Hotel Bar',
      address: '789 St. Julian\'s Bay',
      city: 'St. Julian\'s',
      country: 'Malta',
      phone: '+356 2123 4569',
      website: 'https://grandhotel.mt',
      logo: 'https://via.placeholder.com/100x100/F59E0B/FFFFFF?text=GH',
      categories: ['Bar', 'Lounge'],
      tags: ['Luxury', 'Waterfront', 'Cocktails'],
      confirmed: false,
      active: false,
      created_at: '2024-01-25T11:00:00Z',
      updated_at: '2024-01-25T11:00:00Z',
      menu_count: 0,
      order_count: 0
    },
    {
      id: '4',
      name: 'Pizza Palace',
      address: '321 Spinola Road',
      city: 'St. Julian\'s',
      country: 'Malta',
      phone: '+356 2123 4570',
      website: 'https://pizzapalace.mt',
      logo: 'https://via.placeholder.com/100x100/EF4444/FFFFFF?text=PP',
      categories: ['Restaurant'],
      tags: ['Pizza', 'Delivery', 'Family Friendly'],
      confirmed: true,
      active: true,
      created_at: '2024-01-12T08:00:00Z',
      updated_at: '2024-01-22T12:15:00Z',
      menu_count: 28,
      order_count: 203
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBars(mockBars);
      setFilteredBars(mockBars);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = bars;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(bar =>
        bar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bar.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bar.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'confirmed') {
        filtered = filtered.filter(bar => bar.confirmed);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(bar => !bar.confirmed);
      } else if (statusFilter === 'active') {
        filtered = filtered.filter(bar => bar.active);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(bar => !bar.active);
      }
    }

    // Country filter
    if (countryFilter !== 'all') {
      filtered = filtered.filter(bar => bar.country === countryFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(bar => bar.categories.includes(categoryFilter));
    }

    setFilteredBars(filtered);
  }, [bars, searchQuery, statusFilter, countryFilter, categoryFilter]);

  const toggleBarStatus = (barId: string, field: 'confirmed' | 'active') => {
    setBars(prev => prev.map(bar => 
      bar.id === barId ? { ...bar, [field]: !bar[field] } : bar
    ));
    
    toast({
      title: "Status updated",
      description: `Bar ${field} status has been updated`,
    });
  };

  const deleteBar = (barId: string) => {
    setBars(prev => prev.filter(bar => bar.id !== barId));
    toast({
      title: "Bar deleted",
      description: "Bar has been removed from the system",
    });
  };

  const getStatusBadge = (bar: Bar) => {
    if (!bar.confirmed) {
      return <Badge variant="secondary">Pending</Badge>;
    }
    if (!bar.active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getCountries = () => {
    return [...new Set(bars.map(bar => bar.country))];
  };

  const getCategories = () => {
    const allCategories = bars.flatMap(bar => bar.categories);
    return [...new Set(allCategories)];
  };

  if (loading) {
    return (
      <AdminLayout title="Bar Management" subtitle="Manage bars and venues">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bars...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Bar Management" subtitle="Manage bars and venues">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Bars & Venues</h2>
            <p className="text-gray-600">Manage {bars.length} establishments</p>
          </div>
          <Button 
            onClick={() => navigate('/admin/bar-onboarding')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Bar
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bars..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Country</label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {getCountries().map(country => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getCategories().map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setCountryFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredBars.length} of {bars.length} bars
          </p>
          <div className="flex gap-2">
            <Badge variant="outline">
              {bars.filter(b => b.confirmed).length} Confirmed
            </Badge>
            <Badge variant="outline">
              {bars.filter(b => b.active).length} Active
            </Badge>
            <Badge variant="outline">
              {bars.filter(b => !b.confirmed).length} Pending
            </Badge>
          </div>
        </div>

        {/* Bars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBars.map((bar) => (
            <Card key={bar.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      {bar.logo ? (
                        <img 
                          src={bar.logo} 
                          alt={bar.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <MapPin className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{bar.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(bar)}
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{bar.city}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{bar.address}</span>
                  </div>
                  {bar.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{bar.phone}</span>
                    </div>
                  )}
                  {bar.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="h-3 w-3" />
                      <span className="truncate">{bar.website}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {bar.categories.map(category => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">{bar.menu_count}</span>
                      <span className="text-gray-500">menu items</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">{bar.order_count}</span>
                      <span className="text-gray-500">orders</span>
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(bar.updated_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/bars/${bar.id}`)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/bars/${bar.id}/edit`)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleBarStatus(bar.id, bar.confirmed ? 'active' : 'confirmed')}
                    className="flex-1"
                  >
                    {bar.confirmed && bar.active ? (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBars.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium mb-2">No bars found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or add a new bar
              </p>
              <Button onClick={() => navigate('/admin/bar-onboarding')}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Bar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBarList; 