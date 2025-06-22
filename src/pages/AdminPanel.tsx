
import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import AdminAuth from '@/components/admin/AdminAuth';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';

const AdminPanel = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Handle authentication and authorization
  const authComponent = (
    <AdminAuth 
      user={user}
      profile={profile}
      authModalOpen={authModalOpen}
      setAuthModalOpen={setAuthModalOpen}
      loading={loading}
    />
  );

  if (authComponent) {
    return authComponent;
  }

  // Main admin panel for authenticated admin users
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user!} profile={profile} />
      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default AdminPanel;
