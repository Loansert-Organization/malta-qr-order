import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Menu, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ComprehensiveNotificationCenter from '@/components/notifications/ComprehensiveNotificationCenter';

interface HeaderProps {
  title?: string;
  showNotifications?: boolean;
  showSearch?: boolean;
  showMenu?: boolean;
  unreadCount?: number;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title = 'ICUPA Malta',
  showNotifications = true,
  showSearch = false,
  showMenu = false,
  unreadCount = 0,
  onMenuClick,
  onSearchClick
}) => {
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              {showMenu && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMenuClick}
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              
              <div className="flex items-center space-x-2">
                <div 
                  className="cursor-pointer"
                  onClick={() => navigate('/')}
                >
                  <h1 className="text-xl font-bold text-blue-600">{title}</h1>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2">
              {showSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSearchClick}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}

              {showNotifications && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotificationCenter(true)}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Center */}
      <ComprehensiveNotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        userId="demo-user" // In production, get from auth context
      />
    </>
  );
};

export default Header;
