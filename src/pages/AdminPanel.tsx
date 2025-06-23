
import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import AdminAuth from '@/components/admin/AdminAuth';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';

const AdminPanel = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  console.log('AdminPanel render:', { user, profile, loading });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // For now, allow anonymous access to admin panel (as per restoration requirements)
  // In a real app, you'd want proper admin authentication
  const needsAuth = false; // Temporarily disabled for system restoration

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
