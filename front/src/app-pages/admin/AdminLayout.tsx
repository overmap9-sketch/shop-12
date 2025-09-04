import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectUser, logout } from '../../features/auth/authSlice';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../components/ui/badge';
import { usePermissions } from '../../shared/lib/permissions';
import {
  LayoutDashboard,
  Package,
  Layers,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Home,
  ChevronDown,
  Mail,
  Truck
} from 'lucide-react';

const adminNavigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    badge: '25'
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: Layers,
    badge: '12'
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    badge: '8'
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    badge: '342'
  },
  {
    name: 'Contacts',
    href: '/admin/contacts',
    icon: Mail
  },
  {
    name: 'Shipping',
    href: '/admin/shipping',
    icon: Truck
  },
  {
    name: 'Coupons',
    href: '/admin/coupons',
    icon: Mail
  },
  {
    name: 'Bulk Update',
    href: '/admin/bulk-update',
    icon: Layers
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
];

export function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { has } = usePermissions();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New order received', time: '2m ago', unread: true },
    { id: 2, message: 'Low stock alert: Wireless Headphones', time: '1h ago', unread: true },
    { id: 3, message: 'User feedback received', time: '3h ago', unread: false }
  ]);

  const unreadNotifications = notifications.filter(n => n.unread).length;

  const isActiveRoute = (href: string, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b">
        <Package className="h-8 w-8 text-primary" />
        <span className="ml-2 text-xl font-bold text-foreground">
          {t('admin.layout.title', 'Admin Panel')}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {adminNavigation
          .filter((item) => {
            switch (item.name) {
              case 'Products': return has('products.read');
              case 'Categories': return has('categories.read');
              case 'Users': return has('users.read');
              case 'Orders': return has('orders.read');
              case 'Settings': return has('settings.update');
              case 'Coupons': return has('coupons.read');
              case 'Bulk Update': return has('products.bulkUpdate');
              default: return true;
            }
          })
          .map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href, item.exact);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="h-5 w-5 mr-3" />
              {t(`admin.nav.${item.name.toLowerCase()}`, item.name)}
              {item.badge && (
                <Badge 
                  variant={isActive ? "secondary" : "outline"} 
                  className="ml-auto text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="px-4 py-4 border-t">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {user?.firstName?.charAt(0) || 'A'}{user?.lastName?.charAt(0) || 'D'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email || 'admin@example.com'}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Link to="/" className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
            <Home className="h-4 w-4 mr-2" />
            {t('admin.layout.viewSite', 'View Site')}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('admin.layout.logout', 'Logout')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0 lg:flex-shrink-0`}>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-card border-b px-4 py-3 lg:px-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Search */}
              <div className="relative ml-4 flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('admin.layout.search', 'Search...')}
                  className="w-full pl-10 pr-4 py-2 bg-muted rounded-md text-sm text-foreground placeholder-muted-foreground border-0 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-medium">
                      {user?.firstName?.charAt(0) || 'A'}{user?.lastName?.charAt(0) || 'D'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Close Button */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed top-4 right-4 z-50 p-2 bg-card rounded-md shadow-lg lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
