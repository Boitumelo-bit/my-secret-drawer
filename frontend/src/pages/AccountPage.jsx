import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, ShoppingBagIcon, PencilIcon, CheckIcon, XMarkIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AccountPage = () => {
  const { user, token, updateProfile, logout } = useAuth();
  const { orders } = useOrders();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: ''
  });
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    country: 'Lesotho',
    isDefault: false
  });
  
  // My Reviews States
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    }
    loadAddresses();
    fetchUserReviews();
  }, [user]);

  // Load addresses from localStorage
  const loadAddresses = () => {
    const savedAddresses = localStorage.getItem(`addresses_${user?.id}`);
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }
  };

  // Save addresses
  const saveAddresses = (newAddresses) => {
    localStorage.setItem(`addresses_${user?.id}`, JSON.stringify(newAddresses));
    setAddresses(newAddresses);
  };

  // Fetch user's reviews
  const fetchUserReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/my-reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUserReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
    setLoading(false);
  };

  // Handle add address
  const handleAddAddress = (e) => {
    e.preventDefault();
    const addressToAdd = {
      ...newAddress,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    const updatedAddresses = [...addresses, addressToAdd];
    saveAddresses(updatedAddresses);
    setNewAddress({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      country: 'Lesotho',
      isDefault: false
    });
    setShowAddressForm(false);
    toast.success('Address added successfully');
  };

  // Handle delete address
  const handleDeleteAddress = (addressId) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    saveAddresses(updatedAddresses);
    toast.success('Address removed');
  };

  // Handle set default address
  const handleSetDefault = (addressId) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    saveAddresses(updatedAddresses);
    toast.success('Default address updated');
  };

  // Get user stats
  const totalOrders = orders?.length || 0;
  const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;
  const totalSpent = orders?.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0) || 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-8 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md mx-auto">
            <UserIcon className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-playfair font-bold text-darkPlum mb-3 sm:mb-4">Please Sign In</h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">Sign in to view your account</p>
            <Link to="/login" className="bg-primary text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-secondary transition inline-block text-sm sm:text-base">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum mb-6 sm:mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
          
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Profile Information</h2>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-primary hover:text-secondary transition">
                  <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
            
            {!isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Name</p>
                    <p className="font-medium text-sm sm:text-base">{user.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Email</p>
                    <p className="font-medium text-sm sm:text-base">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-sm sm:text-base">{user.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <ShoppingBagIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-sm sm:text-base">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input-field text-sm sm:text-base"
                    placeholder="+266 1234 5678"
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-2 text-sm sm:text-base">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary flex-1 py-2 text-sm sm:text-base">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* Order Statistics */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 text-sm sm:text-base">Total Orders</span>
                <span className="text-xl sm:text-2xl font-bold text-primary">{totalOrders}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 text-sm sm:text-base">Completed Orders</span>
                <span className="text-xl sm:text-2xl font-bold text-green-600">{completedOrders}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600 text-sm sm:text-base">Total Spent</span>
                <span className="text-xl sm:text-2xl font-bold text-primary">LSL {totalSpent.toLocaleString()}</span>
              </div>
              <Link to="/orders" className="btn-primary w-full text-center py-2 mt-2 inline-block text-sm sm:text-base">
                View All Orders
              </Link>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/orders" className="flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 transition">
                <ShoppingBagIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-sm sm:text-base">My Orders</span>
              </Link>
              <Link to="/wishlist" className="flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 transition">
                <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-sm sm:text-base">My Wishlist</span>
              </Link>
              <button onClick={logout} className="flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg hover:bg-red-50 transition w-full text-left">
                <span className="text-red-500 text-sm sm:text-base">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Saved Addresses Section */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Saved Addresses</h2>
              <button 
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-primary hover:text-secondary transition text-sm font-semibold"
              >
                {showAddressForm ? 'Cancel' : '+ Add New Address'}
              </button>
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Address *</label>
                    <input
                      type="text"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <select
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                      className="input-field text-sm"
                    >
                      <option value="Lesotho">Lesotho</option>
                      <option value="South Africa">South Africa</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary"
                      />
                      <span className="text-xs sm:text-sm">Set as default address</span>
                    </label>
                  </div>
                </div>
                <div className="mt-4">
                  <button type="submit" className="btn-primary px-5 sm:px-6 py-1.5 sm:py-2 text-sm">Save Address</button>
                </div>
              </form>
            )}

            {/* Addresses List */}
            {addresses.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">No saved addresses yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-3 sm:p-4 relative">
                    {address.isDefault && (
                      <span className="absolute top-2 right-2 bg-primary text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        Default
                      </span>
                    )}
                    <p className="font-semibold text-sm sm:text-base">{address.fullName}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{address.phone}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{address.address}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{address.city}, {address.country}</p>
                    <div className="flex space-x-3 mt-3 pt-3 border-t">
                      {!address.isDefault && (
                        <button 
                          onClick={() => handleSetDefault(address.id)}
                          className="text-[11px] sm:text-xs text-primary hover:underline"
                        >
                          Set as Default
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-[11px] sm:text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MY REVIEWS SECTION */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">My Reviews</h2>
            
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-7 w-7 sm:h-8 sm:w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : userReviews.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <Link to={`/product/${review.productId}`} className="font-semibold text-sm sm:text-base hover:text-primary transition">
                          {review.product?.name || 'Product'}
                        </Link>
                        <div className="flex text-yellow-400 text-xs sm:text-sm mt-1">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </div>
                        {review.title && <p className="font-medium text-xs sm:text-sm mt-2">{review.title}</p>}
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{review.comment}</p>
                        {review.reply && (
                          <div className="mt-2 pl-2 sm:pl-3 border-l-2 border-primary">
                            <p className="text-[10px] sm:text-xs font-medium text-primary">Store Reply:</p>
                            <p className="text-[10px] sm:text-xs text-gray-600">{review.reply}</p>
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full self-start sm:self-auto ${
                        review.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-2">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <StarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No reviews yet</p>
                <Link to="/products" className="text-primary text-xs sm:text-sm hover:underline mt-2 inline-block">
                  Browse Products to Review →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;