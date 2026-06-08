import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBagIcon, 
  CubeIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  StarIcon,
  PhotoIcon,
  TagIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const EmployeeDashboard = () => {
  const { user, token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/employee`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setDashboard(data.dashboard);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      title: 'Pending Orders', 
      value: dashboard?.stats?.pendingOrders || 0, 
      icon: ClockIcon, 
      color: 'bg-yellow-500',
      link: '/employee/orders'
    },
    { 
      title: 'Total Orders', 
      value: dashboard?.stats?.totalOrders || 0, 
      icon: ShoppingBagIcon, 
      color: 'bg-primary',
      link: '/employee/orders'
    },
    { 
      title: 'Low Stock Products', 
      value: dashboard?.stats?.lowStockProducts || 0, 
      icon: ExclamationTriangleIcon, 
      color: 'bg-red-500',
      link: '/employee/inventory'
    },
    { 
      title: 'Products', 
      value: dashboard?.topProducts?.length || 0, 
      icon: CubeIcon, 
      color: 'bg-green-500',
      link: '/employee/products'
    },
  ];

  const quickActions = [
    { title: 'Manage Orders', icon: ShoppingBagIcon, link: '/employee/orders', color: 'bg-primary' },
    { title: 'Manage Products', icon: CubeIcon, link: '/employee/products', color: 'bg-secondary' },
    { title: 'Manage Banners', icon: PhotoIcon, link: '/employee/banners', color: 'bg-purple-500' },
    { title: 'Create Sale', icon: TagIcon, link: '/employee/sales', color: 'bg-orange-500' },
    { title: 'Approve Reviews', icon: StarIcon, link: '/employee/reviews', color: 'bg-pink-500' },
    { title: 'View Customers', icon: UsersIcon, link: '/employee/customers', color: 'bg-teal-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl sm:rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 text-white">
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold mb-2">Employee Dashboard</h1>
          <p className="text-sm sm:text-base opacity-90">Welcome, {user?.name}. Manage orders, products, and inventory.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <Link 
              key={index} 
              to={stat.link}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm mb-1">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-darkPlum">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 sm:p-3 rounded-full group-hover:scale-110 transition`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders & Quick Actions */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Recent Orders */}
          <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
              <h2 className="text-base sm:text-lg font-semibold">Recent Orders</h2>
            </div>
            <div className="divide-y">
              {dashboard?.recentOrders?.slice(0, 5).map((order) => (
                <div key={order.id} className="p-3 sm:p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <p className="font-medium text-sm sm:text-base">{order.orderNumber}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{order.user?.name}</p>
                    </div>
                    <span className={`px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full self-start sm:self-auto ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status || 'PENDING'}
                    </span>
                  </div>
                </div>
              ))}
              {(!dashboard?.recentOrders || dashboard.recentOrders.length === 0) && (
                <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">No recent orders</div>
              )}
            </div>
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t bg-gray-50">
              <Link to="/employee/orders" className="text-primary text-xs sm:text-sm hover:underline flex items-center gap-1">
                View All Orders →
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
              <h2 className="text-base sm:text-lg font-semibold">Quick Actions</h2>
            </div>
            <div className="p-3 sm:p-4 grid grid-cols-2 gap-2 sm:gap-3">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.link}
                  className="flex flex-col items-center p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition group"
                >
                  <div className={`${action.color} p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 group-hover:scale-110 transition`}>
                    <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-[11px] sm:text-sm font-medium text-center">{action.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
            <h2 className="text-base sm:text-lg font-semibold">Best Selling Products</h2>
          </div>
          <div className="divide-y">
            {dashboard?.topProducts?.length > 0 ? (
              dashboard.topProducts.map((product) => (
                <div key={product.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="font-medium text-sm sm:text-base">{product.name}</span>
                  <span className="text-primary font-bold text-sm sm:text-base">{product.total_sold} sold</span>
                </div>
              ))
            ) : (
              <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">No sales data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;