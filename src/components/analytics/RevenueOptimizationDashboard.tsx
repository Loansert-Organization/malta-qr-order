
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const RevenueOptimizationDashboard = () => {
  const revenueData = [
    { name: 'Mon', revenue: 1200, target: 1500, optimization: 'low' },
    { name: 'Tue', revenue: 1800, target: 1500, optimization: 'high' },
    { name: 'Wed', revenue: 1400, target: 1500, optimization: 'medium' },
    { name: 'Thu', revenue: 2200, target: 1500, optimization: 'high' },
    { name: 'Fri', revenue: 2800, target: 1500, optimization: 'high' },
    { name: 'Sat', revenue: 3200, target: 1500, optimization: 'high' },
    { name: 'Sun', revenue: 2400, target: 1500, optimization: 'high' }
  ];

  const pricingOpportunities = [
    { category: 'Premium Cocktails', current: 12, suggested: 15, impact: '+25%' },
    { category: 'Wine Selection', current: 8, suggested: 10, impact: '+15%' },
    { category: 'Appetizers', current: 6, suggested: 7, impact: '+12%' },
    { category: 'Main Courses', current: 18, suggested: 20, impact: '+8%' }
  ];

  const upsellData = [
    { name: 'Dessert Combos', success: 85, attempts: 100 },
    { name: 'Wine Pairings', success: 72, attempts: 120 },
    { name: 'Appetizer Upgrades', success: 65, attempts: 95 },
    { name: 'Premium Drinks', success: 58, attempts: 80 }
  ];

  const timeSlotData = [
    { time: '11:00', revenue: 200, efficiency: 65 },
    { time: '12:00', revenue: 450, efficiency: 85 },
    { time: '13:00', revenue: 680, efficiency: 92 },
    { time: '14:00', revenue: 520, efficiency: 78 },
    { time: '15:00', revenue: 300, efficiency: 55 },
    { time: '16:00', revenue: 180, efficiency: 45 },
    { time: '17:00', revenue: 220, efficiency: 52 },
    { time: '18:00', revenue: 580, efficiency: 88 },
    { time: '19:00', revenue: 820, efficiency: 95 },
    { time: '20:00', revenue: 950, efficiency: 98 },
    { time: '21:00', revenue: 780, efficiency: 87 },
    { time: '22:00', revenue: 420, efficiency: 62 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€15,231</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                +20.1% from last week
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€28.50</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                +12.5% from target
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upsell Success</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                +8.2% this week
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600 flex items-center">
                <ArrowDown className="h-3 w-3 mr-1" />
                -2.1% from peak
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
          <TabsTrigger value="pricing">Dynamic Pricing</TabsTrigger>
          <TabsTrigger value="upsell">Upsell Analytics</TabsTrigger>
          <TabsTrigger value="optimization">Time Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Revenue vs Target</CardTitle>
              <CardDescription>
                AI-powered revenue tracking with optimization recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Peak Revenue Day</span>
                  <Badge variant="secondary">Saturday</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Best Performing Category</span>
                  <Badge variant="secondary">Premium Cocktails</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Optimization Opportunity</span>
                  <Badge variant="destructive">Tuesday Lunch</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Confidence Level</span>
                  <Badge variant="default">92%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Apply Dynamic Pricing
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Enable Smart Upselling
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Zap className="mr-2 h-4 w-4" />
                  Optimize Menu Layout
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Review Low Performers
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Pricing Opportunities</CardTitle>
              <CardDescription>
                AI-suggested price adjustments based on demand and competition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingOpportunities.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.category}</h4>
                      <p className="text-sm text-muted-foreground">
                        Current: €{item.current} → Suggested: €{item.suggested}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2">
                        {item.impact} revenue
                      </Badge>
                      <div className="space-x-2">
                        <Button size="sm" variant="outline">Review</Button>
                        <Button size="sm">Apply</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upsell" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upselling Performance</CardTitle>
              <CardDescription>
                Success rates and optimization suggestions for upselling strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {upsellData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.success}/{item.attempts} ({Math.round((item.success / item.attempts) * 100)}%)
                      </span>
                    </div>
                    <Progress value={(item.success / item.attempts) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upsell Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Wine pairing suggestions</span>
                  </div>
                  <Badge variant="secondary">+€8 avg</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm">Dessert after main course</span>
                  </div>
                  <Badge variant="secondary">+€6 avg</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm">Premium drink upgrades</span>
                  </div>
                  <Badge variant="secondary">+€4 avg</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time-Based Revenue Optimization</CardTitle>
              <CardDescription>
                Revenue and efficiency analysis by time slots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSlotData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue (€)" />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Efficiency (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Peak Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">19:00-21:00</div>
                <p className="text-xs text-muted-foreground">95% efficiency</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Optimization Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15:00-17:00</div>
                <p className="text-xs text-muted-foreground">50% efficiency</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revenue Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+€2,400</div>
                <p className="text-xs text-muted-foreground">Weekly opportunity</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueOptimizationDashboard;
