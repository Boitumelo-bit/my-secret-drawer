import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCartIcon, HeartIcon, AdjustmentsHorizontalIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingProduct, setPendingProduct] = useState(null);

  // Use STRING IDs that match your database
  const sampleProducts = [
    { id: "prod_1", name: 'Elegant Silk Dress', price: 1299, category: 'dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', rating: 4.8, isNew: true, isBestSeller: true },
    { id: "prod_2", name: 'Designer Handbag', price: 2499, category: 'handbags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', rating: 4.9, isNew: false, isBestSeller: true },
    { id: "prod_3", name: 'Leather Boots', price: 1899, category: 'shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', rating: 4.7, isNew: false, isBestSeller: false },
    { id: "prod_4", name: 'Statement Necklace', price: 599, category: 'jewellery', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500', rating: 4.6, isNew: true, isBestSeller: false },
    { id: "prod_5", name: 'Luxury Skincare Set', price: 899, category: 'beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500', rating: 4.8, isNew: false, isBestSeller: true },
    { id: "prod_6", name: 'Cashmere Scarf', price: 399, category: 'accessories', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500', rating: 4.5, isNew: true, isBestSeller: false },
    { id: "prod_7", name: 'Evening Gown', price: 3599, category: 'dresses', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500', rating: 4.9, isNew: true, isBestSeller: true },
    { id: "prod_8", name: 'Leather Tote', price: 1899, category: 'handbags', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=500', rating: 4.7, isNew: false, isBestSeller: false },
  ];

  // Fashion categories (all clothing and accessories)
  const fashionCategories = ['dresses', 'handbags', 'shoes', 'jewellery', 'accessories'];
  
  // Beauty categories
  const beautyCategories = ['beauty', 'skincare', 'makeup', 'perfume', 'hair', 'body'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const data = await response.json();
        if (data.success && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(sampleProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts(sampleProducts);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Get filter from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    
    if (categoryParam === 'dresses') {
      setFilter('dresses');
    } else if (categoryParam === 'beauty') {
      setFilter('beauty');
    } else {
      setFilter('all');
    }
  }, [location.search]);

  // Filter products based on selected category
  const getFilteredProducts = () => {
    if (filter === 'all') {
      return products;
    }
    
    // Handle "fashion" as a group of categories
    if (filter === 'fashion') {
      return products.filter(p => fashionCategories.includes(p.category));
    }
    
    // Handle "beauty" as a group of categories
    if (filter === 'beauty') {
      return products.filter(p => beautyCategories.includes(p.category));
    }
    
    // Regular category filter
    return products.filter(p => p.category === filter);
  };

  const filteredProducts = getFilteredProducts();

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'beauty', name: 'Beauty' },
    { id: 'dresses', name: 'Dresses' },
    { id: 'handbags', name: 'Handbags' },
    { id: 'shoes', name: 'Shoes' },
    { id: 'jewellery', name: 'Jewellery' },
    { id: 'accessories', name: 'Accessories' },
  ];

  const addToCart = (product) => {
    if (!isAuthenticated) {
      setPendingAction('cart');
      setPendingProduct(product);
      setShowLoginPrompt(true);
      return;
    }
    addToCartContext(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setPendingAction('wishlist');
      setPendingProduct(product);
      setShowLoginPrompt(true);
      return;
    }
    
    toggleWishlist(product);
    if (isInWishlist(product.id)) {
      toast.success(`${product.name} removed from wishlist`);
    } else {
      toast.success(`${product.name} added to wishlist`);
    }
  };

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
    setPendingAction(null);
    setPendingProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 sm:pt-24">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 sm:pt-24 pb-8 sm:pb-16">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/90 to-secondary/90 text-white p-6 sm:p-10 mb-6 sm:mb-10 text-center">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-playfair font-bold mb-2 sm:mb-3">
              {filter === 'fashion' ? 'Fashion Collection' : filter === 'beauty' ? 'Beauty Collection' : 'Shop Our Collection'}
            </h1>
            <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto px-2">
              {filter === 'fashion' 
                ? 'Discover the latest fashion trends' 
                : filter === 'beauty' 
                  ? 'Explore our premium beauty products'
                  : 'Discover luxury fashion and beauty curated for the modern woman'}
            </p>
          </div>
        </div>

        {/* Filter Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-200 rounded-full text-xs sm:text-sm"
            >
              <AdjustmentsHorizontalIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Filter</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 hidden md:block">{filteredProducts.length} products found</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-darkPlum">Categories</h3>
              <div className="space-y-1.5 sm:space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 text-sm sm:text-base ${
                      filter === cat.id 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                    {filter === cat.id && (
                      <span className="ml-2 w-1.5 h-1.5 bg-primary rounded-full inline-block"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Filters Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setShowFilters(false)}>
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-5 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-darkPlum">Categories</h3>
                  <button onClick={() => setShowFilters(false)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    ✕
                  </button>
                </div>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setFilter(cat.id); setShowFilters(false); }}
                      className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base ${
                        filter === cat.id ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                >
                  <div className="relative overflow-hidden">
                    <Link to={`/product/${product.id}`}>
                      <img 
                        src={product.image || product.images?.[0]} 
                        alt={product.name}
                        className="w-full h-56 sm:h-64 md:h-72 object-cover group-hover:scale-110 transition duration-700"
                      />
                    </Link>
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1.5 sm:gap-2">
                      {product.isNew && (
                        <span className="bg-primary/90 backdrop-blur-sm text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold">New</span>
                      )}
                      {product.isBestSeller && (
                        <span className="bg-amber-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold">Best Seller</span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => handleWishlistToggle(product, e)}
                      className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${
                        isAuthenticated && isInWishlist(product.id) 
                          ? 'bg-primary text-white' 
                          : 'bg-white/90 backdrop-blur-sm hover:bg-primary hover:text-white'
                      }`}
                    >
                      <HeartIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isAuthenticated && isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="p-3 sm:p-5">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-sm sm:text-lg font-playfair font-semibold text-darkPlum mb-1 hover:text-primary transition line-clamp-1">{product.name}</h3>
                    </Link>
                    <div className="flex items-center mb-2 sm:mb-3">
                      <div className="flex text-amber-400 text-xs sm:text-sm">
                        {'★'.repeat(Math.floor(product.rating || 4.5))}
                        {'☆'.repeat(5 - Math.floor(product.rating || 4.5))}
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-400 ml-1.5 sm:ml-2">({product.rating || 4.5})</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 sm:mt-3">
                      <div>
                        <span className="text-lg sm:text-2xl font-bold text-primary">LSL {product.price}</span>
                      </div>
                      <button 
                        onClick={() => addToCart(product)}
                        className="flex items-center space-x-1 sm:space-x-1.5 bg-primary/10 text-primary px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                      >
                        <ShoppingCartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 sm:py-16">
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
                <h3 className="text-lg sm:text-xl font-semibold text-darkPlum mb-2">No products found</h3>
                <p className="text-gray-500 text-sm sm:text-base">Try adjusting your filter</p>
                <button onClick={() => setFilter('all')} className="btn-primary mt-4 px-5 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm">View All</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl animate-scale-up">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-7 h-7 sm:w-8 sm:h-8 text-pink-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-darkPlum mb-2">Sign In Required</h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-5 sm:mb-6">
                Please sign in to {pendingAction === 'cart' ? 'add items to your cart' : 'add items to your wishlist'}.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  to="/login" 
                  className="flex-1 bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-center text-sm"
                  onClick={closeLoginPrompt}
                >
                  Sign In
                </Link>
                <button 
                  onClick={closeLoginPrompt}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;