
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Database } from 'lucide-react';

const AdminHeader = () => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">ICUPA Malta Admin</h1>
                <p className="text-sm text-gray-500">Anonymous Access Mode</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Full Access</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Database className="h-4 w-4" />
              <span>Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
