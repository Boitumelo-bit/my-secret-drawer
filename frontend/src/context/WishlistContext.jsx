import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load wishlist from localStorage
  useEffect(() => {
    loadWishlist();
  }, [user]);

  const loadWishlist = () => {
    let saved = [];
    if (isAuthenticated && user) {
      saved = localStorage.getItem(`wishlist_${user.id}`);
    } else {
      saved = localStorage.getItem('wishlist');
    }
    
    if (saved) {
      const items = JSON.parse(saved);
      setWishlistItems(items);
      setWishlistCount(items.length);
    } else {
      setWishlistItems([]);
      setWishlistCount(0);
    }
    setLoading(false);
  };

  const saveWishlist = (items) => {
    if (isAuthenticated && user) {
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(items));
    } else {
      localStorage.setItem('wishlist', JSON.stringify(items));
    }
    setWishlistItems(items);
    setWishlistCount(items.length);
  };

  const addToWishlist = (product) => {
    const exists = wishlistItems.some(item => item.id === product.id);
    
    if (exists) {
      toast.info(`${product.name} is already in your wishlist`);
      return false;
    }
    
    const newWishlist = [...wishlistItems, product];
    saveWishlist(newWishlist);
    toast.success(`${product.name} added to wishlist!`);
    return true;
  };

  const removeFromWishlist = (productId) => {
    const product = wishlistItems.find(item => item.id === productId);
    const newWishlist = wishlistItems.filter(item => item.id !== productId);
    saveWishlist(newWishlist);
    toast.success(`${product?.name || 'Item'} removed from wishlist`);
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      return false;
    } else {
      addToWishlist(product);
      return true;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    saveWishlist([]);
    toast.success('Wishlist cleared');
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      wishlistCount,
      loading,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};