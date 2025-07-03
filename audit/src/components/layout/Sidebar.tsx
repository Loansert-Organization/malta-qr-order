import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  FileText, 
  AlertTriangle, 
  FileCheck,
  Shield,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEngagement } from '@/hooks/useEngagement';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Planning Hub', href: '/planning', icon: ClipboardList },
  { name: 'Fieldwork Board', href: '/fieldwork', icon: Users },
  { name: 'Evidence Hub', href: '/evidence', icon: FileText },
  { name: 'Exceptions Explorer', href: '/exceptions', icon: AlertTriangle },
  { name: 'Reporting Studio', href: '/reporting', icon: FileCheck },
  { name: 'Quality Control', href: '/quality', icon: Shield },
];

export function Sidebar() {
  const location = useLocation();
  const { currentEngagement } = useEngagement();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-primary overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-accent" />
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-white">Audit Agent</h2>
              <p className="text-xs text-accent">Malta Edition</p>
            </div>
          </div>
        </div>

        {/* Current Engagement */}
        {currentEngagement && (
          <div className="mt-6 px-4">
            <div className="audit-card bg-primary-foreground/10 border-accent/20">
              <h3 className="text-sm font-medium text-white mb-1">Current Engagement</h3>
              <p className="text-xs text-accent">{currentEngagement.name}</p>
              <p className="text-xs text-primary-foreground/60">
                Year End: {new Date(currentEngagement.yearEnd).getFullYear()}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-8 flex-1 px-2 pb-4 space-y-1">
          {navigation.map((item) => {
            const href = currentEngagement 
              ? `/engagement/${currentEngagement.id}${item.href}`
              : item.href;
            
            const isActive = location.pathname.includes(item.href);
            
            return (
              <Link
                key={item.name}
                to={href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-accent text-primary'
                    : 'text-primary-foreground hover:bg-primary-foreground/10 hover:text-accent'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 flex-shrink-0 h-5 w-5',
                    isActive ? 'text-primary' : 'text-primary-foreground/60'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="flex-shrink-0 p-2">
          <Link
            to="/settings"
            className="group flex items-center px-2 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 hover:text-accent rounded-md transition-colors"
          >
            <Settings className="mr-3 flex-shrink-0 h-5 w-5 text-primary-foreground/60" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}