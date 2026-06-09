import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { ShoppingBagIcon, TruckIcon, CheckCircleIcon, ClockIcon, XCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Show loading while checking authentication or fetching orders
  if (authLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 sm:pt-24">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-8 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md mx-auto">
            <ShoppingBagIcon className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-playfair font-bold text-darkPlum mb-3 sm:mb-4">Sign in to View Orders</h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">Please sign in to see your order history</p>
            <Link to="/login" className="bg-[#FF1493] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-[#FF69B4] transition inline-block text-sm sm:text-base">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-8 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md mx-auto">
            <ShoppingBagIcon className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-playfair font-bold text-darkPlum mb-3 sm:mb-4">No Orders Yet</h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">You haven't placed any orders yet.</p>
            <Link to="/products" className="bg-[#FF1493] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-[#FF69B4] transition inline-block text-sm sm:text-base">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case 'shipped': return <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
      case 'cancelled': return <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      default: return <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const openReviewModal = (order, product) => {
    setSelectedOrder(order);
    setSelectedProduct(product);
    setReviewRating(5);
    setReviewTitle('');
    setReviewComment('');
    setShowReviewModal(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    
    setSubmittingReview(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Review submitted! Pending approval.');
        setShowReviewModal(false);
        setSelectedProduct(null);
        setSelectedOrder(null);
      } else {
        toast.error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum mb-6 sm:mb-8">My Orders</h1>
        
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div>
                    <Link to={`/track-order/${order.orderNumber}`}>
                      <h2 className="text-base sm:text-lg font-semibold text-primary hover:underline">{order.orderNumber}</h2>
                    </Link>
                    <p className="text-xs sm:text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    {getStatusIcon(order.status)}
                    <span className={`px-2 py-1 text-[10px] sm:text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 sm:space-x-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg" />
                        <div>
                          <p className="font-medium text-xs sm:text-sm">{item.name}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg">
                        <span className="text-[10px] sm:text-xs font-medium">+{order.items.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Total Amount</p>
                    <p className="text-lg sm:text-xl font-bold text-primary">LSL {order.total.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => {
                          if (order.items.length === 1) {
                            openReviewModal(order, order.items[0]);
                          } else {
                            openReviewModal(order, order.items[0]);
                            toast('You can review other products from the product page', { icon: 'ℹ️' });
                          }
                        }}
                        className="flex-1 sm:flex-none border-2 border-green-500 text-green-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm font-semibold hover:bg-green-500 hover:text-white transition"
                      >
                        Write a Review
                      </button>
                    )}
                    <Link to={`/track-order/${order.orderNumber}`} className="flex-1 sm:flex-none border-2 border-primary text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm font-semibold hover:bg-primary hover:text-white transition text-center">
                      Track Order
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Write a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded" />
                <div>
                  <p className="font-medium text-xs sm:text-sm">{selectedProduct.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Order #{selectedOrder?.orderNumber}</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating *</label>
                <div className="flex gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-xl sm:text-2xl focus:outline-none"
                    >
                      <span className={star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Title (Optional)</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Summarize your experience"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Review *</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" disabled={submittingReview} className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-secondary transition disabled:opacity-50 text-sm sm:text-base">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;