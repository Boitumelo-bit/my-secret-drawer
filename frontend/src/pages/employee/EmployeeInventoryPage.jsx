import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowPathIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  PlusIcon,
  MinusIcon,
  TruckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EmployeeInventoryPage = () => {
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('all'); // all, low, out, instock
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // name, stock, price, category
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, newStock) => {
    setUpdating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: newStock })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Stock updated successfully');
        fetchProducts();
        setShowStockModal(false);
        setSelectedProduct(null);
        setStockAdjustment(0);
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    } finally {
      setUpdating(false);
    }
  };

  const handleStockUpdate = () => {
    if (selectedProduct && stockAdjustment !== 0) {
      const newStock = selectedProduct.stock + stockAdjustment;
      if (newStock < 0) {
        toast.error('Stock cannot be negative');
        return;
      }
      updateStock(selectedProduct.id, newStock);
    }
  };

  const handleBulkStockUpdate = async () => {
    const lowStockProducts = products.filter(p => p.stock < 10 && p.stock > 0);
    if (lowStockProducts.length === 0) {
      toast.info('No low stock products found');
      return;
    }
    
    setUpdating(true);
    let updated = 0;
    for (const product of lowStockProducts) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/admin/products/${product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ stock: product.stock + 10 })
        });
        const data = await response.json();
        if (data.success) updated++;
      } catch (error) {
        console.error('Error updating stock:', error);
      }
    }
    toast.success(`Updated ${updated} low stock products`);
    fetchProducts();
    setUpdating(false);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon, severity: 'critical' };
    if (stock < 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon, severity: 'warning' };
    if (stock < 25) return { label: 'Limited Stock', color: 'bg-orange-100 text-orange-800', icon: ClockIcon, severity: 'moderate' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, severity: 'good' };
  };

  const getFilteredAndSortedProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStock === 'low') return matchesSearch && product.stock < 10 && product.stock > 0;
      if (filterStock === 'out') return matchesSearch && product.stock === 0;
      if (filterStock === 'instock') return matchesSearch && product.stock >= 10;
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'stock':
          aVal = a.stock;
          bVal = b.stock;
          break;
        case 'price':
          aVal = a.priceLSL || a.price;
          bVal = b.priceLSL || b.price;
          break;
        case 'category':
          aVal = a.category.toLowerCase();
          bVal = b.category.toLowerCase();
          break;
        default:
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock < 10 && p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    inStock: products.filter(p => p.stock >= 10).length,
    totalValue: products.reduce((sum, p) => sum + ((p.priceLSL || p.price) * p.stock), 0)
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
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum">Inventory Management</h1>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={fetchProducts}
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleBulkStockUpdate}
              disabled={updating}
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm"
            >
              <TruckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Restock Low</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Total Products</p>
            <p className="text-lg sm:text-2xl font-bold text-darkPlum">{stats.total}</p>
          </div>
          <div 
            className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center cursor-pointer hover:shadow-md transition"
            onClick={() => setFilterStock('instock')}
          >
            <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">In Stock</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.inStock}</p>
          </div>
          <div 
            className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center cursor-pointer hover:shadow-md transition"
            onClick={() => setFilterStock('low')}
          >
            <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Low Stock</p>
            <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
          </div>
          <div 
            className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center cursor-pointer hover:shadow-md transition"
            onClick={() => setFilterStock('out')}
          >
            <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Out of Stock</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center col-span-2 sm:col-span-1">
            <p className="text-gray-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1">Inventory Value</p>
            <p className="text-xs sm:text-xl font-bold text-primary">LSL {stats.totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => setFilterStock('all')}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                filterStock === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStock('instock')}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                filterStock === 'instock' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setFilterStock('low')}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                filterStock === 'low' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Low
            </button>
            <button
              onClick={() => setFilterStock('out')}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                filterStock === 'out' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Out
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs sm:text-sm">
                  <th 
                    className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700 whitespace-nowrap"
                    onClick={() => handleSort('name')}
                  >
                    Product {getSortIcon('name')}
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700 hidden sm:table-cell"
                    onClick={() => handleSort('category')}
                  >
                    Category {getSortIcon('category')}
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700 hidden md:table-cell"
                    onClick={() => handleSort('price')}
                  >
                    Price {getSortIcon('price')}
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('stock')}
                  >
                    Stock {getSortIcon('stock')}
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden lg:table-cell">Status</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden xl:table-cell">Total Value</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock);
                  const StatusIcon = status.icon;
                  const productValue = (product.priceLSL || product.price) * product.stock;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img 
                            src={product.images?.[0] || 'https://via.placeholder.com/40'} 
                            alt={product.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg"
                          />
                          <span className="font-medium text-xs sm:text-sm line-clamp-1 max-w-[120px] sm:max-w-none">{product.name}</span>
                        </div>
                        <div className="text-[10px] sm:hidden text-gray-500 mt-1">{product.category}</div>
                        <div className="text-[10px] sm:hidden text-primary mt-0.5">LSL {product.priceLSL || product.price}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{product.category}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-primary hidden md:table-cell">LSL {product.priceLSL || product.price}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <span className={`font-semibold text-xs sm:text-sm ${status.severity === 'critical' ? 'text-red-600' : status.severity === 'warning' ? 'text-yellow-600' : 'text-gray-900'}`}>
                          {product.stock}
                        </span>
                        <div className="sm:hidden mt-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-semibold ${status.color}`}>
                            <StatusIcon className="w-2 h-2 mr-0.5" />
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 hidden lg:table-cell">
                        <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold ${status.color}`}>
                          <StatusIcon className="w-2 h-2 sm:w-3 sm:h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm hidden xl:table-cell">LSL {productValue.toLocaleString()}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setStockAdjustment(0);
                            setShowStockModal(true);
                          }}
                          className="flex items-center space-x-0.5 sm:space-x-1 text-primary hover:text-secondary transition"
                        >
                          <PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="text-[10px] sm:text-sm">Update</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Update Stock Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full mx-4">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Update Stock</h3>
            <p className="text-gray-600 text-sm mb-2">Product: <span className="font-semibold">{selectedProduct.name}</span></p>
            <p className="text-gray-600 text-sm mb-4">Current Stock: <span className="font-semibold text-primary">{selectedProduct.stock}</span></p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Adjustment</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStockAdjustment(stockAdjustment - 1)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-primary hover:bg-primary hover:text-white transition"
                >
                  <MinusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <span className="text-base sm:text-xl font-semibold w-12 sm:w-16 text-center">{stockAdjustment}</span>
                <button
                  onClick={() => setStockAdjustment(stockAdjustment + 1)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-primary hover:bg-primary hover:text-white transition"
                >
                  <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4 p-2.5 sm:p-3 bg-gray-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">New Stock: <span className="font-semibold text-primary">{selectedProduct.stock + stockAdjustment}</span></p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => updateStock(selectedProduct.id, selectedProduct.stock + 10)}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition text-sm"
              >
                +10
              </button>
              <button
                onClick={handleStockUpdate}
                disabled={updating || stockAdjustment === 0}
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 text-sm"
              >
                {updating ? 'Updating...' : 'Update Stock'}
              </button>
              <button
                onClick={() => setShowStockModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeInventoryPage;