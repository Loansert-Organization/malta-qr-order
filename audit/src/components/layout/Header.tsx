import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEngagement } from '@/hooks/useEngagement';
import { cn, getInitials } from '@/lib/utils';

export function Header() {
  const { user, logout } = useAuth();
  const { currentEngagement } = useEngagement();

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search and Engagement Info */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search engagements, tasks, evidence..."
              className="audit-input pl-10 w-80"
            />
          </div>
          
          {currentEngagement && (
            <div className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground">
              <span>•</span>
              <span className="font-medium">{currentEngagement.name}</span>
              <span>•</span>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs',
                currentEngagement.status === 'planning' && 'bg-blue-100 text-blue-800',
                currentEngagement.status === 'fieldwork' && 'bg-yellow-100 text-yellow-800',
                currentEngagement.status === 'review' && 'bg-purple-100 text-purple-800',
                currentEngagement.status === 'completed' && 'bg-green-100 text-green-800',
              )}>
                {currentEngagement.status.charAt(0).toUpperCase() + currentEngagement.status.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {user ? getInitials(user.displayName) : <User className="h-4 w-4" />}
              </div>
            )}
            
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>

            <button
              onClick={logout}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}