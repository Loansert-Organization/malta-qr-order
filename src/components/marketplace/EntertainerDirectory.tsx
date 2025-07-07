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
  Music,
  Calendar,
  Clock,
  Users,
  Award,
  Play,
  Mic,
  Guitar,
  Piano
} from 'lucide-react';

interface Entertainer {
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
  socialMedia: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  specialties: string[];
  genres: string[];
  availability: string[];
  hourlyRate: number;
  minimumBooking: number;
  responseTime: string;
  verified: boolean;
  image?: string;
  equipment: string[];
  languages: string[];
}

const EntertainerDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  // Mock entertainers data
  const entertainers: Entertainer[] = [
    {
      id: '1',
      name: 'Maria & The Mediterranean Band',
      description: 'Professional live band specializing in Mediterranean, jazz, and contemporary music. Perfect for weddings, corporate events, and bar entertainment.',
      category: 'Live Band',
      location: 'Valletta',
      rating: 4.9,
      reviewCount: 156,
      phone: '+356 2123 4567',
      email: 'booking@mariaband.mt',
      website: 'www.mariaband.mt',
      socialMedia: {
        instagram: '@mariaband',
        facebook: 'MariaMediterraneanBand',
        youtube: 'MariaBandOfficial'
      },
      specialties: ['Weddings', 'Corporate Events', 'Bar Entertainment', 'Private Parties'],
      genres: ['Mediterranean', 'Jazz', 'Contemporary', 'Pop'],
      availability: ['Weekends', 'Evenings', 'Weekdays'],
      hourlyRate: 150,
      minimumBooking: 2,
      responseTime: '< 2 hours',
      verified: true,
      equipment: ['Full PA System', 'Instruments', 'Lighting'],
      languages: ['English', 'Maltese', 'Italian']
    },
    {
      id: '2',
      name: 'DJ Alex Malta',
      description: 'Experienced DJ with 10+ years in the industry. Specializes in electronic, house, and top 40 hits. Available for clubs, bars, and private events.',
      category: 'DJ',
      location: 'St. Julian\'s',
      rating: 4.7,
      reviewCount: 203,
      phone: '+356 2123 4568',
      email: 'alex@djmalta.mt',
      website: 'www.djmalta.mt',
      socialMedia: {
        instagram: '@djalexmalta',
        facebook: 'DJAlexMalta'
      },
      specialties: ['Club DJ', 'Bar Entertainment', 'Private Parties', 'Corporate Events'],
      genres: ['Electronic', 'House', 'Top 40', 'Hip Hop'],
      availability: ['Weekends', 'Late Night', 'Weekdays'],
      hourlyRate: 120,
      minimumBooking: 3,
      responseTime: '< 4 hours',
      verified: true,
      equipment: ['Professional DJ Setup', 'Speakers', 'Lighting'],
      languages: ['English', 'Maltese']
    },
    {
      id: '3',
      name: 'Solo Guitarist - Marco',
      description: 'Acoustic guitarist and vocalist performing covers and original music. Perfect for intimate settings, restaurants, and background music.',
      category: 'Solo Musician',
      location: 'Sliema',
      rating: 4.6,
      reviewCount: 89,
      phone: '+356 2123 4569',
      email: 'marco@guitar.mt',
      website: 'www.marcoguitar.mt',
      socialMedia: {
        instagram: '@marcoguitar',
        youtube: 'MarcoGuitar'
      },
      specialties: ['Background Music', 'Restaurants', 'Private Events', 'Weddings'],
      genres: ['Acoustic', 'Folk', 'Pop', 'Classical'],
      availability: ['Evenings', 'Weekends', 'Weekdays'],
      hourlyRate: 80,
      minimumBooking: 1,
      responseTime: '< 1 hour',
      verified: false,
      equipment: ['Acoustic Guitar', 'Small PA System'],
      languages: ['English', 'Italian', 'Spanish']
    },
    {
      id: '4',
      name: 'Karaoke Night Malta',
      description: 'Professional karaoke setup and hosting service. Complete system with thousands of songs and professional hosting for bars and private events.',
      category: 'Karaoke',
      location: 'Birkirkara',
      rating: 4.4,
      reviewCount: 127,
      phone: '+356 2123 4570',
      email: 'info@karaokemalta.mt',
      website: 'www.karaokemalta.mt',
      socialMedia: {
        facebook: 'KaraokeNightMalta'
      },
      specialties: ['Bar Entertainment', 'Private Parties', 'Corporate Events', 'Birthday Parties'],
      genres: ['Karaoke', 'Pop', 'Rock', 'Classic Hits'],
      availability: ['Weekends', 'Evenings', 'Weekdays'],
      hourlyRate: 100,
      minimumBooking: 2,
      responseTime: '< 6 hours',
      verified: true,
      equipment: ['Professional Karaoke System', 'Microphones', 'Song Library'],
      languages: ['English', 'Maltese', 'Italian']
    },
    {
      id: '5',
      name: 'Piano Bar Duo',
      description: 'Elegant piano and vocal duo performing jazz standards, classical pieces, and contemporary hits. Perfect for sophisticated venues and events.',
      category: 'Duo',
      location: 'Valletta',
      rating: 4.8,
      reviewCount: 94,
      phone: '+356 2123 4571',
      email: 'booking@pianobarduo.mt',
      website: 'www.pianobarduo.mt',
      socialMedia: {
        instagram: '@pianobarduo',
        facebook: 'PianoBarDuoMalta'
      },
      specialties: ['Sophisticated Venues', 'Corporate Events', 'Weddings', 'Fine Dining'],
      genres: ['Jazz', 'Classical', 'Contemporary', 'Standards'],
      availability: ['Evenings', 'Weekends'],
      hourlyRate: 200,
      minimumBooking: 2,
      responseTime: '< 3 hours',
      verified: true,
      equipment: ['Grand Piano', 'Professional Sound System'],
      languages: ['English', 'Italian', 'French']
    },
  ];

  const categories = ['All', 'Live Band', 'DJ', 'Solo Musician', 'Karaoke', 'Duo', 'Comedian'];
  const locations = ['All', 'Valletta', 'St. Julian\'s', 'Sliema', 'Birkirkara', 'Mosta'];
  const genres = ['All', 'Mediterranean', 'Jazz', 'Electronic', 'Acoustic', 'Pop', 'Rock', 'Classical'];

  const filteredEntertainers = useMemo(() => {
    return entertainers.filter(entertainer => {
      const matchesSearch = entertainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entertainer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entertainer.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !selectedCategory || selectedCategory === 'All' || entertainer.category === selectedCategory;
      const matchesLocation = !selectedLocation || selectedLocation === 'All' || entertainer.location === selectedLocation;
      const matchesGenre = !selectedGenre || selectedGenre === 'All' || entertainer.genres.includes(selectedGenre);
      const matchesVerified = !verifiedOnly || entertainer.verified;

      return matchesSearch && matchesCategory && matchesLocation && matchesGenre && matchesVerified;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'rate':
          return a.hourlyRate - b.hourlyRate;
        default:
          return 0;
      }
    });
  }, [searchQuery, selectedCategory, selectedLocation, selectedGenre, verifiedOnly, sortBy]);

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Live Band': return <Users className="h-4 w-4" />;
      case 'DJ': return <Music className="h-4 w-4" />;
      case 'Solo Musician': return <Guitar className="h-4 w-4" />;
      case 'Karaoke': return <Mic className="h-4 w-4" />;
      case 'Duo': return <Piano className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Entertainer Directory</h1>
        <p className="text-muted-foreground">
          Find talented entertainers, musicians, and performers for your venue
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search entertainers..."
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
              <Label>Genre</Label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="All genres" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
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
                  <SelectItem value="rate">Hourly Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified-only"
                checked={verifiedOnly}
                onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
              />
              <Label htmlFor="verified-only">Verified Entertainers Only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {filteredEntertainers.length} Entertainer{filteredEntertainers.length !== 1 ? 's' : ''} Found
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntertainers.map((entertainer) => (
            <Card key={entertainer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getCategoryIcon(entertainer.category)}
                      {entertainer.name}
                      {entertainer.verified && (
                        <Badge variant="default" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {entertainer.location}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {renderStars(entertainer.rating)}
                    <p className="text-xs text-muted-foreground">
                      {entertainer.reviewCount} reviews
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {entertainer.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Music className="h-4 w-4" />
                    <span className="font-medium">Genres:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {entertainer.genres.map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Specialties:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {entertainer.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Hourly Rate:</span>
                    <p>€{entertainer.hourlyRate}</p>
                  </div>
                  <div>
                    <span className="font-medium">Min Booking:</span>
                    <p>{entertainer.minimumBooking}h</p>
                  </div>
                  <div>
                    <span className="font-medium">Response:</span>
                    <p>{entertainer.responseTime}</p>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <p>{entertainer.category}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Availability:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {entertainer.availability.map((time) => (
                      <Badge key={time} variant="outline" className="text-xs">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>{entertainer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>{entertainer.email}</span>
                  </div>
                  {entertainer.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={`https://${entertainer.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {entertainer.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    Book Now
                  </Button>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEntertainers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No entertainers found</h3>
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

export default EntertainerDirectory; 