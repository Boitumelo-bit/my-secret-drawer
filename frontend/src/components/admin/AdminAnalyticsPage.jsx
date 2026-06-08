import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminAnalyticsPage = () => {
  const { token, user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
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
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const summaryCards = [
    { 
      title: 'Total Revenue', 
      value: formatCurrency(analytics?.summary?.totalRevenue), 
      icon: CurrencyDollarIcon, 
      color: 'bg-green-500',
      trend: '+12.5%',
      trendUp: true
    },
    { 
      title: 'Total Orders', 
      value: formatNumber(analytics?.summary?.totalOrders), 
      icon: ShoppingBagIcon, 
      color: 'bg-pink-500',
      trend: '+8.2%',
      trendUp: true
    },
    { 
      title: 'Total Customers', 
      value: formatNumber(analytics?.summary?.totalCustomers), 
      icon: UsersIcon, 
      color: 'bg-blue-500',
      trend: '+15.3%',
      trendUp: true
    },
    { 
      title: 'Total Products', 
      value: formatNumber(analytics?.summary?.totalProducts), 
      icon: CubeIcon, 
      color: 'bg-purple-500',
      trend: '+3.1%',
      trendUp: true
    },
    { 
      title: 'Avg Order Value', 
      value: formatCurrency(analytics?.summary?.averageOrderValue), 
      icon: ArrowTrendingUpIcon, 
      color: 'bg-indigo-500',
      trend: '+5.7%',
      trendUp: true
    },
    { 
      title: 'Conversion Rate', 
      value: `${analytics?.summary?.conversionRate || 0}%`, 
      icon: ChartBarIcon, 
      color: 'bg-teal-500',
      trend: '+2.1%',
      trendUp: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container mx-auto px-3 md:px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ChartBarIcon className="w-6 h-6 md:w-8 md:h-8 text-pink-500" />
              <h1 className="text-2xl md:text-3xl font-playfair font-bold text-gray-800">Analytics & Reports</h1>
            </div>
            <p className="text-sm text-gray-500">Complete overview of your store's performance</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
          {summaryCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-[10px] md:text-xs mb-0.5">{card.title}</p>
                  <p className="text-sm md:text-lg font-bold text-gray-800">{card.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {card.trendUp ? (
                      <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-[9px] md:text-xs ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {card.trend}
                    </span>
                  </div>
                </div>
                <div className={`${card.color} p-1.5 md:p-2 rounded-full shrink-0`}>
                  <card.icon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 md:gap-2 mb-6 border-b overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium text-sm md:text-base transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium text-sm md:text-base transition-colors whitespace-nowrap ${
              activeTab === 'revenue'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium text-sm md:text-base transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium text-sm md:text-base transition-colors whitespace-nowrap ${
              activeTab === 'products'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium text-sm md:text-base transition-colors whitespace-nowrap ${
              activeTab === 'customers'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Customers
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
                <p className="text-gray-500 text-sm">Weekly Revenue</p>
                <p className="text-xl md:text-2xl font-bold text-pink-600">{formatCurrency(analytics?.summary?.weeklyRevenue)}</p>
                <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
                <p className="text-gray-500 text-sm">Monthly Revenue</p>
                <p className="text-xl md:text-2xl font-bold text-pink-600">{formatCurrency(analytics?.summary?.monthlyRevenue)}</p>
                <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
                <p className="text-gray-500 text-sm">Yearly Revenue</p>
                <p className="text-xl md:text-2xl font-bold text-pink-600">{formatCurrency(analytics?.summary?.yearlyRevenue)}</p>
                <p className="text-xs text-gray-400 mt-1">Last 365 days</p>
              </div>
            </div>

            {/* Orders by Status */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h2 className="text-base md:text-lg font-semibold mb-4">Order Status Distribution</h2>
              <div className="space-y-3">
                {analytics?.ordersByStatus && Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{status}</span>
                      <span className="font-medium">{formatNumber(count)} orders</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
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

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b">
                <h2 className="text-base md:text-lg font-semibold">Top Selling Products</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-xs md:text-sm">
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left font-medium text-gray-500">Product</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left font-medium text-gray-500">Units Sold</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left font-medium text-gray-500">Revenue</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left font-medium text-gray-500">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analytics?.topProducts?.slice(0, 5).map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-3 md:px-6 py-2 md:py-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt="" className="w-8 h-8 md:w-10 md:h-10 object-cover rounded" />
                            ) : (
                              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded flex items-center justify-center">
                                <CubeIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                              </div>
                            )}
                            <span className="text-xs md:text-sm font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm font-semibold">{formatNumber(product.total_sold)}</td>
                        <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm font-semibold text-pink-600">{formatCurrency(product.total_revenue)}</td>
                        <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">
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
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <h3 className="font-semibold mb-2">Total Revenue</h3>
                <p className="text-2xl md:text-3xl font-bold text-pink-600">{formatCurrency(analytics?.summary?.totalRevenue)}</p>
                <p className="text-sm text-gray-500 mt-2">All time revenue</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <h3 className="font-semibold mb-2">Average Order Value</h3>
                <p className="text-2xl md:text-3xl font-bold text-pink-600">{formatCurrency(analytics?.summary?.averageOrderValue)}</p>
                <p className="text-sm text-gray-500 mt-2">Per order average</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h3 className="font-semibold mb-4">Revenue Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Weekly Revenue</span>
                    <span className="font-semibold">{formatCurrency(analytics?.summary?.weeklyRevenue)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(analytics?.summary?.weeklyRevenue / analytics?.summary?.yearlyRevenue) * 100 || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monthly Revenue</span>
                    <span className="font-semibold">{formatCurrency(analytics?.summary?.monthlyRevenue)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-purple-500" style={{ width: `${(analytics?.summary?.monthlyRevenue / analytics?.summary?.yearlyRevenue) * 100 || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b">
              <h2 className="text-base md:text-lg font-semibold">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs md:text-sm">
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left font-medium text-gray-500">Order #</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left font-medium text-gray-500">Customer</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left font-medium text-gray-500">Total</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics?.recentOrders?.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm font-medium">{order.orderNumber?.slice(-8)}</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-gray-600">{order.user?.name || 'Guest'}</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm font-semibold text-pink-600">{formatCurrency(order.total)}</td>
                      <td className="px-3 md:px-6 py-2 md:py-4">
                        <span className={`px-1.5 md:px-2 py-0.5 text-[9px] md:text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs text-gray-600">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b">
              <h2 className="text-base md:text-lg font-semibold">Sales by Category</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs md:text-sm">
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left font-medium text-gray-500">Category</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left font-medium text-gray-500">Items Sold</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left font-medium text-gray-500">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics?.salesByCategory?.map((category) => (
                    <tr key={category.category} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm font-medium capitalize">{category.category}</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">{formatNumber(category.items_sold)}</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm font-semibold text-pink-600">{formatCurrency(category.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold mb-4">Customer Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Customers</p>
                <p className="text-2xl md:text-3xl font-bold text-pink-600">{formatNumber(analytics?.summary?.totalCustomers)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Average Order Value</p>
                <p className="text-2xl md:text-3xl font-bold text-pink-600">{formatCurrency(analytics?.summary?.averageOrderValue)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Conversion Rate</p>
                <p className="text-2xl md:text-3xl font-bold text-pink-600">{analytics?.summary?.conversionRate || 0}%</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Low Stock Products</p>
                <p className="text-2xl md:text-3xl font-bold text-orange-600">{formatNumber(analytics?.summary?.lowStockProducts)}</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">💡 Pro Tip: Send personalized offers to high-value customers to increase retention.</p>
            </div>
          </div>
        )}

        {/* Low Stock Alert */}
        {(analytics?.summary?.lowStockProducts > 0 || analytics?.summary?.outOfStockProducts > 0) && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">Inventory Alert</p>
                <p className="text-sm text-yellow-700">
                  {analytics?.summary?.lowStockProducts > 0 && `${analytics.summary.lowStockProducts} products are running low on stock. `}
                  {analytics?.summary?.outOfStockProducts > 0 && `${analytics.summary.outOfStockProducts} products are out of stock.`}
                  <Link to="/admin/products" className="text-pink-600 font-semibold ml-2 hover:underline">
                    Update Inventory →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;