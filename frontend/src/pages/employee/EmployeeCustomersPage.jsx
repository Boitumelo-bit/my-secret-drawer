import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  UserIcon,
  ShoppingBagIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EmployeeCustomersPage = () => {
  const { user, token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/admin/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
      } else {
        toast.error(data.message || 'Failed to load customers');
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const customerOrders = data.orders.filter(order => order.userId === customerId);
        return customerOrders;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return [];
    }
  };

  const handleViewDetails = async (customer) => {
    const orders = await fetchCustomerOrders(customer.id);
    setSelectedCustomer({ ...customer, orders });
    setShowDetailsModal(true);
  };

  const getFilteredAndSortedCustomers = () => {
    let filtered = customers.filter(customer => {
      const matchesSearch = 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'email':
          aVal = a.email?.toLowerCase() || '';
          bVal = b.email?.toLowerCase() || '';
          break;
        case 'orders':
          aVal = a._count?.orders || 0;
          bVal = b._count?.orders || 0;
          break;
        case 'joined':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        default:
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const filteredCustomers = getFilteredAndSortedCustomers();

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.isActive).length,
    inactive: customers.filter(c => !c.isActive).length,
    totalOrders: customers.reduce((sum, c) => sum + (c._count?.orders || 0), 0)
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum">Customer Management</h1>
          <button
            onClick={fetchCustomers}
            className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Total Customers</p>
                <p className="text-lg sm:text-2xl font-bold text-darkPlum">{stats.total}</p>
              </div>
              <div className="bg-primary/10 p-1.5 sm:p-3 rounded-full">
                <UserIcon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Active Customers</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="bg-green-100 p-1.5 sm:p-3 rounded-full">
                <UserIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Total Orders</p>
                <p className="text-lg sm:text-2xl font-bold text-primary">{stats.totalOrders}</p>
              </div>
              <div className="bg-primary/10 p-1.5 sm:p-3 rounded-full">
                <ShoppingBagIcon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Inactive</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <div className="bg-red-100 p-1.5 sm:p-3 rounded-full">
                <UserIcon className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-full sm:max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs sm:text-sm">
                  <th 
                    className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700 whitespace-nowrap"
                    onClick={() => handleSort('name')}
                  >
                    Customer {getSortIcon('name')}
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700 hidden sm:table-cell"
                    onClick={() => handleSort('email')}
                  >
                    Contact {getSortIcon('email')}
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700 whitespace-nowrap"
                    onClick={() => handleSort('orders')}
                  >
                    Orders {getSortIcon('orders')}
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700 hidden md:table-cell"
                    onClick={() => handleSort('joined')}
                  >
                    Joined {getSortIcon('joined')}
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden lg:table-cell">Status</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-xs sm:text-sm line-clamp-1 max-w-[120px] sm:max-w-none">{customer.name}</p>
                          <p className="text-[9px] sm:text-xs text-gray-500">ID: {customer.id.slice(0, 6)}...</p>
                          <div className="sm:hidden mt-1">
                            <p className="text-[10px] text-gray-600">{customer.email}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 hidden sm:table-cell">
                      <p className="text-xs sm:text-sm">{customer.email}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{customer.phone || 'No phone'}</p>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-center">
                      <span className="font-semibold text-primary text-xs sm:text-sm">{customer._count?.orders || 0}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs text-gray-600 hidden md:table-cell">{formatDate(customer.createdAt)}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 hidden lg:table-cell">
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <button
                        onClick={() => handleViewDetails(customer)}
                        className="text-primary hover:text-secondary transition flex items-center gap-0.5 sm:gap-1"
                        title="View Details"
                      >
                        <EyeIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                        <span className="text-[10px] sm:text-sm">View</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Customer Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                ✕
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-base sm:text-lg">{selectedCustomer.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-500">Customer since {formatDate(selectedCustomer.createdAt)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <EnvelopeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="break-all">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <PhoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  <span>{selectedCustomer.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  <span>Last Login: {selectedCustomer.lastLogin ? formatDate(selectedCustomer.lastLogin) : 'Never'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <ChartBarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  <span>Total Orders: {selectedCustomer._count?.orders || 0}</span>
                </div>
              </div>
            </div>

            {/* Order History */}
            <h4 className="font-semibold text-sm sm:text-base mb-3">Order History</h4>
            {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
              <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                {selectedCustomer.orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <p className="font-medium text-sm">{order.orderNumber}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-primary text-sm">LSL {order.total}</p>
                        <span className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500 bg-gray-50 rounded-lg">
                <ShoppingBagIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-xs sm:text-sm">No orders yet</p>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-secondary transition text-sm"
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

export default EmployeeCustomersPage;