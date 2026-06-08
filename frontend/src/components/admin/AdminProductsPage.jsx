import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  CubeIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AdminProductsPage = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStockBadge = (stock) => {
    if (stock <= 0) {
      return { color: 'bg-red-100 text-red-700', icon: XCircleIcon, label: 'Out of Stock' };
    } else if (stock < 10) {
      return { color: 'bg-yellow-100 text-yellow-700', icon: XCircleIcon, label: 'Low Stock' };
    } else {
      return { color: 'bg-green-100 text-green-700', icon: CheckCircleIcon, label: 'In Stock' };
    }
  };

  const getStats = () => {
    const total = products.length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const inStock = products.filter(p => p.stock > 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    return { total, lowStock, outOfStock, inStock, totalValue };
  };

  const stats = getStats();

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10">
        <div className="container mx-auto px-3">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-pink-500"></div>
            <p className="mt-3 text-gray-500 text-sm">Loading products...</p>
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
              onClick={fetchProducts}
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
              <CubeIcon className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
              <h1 className="text-xl md:text-3xl font-playfair font-bold text-gray-800">Manage Products</h1>
            </div>
            <p className="text-xs md:text-sm text-gray-500">View and manage all products in your store</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={fetchProducts}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm flex-1 sm:flex-none justify-center"
            >
              <ArrowPathIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => alert('Add Product feature coming soon!')}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm flex-1 sm:flex-none justify-center"
            >
              <PlusIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Mobile optimized */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-5 md:mb-6">
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">In Stock</p>
            <p className="text-lg md:text-2xl font-bold text-green-600">{stats.inStock}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Low Stock</p>
            <p className="text-lg md:text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Out</p>
            <p className="text-lg md:text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm col-span-2 md:col-span-1">
            <p className="text-xs text-gray-500">Inventory Value</p>
            <p className="text-xs md:text-sm font-bold text-teal-600 break-words">{formatCurrency(stats.totalValue)}</p>
          </div>
        </div>

        {/* Search and Filter - Mobile optimized */}
        <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-5 md:mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table - Mobile optimized */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-xs md:text-sm text-gray-500">
                  <th className="px-3 md:px-6 py-2 md:py-3">Product</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 hidden sm:table-cell">Price</th>
                  <th className="px-3 md:px-6 py-2 md:py-3">Stock</th>
                  <th className="px-3 md:px-6 py-2 md:py-3">Status</th>
                  <th className="px-3 md:px-6 py-2 md:py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const stockInfo = getStockBadge(product.stock);
                    const StockIcon = stockInfo.icon;
                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            {product.images && product.images[0] ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-10 h-10 md:w-12 md:h-12 object-cover rounded shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded flex items-center justify-center shrink-0">
                                <CubeIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-800 text-sm md:text-base truncate">{product.name}</p>
                              <p className="text-xs text-gray-500 truncate">{product.category || 'Uncategorized'}</p>
                              {/* Price shown on mobile */}
                              <p className="text-xs font-semibold text-gray-700 sm:hidden mt-1">{formatCurrency(product.price)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-800 hidden sm:table-cell">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className="font-medium text-sm">{product.stock}</span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs rounded-full ${stockInfo.color}`}>
                            <StockIcon className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            <span className="hidden sm:inline">{stockInfo.label}</span>
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-1 md:gap-2">
                            <button
                              onClick={() => alert(`View Product: ${product.name}`)}
                              className="text-blue-600 hover:text-blue-800 p-1 active:scale-90 transition-transform"
                            >
                              <EyeIcon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                            </button>
                            <button
                              onClick={() => alert(`Edit Product: ${product.name}`)}
                              className="text-yellow-600 hover:text-yellow-800 p-1 active:scale-90 transition-transform"
                            >
                              <PencilIcon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                            </button>
                            <button
                              onClick={() => alert(`Delete Product: ${product.name}`)}
                              className="text-red-600 hover:text-red-800 p-1 active:scale-90 transition-transform"
                            >
                              <TrashIcon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 md:px-6 py-8 md:py-12 text-center text-gray-500 text-sm">
                      No products found
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

export default AdminProductsPage;