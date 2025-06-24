
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Settings, 
  Heart, 
  AlertCircle,
  ChefHat,
  Utensils
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface GuestPreferencesProps {
  sessionId: string;
  vendorId?: string;
}

interface Preferences {
  dietary_restrictions: string[];
  favorite_categories: string[];
  ai_memory: Record<string, any>;
}

const GuestPreferences: React.FC<GuestPreferencesProps> = ({ sessionId, vendorId }) => {
  const [preferences, setPreferences] = useState<Preferences>({
    dietary_restrictions: [],
    favorite_categories: [],
    ai_memory: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dietaryOptions = [
    'vegetarian',
    'vegan',
    'gluten-free',
    'dairy-free',
    'nut-free',
    'halal',
    'kosher',
    'keto',
    'low-carb'
  ];

  const categoryOptions = [
    'starters',
    'mains',
    'desserts',
    'drinks',
    'cocktails',
    'wine',
    'beer',
    'coffee'
  ];

  useEffect(() => {
    fetchPreferences();
  }, [sessionId]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_preferences')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          dietary_restrictions: data.dietary_restrictions || [],
          favorite_categories: data.favorite_categories || [],
          ai_memory: (data.ai_memory && typeof data.ai_memory === 'object' && !Array.isArray(data.ai_memory)) 
            ? data.ai_memory as Record<string, any> 
            : {}
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('guest_preferences')
        .upsert({
          session_id: sessionId,
          vendor_id: vendorId,
          dietary_restrictions: preferences.dietary_restrictions,
          favorite_categories: preferences.favorite_categories,
          ai_memory: preferences.ai_memory,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setPreferences(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(restriction)
        ? prev.dietary_restrictions.filter(r => r !== restriction)
        : [...prev.dietary_restrictions, restriction]
    }));
  };

  const toggleFavoriteCategory = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      favorite_categories: prev.favorite_categories.includes(category)
        ? prev.favorite_categories.filter(c => c !== category)
        : [...prev.favorite_categories, category]
    }));
  };

  const formatAIMemoryValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-5 w-5" />
        <h2 className="text-xl font-bold">Your Preferences</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Dietary Restrictions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dietaryOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={preferences.dietary_restrictions.includes(option)}
                  onCheckedChange={() => toggleDietaryRestriction(option)}
                />
                <label htmlFor={option} className="text-sm capitalize cursor-pointer">
                  {option.replace('-', ' ')}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5" />
            <span>Favorite Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categoryOptions.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={preferences.favorite_categories.includes(category)}
                  onCheckedChange={() => toggleFavoriteCategory(category)}
                />
                <label htmlFor={category} className="text-sm capitalize cursor-pointer">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChefHat className="h-5 w-5" />
            <span>AI Memory</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.keys(preferences.ai_memory).length > 0 ? (
              Object.entries(preferences.ai_memory).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{key}</span>
                  <Badge variant="secondary">{formatAIMemoryValue(value)}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                <Utensils className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No AI memories yet</p>
                <p className="text-xs">Chat with our AI assistant to build your profile</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-3">
        <Button onClick={savePreferences} disabled={saving} className="flex-1">
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
        <Button variant="outline" onClick={fetchPreferences} className="flex-1">
          Reset
        </Button>
      </div>
    </div>
  );
};

export default GuestPreferences;
