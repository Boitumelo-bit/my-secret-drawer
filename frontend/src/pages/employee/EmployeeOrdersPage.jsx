import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBagIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EmployeeOrdersPage = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, trackingNum = null) => {
    setUpdating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          trackingNumber: trackingNum || trackingNumber
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
        setShowModal(false);
        setTrackingNumber('');
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pending' },
      'CONFIRMED': { color: 'bg-blue-100 text-blue-800', icon: ArrowPathIcon, label: 'Confirmed' },
      'PACKED': { color: 'bg-purple-100 text-purple-800', icon: ShoppingBagIcon, label: 'Packed' },
      'SHIPPED': { color: 'bg-indigo-100 text-indigo-800', icon: TruckIcon, label: 'Shipped' },
      'DELIVERED': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Delivered' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Cancelled' }
    };
    const info = statusMap[status] || statusMap['PENDING'];
    const Icon = info.icon;
    return (
      <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-semibold ${info.color}`}>
        <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
        {info.label}
      </span>
    );
  };

  const getNextStatuses = (currentStatus) => {
    const workflow = {
      'PENDING': [{ status: 'CONFIRMED', label: 'Confirm Order' }],
      'CONFIRMED': [{ status: 'PACKED', label: 'Mark as Packed' }],
      'PACKED': [{ status: 'SHIPPED', label: 'Mark as Shipped' }],
      'SHIPPED': [{ status: 'DELIVERED', label: 'Mark as Delivered' }],
    };
    return workflow[currentStatus] || [];
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const statusCounts = {
    all: orders.length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    CONFIRMED: orders.filter(o => o.status === 'CONFIRMED').length,
    PACKED: orders.filter(o => o.status === 'PACKED').length,
    SHIPPED: orders.filter(o => o.status === 'SHIPPED').length,
    DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
    CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
  };

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum">Manage Orders</h1>
          <button 
            onClick={fetchOrders}
            className="flex items-center space-x-1.5 sm:space-x-2 text-primary hover:text-secondary transition text-sm"
          >
            <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Status Filters - Horizontal scroll on mobile */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? `All (${statusCounts.all})` : `${status} (${statusCounts[status] || 0})`}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs sm:text-sm">
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Order #</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden sm:table-cell">Customer</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden md:table-cell">Date</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Total</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden lg:table-cell">Tracking</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium">
                      <div>
                        {order.orderNumber?.slice(-8)}
                        <div className="text-[10px] sm:hidden text-gray-500 mt-0.5">{order.user?.name?.split(' ')[0] || 'Guest'}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{order.user?.name || 'Guest'}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-primary">LSL {order.total}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 hidden lg:table-cell">
                      {order.trackingNumber || '-'}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <div className="flex space-x-1.5 sm:space-x-2">
                        <Link 
                          to={`/track-order/${order.orderNumber}`}
                          className="text-primary hover:text-secondary transition p-0.5"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 transition p-0.5"
                            title="Update Status"
                          >
                            <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Update Order Status</h3>
            <p className="text-gray-600 text-sm mb-4">Order: {selectedOrder.orderNumber}</p>
            <p className="text-gray-600 text-sm mb-4">Current Status: {selectedOrder.status}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">New Status</label>
              <div className="space-y-2">
                {getNextStatuses(selectedOrder.status).map((next) => (
                  <button
                    key={next.status}
                    onClick={() => updateOrderStatus(selectedOrder.id, next.status)}
                    disabled={updating}
                    className="w-full py-2 bg-primary text-white rounded-lg hover:bg-secondary transition disabled:opacity-50 text-sm"
                  >
                    {next.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedOrder.status === 'SHIPPED' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => updateOrderStatus(selectedOrder.id, 'CANCELLED')}
                disabled={updating}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 text-sm"
              >
                Cancel Order
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeOrdersPage;