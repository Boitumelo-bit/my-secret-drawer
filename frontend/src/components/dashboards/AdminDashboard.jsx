import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon, 
  UserPlusIcon,
  EyeIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import EmployeeManagement from '../admin/EmployeeManagement';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const { fetchNotifications } = useNotification();
  const [dashboard, setDashboard] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboard();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
    if (activeTab === 'orders') {
      fetchAllOrders();
    }
  }, [activeTab]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setDashboard(data.dashboard);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/audit-logs?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAuditLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoadingAudit(false);
    }
  };

  const fetchAllOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAllOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-ZA', {
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

  const getActionBadge = (action) => {
    if (action.includes('CREATE') || action.includes('REGISTER')) {
      return 'bg-green-100 text-green-700';
    } else if (action.includes('UPDATE') || action.includes('EDIT') || action.includes('PROFILE')) {
      return 'bg-yellow-100 text-yellow-700';
    } else if (action.includes('DELETE') || action.includes('REMOVE')) {
      return 'bg-red-100 text-red-700';
    } else if (action.includes('LOGIN')) {
      return 'bg-blue-100 text-blue-700';
    } else if (action.includes('VIEW')) {
      return 'bg-purple-100 text-purple-700';
    } else {
      return 'bg-gray-100 text-gray-700';
    }
  };

  const getOrderStatusBadge = (status) => {
    switch(status) {
      case 'DELIVERED':
        return { color: 'bg-green-100 text-green-700', icon: CheckCircleIcon, label: 'Delivered' };
      case 'SHIPPED':
        return { color: 'bg-blue-100 text-blue-700', icon: TruckIcon, label: 'Shipped' };
      case 'CANCELLED':
        return { color: 'bg-red-100 text-red-700', icon: XCircleIcon, label: 'Cancelled' };
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon, label: 'Pending' };
      case 'CONFIRMED':
        return { color: 'bg-purple-100 text-purple-700', icon: CheckCircleIcon, label: 'Confirmed' };
      case 'PACKED':
        return { color: 'bg-indigo-100 text-indigo-700', icon: ShoppingBagIcon, label: 'Packed' };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: ClockIcon, label: status };
    }
  };

  const getOrderStats = () => {
    if (!allOrders.length) return { total: 0, pending: 0, shipped: 0, delivered: 0, cancelled: 0, totalRevenue: 0 };
    
    const pending = allOrders.filter(o => o.status === 'PENDING').length;
    const confirmed = allOrders.filter(o => o.status === 'CONFIRMED').length;
    const packed = allOrders.filter(o => o.status === 'PACKED').length;
    const shipped = allOrders.filter(o => o.status === 'SHIPPED').length;
    const delivered = allOrders.filter(o => o.status === 'DELIVERED').length;
    const cancelled = allOrders.filter(o => o.status === 'CANCELLED').length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
    
    return { 
      total: allOrders.length, 
      pending, 
      confirmed,
      packed,
      shipped, 
      delivered, 
      cancelled, 
      totalRevenue 
    };
  };

  const stats = [
    { title: 'Total Users', value: dashboard?.stats?.totalUsers || 0, icon: UsersIcon, color: 'bg-blue-500' },
    { title: 'Customers', value: dashboard?.stats?.totalCustomers || 0, icon: UsersIcon, color: 'bg-green-500' },
    { title: 'Employees', value: dashboard?.stats?.totalEmployees || 0, icon: UserPlusIcon, color: 'bg-purple-500' },
    { title: 'Total Orders', value: dashboard?.stats?.totalOrders || 0, icon: ShoppingBagIcon, color: 'bg-pink-500' },
    { title: 'Total Revenue', value: `LSL ${dashboard?.stats?.totalRevenue?.toLocaleString() || 0}`, icon: CurrencyDollarIcon, color: 'bg-yellow-500' },
    { title: 'Pending Orders', value: dashboard?.stats?.pendingOrders || 0, icon: ExclamationTriangleIcon, color: 'bg-red-500' },
    { title: 'Low Stock', value: dashboard?.stats?.lowStock || 0, icon: ExclamationTriangleIcon, color: 'bg-orange-500' },
  ];

  const orderStats = getOrderStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container mx-auto px-3 md:px-4">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl md:rounded-2xl p-5 md:p-8 mb-6 md:mb-8 text-white">
          <h1 className="text-2xl md:text-3xl font-playfair font-bold mb-1">Admin Dashboard</h1>
          <p className="text-sm md:text-base opacity-90">Welcome, {user?.name}. Full system control.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-500 text-xs md:text-sm mb-0.5 md:mb-1">{stat.title}</p>
                  <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 md:p-3 rounded-full shrink-0 ml-2`}>
                  <stat.icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b flex overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`px-4 md:px-6 py-2.5 md:py-3 font-medium text-sm md:text-base transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`px-4 md:px-6 py-2.5 md:py-3 font-medium text-sm md:text-base transition-colors whitespace-nowrap ${activeTab === 'orders' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('employees')} 
              className={`px-4 md:px-6 py-2.5 md:py-3 font-medium text-sm md:text-base transition-colors whitespace-nowrap ${activeTab === 'employees' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
            >
              Employees
            </button>
            <button 
              onClick={() => setActiveTab('audit')} 
              className={`px-4 md:px-6 py-2.5 md:py-3 font-medium text-sm md:text-base transition-colors whitespace-nowrap ${activeTab === 'audit' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
            >
              Audit Logs
            </button>
          </div>

          <div className="p-4 md:p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Recent Orders</h3>
                <div className="space-y-2 md:space-y-3">
                  {dashboard?.recentOrders?.slice(0, 5).map((order) => (
                    <div key={order.id} className="border rounded-lg p-3 md:p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-sm md:text-base">{order.orderNumber}</p>
                        <p className="text-xs md:text-sm text-gray-500">{order.user?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-500 text-sm md:text-base">{formatCurrency(order.total)}</p>
                        <span className={`text-xs px-2 py-0.5 md:py-1 rounded-full ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {dashboard?.recentOrders?.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No recent orders</p>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base md:text-lg font-semibold">All Orders</h3>
                  <button 
                    onClick={fetchAllOrders}
                    className="text-xs md:text-sm text-pink-500 hover:text-pink-600"
                  >
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="bg-gray-50 rounded-lg p-2 md:p-3 text-center">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg md:text-xl font-bold text-gray-800">{orderStats.total}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-2 md:p-3 text-center">
                    <p className="text-xs text-yellow-600">Pending</p>
                    <p className="text-lg md:text-xl font-bold text-yellow-700">{orderStats.pending}</p>
  </div>
                  <div className="bg-purple-50 rounded-lg p-2 md:p-3 text-center">
                    <p className="text-xs text-purple-600">Confirmed</p>
                    <p className="text-lg md:text-xl font-bold text-purple-700">{orderStats.confirmed}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-2 md:p-3 text-center">
                    <p className="text-xs text-indigo-600">Packed</p>
                    <p className="text-lg md:text-xl font-bold text-indigo-700">{orderStats.packed}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 md:p-3 text-center">
                    <p className="text-xs text-blue-600">Shipped</p>
                    <p className="text-lg md:text-xl font-bold text-blue-700">{orderStats.shipped}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 md:p-3 text-center">
                    <p className="text-xs text-green-600">Delivered</p>
                    <p className="text-lg md:text-xl font-bold text-green-700">{orderStats.delivered}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 md:p-3 text-center">
                    <p className="text-xs text-red-600">Cancelled</p>
                    <p className="text-lg md:text-xl font-bold text-red-700">{orderStats.cancelled}</p>
                  </div>
                </div>

                {loadingOrders ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500 text-sm">Loading orders...</p>
                  </div>
                ) : allOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm md:text-base">
                      <thead className="bg-gray-50 border-b">
                        <tr className="text-left text-xs md:text-sm text-gray-500">
                          <th className="px-2 md:px-4 py-2 md:py-3">Order #</th>
                          <th className="px-2 md:px-4 py-2 md:py-3">Customer</th>
                          <th className="px-2 md:px-4 py-2 md:py-3 hidden sm:table-cell">Date</th>
                          <th className="px-2 md:px-4 py-2 md:py-3">Total</th>
                          <th className="px-2 md:px-4 py-2 md:py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allOrders.slice(0, 10).map((order) => {
                          const statusInfo = getOrderStatusBadge(order.status);
                          const StatusIcon = statusInfo.icon;
                          return (
                            <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="px-2 md:px-4 py-2 md:py-3">
                                <span className="font-mono text-xs md:text-sm">
                                  {order.orderNumber?.slice(-8) || order.id.slice(-8)}
                                </span>
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3">
                                <p className="font-medium text-gray-800 text-xs md:text-sm">{order.user?.name?.split(' ')[0] || 'Guest'}</p>
                                <p className="text-xs text-gray-500 hidden md:block">{order.user?.email}</p>
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-xs text-gray-600 hidden sm:table-cell">
                                {formatDate(order.createdAt).split(',')[0]}
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-800 text-xs md:text-sm">
                                {formatCurrency(order.total)}
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3">
                                <span className={`inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs rounded-full ${statusInfo.color}`}>
                                  <StatusIcon className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                  <span className="hidden sm:inline">{statusInfo.label}</span>
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {allOrders.length > 10 && (
                      <div className="text-center mt-4">
                        <p className="text-xs text-gray-500">Showing 10 of {allOrders.length} orders</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBagIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No orders found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'employees' && <EmployeeManagement />}

            {activeTab === 'audit' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base md:text-lg font-semibold">Recent Audit Logs</h3>
                  <button 
                    onClick={fetchAuditLogs}
                    className="text-xs md:text-sm text-pink-500 hover:text-pink-600"
                  >
                    Refresh
                  </button>
                </div>
                
                {loadingAudit ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500 text-sm">Loading audit logs...</p>
                  </div>
                ) : auditLogs.length > 0 ? (
                  <div className="space-y-2 md:space-y-3">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="border rounded-lg p-3 md:p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <span className={`px-2 py-1 text-[10px] md:text-xs rounded-full self-start ${getActionBadge(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <UsersIcon className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                          <span className="text-gray-600">
                            by {log.user?.name?.split(' ')[0] || 'System'}
                          </span>
                        </div>
                        {log.details && (
                          <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded overflow-x-auto">
                            <pre className="whitespace-pre-wrap text-[10px] md:text-xs">
                              {JSON.stringify(log.details, null, 2).substring(0, 100)}
                              {JSON.stringify(log.details, null, 2).length > 100 && '...'}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <EyeIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No audit logs found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;