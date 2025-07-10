import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Store, 
  Menu, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Settings, 
  FileText, 
  Bot, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Bell,
  Search,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Bar Management',
    href: '/admin/bars',
    icon: Store,
    children: [
      { label: 'All Bars', href: '/admin/bars', icon: Store },
      { label: 'Add Bar', href: '/admin/bars/onboard', icon: Store },
      { label: 'Bar Onboarding', href: '/admin/bar-onboarding', icon: Store },
    ]
  },
  {
    label: 'Menu Management',
    href: '/admin/menus',
    icon: Menu,
    children: [
      { label: 'Menu Review', href: '/admin/menus', icon: Menu },
      { label: 'Menu Import', href: '/admin/menu-import', icon: Menu },
      { label: 'MenuMT1 Import', href: '/admin/menumt1-import', icon: Menu },
      { label: 'Menu Editor', href: '/admin/menus/editor', icon: Menu },
    ]
  },
  {
    label: 'Order Management',
    href: '/admin/orders',
    icon: ShoppingBag,
    badge: '12',
  },
  {
    label: 'Payment Analytics',
    href: '/admin/payments',
    icon: DollarSign,
  },
  {
    label: 'Entertainers',
    href: '/admin/entertainers',
    icon: Users,
  },
  {
    label: 'Suppliers',
    href: '/admin/suppliers',
    icon: Store,
  },
  {
    label: 'AI Agents',
    href: '/admin/agents',
    icon: Bot,
    children: [
      { label: 'Tasks & Tools', href: '/admin/agents/tasks', icon: Bot },
      { label: 'Persona Config', href: '/admin/agents/persona', icon: Bot },
      { label: 'Learning Mode', href: '/admin/agents/learning', icon: Bot },
    ]
  },
  {
    label: 'System Logs',
    href: '/admin/logs',
    icon: Activity,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  showBackButton = false 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isExpanded = expandedItems.includes(item.label);
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.href);

    return (
      <div key={item.href}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.label);
            } else {
              navigate(item.href);
            }
          }}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${active 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
            ${level > 0 ? 'ml-4' : ''}
          `}
        >
          <div className="flex items-center gap-3">
            <item.icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
            {!sidebarCollapsed && (
              <span className="truncate">{item.label}</span>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
              {hasChildren && (
                <ChevronRight 
                  className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                />
              )}
            </div>
          )}
        </button>
        
        {hasChildren && isExpanded && !sidebarCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`
        bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">I</span>
                </div>
                <span className="font-bold text-lg text-gray-900">ICUPA</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map(item => renderNavItem(item))}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-4 right-4">
          <Separator className="mb-4" />
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="w-full justify-start"
            >
              <Home className="h-4 w-4 mr-3" />
              {!sidebarCollapsed && <span>Back to App</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toast({
                  title: "Logged out",
                  description: "You have been logged out successfully",
                });
                navigate('/');
              }}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-3" />
              {!sidebarCollapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title || 'Admin Panel'}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">3</Badge>
              </Button>
              
              {/* User Menu */}
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 