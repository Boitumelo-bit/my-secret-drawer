import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, ShoppingBagIcon, CubeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GlobalSearch = () => {
  const { token, isAdmin, isEmployee } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openSearch = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSearchPlaceholder = () => {
    if (isAdmin) return 'Search orders by customer, order number, or status...';
    if (isEmployee) return 'Search orders by customer, order number, or status...';
    return 'Search products by name, category, or description...';
  };

  const getResultCountText = () => {
    if (results.length === 0) return '';
    if (isAdmin || isEmployee) {
      return `Found ${results.length} order${results.length !== 1 ? 's' : ''}`;
    }
    return `Found ${results.length} product${results.length !== 1 ? 's' : ''}`;
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={openSearch}
        className="text-[#1A1A1A] hover:text-[#FF1493] transition-all duration-200 p-2 rounded-full hover:bg-pink-50 active:scale-95"
        aria-label="Search"
      >
        <MagnifyingGlassIcon className="w-5 h-5" />
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 animate-fade-in">
          <div 
            ref={searchRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-slide-down"
          >
            {/* Search Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none text-base"
                autoFocus
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {searchTerm.length < 2 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Type at least 2 characters to search
                </div>
              ) : loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                  <p className="mt-2 text-gray-500 text-sm">Searching...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No results found for "{searchTerm}"
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {/* Search info badge */}
                  <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
                    {getResultCountText()}
                  </div>
                  
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      to={result.link}
                      onClick={() => setIsOpen(false)}
                      className="block p-4 hover:bg-pink-50 transition-colors"
                    >
                      <div className="flex gap-3">
                        {/* Product Image */}
                        {result.type === 'product' && (
                          <>
                            {result.image ? (
                              <img 
                                src={result.image} 
                                alt={result.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                <CubeIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Order Icon */}
                        {result.type === 'order' && (
                          <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center">
                            <ShoppingBagIcon className="w-6 h-6 text-purple-600" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                              <p className="font-medium text-gray-800">
                                {result.type === 'product' ? result.title : result.orderNumber}
                              </p>
                              <p className="text-sm text-gray-500">
                                {result.type === 'product' 
                                  ? result.category 
                                  : `${result.customerName} • ${formatDate(result.createdAt)}`}
                              </p>
                            </div>
                            {result.type === 'product' && (
                              <p className="font-semibold text-pink-600 whitespace-nowrap">
                                {result.salePrice ? (
                                  <>
                                    <span className="line-through text-gray-400 text-xs mr-1">
                                      {formatCurrency(result.price)}
                                    </span>
                                    {formatCurrency(result.salePrice)}
                                  </>
                                ) : (
                                  formatCurrency(result.price)
                                )}
                              </p>
                            )}
                            {result.type === 'order' && (
                              <p className="font-semibold text-gray-800 whitespace-nowrap">
                                {formatCurrency(result.total)}
                              </p>
                            )}
                          </div>
                          
                          {result.type === 'product' && result.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                              {result.description}
                            </p>
                          )}
                          
                          {result.type === 'order' && result.status && (
                            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                              result.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                              result.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              result.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {result.status}
                            </span>
                          )}
                          
                          {result.type === 'product' && result.stock !== undefined && (
                            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                              result.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {result.stock > 0 ? `${result.stock} in stock` : 'Out of stock'}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default GlobalSearch;