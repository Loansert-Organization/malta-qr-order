import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bot, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Zap,
  MessageSquare,
  ShoppingCart,
  Menu,
  Search,
  HelpCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';

interface AgentTask {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high';
  tools: string[];
  triggers: string[];
  response_template?: string;
  created_at: string;
  updated_at: string;
}

interface AgentTool {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  api_endpoint?: string;
  parameters: string[];
  response_format: string;
}

const AdminAgentTasks: React.FC = () => {
  const [tasks, setTasks] = useState<AgentTask[]>([
    {
      id: '1',
      name: 'Menu Recommendations',
      description: 'Suggest menu items based on customer preferences and dietary restrictions',
      category: 'Recommendations',
      enabled: true,
      priority: 'high',
      tools: ['menu_search', 'dietary_filter'],
      triggers: ['customer_preference', 'dietary_request'],
      response_template: 'Based on your preferences, I recommend: {recommendations}',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      name: 'Order Assistance',
      description: 'Help customers with order placement and modifications',
      category: 'Ordering',
      enabled: true,
      priority: 'high',
      tools: ['order_management', 'payment_processor'],
      triggers: ['order_help', 'modification_request'],
      response_template: 'I can help you with your order. {assistance}',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-18T16:45:00Z'
    },
    {
      id: '3',
      name: 'Payment Support',
      description: 'Assist with payment methods and transaction issues',
      category: 'Payment',
      enabled: true,
      priority: 'medium',
      tools: ['payment_processor', 'transaction_history'],
      triggers: ['payment_issue', 'method_inquiry'],
      response_template: 'Let me help you with your payment: {solution}',
      created_at: '2024-01-12T08:00:00Z',
      updated_at: '2024-01-22T12:15:00Z'
    },
    {
      id: '4',
      name: 'General Inquiries',
      description: 'Handle general questions about the establishment',
      category: 'Information',
      enabled: true,
      priority: 'low',
      tools: ['business_info', 'hours_lookup'],
      triggers: ['general_question', 'info_request'],
      response_template: 'Here\'s what I can tell you: {information}',
      created_at: '2024-01-08T07:00:00Z',
      updated_at: '2024-01-16T11:30:00Z'
    }
  ]);

  const [tools, setTools] = useState<AgentTool[]>([
    {
      id: '1',
      name: 'Menu Search',
      description: 'Search and filter menu items',
      category: 'Menu',
      enabled: true,
      api_endpoint: '/api/menu/search',
      parameters: ['query', 'category', 'price_range', 'dietary'],
      response_format: 'json'
    },
    {
      id: '2',
      name: 'Order Management',
      description: 'Create and modify orders',
      category: 'Order',
      enabled: true,
      api_endpoint: '/api/orders',
      parameters: ['items', 'quantities', 'modifications'],
      response_format: 'json'
    },
    {
      id: '3',
      name: 'Payment Processor',
      description: 'Handle payment transactions',
      category: 'Payment',
      enabled: true,
      api_endpoint: '/api/payments',
      parameters: ['amount', 'method', 'currency'],
      response_format: 'json'
    },
    {
      id: '4',
      name: 'Business Info',
      description: 'Get business information and hours',
      category: 'Info',
      enabled: true,
      api_endpoint: '/api/business/info',
      parameters: ['type'],
      response_format: 'json'
    }
  ]);

  const [editingTask, setEditingTask] = useState<AgentTask | null>(null);
  const [editingTool, setEditingTool] = useState<AgentTool | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'tools'>('tasks');
  
  const { toast } = useToast();

  const categories = ['Recommendations', 'Ordering', 'Payment', 'Information', 'Support'];
  const priorities = ['low', 'medium', 'high'];
  const toolCategories = ['Menu', 'Order', 'Payment', 'Info', 'Analytics'];

  const saveTask = () => {
    if (!editingTask) return;
    
    if (editingTask.id === 'new') {
      const newTask = {
        ...editingTask,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setTasks(prev => [...prev, newTask]);
    } else {
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id 
          ? { ...editingTask, updated_at: new Date().toISOString() }
          : task
      ));
    }
    
    setEditingTask(null);
    toast({
      title: "Task saved",
      description: "Agent task has been updated successfully",
    });
  };

  const saveTool = () => {
    if (!editingTool) return;
    
    if (editingTool.id === 'new') {
      const newTool = {
        ...editingTool,
        id: Date.now().toString()
      };
      setTools(prev => [...prev, newTool]);
    } else {
      setTools(prev => prev.map(tool => 
        tool.id === editingTool.id ? editingTool : tool
      ));
    }
    
    setEditingTool(null);
    toast({
      title: "Tool saved",
      description: "Agent tool has been updated successfully",
    });
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "Agent task has been removed",
    });
  };

  const deleteTool = (toolId: string) => {
    setTools(prev => prev.filter(tool => tool.id !== toolId));
    toast({
      title: "Tool deleted",
      description: "Agent tool has been removed",
    });
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, enabled: !task.enabled } : task
    ));
  };

  const toggleToolStatus = (toolId: string) => {
    setTools(prev => prev.map(tool => 
      tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Recommendations': return <Search className="h-4 w-4" />;
      case 'Ordering': return <ShoppingCart className="h-4 w-4" />;
      case 'Payment': return <Zap className="h-4 w-4" />;
      case 'Information': return <HelpCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout 
      title="AI Agent Configuration" 
      subtitle="Tasks & Tools Management"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">AI Agent Tasks & Tools</h2>
            <p className="text-gray-600">Configure AI agent capabilities and responses</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setActiveTab('tasks')}
              className={activeTab === 'tasks' ? 'bg-blue-50 border-blue-200' : ''}
            >
              Tasks ({tasks.length})
            </Button>
            <Button 
              variant="outline"
              onClick={() => setActiveTab('tools')}
              className={activeTab === 'tools' ? 'bg-blue-50 border-blue-200' : ''}
            >
              Tools ({tools.length})
            </Button>
          </div>
        </div>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Agent Tasks</h3>
              <Button 
                onClick={() => setEditingTask({
                  id: 'new',
                  name: '',
                  description: '',
                  category: 'Information',
                  enabled: true,
                  priority: 'medium',
                  tools: [],
                  triggers: [],
                  response_template: '',
                  created_at: '',
                  updated_at: ''
                })}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>

            {editingTask ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingTask.id === 'new' ? 'New Task' : 'Edit Task'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="task-name">Task Name</Label>
                      <Input
                        id="task-name"
                        value={editingTask.name}
                        onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                        placeholder="e.g., Menu Recommendations"
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-category">Category</Label>
                      <Select 
                        value={editingTask.category} 
                        onValueChange={(value) => setEditingTask({ ...editingTask, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      value={editingTask.description}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                      placeholder="Describe what this task does..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="task-priority">Priority</Label>
                      <Select 
                        value={editingTask.priority} 
                        onValueChange={(value: 'low' | 'medium' | 'high') => setEditingTask({ ...editingTask, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map(priority => (
                            <SelectItem key={priority} value={priority}>
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingTask.enabled}
                        onCheckedChange={(checked) => setEditingTask({ ...editingTask, enabled: checked })}
                      />
                      <Label>Enabled</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="task-response">Response Template</Label>
                    <Textarea
                      id="task-response"
                      value={editingTask.response_template || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, response_template: e.target.value })}
                      placeholder="Template for AI responses..."
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={saveTask} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Task
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingTask(null)}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(task.category)}
                          <div>
                            <CardTitle className="text-lg">{task.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{task.category}</Badge>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <Badge variant={task.enabled ? "default" : "secondary"}>
                                {task.enabled ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingTask(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{task.description}</p>
                      
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Tools:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.tools.map(tool => (
                              <Badge key={tool} variant="secondary" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <span className="font-medium">Triggers:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.triggers.map(trigger => (
                              <Badge key={trigger} variant="outline" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleTaskStatus(task.id)}
                        >
                          {task.enabled ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Agent Tools</h3>
              <Button 
                onClick={() => setEditingTool({
                  id: 'new',
                  name: '',
                  description: '',
                  category: 'Info',
                  enabled: true,
                  parameters: [],
                  response_format: 'json'
                })}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Tool
              </Button>
            </div>

            {editingTool ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingTool.id === 'new' ? 'New Tool' : 'Edit Tool'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tool-name">Tool Name</Label>
                      <Input
                        id="tool-name"
                        value={editingTool.name}
                        onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                        placeholder="e.g., Menu Search"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tool-category">Category</Label>
                      <Select 
                        value={editingTool.category} 
                        onValueChange={(value) => setEditingTool({ ...editingTool, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {toolCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="tool-description">Description</Label>
                    <Textarea
                      id="tool-description"
                      value={editingTool.description}
                      onChange={(e) => setEditingTool({ ...editingTool, description: e.target.value })}
                      placeholder="Describe what this tool does..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tool-endpoint">API Endpoint</Label>
                      <Input
                        id="tool-endpoint"
                        value={editingTool.api_endpoint || ''}
                        onChange={(e) => setEditingTool({ ...editingTool, api_endpoint: e.target.value })}
                        placeholder="/api/endpoint"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingTool.enabled}
                        onCheckedChange={(checked) => setEditingTool({ ...editingTool, enabled: checked })}
                      />
                      <Label>Enabled</Label>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={saveTool} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Tool
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingTool(null)}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map((tool) => (
                  <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{tool.category}</Badge>
                            <Badge variant={tool.enabled ? "default" : "secondary"}>
                              {tool.enabled ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingTool(tool)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTool(tool.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{tool.description}</p>
                      
                      {tool.api_endpoint && (
                        <div className="text-sm">
                          <span className="font-medium">API Endpoint:</span>
                          <code className="block mt-1 p-2 bg-gray-100 rounded text-xs">
                            {tool.api_endpoint}
                          </code>
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <span className="font-medium">Parameters:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tool.parameters.map(param => (
                            <Badge key={param} variant="secondary" className="text-xs">
                              {param}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Format: {tool.response_format.toUpperCase()}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleToolStatus(tool.id)}
                        >
                          {tool.enabled ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.enabled).length}
                </div>
                <div className="text-sm text-gray-600">Active Tasks</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{tools.length}</div>
                <div className="text-sm text-gray-600">Total Tools</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {tools.filter(t => t.enabled).length}
                </div>
                <div className="text-sm text-gray-600">Active Tools</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAgentTasks; 