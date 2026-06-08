import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  TagIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EmployeeSalesPage = () => {
  const { user, token } = useAuth();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('active');
  
  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get current datetime for default values
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getFutureDateTime = (daysToAdd) => {
    const future = new Date();
    future.setDate(future.getDate() + daysToAdd);
    const year = future.getFullYear();
    const month = String(future.getMonth() + 1).padStart(2, '0');
    const day = String(future.getDate()).padStart(2, '0');
    const hours = String(future.getHours()).padStart(2, '0');
    const minutes = String(future.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: getCurrentDateTime(),
    endDate: getFutureDateTime(7),
    selectedProducts: [],
    applyToAll: false
  });

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSales(data.sales);
      }
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate >= endDate) {
        toast.error('End date must be after start date');
        setSubmitting(false);
        return;
      }
      
      if (formData.discountValue <= 0 || formData.discountValue > (formData.discountType === 'percentage' ? 70 : 10000)) {
        toast.error(formData.discountType === 'percentage' ? 'Discount must be between 1-70%' : 'Discount must be between 1-10000');
        setSubmitting(false);
        return;
      }
      
      const url = editingSale 
        ? `${import.meta.env.VITE_API_URL}/api/sales/${editingSale.id}`
        : `${import.meta.env.VITE_API_URL}/api/sales`;
      
      const method = editingSale ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          startDate: formData.startDate,
          endDate: formData.endDate,
          applyToAll: formData.applyToAll,
          selectedProducts: formData.selectedProducts
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(editingSale ? 'Sale updated successfully' : 'Sale created successfully');
        setShowModal(false);
        resetForm();
        fetchSales();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving sale:', error);
      toast.error('Failed to save sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (saleId, saleName) => {
    if (window.confirm(`Are you sure you want to delete "${saleName}"?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales/${saleId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          toast.success('Sale deleted successfully');
          fetchSales();
        } else {
          toast.error(data.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Error deleting sale:', error);
        toast.error('Failed to delete sale');
      }
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      name: sale.name,
      description: sale.description || '',
      discountType: sale.discountType,
      discountValue: sale.discountValue,
      startDate: formatDateForInput(sale.startDate),
      endDate: formatDateForInput(sale.endDate),
      selectedProducts: sale.selectedProducts || [],
      applyToAll: sale.applyToAll || false
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingSale(null);
    setFormData({
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      startDate: getCurrentDateTime(),
      endDate: getFutureDateTime(7),
      selectedProducts: [],
      applyToAll: false
    });
  };

  const toggleProductSelection = (productId) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter(id => id !== productId)
        : [...prev.selectedProducts, productId]
    }));
  };

  const getSaleStatus = (sale) => {
    const now = new Date();
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);
    
    if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800', icon: ClockIcon };
    if (now > end) return { label: 'Expired', color: 'bg-gray-100 text-gray-800', icon: XMarkIcon };
    return { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon };
  };

  const getFilteredSales = () => {
    const now = new Date();
    return sales.filter(sale => {
      const start = new Date(sale.startDate);
      const end = new Date(sale.endDate);
      
      if (filter === 'active') return now >= start && now <= end;
      if (filter === 'upcoming') return now < start;
      if (filter === 'expired') return now > end;
      return true;
    });
  };

  const filteredSales = getFilteredSales();
  
  const stats = {
    active: sales.filter(s => {
      const now = new Date();
      const start = new Date(s.startDate);
      const end = new Date(s.endDate);
      return now >= start && now <= end;
    }).length,
    upcoming: sales.filter(s => new Date(s.startDate) > new Date()).length,
    expired: sales.filter(s => new Date(s.endDate) < new Date()).length,
    total: sales.length
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
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum">Sales & Discounts</h1>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={fetchSales}
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-secondary transition text-sm"
            >
              <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Create Sale</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Active Sales</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Upcoming Sales</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.upcoming}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Expired Sales</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-600">{stats.expired}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Total Created</p>
            <p className="text-lg sm:text-2xl font-bold text-primary">{stats.total}</p>
          </div>
        </div>

        {/* Filter Tabs - Horizontal scroll on mobile */}
        <div className="flex gap-1.5 sm:gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setFilter('active')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              filter === 'active' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              filter === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              filter === 'expired' ? 'bg-gray-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Expired
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs sm:text-sm">
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Sale Name</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Discount</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden md:table-cell">Duration</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden lg:table-cell">Products</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSales.map((sale) => {
                  const status = getSaleStatus(sale);
                  const StatusIcon = status.icon;
                  const startDate = new Date(sale.startDate).toLocaleDateString();
                  const endDate = new Date(sale.endDate).toLocaleDateString();
                  
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <div>
                          <p className="font-medium text-xs sm:text-sm">{sale.name}</p>
                          {sale.description && (
                            <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">{sale.description}</p>
                          )}
                        </div>
                       </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 text-primary rounded-full text-[10px] sm:text-sm font-semibold">
                          <TagIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {sale.discountValue}{sale.discountType === 'percentage' ? '%' : ' LSL'}
                        </span>
                       </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                          <span className="whitespace-nowrap">{startDate} - {endDate}</span>
                        </div>
                        </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold ${status.color}`}>
                          <StatusIcon className="w-2 h-2 sm:w-3 sm:h-3" />
                          {status.label}
                        </span>
                        </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm hidden lg:table-cell">
                        {sale.applyToAll ? (
                          <span className="text-primary">All Products</span>
                        ) : (
                          <span>{sale.selectedProducts?.length || 0} product(s)</span>
                        )}
                        </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <div className="flex space-x-1.5 sm:space-x-2">
                          <button
                            onClick={() => handleEdit(sale)}
                            className="text-green-600 hover:text-green-800 transition p-0.5"
                            title="Edit Sale"
                          >
                            <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id, sale.name)}
                            className="text-red-600 hover:text-red-800 transition p-0.5"
                            title="Delete Sale"
                          >
                            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                        </td>
                      </tr>
                  );
                })}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                      No sales found. Click "Create Sale" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold">{editingSale ? 'Edit Sale' : 'Create New Sale'}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sale Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Summer Sale, Black Friday"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional description"
                  rows="2"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type *</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, discountType: 'percentage'})}
                      className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                        formData.discountType === 'percentage'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <TagIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0.5 sm:mr-1" />
                      Percentage
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, discountType: 'fixed'})}
                      className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                        formData.discountType === 'fixed'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <CurrencyDollarIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0.5 sm:mr-1" />
                      Fixed Amount
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {formData.discountType === 'percentage' ? 'Discount % *' : 'Discount Amount (LSL) *'}
                  </label>
                  <input
                    type="number"
                    step={formData.discountType === 'percentage' ? 1 : 0.01}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                  {formData.discountType === 'percentage' && (
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Maximum 70% discount</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Apply To</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      checked={formData.applyToAll}
                      onChange={() => setFormData({...formData, applyToAll: true, selectedProducts: []})}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary"
                    />
                    <span className="text-sm">All Products</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      checked={!formData.applyToAll}
                      onChange={() => setFormData({...formData, applyToAll: false})}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary"
                    />
                    <span className="text-sm">Specific Products</span>
                  </label>
                </div>
              </div>
              
              {!formData.applyToAll && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Products</label>
                  <div className="border rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                    {products.map((product) => (
                      <label key={product.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0"
                        />
                        <img src={product.images?.[0] || '/placeholder.png'} alt="" className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded" />
                        <span className="flex-1 text-xs sm:text-sm truncate">{product.name}</span>
                        <span className="text-[10px] sm:text-xs text-gray-500">LSL {product.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="submit" disabled={submitting} className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 text-sm">
                  {submitting ? 'Saving...' : (editingSale ? 'Update Sale' : 'Create Sale')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSalesPage;