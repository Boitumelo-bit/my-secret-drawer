import React from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { wishlistItems, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemoveItem = (productId, productName) => {
    removeFromWishlist(productId);
  };

  // Helper function to get product image
  const getProductImage = (product) => {
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) return product.images[0];
    return 'https://via.placeholder.com/300x400?text=No+Image';
  };

  if (!wishlistItems) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-8 sm:pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-8 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md mx-auto">
            <HeartIcon className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-playfair font-bold text-darkPlum mb-3 sm:mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">Save your favorite items here!</p>
            <Link to="/products" className="bg-[#FF1493] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-[#FF69B4] transition inline-block text-sm sm:text-base">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum">My Wishlist ({wishlistCount} items)</h1>
          <button 
            onClick={clearWishlist}
            className="text-red-500 text-xs sm:text-sm hover:text-red-700 transition"
          >
            Clear All
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {wishlistItems.map((product) => (
            <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
              <div className="relative overflow-hidden">
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name}
                    className="w-full h-56 sm:h-64 object-cover group-hover:scale-110 transition duration-700"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x400?text=Image+Not+Found';
                    }}
                  />
                </Link>
                <button 
                  onClick={() => handleRemoveItem(product.id, product.name)}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                  <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
              <div className="p-3 sm:p-5">
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-sm sm:text-lg font-playfair font-semibold text-darkPlum mb-1 hover:text-primary transition line-clamp-1">{product.name}</h3>
                </Link>
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="flex text-amber-400 text-[10px] sm:text-sm">
                    {'★'.repeat(Math.floor(product.rating || 4.5))}
                    {'☆'.repeat(5 - Math.floor(product.rating || 4.5))}
                  </div>
                  <span className="text-[9px] sm:text-xs text-gray-400 ml-1 sm:ml-2">({product.rating || 4.5})</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2 sm:mt-3">
                  <div>
                    <span className="text-lg sm:text-2xl font-bold text-primary">LSL {product.price}</span>
                  </div>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center justify-center space-x-1 sm:space-x-1.5 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-primary hover:text-white transition-all duration-300 w-full sm:w-auto"
                  >
                    <ShoppingCartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;