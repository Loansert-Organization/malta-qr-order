import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Settings, User, MessageSquare } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminAgentPersona: React.FC = () => {
  return (
    <AdminLayout 
      title="AI Agent Persona Configuration" 
      subtitle="Configure AI personality and tone"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agent Persona Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium mb-2">Persona Configuration</h3>
              <p className="text-gray-600 mb-4">
                Configure AI agent personality, tone, and language settings
              </p>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAgentPersona; 