import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EmployeeAnalyticsPage = () => {
  const { user, token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        toast.error(data.message || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `LSL ${amount?.toLocaleString() || 0}`;
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const summaryCards = [
    { title: 'Total Revenue', value: formatCurrency(analytics?.summary?.totalRevenue), icon: CurrencyDollarIcon, color: 'bg-green-500' },
    { title: 'Total Orders', value: formatNumber(analytics?.summary?.totalOrders), icon: ShoppingBagIcon, color: 'bg-primary' },
    { title: 'Total Customers', value: formatNumber(analytics?.summary?.totalCustomers), icon: UsersIcon, color: 'bg-blue-500' },
    { title: 'Total Products', value: formatNumber(analytics?.summary?.totalProducts), icon: CubeIcon, color: 'bg-purple-500' },
    { title: 'Low Stock', value: formatNumber(analytics?.summary?.lowStockProducts), icon: ExclamationTriangleIcon, color: 'bg-yellow-500' },
    { title: 'Out of Stock', value: formatNumber(analytics?.summary?.outOfStockProducts), icon: ExclamationTriangleIcon, color: 'bg-red-500' },
    { title: 'Avg Order Value', value: formatCurrency(analytics?.summary?.averageOrderValue), icon: ArrowTrendingUpIcon, color: 'bg-indigo-500' },
    { title: 'Conversion Rate', value: `${analytics?.summary?.conversionRate || 0}%`, icon: ChartBarIcon, color: 'bg-teal-500' },
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    packed: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum">Store Analytics</h1>
          <button
            onClick={fetchAnalytics}
            className="flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {summaryCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-[10px] sm:text-xs mb-0.5 sm:mb-1">{card.title}</p>
                  <p className="text-base sm:text-xl font-bold text-darkPlum">{card.value}</p>
                </div>
                <div className={`${card.color} p-1.5 sm:p-2 rounded-full`}>
                  <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs - Horizontal scroll on mobile */}
        <div className="flex gap-1 sm:gap-2 mb-6 border-b overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders by Status
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === 'products'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Top Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === 'categories'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Categories
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-5 sm:space-y-6">
            {/* Revenue Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5">
                <p className="text-gray-500 text-[10px] sm:text-sm">Weekly Revenue</p>
                <p className="text-base sm:text-2xl font-bold text-primary">{formatCurrency(analytics?.summary?.weeklyRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5">
                <p className="text-gray-500 text-[10px] sm:text-sm">Monthly Revenue</p>
                <p className="text-base sm:text-2xl font-bold text-primary">{formatCurrency(analytics?.summary?.monthlyRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5">
                <p className="text-gray-500 text-[10px] sm:text-sm">Yearly Revenue</p>
                <p className="text-base sm:text-2xl font-bold text-primary">{formatCurrency(analytics?.summary?.yearlyRevenue)}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
                <h2 className="text-base sm:text-lg font-semibold">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-xs sm:text-sm">
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Order #</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Customer</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Total</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden sm:table-cell">Status</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden md:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analytics?.recentOrders?.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium">{order.orderNumber?.slice(-8)}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 truncate max-w-[100px] sm:max-w-none">{order.user?.name || 'Guest'}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-primary">{formatCurrency(order.total)}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 hidden sm:table-cell">
                          <span className={`px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-xs rounded-full ${statusColors[order.status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs text-gray-600 hidden md:table-cell">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders by Status Tab */}
        {activeTab === 'orders' && analytics?.ordersByStatus && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Order Status Distribution</h2>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="capitalize">{status}</span>
                    <span className="font-medium">{count} orders</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className={`h-1.5 sm:h-2 rounded-full ${
                        status === 'pending' ? 'bg-yellow-500' :
                        status === 'confirmed' ? 'bg-blue-500' :
                        status === 'packed' ? 'bg-purple-500' :
                        status === 'shipped' ? 'bg-indigo-500' :
                        status === 'delivered' ? 'bg-green-500' :
                        status === 'cancelled' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${(count / (analytics?.summary?.totalOrders || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
              <h2 className="text-base sm:text-lg font-semibold">Best Selling Products</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs sm:text-sm">
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Product</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden sm:table-cell">Price</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Sold</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden lg:table-cell">Revenue</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics?.topProducts?.slice(0, 5).map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt="" className="w-6 h-6 sm:w-10 sm:h-10 object-cover rounded" />
                          <span className="text-xs sm:text-sm font-medium line-clamp-1 max-w-[120px] sm:max-w-none">{product.name}</span>
                        </div>
                       </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm hidden sm:table-cell">{formatCurrency(product.price)}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold">{formatNumber(product.total_sold)}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-primary hidden lg:table-cell">{formatCurrency(product.total_revenue)}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                        <span className={product.stock < 10 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                          {product.stock}
                        </span>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
              <h2 className="text-base sm:text-lg font-semibold">Sales by Category</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs sm:text-sm">
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Category</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Items Sold</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden md:table-cell">Revenue</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics?.salesByCategory?.map((category) => (
                    <tr key={category.category} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-medium text-xs sm:text-sm capitalize truncate max-w-[100px] sm:max-w-none">{category.category}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">{formatNumber(category.items_sold)}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-primary hidden md:table-cell">{formatCurrency(category.revenue)}</td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAnalyticsPage;