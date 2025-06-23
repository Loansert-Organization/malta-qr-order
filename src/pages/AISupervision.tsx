
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Activity, MessageSquare, TrendingUp, Settings, Zap } from 'lucide-react';

const AISupervision = () => {
  const [selectedModel, setSelectedModel] = useState('gpt-4o');

  const aiModels = [
    { id: 'gpt-4o', name: 'GPT-4o', status: 'active', usage: 85, cost: '€45.20' },
    { id: 'claude-4', name: 'Claude-4', status: 'active', usage: 72, cost: '€32.15' },
    { id: 'gemini-2.5', name: 'Gemini 2.5 Pro', status: 'standby', usage: 23, cost: '€12.80' }
  ];

  const aiTasks = [
    { id: 1, task: 'Dynamic UI Generation', model: 'GPT-4o', status: 'running', accuracy: 94 },
    { id: 2, task: 'Menu Recommendations', model: 'Claude-4', status: 'completed', accuracy: 87 },
    { id: 3, task: 'Customer Support', model: 'GPT-4o', status: 'running', accuracy: 91 },
    { id: 4, task: 'Order Processing', model: 'Gemini 2.5', status: 'idle', accuracy: 89 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Supervision Dashboard</h1>
            <p className="text-gray-600">Monitor and manage AI model performance</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Models
            </Button>
            <Button>
              <Brain className="h-4 w-4 mr-2" />
              Run Diagnostics
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <p className="text-sm text-gray-600">Active AI Models</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">91%</div>
              <p className="text-sm text-gray-600">Average Accuracy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">€90.15</div>
              <p className="text-sm text-gray-600">Monthly Cost</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="tasks">Active Tasks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="logs">AI Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="models">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {aiModels.map((model) => (
                <Card key={model.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Brain className="h-5 w-5 mr-2" />
                        {model.name}
                      </CardTitle>
                      <Badge 
                        variant={model.status === 'active' ? 'default' : 'secondary'}
                        className={model.status === 'active' ? 'bg-green-500' : ''}
                      >
                        {model.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Usage</span>
                          <span>{model.usage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${model.usage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Monthly Cost:</span>
                        <span className="font-medium">{model.cost}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Configure
                        </Button>
                        <Button size="sm" className="flex-1">
                          Monitor
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Active AI Tasks</CardTitle>
                <CardDescription>Currently running AI operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{task.task}</h4>
                          <p className="text-sm text-gray-600">Model: {task.model}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{task.accuracy}% accuracy</div>
                          <Badge 
                            variant={
                              task.status === 'running' ? 'default' : 
                              task.status === 'completed' ? 'secondary' : 'outline'
                            }
                            className={
                              task.status === 'running' ? 'bg-green-500' :
                              task.status === 'completed' ? 'bg-blue-500' : ''
                            }
                          >
                            {task.status}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Response Time</span>
                      <span className="font-medium">240ms avg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Success Rate</span>
                      <span className="font-medium text-green-600">98.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cost Efficiency</span>
                      <span className="font-medium text-blue-600">92%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    AI Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Requests</span>
                      <span className="font-medium">12,450</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Customer Satisfaction</span>
                      <span className="font-medium text-green-600">4.8/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Error Rate</span>
                      <span className="font-medium text-yellow-600">1.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>AI Operation Logs</CardTitle>
                <CardDescription>Recent AI model activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((log) => (
                    <div key={log} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium">AI Task Execution #{log}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(Date.now() - log * 300000).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Success</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AISupervision;
