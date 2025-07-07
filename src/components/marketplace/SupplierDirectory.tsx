import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Package,
  Truck,
  Building2,
  Users,
  Award
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  phone: string;
  email: string;
  website: string;
  specialties: string[];
  deliveryAvailable: boolean;
  minimumOrder: number;
  responseTime: string;
  verified: boolean;
  image?: string;
}

const SupplierDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  // Mock suppliers data
  const suppliers: Supplier[] = [
    {
      id: '1',
      name: 'Mediterranean Foods Ltd',
      description: 'Premium Mediterranean ingredients and specialty foods for restaurants and bars.',
      category: 'Food & Beverage',
      location: 'Valletta',
      rating: 4.8,
      reviewCount: 127,
      phone: '+356 2123 4567',
      email: 'info@medfoods.mt',
      website: 'www.medfoods.mt',
      specialties: ['Olive Oil', 'Cheese', 'Wine', 'Pasta'],
      deliveryAvailable: true,
      minimumOrder: 50,
      responseTime: '< 2 hours',
      verified: true,
    },
    {
      id: '2',
      name: 'Island Beverage Supply',
      description: 'Comprehensive beverage solutions including craft beers, spirits, and mixers.',
      category: 'Beverages',
      location: 'Sliema',
      rating: 4.6,
      reviewCount: 89,
      phone: '+356 2123 4568',
      email: 'orders@islandbeverage.mt',
      website: 'www.islandbeverage.mt',
      specialties: ['Craft Beer', 'Spirits', 'Mixers', 'Wine'],
      deliveryAvailable: true,
      minimumOrder: 100,
      responseTime: '< 4 hours',
      verified: true,
    },
    {
      id: '3',
      name: 'Fresh Produce Co.',
      description: 'Daily fresh produce delivery for restaurants and hospitality businesses.',
      category: 'Produce',
      location: 'St. Julian\'s',
      rating: 4.4,
      reviewCount: 156,
      phone: '+356 2123 4569',
      email: 'fresh@produce.mt',
      website: 'www.freshproduce.mt',
      specialties: ['Vegetables', 'Fruits', 'Herbs', 'Organic'],
      deliveryAvailable: true,
      minimumOrder: 30,
      responseTime: '< 1 hour',
      verified: false,
    },
    {
      id: '4',
      name: 'Equipment Solutions Malta',
      description: 'Professional kitchen and bar equipment sales and maintenance.',
      category: 'Equipment',
      location: 'Birkirkara',
      rating: 4.7,
      reviewCount: 203,
      phone: '+356 2123 4570',
      email: 'sales@equipment.mt',
      website: 'www.equipment.mt',
      specialties: ['Kitchen Equipment', 'Bar Equipment', 'Maintenance', 'Installation'],
      deliveryAvailable: false,
      minimumOrder: 500,
      responseTime: '< 24 hours',
      verified: true,
    },
    {
      id: '5',
      name: 'Local Artisan Bakery',
      description: 'Artisan breads, pastries, and baked goods for restaurants and cafes.',
      category: 'Bakery',
      location: 'Mosta',
      rating: 4.9,
      reviewCount: 78,
      phone: '+356 2123 4571',
      email: 'orders@artisanbakery.mt',
      website: 'www.artisanbakery.mt',
      specialties: ['Artisan Bread', 'Pastries', 'Cakes', 'Gluten-Free'],
      deliveryAvailable: true,
      minimumOrder: 25,
      responseTime: '< 3 hours',
      verified: true,
    },
  ];

  const categories = ['All', 'Food & Beverage', 'Beverages', 'Produce', 'Equipment', 'Bakery'];
  const locations = ['All', 'Valletta', 'Sliema', 'St. Julian\'s', 'Birkirkara', 'Mosta'];

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          supplier.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          supplier.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !selectedCategory || selectedCategory === 'All' || supplier.category === selectedCategory;
      const matchesLocation = !selectedLocation || selectedLocation === 'All' || supplier.location === selectedLocation;
      const matchesDelivery = !deliveryOnly || supplier.deliveryAvailable;
      const matchesVerified = !verifiedOnly || supplier.verified;

      return matchesSearch && matchesCategory && matchesLocation && matchesDelivery && matchesVerified;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'response':
          return a.responseTime.localeCompare(b.responseTime);
        default:
          return 0;
      }
    });
  }, [searchQuery, selectedCategory, selectedLocation, deliveryOnly, verifiedOnly, sortBy]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Supplier Directory</h1>
        <p className="text-muted-foreground">
          Find reliable suppliers for your bar or restaurant needs
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="reviews">Reviews</SelectItem>
                  <SelectItem value="response">Response Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delivery-only"
                checked={deliveryOnly}
                onCheckedChange={(checked) => setDeliveryOnly(checked as boolean)}
              />
              <Label htmlFor="delivery-only">Delivery Available Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified-only"
                checked={verifiedOnly}
                onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
              />
              <Label htmlFor="verified-only">Verified Suppliers Only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {filteredSuppliers.length} Supplier{filteredSuppliers.length !== 1 ? 's' : ''} Found
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {supplier.name}
                      {supplier.verified && (
                        <Badge variant="default" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {supplier.location}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {renderStars(supplier.rating)}
                    <p className="text-xs text-muted-foreground">
                      {supplier.reviewCount} reviews
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {supplier.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Specialties:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {supplier.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Min Order:</span>
                    <p>€{supplier.minimumOrder}</p>
                  </div>
                  <div>
                    <span className="font-medium">Response:</span>
                    <p>{supplier.responseTime}</p>
                  </div>
                  <div>
                    <span className="font-medium">Delivery:</span>
                    <p className={supplier.deliveryAvailable ? 'text-green-600' : 'text-red-600'}>
                      {supplier.deliveryAvailable ? 'Available' : 'Not Available'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <p>{supplier.category}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>{supplier.email}</span>
                  </div>
                  {supplier.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={`https://${supplier.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {supplier.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    Contact Supplier
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSuppliers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No suppliers found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SupplierDirectory; 