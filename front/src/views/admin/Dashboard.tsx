import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectProducts, selectCategories, fetchCategories } from '../../features/catalog/catalogSlice';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Eye,
  Plus,
  Settings,
  Activity,
  DollarSign,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentActivity: Array<{
    id: string;
    type: 'order' | 'product' | 'user';
    message: string;
    timestamp: string;
  }>;
}

export function AdminDashboard() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const categories = useAppSelector(selectCategories);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentActivity: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories if not loaded
        if (categories.length === 0) {
          await dispatch(fetchCategories()).unwrap();
        }

        // Simulate loading other data
        await new Promise(resolve => setTimeout(resolve, 500));

        // Build recent activity from audit logs
        const { AuditAPI } = await import('../../shared/api/audit');
        const logs = AuditAPI.list({ limit: 10 });
        const toAgo = (ts: string) => {
          const diff = Date.now() - new Date(ts).getTime();
          const m = Math.floor(diff / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m} min ago`;
          const h = Math.floor(m / 60); if (h < 24) return `${h} h ago`;
          const d = Math.floor(h / 24); return `${d} d ago`;
        };
        const recentActivity = logs.map(l => ({
          id: l.id,
          type: (l.entity === 'product' ? 'product' : l.entity === 'category' ? 'product' : l.entity === 'settings' ? 'user' : 'order') as 'order'|'product'|'user',
          message: `${l.userEmail || 'System'} ${l.action} ${l.entity}${l.entityId ? ` (${l.entityId})` : ''}`,
          timestamp: toAgo(l.timestamp)
        }));

        setStats({
          totalProducts: products.length || 0,
          totalCategories: categories.length || 0,
          totalOrders: 0,
          totalUsers: 0,
          totalRevenue: 0,
          recentActivity,
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [dispatch, categories.length, products.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/products'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: Layers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/admin/categories'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/orders'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/admin/users'
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      link: '/admin/analytics'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'text-green-600 bg-green-50';
      case 'product':
        return 'text-blue-600 bg-blue-50';
      case 'user':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('admin.dashboard.title', 'Dashboard')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('admin.dashboard.subtitle', 'Welcome to your admin dashboard')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            {t('admin.dashboard.viewSite', 'View Site')}
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            {t('admin.dashboard.settings', 'Settings')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {t('admin.dashboard.recentActivity', 'Recent Activity')}
            </h2>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              {t('admin.dashboard.viewAll', 'View All')}
            </Button>
          </div>
          
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {t('admin.dashboard.quickActions', 'Quick Actions')}
          </h2>
          
          <div className="space-y-3">
            <Link to="/admin/products/new">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.dashboard.addProduct', 'Add Product')}
              </Button>
            </Link>
            
            <Link to="/admin/categories/new">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.dashboard.addCategory', 'Add Category')}
              </Button>
            </Link>
            
            <Link to="/admin/orders">
              <Button className="w-full justify-start" variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t('admin.dashboard.manageOrders', 'Manage Orders')}
              </Button>
            </Link>
            
            <Link to="/admin/users">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                {t('admin.dashboard.manageUsers', 'Manage Users')}
              </Button>
            </Link>
            
            <Link to="/admin/analytics">
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                {t('admin.dashboard.viewAnalytics', 'View Analytics')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {t('admin.dashboard.salesOverview', 'Sales Overview')}
            </h2>
            <Badge variant="secondary">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% vs last month
            </Badge>
          </div>

          {/* Simple Chart Representation */}
          <div className="space-y-4">
            {[
              { month: 'Jan', value: 12000, color: 'bg-blue-500' },
              { month: 'Feb', value: 19000, color: 'bg-green-500' },
              { month: 'Mar', value: 15000, color: 'bg-purple-500' },
              { month: 'Apr', value: 22000, color: 'bg-orange-500' },
              { month: 'May', value: 28000, color: 'bg-red-500' },
              { month: 'Jun', value: 35000, color: 'bg-indigo-500' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground w-12">{item.month}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${(item.value / 35000) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-foreground w-16 text-right">
                  ${(item.value / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {t('admin.dashboard.topProducts', 'Top Products')}
          </h2>

          <div className="space-y-4">
            {[
              { name: 'Wireless Headphones Pro', sales: 156, revenue: 46740, image: 'https://picsum.photos/40/40?random=1' },
              { name: 'Gaming Laptop RTX', sales: 89, revenue: 142391, image: 'https://picsum.photos/40/40?random=2' },
              { name: 'Smartphone Ultra 256GB', sales: 67, revenue: 60299, image: 'https://picsum.photos/40/40?random=3' },
              { name: 'Eco-Friendly Yoga Mat', sales: 234, revenue: 14034, image: 'https://picsum.photos/40/40?random=4' },
              { name: 'Cotton T-Shirt Pack', sales: 445, revenue: 22245, image: 'https://picsum.photos/40/40?random=5' }
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    ${product.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {t('admin.dashboard.performance', 'Performance Overview')}
          </h2>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% vs last month
            </Badge>
            <select className="text-xs bg-background border rounded px-2 py-1">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-2xl font-bold text-green-600">98.5%</p>
            <p className="text-sm text-muted-foreground">Uptime</p>
            <p className="text-xs text-green-600">+0.2% vs last month</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            </div>
            <p className="text-2xl font-bold text-blue-600">2.3s</p>
            <p className="text-sm text-muted-foreground">Avg Load Time</p>
            <p className="text-xs text-blue-600">-0.1s vs last month</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
            </div>
            <p className="text-2xl font-bold text-purple-600">73%</p>
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="text-xs text-purple-600">+5% vs last month</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
            </div>
            <p className="text-2xl font-bold text-orange-600">4.8</p>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
            <p className="text-xs text-orange-600">+0.2 vs last month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
