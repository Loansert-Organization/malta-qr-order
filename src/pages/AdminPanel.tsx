
import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import AdminAuth from '@/components/admin/AdminAuth';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';

const AdminPanel = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Check if user needs authentication
  const needsAuth = !user || (profile && profile.role !== 'admin');

  if (needsAuth) {
    return (
      <AdminAuth
        user={user}
        profile={profile}
        authModalOpen={authModalOpen}
        setAuthModalOpen={setAuthModalOpen}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default AdminPanel;
