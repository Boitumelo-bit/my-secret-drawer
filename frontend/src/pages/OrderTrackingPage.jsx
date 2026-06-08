import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon, TruckIcon, ShoppingBagIcon, ClipboardIcon, HomeIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const OrderTrackingPage = () => {
  const { orderNumber } = useParams();
  const { getOrderByNumber } = useOrders();
  const { isAuthenticated, isCustomer, isAdmin, isEmployee, token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refundInfo, setRefundInfo] = useState(null);
  const [loadingRefund, setLoadingRefund] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrder = async () => {
      const foundOrder = await getOrderByNumber(orderNumber);
      if (foundOrder) {
        setOrder(foundOrder);
        fetchRefundInfo(foundOrder.id);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderNumber, getOrderByNumber, isAuthenticated, navigate]);

  const fetchRefundInfo = async (orderId) => {
    setLoadingRefund(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/refunds?orderId=${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.refunds && data.refunds.length > 0) {
        setRefundInfo(data.refunds[0]);
      }
    } catch (error) {
      console.error('Failed to fetch refund info:', error);
    } finally {
      setLoadingRefund(false);
    }
  };

  const orderSteps = [
    { key: 'pending', label: 'Order Placed', icon: ClipboardIcon, description: 'Your order has been received' },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircleIcon, description: 'Your order has been confirmed' },
    { key: 'packed', label: 'Packed', icon: ShoppingBagIcon, description: 'Your order is being packed' },
    { key: 'shipped', label: 'Shipped', icon: TruckIcon, description: 'Your order is on the way' },
    { key: 'delivered', label: 'Delivered', icon: HomeIcon, description: 'Your order has been delivered' },
  ];

  const getCurrentStepIndex = () => {
    if (order?.status === 'cancelled') return -1;
    if (order?.status === 'refunded') return -1;
    const statusOrder = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order?.status);
    return currentIndex >= 0 ? currentIndex : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return `LSL ${amount?.toLocaleString() || 0}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 sm:pt-24">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-8 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md mx-auto">
            <ShoppingBagIcon className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-playfair font-bold text-darkPlum mb-3 sm:mb-4">Order Not Found</h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">We couldn't find an order with number #{orderNumber}</p>
            <Link to="/orders" className="bg-[#FF1493] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-[#FF69B4] transition inline-block text-sm sm:text-base">View My Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();
  const isCancelled = order.status === 'cancelled';
  const isRefunded = order.status === 'refunded';

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum mb-2">Track Your Order</h1>
          <p className="text-sm sm:text-base text-gray-500">Order #{order.orderNumber}</p>
        </div>

        {/* Order Status Card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Placed on</p>
              <p className="font-semibold text-sm sm:text-base">{new Date(order.date).toLocaleDateString()}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-500">Total Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">LSL {order.total.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Delivery Address</p>
            <p className="font-medium text-sm sm:text-base">
              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}<br />
              {order.shippingAddress?.address}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
              Phone: {order.shippingAddress?.phone}
            </p>
          </div>
        </div>

        {/* Cancellation/Refund Status Banner */}
        {(isCancelled || isRefunded) && (
          <div className={`rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 ${isCancelled ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
            <div className="flex items-start gap-3">
              <XCircleIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${isCancelled ? 'text-red-500' : 'text-orange-500'} shrink-0`} />
              <div>
                <h3 className={`font-semibold text-base sm:text-lg ${isCancelled ? 'text-red-700' : 'text-orange-700'}`}>
                  {isCancelled ? 'Order Cancelled' : 'Order Refunded'}
                </h3>
                <p className={`text-xs sm:text-sm ${isCancelled ? 'text-red-600' : 'text-orange-600'} mt-1`}>
                  {isCancelled 
                    ? 'This order has been cancelled. No payment was processed.'
                    : 'A refund has been issued for this order.'
                  }
                </p>
                {refundInfo && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-sm font-medium">Refund Details:</p>
                    <p className="text-xs sm:text-sm">Amount: {formatCurrency(refundInfo.amount)}</p>
                    <p className="text-xs sm:text-sm">Reason: {refundInfo.reason}</p>
                    <p className="text-xs sm:text-sm">Processed on: {formatDate(refundInfo.processedAt)}</p>
                    {refundInfo.notes && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Note: {refundInfo.notes}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Order Progress Steps */}
        {!isCancelled && !isRefunded && (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 overflow-x-auto">
            <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Order Progress</h2>
            <div className="relative min-w-[500px] sm:min-w-0">
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200"></div>
              <div className="relative flex justify-between">
                {orderSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  
                  return (
                    <div key={step.key} className="text-center flex-1">
                      <div className={`relative z-10 mx-auto w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <p className={`mt-2 text-[10px] sm:text-sm font-medium ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[9px] sm:text-xs text-gray-500 mt-1 hidden md:block">{step.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pb-4 border-b last:border-0">
                <img src={item.image} alt={item.name} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg mx-auto sm:mx-0" />
                <div className="flex-1 text-center sm:text-left">
                  <Link to={`/product/${item.id}`} className="font-semibold text-sm sm:text-base hover:text-primary transition">
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-500">Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'}</p>
                  <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="text-center sm:text-right w-full sm:w-auto">
                  <p className="font-bold text-primary text-sm sm:text-base">LSL {(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">LSL {item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons - Role Based */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link 
            to={isEmployee ? "/employee/orders" : "/orders"} 
            className="border-2 border-primary text-primary px-4 sm:px-6 py-2 rounded-full font-semibold hover:bg-primary hover:text-white transition text-center text-sm sm:text-base"
          >
            Back to Orders
          </Link>
          
          {(isCustomer || isAdmin) && (
            <Link 
              to="/products" 
              className="bg-primary text-white px-4 sm:px-6 py-2 rounded-full font-semibold hover:bg-secondary transition text-center text-sm sm:text-base"
            >
              Continue Shopping
            </Link>
          )}
          
          {isEmployee && (
            <Link 
              to="/employee/dashboard" 
              className="bg-primary text-white px-4 sm:px-6 py-2 rounded-full font-semibold hover:bg-secondary transition text-center text-sm sm:text-base"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;