import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useOrders } from '../../context/OrderContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { ShoppingBagIcon, HeartIcon, MapPinIcon, CreditCardIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const CustomerDashboard = () => {
  const { user, token } = useAuth();
  const { fetchNotifications } = useNotification();
  const { orders, loading: ordersLoading, fetchOrders } = useOrders();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    loadDashboardData();
    fetchNotifications();
    fetchOrders();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch user stats from API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/customer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDashboard(data.dashboard);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
    
    // Calculate from orders
    if (orders.length > 0) {
      const deliveredOrders = orders.filter(o => o.status === 'delivered');
      const spent = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
      setTotalSpent(spent);
      setTotalOrders(orders.length);
      setRecentOrders(orders.slice(0, 5));
    }
    
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'Delivered';
      case 'shipped': return 'Shipped';
      case 'cancelled': return 'Cancelled';
      case 'pending': return 'Pending';
      default: return status || 'Pending';
    }
  };

  const stats = [
    { 
      title: 'Total Orders', 
      value: totalOrders || dashboard?.totalOrders || 0, 
      icon: ShoppingBagIcon, 
      color: 'bg-primary',
      link: '/orders'
    },
    { 
      title: 'Total Spent', 
      value: `LSL ${(totalSpent || dashboard?.totalSpent || 0).toLocaleString()}`, 
      icon: CreditCardIcon, 
      color: 'bg-secondary',
      link: '/orders'
    },
    { 
      title: 'Wishlist', 
      value: wishlistCount || dashboard?.wishlistCount || 0, 
      icon: HeartIcon, 
      color: 'bg-[#FF69B4]',
      link: '/wishlist'
    },
    { 
      title: 'Cart Items', 
      value: cartCount || 0, 
      icon: ShoppingBagIcon, 
      color: 'bg-[#FFB6C1]',
      link: '/cart'
    },
  ];

  if (loading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl sm:rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 text-white">
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold mb-2">Welcome back, {user?.name || 'Customer'}!</h1>
          <p className="text-sm sm:text-base opacity-90">Track your orders, manage your wishlist, and update your profile</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <Link 
              key={index} 
              to={stat.link}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow block group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm mb-1">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-darkPlum">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 sm:p-3 rounded-full group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-semibold text-darkPlum">Recent Orders</h2>
            {recentOrders.length > 0 && (
              <Link to="/orders" className="text-primary text-xs sm:text-sm hover:underline flex items-center gap-1">
                View All <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            )}
          </div>
          <div className="divide-y">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                    <div className="flex-1">
                      <Link to={`/track-order/${order.orderNumber}`}>
                        <p className="font-semibold text-primary text-sm sm:text-base hover:underline">{order.orderNumber}</p>
                      </Link>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Items: {order.items?.length || 0}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-primary text-base sm:text-lg">LSL {order.total?.toFixed(2)}</p>
                      <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full mt-2 ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-3 sm:mt-4 pt-3 border-t flex flex-wrap gap-2 sm:gap-3">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <img 
                            src={item.image || 'https://via.placeholder.com/40'} 
                            alt={item.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                            }}
                          />
                          <div>
                            <p className="text-xs sm:text-sm font-medium line-clamp-1 max-w-[100px] sm:max-w-none">{item.name}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg">
                          <span className="text-[10px] sm:text-xs font-medium">+{order.items.length - 3}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <ShoppingBagIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">No orders yet</p>
                <Link to="/products" className="btn-primary inline-block text-sm sm:text-base">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
          <Link to="/products" className="bg-white rounded-xl shadow-sm p-3 sm:p-4 text-center hover:shadow-md transition group">
            <ShoppingBagIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition" />
            <p className="font-medium text-darkPlum text-xs sm:text-sm">Continue Shopping</p>
          </Link>
          <Link to="/wishlist" className="bg-white rounded-xl shadow-sm p-3 sm:p-4 text-center hover:shadow-md transition group">
            <HeartIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition" />
            <p className="font-medium text-darkPlum text-xs sm:text-sm">My Wishlist</p>
          </Link>
          <Link to="/cart" className="bg-white rounded-xl shadow-sm p-3 sm:p-4 text-center hover:shadow-md transition group">
            <ShoppingBagIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition" />
            <p className="font-medium text-darkPlum text-xs sm:text-sm">My Cart</p>
          </Link>
          <Link to="/account" className="bg-white rounded-xl shadow-sm p-3 sm:p-4 text-center hover:shadow-md transition group">
            <CreditCardIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition" />
            <p className="font-medium text-darkPlum text-xs sm:text-sm">Account Settings</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;