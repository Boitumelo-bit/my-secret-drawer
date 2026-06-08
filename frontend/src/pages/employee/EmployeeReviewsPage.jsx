import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowPathIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  EyeIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EmployeeReviewsPage = () => {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      } else {
        const savedReviews = localStorage.getItem('reviews');
        if (savedReviews) {
          setReviews(JSON.parse(savedReviews));
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      const savedReviews = localStorage.getItem('reviews');
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const saveReviews = (updatedReviews) => {
    localStorage.setItem('reviews', JSON.stringify(updatedReviews));
    setReviews(updatedReviews);
  };

  const approveReview = async (reviewId) => {
    setProcessing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Review approved successfully');
        fetchReviews();
      } else {
        const updatedReviews = reviews.map(review =>
          review.id === reviewId ? { ...review, status: 'approved' } : review
        );
        saveReviews(updatedReviews);
        toast.success('Review approved successfully (saved locally)');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      const updatedReviews = reviews.map(review =>
        review.id === reviewId ? { ...review, status: 'approved' } : review
      );
      saveReviews(updatedReviews);
      toast.success('Review approved successfully (saved locally)');
    } finally {
      setProcessing(false);
    }
  };

  const rejectReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to reject this review?')) {
      setProcessing(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}/reject`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          toast.success('Review rejected');
          fetchReviews();
        } else {
          const updatedReviews = reviews.filter(review => review.id !== reviewId);
          saveReviews(updatedReviews);
          toast.success('Review rejected (saved locally)');
        }
      } catch (error) {
        console.error('Error rejecting review:', error);
        const updatedReviews = reviews.filter(review => review.id !== reviewId);
        saveReviews(updatedReviews);
        toast.success('Review rejected (saved locally)');
      } finally {
        setProcessing(false);
      }
    }
  };

  const deleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      setProcessing(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          toast.success('Review deleted successfully');
          fetchReviews();
        } else {
          const updatedReviews = reviews.filter(review => review.id !== reviewId);
          saveReviews(updatedReviews);
          toast.success('Review deleted successfully (saved locally)');
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        const updatedReviews = reviews.filter(review => review.id !== reviewId);
        saveReviews(updatedReviews);
        toast.success('Review deleted successfully (saved locally)');
      } finally {
        setProcessing(false);
      }
    }
  };

  const submitReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    
    setProcessing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${selectedReview.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText.trim() })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Reply added successfully');
        setShowReplyModal(false);
        setSelectedReview(null);
        setReplyText('');
        fetchReviews();
      } else {
        const updatedReviews = reviews.map(review =>
          review.id === selectedReview.id 
            ? { ...review, reply: replyText.trim(), status: 'approved' }
            : review
        );
        saveReviews(updatedReviews);
        toast.success('Reply added successfully (saved locally)');
        setShowReplyModal(false);
        setSelectedReview(null);
        setReplyText('');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      const updatedReviews = reviews.map(review =>
        review.id === selectedReview.id 
          ? { ...review, reply: replyText.trim(), status: 'approved' }
          : review
      );
      saveReviews(updatedReviews);
      toast.success('Reply added successfully (saved locally)');
      setShowReplyModal(false);
      setSelectedReview(null);
      setReplyText('');
    } finally {
      setProcessing(false);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getRatingStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircleIcon };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircleIcon };
      default:
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: ChatBubbleLeftRightIcon };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredReviews = reviews.filter(review => {
    const productName = getProductName(review.productId);
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'pending' && review.status === 'pending') ||
                       (activeTab === 'approved' && review.status === 'approved') ||
                       (activeTab === 'rejected' && review.status === 'rejected');
    return matchesSearch && matchesStatus && matchesRating && matchesTab;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    averageRating: (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / (reviews.length || 1)).toFixed(1)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum">Manage Reviews</h1>
          <button
            onClick={fetchReviews}
            className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('all')}>
            <p className="text-gray-500 text-[10px] sm:text-sm">Total Reviews</p>
            <p className="text-lg sm:text-2xl font-bold text-darkPlum">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('pending')}>
            <p className="text-gray-500 text-[10px] sm:text-sm">Pending</p>
            <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('approved')}>
            <p className="text-gray-500 text-[10px] sm:text-sm">Approved</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('rejected')}>
            <p className="text-gray-500 text-[10px] sm:text-sm">Rejected</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center col-span-2 sm:col-span-1">
            <p className="text-gray-500 text-[10px] sm:text-sm">Avg Rating</p>
            <p className="text-lg sm:text-2xl font-bold text-primary">{stats.averageRating} ★</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product, customer, or review title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars ★★★★★</option>
            <option value="4">4 Stars ★★★★☆</option>
            <option value="3">3 Stars ★★★☆☆</option>
            <option value="2">2 Stars ★★☆☆☆</option>
            <option value="1">1 Star ★☆☆☆☆</option>
          </select>
        </div>

        {/* Reviews List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredReviews.map((review) => {
            const status = getStatusBadge(review.status);
            const StatusIcon = status.icon;
            const productName = getProductName(review.productId);
            return (
              <div key={review.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg">{productName}</h3>
                        {getRatingStars(review.rating)}
                        <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold ${status.color}`}>
                          <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {status.label}
                        </span>
                      </div>
                      {review.title && (
                        <p className="font-medium text-darkPlum text-sm sm:text-base">{review.title}</p>
                      )}
                      <p className="text-gray-600 text-xs sm:text-sm mt-2">{review.comment}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
                        <span>By: {review.user?.name || 'Customer'}</span>
                        <span>📅 {formatDate(review.createdAt)}</span>
                      </div>
                      {review.reply && (
                        <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs sm:text-sm font-medium text-primary">Store Reply:</p>
                          <p className="text-xs sm:text-sm text-gray-600">{review.reply}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setReplyText(review.reply || '');
                          setShowReplyModal(true);
                        }}
                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Reply to Review"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveReview(review.id)}
                            disabled={processing}
                            className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Approve Review"
                          >
                            <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => rejectReview(review.id)}
                            disabled={processing}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Reject Review"
                          >
                            <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteReview(review.id)}
                        disabled={processing}
                        className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title="Delete Review"
                      >
                        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-10 sm:py-16 bg-white rounded-xl">
            <StarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-sm">No reviews found</p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Reply to Review</h3>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {getRatingStars(selectedReview.rating)}
                  {selectedReview.title && (
                    <span className="font-medium text-sm">{selectedReview.title}</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">{selectedReview.comment}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">- {selectedReview.user?.name || 'Customer'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Your Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Thank you for your review..."
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={submitReply}
                  disabled={processing}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 text-sm"
                >
                  {processing ? 'Posting...' : 'Post Reply'}
                </button>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeReviewsPage;