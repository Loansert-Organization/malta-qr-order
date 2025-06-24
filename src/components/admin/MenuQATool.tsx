
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Filter,
  Image,
  DollarSign,
  FileText,
  Wand2,
  Eye,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface QAIssue {
  id: string;
  type: 'missing_price' | 'missing_image' | 'poor_description' | 'missing_allergens' | 'format_issue';
  severity: 'high' | 'medium' | 'low';
  description: string;
  suggestions?: string[];
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  category: string;
  allergens?: string[];
  vendor_id: string;
  vendor_name: string;
  issues: QAIssue[];
}

const MenuQATool = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [vendors, setVendors] = useState<Array<{id: string, name: string}>>([]);
  const [fixingItem, setFixingItem] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
    fetchVendors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [menuItems, searchQuery, severityFilter, typeFilter, vendorFilter]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          price,
          description,
          image_url,
          category,
          allergens,
          vendor_id,
          vendors!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const itemsWithIssues = (data || []).map(item => ({
        ...item,
        vendor_name: item.vendors.name,
        issues: analyzeItem(item)
      }));

      setMenuItems(itemsWithIssues);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const analyzeItem = (item: any): QAIssue[] => {
    const issues: QAIssue[] = [];

    // Check for missing price
    if (!item.price || item.price <= 0) {
      issues.push({
        id: `price-${item.id}`,
        type: 'missing_price',
        severity: 'high',
        description: 'Item is missing a valid price',
        suggestions: ['Add a price greater than 0', 'Check if this is a complimentary item']
      });
    }

    // Check for missing image
    if (!item.image_url) {
      issues.push({
        id: `image-${item.id}`,
        type: 'missing_image',
        severity: 'medium',
        description: 'Item is missing an image',
        suggestions: ['Upload a high-quality image', 'Use AI to generate an image']
      });
    }

    // Check for poor description
    if (!item.description || item.description.length < 10) {
      issues.push({
        id: `desc-${item.id}`,
        type: 'poor_description',
        severity: 'medium',
        description: 'Description is missing or too short',
        suggestions: ['Add a detailed description', 'Include ingredients and preparation method']
      });
    }

    // Check for missing allergens
    if (!item.allergens || item.allergens.length === 0) {
      issues.push({
        id: `allergens-${item.id}`,
        type: 'missing_allergens',
        severity: 'low',
        description: 'No allergen information provided',
        suggestions: ['Add allergen information', 'Mark as "No known allergens" if applicable']
      });
    }

    // Check for formatting issues
    if (item.name && (item.name.length > 50 || item.name !== item.name.trim())) {
      issues.push({
        id: `format-${item.id}`,
        type: 'format_issue',
        severity: 'low',
        description: 'Name formatting issues detected',
        suggestions: ['Trim whitespace', 'Keep name under 50 characters']
      });
    }

    return issues;
  };

  const applyFilters = () => {
    let filtered = menuItems;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendor_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(item =>
        item.issues.some(issue => issue.severity === severityFilter)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item =>
        item.issues.some(issue => issue.type === typeFilter)
      );
    }

    // Vendor filter
    if (vendorFilter !== 'all') {
      filtered = filtered.filter(item => item.vendor_id === vendorFilter);
    }

    // Only show items with issues
    filtered = filtered.filter(item => item.issues.length > 0);

    setFilteredItems(filtered);
  };

  const getIssueIcon = (type: QAIssue['type']) => {
    switch (type) {
      case 'missing_price': return <DollarSign className="h-4 w-4" />;
      case 'missing_image': return <Image className="h-4 w-4" />;
      case 'poor_description': return <FileText className="h-4 w-4" />;
      case 'missing_allergens': return <AlertTriangle className="h-4 w-4" />;
      case 'format_issue': return <Edit className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: QAIssue['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAIFix = async (itemId: string, issueType: QAIssue['type']) => {
    setFixingItem(itemId);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-menu-qa-fix', {
        body: {
          item_id: itemId,
          issue_type: issueType
        }
      });

      if (error) throw error;

      toast.success('AI fix applied successfully!');
      await fetchMenuItems(); // Refresh to see changes
      
    } catch (error) {
      console.error('Error applying AI fix:', error);
      toast.error('Failed to apply AI fix');
    } finally {
      setFixingItem(null);
    }
  };

  const totalIssues = menuItems.reduce((sum, item) => sum + item.issues.length, 0);
  const highSeverityIssues = menuItems.reduce((sum, item) => 
    sum + item.issues.filter(issue => issue.severity === 'high').length, 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing menu quality...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Menu Quality Assurance</h2>
          <p className="text-gray-600">Identify and fix menu issues across all vendors</p>
        </div>
        
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{highSeverityIssues}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalIssues}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items or vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Issue Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="missing_price">Missing Price</SelectItem>
                <SelectItem value="missing_image">Missing Image</SelectItem>
                <SelectItem value="poor_description">Poor Description</SelectItem>
                <SelectItem value="missing_allergens">Missing Allergens</SelectItem>
                <SelectItem value="format_issue">Format Issues</SelectItem>
              </SelectContent>
            </Select>

            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map(vendor => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
              <p className="text-gray-600">
                {menuItems.length === 0 
                  ? "No menu items to analyze"
                  : "All menu items meet quality standards!"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map(item => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          {item.vendor_name} • {item.category} • €{item.price?.toFixed(2) || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {item.issues.map(issue => (
                        <div key={issue.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className={`p-2 rounded-lg ${getSeverityColor(issue.severity)}`}>
                              {getIssueIcon(issue.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium">{issue.description}</span>
                                <Badge className={getSeverityColor(issue.severity)}>
                                  {issue.severity}
                                </Badge>
                              </div>
                              {issue.suggestions && (
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {issue.suggestions.map((suggestion, index) => (
                                    <li key={index}>• {suggestion}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAIFix(item.id, issue.type)}
                              disabled={fixingItem === item.id}
                            >
                              <Wand2 className="h-4 w-4 mr-1" />
                              {fixingItem === item.id ? 'Fixing...' : 'AI Fix'}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuQATool;
