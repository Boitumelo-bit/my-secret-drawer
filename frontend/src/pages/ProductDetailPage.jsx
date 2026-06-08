import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, HeartIcon, ShareIcon, CreditCardIcon, StarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart: addToCartContext } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, isCustomer, isAdmin, isEmployee, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingProduct, setPendingProduct] = useState(null);
  
  // Review States
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Employee cannot shop - redirect if they try to add to cart
  const canShop = isCustomer || isAdmin;
  const canUseWishlist = isCustomer || isAdmin;
  const canWriteReview = isCustomer || isAdmin;

  useEffect(() => {
    // Fetch product from API
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        const data = await response.json();
        if (data.success) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
    fetchReviews();
  }, [id]);

  // Fetch reviews for this product
  const fetchReviews = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/product/${id}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const addToCart = () => {
    if (!isAuthenticated) {
      setPendingAction('cart');
      setPendingProduct(product);
      setShowLoginPrompt(true);
      return;
    }
    
    if (!canShop) {
      toast.error('Employees cannot purchase products. This is for customers only.');
      return;
    }
    
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }
    
    addToCartContext(product, selectedSize, selectedColor, quantity);
    toast.success(`Added ${quantity} ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setPendingAction('buynow');
      setPendingProduct(product);
      setShowLoginPrompt(true);
      return;
    }
    
    if (!canShop) {
      toast.error('Employees cannot purchase products. This is for customers only.');
      return;
    }
    
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }
    
    addToCartContext(product, selectedSize, selectedColor, quantity);
    
    toast('Please sign in to continue with checkout', {
      duration: 4000,
      icon: '🔐',
      style: {
        background: '#1A1A1A',
        color: '#fff',
      },
    });
    
    setTimeout(() => {
      navigate('/login', { state: { from: '/checkout', message: 'Please sign in to complete your purchase' } });
    }, 1500);
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      setPendingAction('wishlist');
      setPendingProduct(product);
      setShowLoginPrompt(true);
      return;
    }
    
    if (!canUseWishlist) {
      toast.error('Employees cannot use wishlist. This is for customers only.');
      return;
    }
    if (product) {
      toggleWishlist(product);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Product link copied to clipboard!');
  };

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
    setPendingAction(null);
    setPendingProduct(null);
  };

  // Submit review
  const submitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      setPendingAction('review');
      setShowReviewModal(false);
      return;
    }
    
    if (!canWriteReview) {
      toast.error('Only customers can write reviews');
      return;
    }
    
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Review submitted! Pending approval.');
        setShowReviewModal(false);
        setReviewRating(5);
        setReviewTitle('');
        setReviewComment('');
        fetchReviews();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 sm:pt-24">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 sm:pt-24">
        <div className="text-center px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-darkPlum mb-4">Product not found</h1>
          <Link to="/products" className="btn-primary inline-block">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const isWishlisted = isAuthenticated && isInWishlist(product.id);
  const productImage = product.images?.[0] || 'https://via.placeholder.com/600x800?text=No+Image';

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-16">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <Link to="/" className="hover:text-primary transition">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary transition">Shop</Link>
          <span>/</span>
          <span className="text-primary truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </div>

        {/* Non-Authenticated User Warning */}
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-6 text-center">
            <p className="text-blue-800 text-xs sm:text-sm">
              🔐 <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link> to add items to cart, wishlist, and write reviews
            </p>
          </div>
        )}

        {/* Employee Warning Banner */}
        {isEmployee && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4 mb-6 text-center">
            <p className="text-yellow-800 text-xs sm:text-sm">
              📋 You are viewing this as an employee. You cannot purchase products.
              <Link to="/employee/dashboard" className="text-primary font-semibold ml-2 hover:underline">
                Go to Dashboard →
              </Link>
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <img src={productImage} alt={product.name} className="w-full h-auto object-cover" />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {product.images.slice(1, 4).map((img, idx) => (
                  <div key={idx} className="bg-white rounded-xl overflow-hidden cursor-pointer hover:opacity-80 shadow-sm transition">
                    <img src={img} alt={`view ${idx + 2}`} className="w-full h-20 sm:h-24 object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-darkPlum mb-2">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400 text-sm sm:text-base">
                  {'★'.repeat(Math.floor(product.rating || 4.5))}
                  {'☆'.repeat(5 - Math.floor(product.rating || 4.5))}
                </div>
                <span className="text-gray-500 text-xs sm:text-sm ml-2">({product.reviewsCount || 0} reviews)</span>
              </div>
            </div>
            
            {/* Price Display with Sale */}
            <div className="mb-4">
              {product.isOnSale ? (
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold text-red-500">LSL {product.salePrice || product.displayPrice}</span>
                  <span className="text-lg sm:text-xl text-gray-400 line-through">LSL {product.originalPrice || product.price}</span>
                  <span className="bg-red-500 text-white px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold">SALE</span>
                </div>
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-primary">LSL {product.price}</span>
              )}
              <span className="text-xs sm:text-sm text-gray-400 block mt-1">/ ZAR {product.priceZAR || product.price}</span>
            </div>
            
            <p className="text-gray-600 text-sm sm:text-base mb-5 sm:mb-6 leading-relaxed">{product.description}</p>

            {/* Stock Status */}
            <div className="mb-5 sm:mb-6">
              <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm font-semibold ${(product.stock || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {(product.stock || 0) > 0 ? `✓ In Stock (${product.stock} left)` : 'Out of Stock'}
              </span>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-5 sm:mb-6">
                <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!canShop || !isAuthenticated}
                      className={`px-3 sm:px-5 py-1.5 sm:py-2 border-2 rounded-full text-xs sm:text-sm transition-all ${
                        selectedSize === size 
                          ? 'border-primary bg-primary text-white shadow-md' 
                          : 'border-gray-300 hover:border-primary hover:bg-pinkLight'
                      } ${(!canShop || !isAuthenticated) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-5 sm:mb-6">
                <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Select Color</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      disabled={!canShop || !isAuthenticated}
                      className={`px-3 sm:px-5 py-1.5 sm:py-2 border-2 rounded-full text-xs sm:text-sm transition-all ${
                        selectedColor === color 
                          ? 'border-primary bg-primary text-white shadow-md' 
                          : 'border-gray-300 hover:border-primary hover:bg-pinkLight'
                      } ${(!canShop || !isAuthenticated) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity - Only for authenticated customers/admins */}
            {canShop && isAuthenticated && (
              <div className="mb-5 sm:mb-6">
                <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Quantity</h3>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 hover:border-primary hover:bg-primary hover:text-white transition flex items-center justify-center"
                  >
                    <span className="text-lg sm:text-xl">-</span>
                  </button>
                  <span className="text-lg sm:text-xl font-semibold w-10 sm:w-12 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 hover:border-primary hover:bg-primary hover:text-white transition flex items-center justify-center"
                  >
                    <span className="text-lg sm:text-xl">+</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons - CONDITIONAL for Authenticated Customers/Admins */}
            {isAuthenticated && canShop ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                <button 
                  onClick={addToCart} 
                  className="flex-1 bg-white border-2 border-primary text-primary py-2.5 sm:py-3 rounded-full font-semibold hover:bg-primary hover:text-white hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group text-sm sm:text-base"
                >
                  <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition" />
                  <span>Add to Cart</span>
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-2.5 sm:py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 group text-sm sm:text-base"
                >
                  <CreditCardIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition" />
                  <span>Buy Now</span>
                </button>
                <button 
                  onClick={handleWishlistToggle}
                  className={`flex-1 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center space-x-2 group text-sm sm:text-base ${
                    isWishlisted 
                      ? 'bg-primary text-white shadow-md' 
                      : 'border-2 border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
                  }`}
                >
                  <HeartIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition ${isWishlisted ? 'fill-current' : 'group-hover:scale-110'}`} />
                  <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                </button>
              </div>
            ) : isAuthenticated && isEmployee ? (
              /* Employee View - No shopping buttons, just management links */
              <div className="mb-6">
                <div className="bg-gray-100 rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-gray-600 text-sm mb-3">This is a product view for employees</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link 
                      to="/employee/products" 
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition text-sm"
                    >
                      Manage Products
                    </Link>
                    <Link 
                      to="/employee/inventory" 
                      className="px-3 sm:px-4 py-1.5 sm:py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition text-sm"
                    >
                      Update Inventory
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Share Button - Visible to all */}
            <button 
              onClick={handleShare}
              className="w-full border border-gray-200 text-gray-500 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold hover:border-primary hover:text-primary transition-all duration-300 flex items-center justify-center space-x-2 mb-4"
            >
              <ShareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Share this product</span>
            </button>

            {/* Product Features */}
            {product.features && product.features.length > 0 && (
              <div className="border-t pt-5 sm:pt-6 mt-3 sm:mt-4">
                <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Product Features</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="text-gray-600 text-xs sm:text-sm flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* REVIEWS SECTION */}
            <div className="border-t pt-5 sm:pt-6 mt-5 sm:mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h3 className="text-base sm:text-lg font-semibold">Customer Reviews</h3>
                {canWriteReview && isAuthenticated && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="text-xs sm:text-sm bg-primary text-white px-2.5 sm:px-3 py-1 rounded-full hover:bg-secondary transition"
                  >
                    Write a Review
                  </button>
                )}
              </div>
              
              {reviews.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex text-yellow-400 text-xs sm:text-sm">
                            {'★'.repeat(review.rating)}
                            {'☆'.repeat(5 - review.rating)}
                          </div>
                          <span className="font-medium text-xs sm:text-sm">{review.user?.name || 'Anonymous'}</span>
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      {review.title && <h4 className="font-semibold text-xs sm:text-sm mt-1">{review.title}</h4>}
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{review.comment}</p>
                      {review.reply && (
                        <div className="mt-2 pl-2 sm:pl-3 border-l-2 border-primary">
                          <p className="text-[10px] sm:text-xs font-medium text-primary">Store Reply:</p>
                          <p className="text-[10px] sm:text-xs text-gray-600">{review.reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-5 sm:py-6 text-xs sm:text-sm">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      {showReviewModal && isAuthenticated && canWriteReview && (
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

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl animate-scale-up">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-7 h-7 sm:w-8 sm:h-8 text-pink-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-darkPlum mb-2">Sign In Required</h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-6">
                {pendingAction === 'cart' && 'Please sign in to add items to your cart.'}
                {pendingAction === 'buynow' && 'Please sign in to complete your purchase.'}
                {pendingAction === 'wishlist' && 'Please sign in to add items to your wishlist.'}
                {pendingAction === 'review' && 'Please sign in to write a review.'}
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

export default ProductDetailPage;