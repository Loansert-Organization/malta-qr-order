import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, BookOpen } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminAgentLearning: React.FC = () => {
  return (
    <AdminLayout title="AI Agent Learning" subtitle="Configure learning mode and training">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Learning Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium mb-2">Learning Mode Settings</h3>
            <p className="text-gray-600 mb-4">
              Configure AI agent learning parameters and training data
            </p>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAgentLearning;