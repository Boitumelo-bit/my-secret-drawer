import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBagIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const AdminOrdersPage = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/admin/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'DELIVERED': 
        return { color: 'bg-green-100 text-green-700', icon: CheckCircleIcon, label: 'Delivered' };
      case 'SHIPPED': 
        return { color: 'bg-blue-100 text-blue-700', icon: TruckIcon, label: 'Shipped' };
      case 'CANCELLED': 
        return { color: 'bg-red-100 text-red-700', icon: XCircleIcon, label: 'Cancelled' };
      case 'PENDING': 
        return { color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon, label: 'Pending' };
      default: 
        return { color: 'bg-gray-100 text-gray-700', icon: ClockIcon, label: status };
    }
  };

  const getStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'PENDING').length;
    const shipped = orders.filter(o => o.status === 'SHIPPED').length;
    const delivered = orders.filter(o => o.status === 'DELIVERED').length;
    const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    return { total, pending, shipped, delivered, cancelled, totalRevenue };
  };

  const stats = getStats();

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user?.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10">
        <div className="container mx-auto px-3">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-pink-500"></div>
            <p className="mt-3 text-gray-500 text-sm">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10">
        <div className="container mx-auto px-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-3 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container mx-auto px-3 md:px-4">
        {/* Header - Mobile optimized */}
        <div className="mb-5 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBagIcon className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
              <h1 className="text-xl md:text-3xl font-playfair font-bold text-gray-800">All Orders</h1>
            </div>
            <p className="text-xs md:text-sm text-gray-500">View and manage all customer orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
          >
            <ArrowPathIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards - Mobile optimized (2x3 grid on mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 mb-5 md:mb-6">
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-lg md:text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Shipped</p>
            <p className="text-lg md:text-2xl font-bold text-blue-600">{stats.shipped}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Delivered</p>
            <p className="text-lg md:text-2xl font-bold text-green-600">{stats.delivered}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Cancelled</p>
            <p className="text-lg md:text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Revenue</p>
            <p className="text-xs md:text-lg font-bold text-teal-600 break-words">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        {/* Search and Filter - Mobile optimized */}
        <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-5 md:mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table - Mobile optimized */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-xs md:text-sm text-gray-500">
                  <th className="px-3 md:px-6 py-2 md:py-3">Order #</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 hidden sm:table-cell">Customer</th>
                  <th className="px-3 md:px-6 py-2 md:py-3">Status</th>
                  <th className="px-3 md:px-6 py-2 md:py-3">Total</th>
                  <th className="px-3 md:px-6 py-2 md:py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const statusInfo = getStatusBadge(order.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div>
                            <span className="font-mono text-xs md:text-sm font-medium">
                              {order.orderNumber?.slice(-8) || order.id.slice(-8)}
                            </span>
                            {/* Customer name shown on mobile */}
                            <p className="text-xs text-gray-500 sm:hidden mt-1">{order.user?.name?.split(' ')[0] || 'Guest'}</p>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{order.user?.name?.split(' ')[0] || 'Guest'}</p>
                            <p className="text-xs text-gray-500">{order.user?.email}</p>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs rounded-full ${statusInfo.color}`}>
                            <StatusIcon className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            <span className="hidden sm:inline">{statusInfo.label}</span>
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-800 text-xs md:text-sm">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <button
                            onClick={() => alert(`Order: ${order.orderNumber}\nCustomer: ${order.user?.name}\nTotal: ${formatCurrency(order.total)}\nStatus: ${order.status}`)}
                            className="text-pink-600 hover:text-pink-800 p-1 active:scale-90 transition-transform"
                          >
                            <EyeIcon className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 md:px-6 py-8 md:py-12 text-center text-gray-500 text-sm">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;