
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from '@supabase/supabase-js';

interface Profile {
  full_name?: string;
  role: string;
}

interface AdminHeaderProps {
  user: User;
  profile: Profile | null;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user, profile }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ICUPA Admin Panel</h1>
            <p className="text-blue-100">Comprehensive platform management and analytics</p>
            {profile && (
              <p className="text-blue-200 text-sm mt-1">
                Welcome, {profile.full_name || user.email}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-white/20 text-white">
              Malta Hospitality Platform
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              AI-Powered
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
