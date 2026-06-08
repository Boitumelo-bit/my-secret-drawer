import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cartItems, cartCount, removeFromCart, updateQuantity, loading, fetchCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && cartItems.length === 0 && isAuthenticated) {
      // Just loading state
    }
  }, [loading, cartItems, isAuthenticated]);

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(item.id, newQuantity, item.selectedSize, item.selectedColor, item.cartItemId);
  };

  const handleRemoveItem = (item) => {
    removeFromCart(item.id, item.selectedSize, item.selectedColor, item.cartItemId);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to continue with checkout');
      navigate('/login', { 
        state: { from: '/checkout', message: 'Please sign in to complete your purchase' } 
      });
    } else {
      navigate('/checkout');
    }
  };

  // Helper function to get product image
  const getProductImage = (item) => {
    if (item.image) return item.image;
    if (item.images && item.images.length > 0) return item.images[0];
    return 'https://via.placeholder.com/100?text=No+Image';
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.priceLSL || item.price) * item.quantity, 0);
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 sm:pt-24">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-8 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md mx-auto">
            <div className="text-5xl sm:text-6xl mb-4">🛒</div>
            <h1 className="text-xl sm:text-2xl font-playfair font-bold text-darkPlum mb-3 sm:mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">Looks like you haven't added any items yet.</p>
            <Link to="/products" className="bg-primary text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-secondary transition inline-block text-sm sm:text-base">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum mb-6 sm:mb-8">Shopping Cart ({cartCount} items)</h1>
        
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <div className="lg:flex-[2] order-1 lg:order-none">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.cartItemId || item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                    <img 
                      src={getProductImage(item)} 
                      alt={item.name} 
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl mx-auto sm:mx-0"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                      }}
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-darkPlum text-sm sm:text-base">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Size: {item.selectedSize || 'N/A'} | Color: {item.selectedColor || 'N/A'}
                      </p>
                      <p className="text-primary font-bold mt-1 text-sm sm:text-base">LSL {item.priceLSL || item.price}</p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-end space-x-3 sm:space-x-0 sm:space-y-3">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)} 
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-primary hover:bg-primary hover:text-white transition"
                        >
                          <MinusIcon className="w-3 h-3" />
                        </button>
                        <span className="w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)} 
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-primary hover:bg-primary hover:text-white transition"
                        >
                          <PlusIcon className="w-3 h-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item)} 
                        className="text-red-500 text-xs sm:text-sm hover:text-red-700 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:flex-1 order-2 lg:order-none">
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 sticky top-24">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Subtotal:</span>
                  <span>LSL {subtotal}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Shipping:</span>
                  <span>{shipping === 0 ? 'Free' : `LSL ${shipping}`}</span>
                </div>
                <div className="border-t pt-2 font-bold flex justify-between text-base sm:text-lg">
                  <span>Total:</span>
                  <span className="text-primary">LSL {total}</span>
                </div>
              </div>
              <button 
                onClick={handleCheckout}
                className="bg-primary text-white py-2.5 sm:py-3 rounded-full font-semibold hover:bg-secondary transition block text-center w-full text-sm sm:text-base"
              >
                Proceed to Checkout
              </button>
              <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-4">Free shipping on orders over LSL 1000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;