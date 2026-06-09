import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { 
  TruckIcon, 
  MapPinIcon, 
  CreditCardIcon, 
  BanknotesIcon,
  BuildingOfficeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { isAuthenticated } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState('maseru');
  const [paymentMethod, setPaymentMethod] = useState('MPESA');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please sign in to continue with checkout');
      navigate('/login', { 
        state: { from: '/checkout', message: 'Please sign in to complete your purchase' } 
      });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (cartItems.length === 0 && isAuthenticated) {
      toast.error('Your cart is empty');
      navigate('/products');
    }
  }, [cartItems, navigate, isAuthenticated]);

  const deliveryFees = {
    maseru: 50,
    lesotho: 100,
    southAfrica: 250,
    pickup: 0
  };

  const subtotal = cartTotal;
  const shippingFee = deliveryFees[deliveryMethod];
  const tax = subtotal * 0.15;
  const total = subtotal + shippingFee + tax;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getProductImage = (item) => {
    if (item.image) return item.image;
    if (item.images && item.images.length > 0) return item.images[0];
    return 'https://via.placeholder.com/100?text=No+Image';
  };

  const getValidPaymentMethod = () => {
    switch(paymentMethod) {
      case 'MPESA':
      case 'ECOCASH':
        return 'MOBILE_MONEY';
      default:
        return 'MOBILE_MONEY';
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    if (paymentMethod === 'MPESA' || paymentMethod === 'ECOCASH') {
      toast.loading(`Processing ${paymentMethod} payment...`, { duration: 2000 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${paymentMethod} payment successful!`);
    }
    
    const orderData = {
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.priceLSL || item.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        image: getProductImage(item)
      })),
      subtotal,
      shippingFee,
      tax,
      total,
      deliveryMethod,
      paymentMethod: getValidPaymentMethod(),
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode
      }
    };

    const newOrder = await placeOrder(orderData);
    
    if (newOrder) {
      clearCart();
      toast.success(`Order #${newOrder.orderNumber} placed successfully!`);
      navigate('/orders');
    }
    
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-8 sm:pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-8 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md mx-auto">
            <ShoppingBagIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-playfair font-bold text-darkPlum mb-3 sm:mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">Add items to your cart before checking out.</p>
            <Link to="/products" className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:shadow-lg transition inline-block text-sm sm:text-base">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-gray-800 mb-6 sm:mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Left Column - Forms */}
          <div className="flex-1 order-1 lg:order-none">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-pink-500" />
                Shipping Information
              </h2>
              <form id="checkout-form" onSubmit={handlePlaceOrder}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">First Name *</label>
                    <input type="text" name="firstName" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all" placeholder="Jane" value={formData.firstName} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Last Name *</label>
                    <input type="text" name="lastName" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all" placeholder="Doe" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Email Address *</label>
                  <input type="email" name="email" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all" placeholder="jane@example.com" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number *</label>
                  <input type="tel" name="phone" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all" placeholder="+266 1234 5678" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Address *</label>
                  <input type="text" name="address" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all" placeholder="Street address" value={formData.address} onChange={handleInputChange} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">City *</label>
                    <input type="text" name="city" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all" placeholder="Maseru" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Postal Code</label>
                    <input type="text" name="postalCode" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all" placeholder="100" value={formData.postalCode} onChange={handleInputChange} />
                  </div>
                </div>
              </form>
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <TruckIcon className="w-5 h-5 text-pink-500" />
                Delivery Method
              </h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:border-pink-500 transition-all active:scale-[0.99]">
                  <input type="radio" name="delivery" value="maseru" checked={deliveryMethod === 'maseru'} onChange={(e) => setDeliveryMethod(e.target.value)} className="mr-3 w-4 h-4 text-pink-500 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base">Maseru Same/Next Day</p>
                    <p className="text-xs text-gray-500">Delivery in 1 day</p>
                  </div>
                  <span className="font-bold text-pink-500 text-sm">LSL 50.00</span>
                </label>
                <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:border-pink-500 transition-all active:scale-[0.99]">
                  <input type="radio" name="delivery" value="lesotho" checked={deliveryMethod === 'lesotho'} onChange={(e) => setDeliveryMethod(e.target.value)} className="mr-3 w-4 h-4 text-pink-500 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base">Lesotho Districts</p>
                    <p className="text-xs text-gray-500">Delivery in 1-3 days</p>
                  </div>
                  <span className="font-bold text-pink-500 text-sm">LSL 100.00</span>
                </label>
                <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:border-pink-500 transition-all active:scale-[0.99]">
                  <input type="radio" name="delivery" value="southAfrica" checked={deliveryMethod === 'southAfrica'} onChange={(e) => setDeliveryMethod(e.target.value)} className="mr-3 w-4 h-4 text-pink-500 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base">South Africa Courier</p>
                    <p className="text-xs text-gray-500">Delivery in 3-7 days</p>
                  </div>
                  <span className="font-bold text-pink-500 text-sm">LSL 250.00</span>
                </label>
                <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:border-pink-500 transition-all active:scale-[0.99]">
                  <input type="radio" name="delivery" value="pickup" checked={deliveryMethod === 'pickup'} onChange={(e) => setDeliveryMethod(e.target.value)} className="mr-3 w-4 h-4 text-pink-500 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base">Store Pickup</p>
                    <p className="text-xs text-gray-500">Free - Pick up from our Maseru store</p>
                  </div>
                  <span className="font-bold text-pink-500 text-sm">Free</span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-pink-500" />
                Payment Method
              </h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:border-pink-500 transition-all active:scale-[0.99]">
                  <input type="radio" name="payment" value="MPESA" checked={paymentMethod === 'MPESA'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 w-4 h-4 text-pink-500 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base">M-PESA</p>
                    <p className="text-xs text-gray-500">Mobile Money - Fast & Secure</p>
                  </div>
                  <DevicePhoneMobileIcon className="w-5 h-5 text-green-500" />
                </label>
                <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:border-pink-500 transition-all active:scale-[0.99]">
                  <input type="radio" name="payment" value="ECOCASH" checked={paymentMethod === 'ECOCASH'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 w-4 h-4 text-pink-500 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base">EcoCash</p>
                    <p className="text-xs text-gray-500">Mobile Money - Convenient & Reliable</p>
                  </div>
                  <BanknotesIcon className="w-5 h-5 text-green-500" />
                </label>
              </div>
              
              {/* Demo notice */}
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700 text-center">
                  ⚡ Demo Mode: No actual payment will be charged
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-96 order-2 lg:order-none">
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 sticky top-24">
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingBagIcon className="w-5 h-5 text-pink-500" />
                Order Summary
              </h2>
              
              <div className="max-h-60 overflow-y-auto mb-4 space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b">
                    <img 
                      src={getProductImage(item)} 
                      alt={item.name} 
                      className="w-12 h-12 object-cover rounded-lg shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-xs text-gray-400">Size: {item.selectedSize || 'N/A'} | Color: {item.selectedColor || 'N/A'}</p>
                    </div>
                    <span className="font-semibold text-pink-500 text-sm whitespace-nowrap">LSL {((item.priceLSL || item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>LSL {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span>LSL {shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (15%):</span>
                  <span>LSL {tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 font-bold flex justify-between">
                  <span className="text-sm">Total:</span>
                  <span className="text-pink-500 text-lg">LSL {total.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                type="submit" 
                form="checkout-form" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-full font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Processing...' : `Pay LSL ${total.toFixed(2)}`}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">Demo mode - No actual payment will be charged</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;