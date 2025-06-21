
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import UserMenu from '@/components/auth/UserMenu';
import AuthModal from '@/components/auth/AuthModal';
import { LogIn, UserPlus } from 'lucide-react';

const Header: React.FC = () => {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  const handleSignInClick = () => {
    setAuthModalTab('signin');
    setAuthModalOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthModalTab('signup');
    setAuthModalOpen(true);
  };

  if (loading) {
    return (
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-blue-600">ICUPA Malta</h1>
          </div>
          <div className="animate-pulse">
            <div className="h-10 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-blue-600">ICUPA Malta</h1>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignInClick}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSignUpClick}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />
    </>
  );
};

export default Header;
