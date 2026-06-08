import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const { user, isAuthenticated, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load orders from API when user logs in
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Fetch orders from backend API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Transform API orders to match frontend format
        const formattedOrders = data.orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          date: order.createdAt,
          status: order.status.toLowerCase(),
          items: order.items?.map(item => ({
            id: item.productId,
            name: item.product?.name || 'Product',
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.product?.images?.[0] || 'https://via.placeholder.com/100'
          })) || [],
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          tax: order.tax,
          total: order.total,
          deliveryMethod: order.deliveryMethod,
          paymentMethod: order.paymentMethod,
          trackingNumber: order.trackingNumber,
          status: order.status.toLowerCase()
        }));
        setOrders(formattedOrders);
      } else {
        console.error('Failed to fetch orders:', data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Place order using API
  const placeOrder = async (orderData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderData.items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color
          })),
          subtotal: orderData.subtotal,
          shippingFee: orderData.shippingFee,
          tax: orderData.tax,
          total: orderData.total,
          deliveryMethod: orderData.deliveryMethod,
          paymentMethod: orderData.paymentMethod,
          shippingAddress: orderData.shippingAddress
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Order #${data.order.orderNumber} placed successfully!`);
        // Refresh orders list
        await fetchOrders();
        return data.order;
      } else {
        toast.error(data.message || 'Failed to place order');
        return null;
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
      return null;
    }
  };

  // Get order by number from API
  const getOrderByNumber = async (orderNumber) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/track/${orderNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const order = data.order;
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          date: order.createdAt,
          status: order.status.toLowerCase(),
          items: order.items?.map(item => ({
            id: item.productId,
            name: item.product?.name || 'Product',
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.product?.images?.[0] || 'https://via.placeholder.com/100'
          })) || [],
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          tax: order.tax,
          total: order.total,
          deliveryMethod: order.deliveryMethod,
          paymentMethod: order.paymentMethod,
          shippingAddress: order.shippingAddress,
          trackingNumber: order.trackingNumber,
          status: order.status.toLowerCase()
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  };

  // For backward compatibility - find in local state
  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  const updateOrderStatus = (orderId, newStatus, trackingNumber = null) => {
    // This would need an API endpoint - for now, update local state
    const updatedOrders = orders.map(order =>
      order.id === orderId 
        ? { ...order, status: newStatus, trackingNumber: trackingNumber || order.trackingNumber }
        : order
    );
    setOrders(updatedOrders);
    toast.success(`Order status updated to ${newStatus}`);
  };

  const cancelOrder = (orderId) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    );
    setOrders(updatedOrders);
    toast.success('Order cancelled successfully');
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      placeOrder,
      updateOrderStatus,
      getOrderById,
      getOrderByNumber,
      cancelOrder,
      fetchOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
};