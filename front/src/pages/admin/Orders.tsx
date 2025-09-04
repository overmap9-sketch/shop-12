import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../components/ui/badge';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  MoreVertical,
  Download,
  RefreshCw
} from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export function AdminOrders() {
  const { t } = useTranslation();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'orderNumber' | 'customerName' | 'total' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock order data
        const mockOrders: Order[] = [
          {
            id: '1',
            orderNumber: 'ORD-001',
            customerId: '1',
            customerName: 'John Doe',
            customerEmail: 'john.doe@example.com',
            status: 'processing',
            paymentStatus: 'paid',
            items: [
              {
                id: '1',
                productId: '1',
                productName: 'Wireless Headphones Pro',
                productImage: 'https://picsum.photos/100/100?random=1',
                quantity: 1,
                price: 299.99,
                total: 299.99
              },
              {
                id: '2',
                productId: '2',
                productName: 'Phone Case',
                productImage: 'https://picsum.photos/100/100?random=2',
                quantity: 2,
                price: 19.99,
                total: 39.98
              }
            ],
            subtotal: 339.97,
            tax: 27.20,
            shipping: 9.99,
            total: 377.16,
            shippingAddress: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA'
            },
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T14:20:00Z',
            estimatedDelivery: '2024-01-20T00:00:00Z'
          },
          {
            id: '2',
            orderNumber: 'ORD-002',
            customerId: '2',
            customerName: 'Jane Smith',
            customerEmail: 'jane.smith@example.com',
            status: 'shipped',
            paymentStatus: 'paid',
            items: [
              {
                id: '3',
                productId: '3',
                productName: 'Gaming Laptop RTX',
                productImage: 'https://picsum.photos/100/100?random=3',
                quantity: 1,
                price: 1599.99,
                total: 1599.99
              }
            ],
            subtotal: 1599.99,
            tax: 127.99,
            shipping: 0,
            total: 1727.98,
            shippingAddress: {
              street: '456 Oak Ave',
              city: 'Los Angeles',
              state: 'CA',
              zipCode: '90210',
              country: 'USA'
            },
            createdAt: '2024-01-14T15:45:00Z',
            updatedAt: '2024-01-16T09:30:00Z',
            estimatedDelivery: '2024-01-19T00:00:00Z',
            trackingNumber: 'TRK123456789'
          },
          {
            id: '3',
            orderNumber: 'ORD-003',
            customerId: '3',
            customerName: 'Mike Wilson',
            customerEmail: 'mike.wilson@example.com',
            status: 'pending',
            paymentStatus: 'pending',
            items: [
              {
                id: '4',
                productId: '4',
                productName: 'Cotton T-Shirt Pack',
                productImage: 'https://picsum.photos/100/100?random=4',
                quantity: 3,
                price: 49.99,
                total: 149.97
              }
            ],
            subtotal: 149.97,
            tax: 11.99,
            shipping: 7.99,
            total: 169.95,
            shippingAddress: {
              street: '789 Pine St',
              city: 'Chicago',
              state: 'IL',
              zipCode: '60601',
              country: 'USA'
            },
            createdAt: '2024-01-16T08:15:00Z',
            updatedAt: '2024-01-16T08:15:00Z'
          },
          {
            id: '4',
            orderNumber: 'ORD-004',
            customerId: '4',
            customerName: 'Sarah Johnson',
            customerEmail: 'sarah.johnson@example.com',
            status: 'delivered',
            paymentStatus: 'paid',
            items: [
              {
                id: '5',
                productId: '5',
                productName: 'Eco-Friendly Yoga Mat',
                productImage: 'https://picsum.photos/100/100?random=5',
                quantity: 1,
                price: 59.99,
                total: 59.99
              }
            ],
            subtotal: 59.99,
            tax: 4.80,
            shipping: 5.99,
            total: 70.78,
            shippingAddress: {
              street: '321 Elm St',
              city: 'Seattle',
              state: 'WA',
              zipCode: '98101',
              country: 'USA'
            },
            createdAt: '2024-01-10T12:00:00Z',
            updatedAt: '2024-01-18T16:45:00Z',
            estimatedDelivery: '2024-01-15T00:00:00Z',
            trackingNumber: 'TRK987654321'
          }
        ];
        
        setOrders(mockOrders);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    const matchesPayment = paymentFilter === '' || order.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];
    
    if (sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortBy === 'total') {
      aValue = a.total;
      bValue = b.total;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, label: 'Confirmed' },
      processing: { variant: 'default' as const, icon: Package, label: 'Processing' },
      shipped: { variant: 'default' as const, icon: Truck, label: 'Shipped' },
      delivered: { variant: 'default' as const, icon: CheckCircle, label: 'Delivered' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, label: 'Cancelled' },
      refunded: { variant: 'outline' as const, icon: RefreshCw, label: 'Refunded' }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center">
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentBadge = (paymentStatus: Order['paymentStatus']) => {
    switch (paymentStatus) {
      case 'paid':
        return <Badge variant="default" className="bg-green-600">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
      ));
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const avgOrderValue = totalRevenue / Math.max(totalOrders, 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('admin.orders.title', 'Orders')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('admin.orders.subtitle', 'Manage customer orders and fulfillment')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('admin.orders.export', 'Export')}
          </Button>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('admin.orders.refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
              <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">Ø</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold text-foreground">${avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('admin.orders.searchPlaceholder', 'Search orders...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-md text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-background border rounded-md text-sm"
          >
            <option value="">{t('admin.orders.allStatuses', 'All Statuses')}</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-background border rounded-md text-sm"
          >
            <option value="">{t('admin.orders.allPayments', 'All Payments')}</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-background border rounded-md text-sm"
          >
            <option value="createdAt">{t('admin.orders.sortByDate', 'Date')}</option>
            <option value="orderNumber">{t('admin.orders.sortByNumber', 'Order Number')}</option>
            <option value="customerName">{t('admin.orders.sortByCustomer', 'Customer')}</option>
            <option value="total">{t('admin.orders.sortByTotal', 'Total')}</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-2 bg-background border rounded-md text-sm"
          >
            <option value="desc">{t('admin.orders.sortDesc', 'Descending')}</option>
            <option value="asc">{t('admin.orders.sortAsc', 'Ascending')}</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        {order.orderNumber}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-xs text-muted-foreground">
                          Track: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-foreground">
                          {order.customerName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {order.customerEmail}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4">
                    {getPaymentBadge(order.paymentStatus)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(order.createdAt)}
                    </div>
                    {order.estimatedDelivery && (
                      <div className="text-xs text-muted-foreground">
                        Est: {formatDate(order.estimatedDelivery)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link to={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      {/* Quick Status Update */}
                      {order.status === 'pending' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {order.status === 'processing' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {t('admin.orders.noOrders', 'No orders found')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter || paymentFilter
                ? t('admin.orders.noOrdersFiltered', 'Try adjusting your search or filters')
                : t('admin.orders.noOrdersEmpty', 'No orders have been placed yet')
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
