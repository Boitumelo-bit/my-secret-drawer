import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const items = JSON.parse(savedCart);
      setCartItems(items);
      updateCartStats(items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartStats(cartItems);
  }, [cartItems]);

  const updateCartStats = (items) => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + ((item.priceLSL || item.price) * item.quantity), 0);
    setCartCount(count);
    setCartTotal(total);
  };

  const addToCart = (product, size = null, color = null, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => 
        item.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color
      );
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && 
          item.selectedSize === size && 
          item.selectedColor === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { 
        ...product, 
        quantity, 
        selectedSize: size, 
        selectedColor: color 
      }];
    });
  };

  const removeFromCart = (id, size = null, color = null) => {
    setCartItems(prevItems => 
      prevItems.filter(item => 
        !(item.id === id && 
          item.selectedSize === size && 
          item.selectedColor === color)
      )
    );
  };

  const updateQuantity = (id, newQuantity, size = null, color = null) => {
    if (newQuantity < 1) {
      removeFromCart(id, size, color);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id && 
        item.selectedSize === size && 
        item.selectedColor === color
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};