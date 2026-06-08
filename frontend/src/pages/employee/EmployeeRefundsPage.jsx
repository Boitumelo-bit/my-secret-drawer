import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowPathIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EmployeeRefundsPage = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('eligible');

  useEffect(() => {
    fetchOrders();
    fetchRefunds();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const deliverableOrders = data.orders.filter(order => 
          order.status === 'DELIVERED' || order.status === 'delivered'
        );
        setOrders(deliverableOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const fetchRefunds = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/refunds`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRefunds(data.refunds);
      } else {
        const savedRefunds = localStorage.getItem('refunds');
        if (savedRefunds) {
          setRefunds(JSON.parse(savedRefunds));
        }
      }
    } catch (error) {
      console.error('Failed to fetch refunds:', error);
      const savedRefunds = localStorage.getItem('refunds');
      if (savedRefunds) {
        setRefunds(JSON.parse(savedRefunds));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveRefunds = (updatedRefunds) => {
    localStorage.setItem('refunds', JSON.stringify(updatedRefunds));
    setRefunds(updatedRefunds);
  };

  const processRefund = async (order) => {
    if (!refundReason.trim()) {
      toast.error('Please provide a reason for refund');
      return;
    }
    
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }
    
    if (parseFloat(refundAmount) > order.total) {
      toast.error('Refund amount cannot exceed order total');
      return;
    }
    
    setProcessing(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.user?.name || 'Customer',
          customerEmail: order.user?.email,
          amount: parseFloat(refundAmount),
          reason: refundReason,
          notes: `Processed by ${user?.name}`
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Refund of LSL ${refundAmount} processed successfully`);
        setShowRefundModal(false);
        setSelectedOrder(null);
        setRefundReason('');
        setRefundAmount('');
        fetchRefunds();
        fetchOrders();
      } else {
        const newRefund = {
          id: Date.now().toString(),
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.user?.name || 'Customer',
          customerEmail: order.user?.email,
          amount: parseFloat(refundAmount),
          reason: refundReason,
          status: 'COMPLETED',
          processedBy: user?.name,
          processedAt: new Date().toISOString(),
          originalTotal: order.total,
          items: order.items
        };
        
        const updatedRefunds = [newRefund, ...refunds];
        saveRefunds(updatedRefunds);
        
        toast.success(`Refund of LSL ${refundAmount} processed successfully (saved locally)`);
        setShowRefundModal(false);
        setSelectedOrder(null);
        setRefundReason('');
        setRefundAmount('');
        fetchRefunds();
        fetchOrders();
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      
      const newRefund = {
        id: Date.now().toString(),
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || 'Customer',
        customerEmail: order.user?.email,
        amount: parseFloat(refundAmount),
        reason: refundReason,
        status: 'COMPLETED',
        processedBy: user?.name,
        processedAt: new Date().toISOString(),
        originalTotal: order.total,
        items: order.items
      };
      
      const updatedRefunds = [newRefund, ...refunds];
      saveRefunds(updatedRefunds);
      
      toast.success(`Refund of LSL ${refundAmount} processed successfully (saved locally)`);
      setShowRefundModal(false);
      setSelectedOrder(null);
      setRefundReason('');
      setRefundAmount('');
      fetchRefunds();
      fetchOrders();
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'COMPLETED':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Completed' };
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pending' };
      case 'REJECTED':
        return { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Rejected' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, label: status || 'Unknown' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return `LSL ${amount?.toLocaleString() || 0}`;
  };

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = refund.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          refund.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || refund.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: refunds.length,
    totalAmount: refunds.reduce((sum, r) => sum + (r.amount || 0), 0),
    completed: refunds.filter(r => r.status === 'COMPLETED').length,
    pending: refunds.filter(r => r.status === 'PENDING').length
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
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum">Process Refunds</h1>
          <button
            onClick={() => { fetchOrders(); fetchRefunds(); }}
            className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Total Refunds</p>
                <p className="text-lg sm:text-2xl font-bold text-darkPlum">{stats.total}</p>
              </div>
              <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                <CurrencyDollarIcon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Total Amount Refunded</p>
                <p className="text-sm sm:text-2xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                <CurrencyDollarIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Completed Refunds</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                <CheckCircleIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Eligible Orders</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{orders.length}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                <DocumentTextIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Horizontal scroll on mobile */}
        <div className="flex gap-1 sm:gap-2 mb-6 border-b overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('eligible')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === 'eligible' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Eligible Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === 'history' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Refund History ({refunds.length})
          </button>
        </div>

        {/* Eligible Orders Section */}
        {activeTab === 'eligible' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-gray-50">
              <h2 className="text-base sm:text-lg font-semibold">Eligible Orders for Refund</h2>
              <p className="text-xs sm:text-sm text-gray-500">Delivered orders that can be refunded</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs sm:text-sm">
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Order #</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden sm:table-cell">Customer</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden md:table-cell">Date</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Total</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium">
                        <div>
                          {order.orderNumber?.slice(-8)}
                          <div className="text-[10px] sm:hidden text-gray-500 mt-0.5">{order.user?.name?.split(' ')[0] || 'Guest'}</div>
                        </div>
                       </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{order.user?.name || 'Guest'}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">{formatDate(order.createdAt)}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-primary">{formatCurrency(order.total)}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setRefundAmount(order.total.toString());
                            setShowRefundModal(true);
                          }}
                          className="px-2 sm:px-3 py-1 bg-primary text-white rounded-lg text-[11px] sm:text-sm hover:bg-secondary transition"
                        >
                          Refund
                        </button>
                        </td>
                      </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                        No eligible orders found for refund
                        </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Refunds History Table */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-gray-50">
              <h2 className="text-base sm:text-lg font-semibold">Refund History</h2>
            </div>
            
            {/* Filters */}
            <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order number or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs sm:text-sm">
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Order #</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden sm:table-cell">Customer</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Amount</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden md:table-cell">Reason</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden lg:table-cell">Processed By</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden xl:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRefunds.map((refund) => {
                    const status = getStatusBadge(refund.status);
                    const StatusIcon = status.icon;
                    return (
                      <tr key={refund.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium">{refund.orderNumber?.slice(-8)}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{refund.customerName?.split(' ')[0]}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-primary">{formatCurrency(refund.amount)}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 max-w-[150px] truncate hidden md:table-cell">{refund.reason}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4">
                          <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold ${status.color}`}>
                            <StatusIcon className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 hidden lg:table-cell">{refund.processedBy}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 hidden xl:table-cell">{formatDate(refund.processedAt)}</td>
                       </tr>
                    );
                  })}
                  {filteredRefunds.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                        No refunds found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Process Refund Modal */}
      {showRefundModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Process Refund</h3>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Order Number</p>
                <p className="font-semibold text-sm sm:text-base">{selectedOrder.orderNumber}</p>
              </div>
              
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Customer</p>
                <p className="font-semibold text-sm sm:text-base">{selectedOrder.user?.name || 'Guest'}</p>
              </div>
              
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Original Total</p>
                <p className="font-semibold text-primary text-sm sm:text-base">{formatCurrency(selectedOrder.total)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Refund Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Enter refund amount"
                  required
                />
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Maximum: {formatCurrency(selectedOrder.total)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Refund *</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="e.g., Damaged product, Wrong item sent, Customer request..."
                  required
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm text-yellow-800 font-medium">Important</p>
                    <p className="text-[10px] sm:text-xs text-yellow-700">Refund will be processed immediately. This action cannot be undone.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => processRefund(selectedOrder)}
                  disabled={processing}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 text-sm"
                >
                  {processing ? 'Processing...' : 'Process Refund'}
                </button>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeRefundsPage;