import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { isAuthenticated } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState('maseru');
  const [paymentMethod, setPaymentMethod] = useState('PAYFAST');
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

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
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
      paymentMethod,
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
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-8 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md mx-auto">
            <div className="text-5xl sm:text-6xl mb-4">🛒</div>
            <h1 className="text-xl sm:text-2xl font-playfair font-bold text-darkPlum mb-3 sm:mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">Add items to your cart before checking out.</p>
            <Link to="/products" className="bg-primary text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-secondary transition inline-block text-sm sm:text-base">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum mb-6 sm:mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Left Column - Forms */}
          <div className="flex-1 order-1 lg:order-none">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Shipping Information</h2>
              <form id="checkout-form" onSubmit={handlePlaceOrder}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">First Name *</label>
                    <input type="text" name="firstName" className="input-field text-sm sm:text-base" placeholder="Jane" value={formData.firstName} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Last Name *</label>
                    <input type="text" name="lastName" className="input-field text-sm sm:text-base" placeholder="Doe" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Email Address *</label>
                  <input type="email" name="email" className="input-field text-sm sm:text-base" placeholder="jane@example.com" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Phone Number *</label>
                  <input type="tel" name="phone" className="input-field text-sm sm:text-base" placeholder="+266 1234 5678" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Address *</label>
                  <input type="text" name="address" className="input-field text-sm sm:text-base" placeholder="Street address" value={formData.address} onChange={handleInputChange} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">City *</label>
                    <input type="text" name="city" className="input-field text-sm sm:text-base" placeholder="Maseru" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Postal Code</label>
                    <input type="text" name="postalCode" className="input-field text-sm sm:text-base" placeholder="100" value={formData.postalCode} onChange={handleInputChange} />
                  </div>
                </div>
              </form>
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Delivery Method</h2>
              <div className="space-y-3">
                <label className="flex flex-col sm:flex-row items-start sm:items-center p-3 border rounded-xl cursor-pointer hover:border-primary transition-all">
                  <div className="flex items-center w-full sm:w-auto">
                    <input type="radio" name="delivery" value="maseru" checked={deliveryMethod === 'maseru'} onChange={(e) => setDeliveryMethod(e.target.value)} className="mr-3 w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">Maseru Same/Next Day</p>
                      <p className="text-xs sm:text-sm text-gray-500">Delivery in 1 day</p>
                    </div>
                    <span className="font-bold text-primary text-sm sm:text-base">LSL 50.00</span>
                  </div>
                </label>
                <label className="flex flex-col sm:flex-row items-start sm:items-center p-3 border rounded-xl cursor-pointer hover:border-primary transition-all">
                  <div className="flex items-center w-full sm:w-auto">
                    <input type="radio" name="delivery" value="lesotho" checked={deliveryMethod === 'lesotho'} onChange={(e) => setDeliveryMethod(e.target.value)} className="mr-3 w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">Lesotho Districts</p>
                      <p className="text-xs sm:text-sm text-gray-500">Delivery in 1-3 days</p>
                    </div>
                    <span className="font-bold text-primary text-sm sm:text-base">LSL 100.00</span>
                  </div>
                </label>
                <label className="flex flex-col sm:flex-row items-start sm:items-center p-3 border rounded-xl cursor-pointer hover:border-primary transition-all">
                  <div className="flex items-center w-full sm:w-auto">
                    <input type="radio" name="delivery" value="southAfrica" checked={deliveryMethod === 'southAfrica'} onChange={(e) => setDeliveryMethod(e.target.value)} className="mr-3 w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">South Africa Courier</p>
                      <p className="text-xs sm:text-sm text-gray-500">Delivery in 3-7 days</p>
                    </div>
                    <span className="font-bold text-primary text-sm sm:text-base">LSL 250.00</span>
                  </div>
                </label>
                <label className="flex flex-col sm:flex-row items-start sm:items-center p-3 border rounded-xl cursor-pointer hover:border-primary transition-all">
                  <div className="flex items-center w-full sm:w-auto">
                    <input type="radio" name="delivery" value="pickup" checked={deliveryMethod === 'pickup'} onChange={(e) => setDeliveryMethod(e.target.value)} className="mr-3 w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">Store Pickup</p>
                      <p className="text-xs sm:text-sm text-gray-500">Free - Pick up from our Maseru store</p>
                    </div>
                    <span className="font-bold text-primary text-sm sm:text-base">Free</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex flex-col sm:flex-row items-start sm:items-center p-3 border rounded-xl cursor-pointer hover:border-primary transition-all">
                  <div className="flex items-center w-full sm:w-auto">
                    <input type="radio" name="payment" value="PAYFAST" checked={paymentMethod === 'PAYFAST'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">Card Payment</p>
                      <p className="text-xs sm:text-sm text-gray-500">Visa, Mastercard via PayFast</p>
                    </div>
                  </div>
                </label>
                <label className="flex flex-col sm:flex-row items-start sm:items-center p-3 border rounded-xl cursor-pointer hover:border-primary transition-all">
                  <div className="flex items-center w-full sm:w-auto">
                    <input type="radio" name="payment" value="EFT" checked={paymentMethod === 'EFT'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">EFT / Bank Transfer</p>
                    </div>
                  </div>
                </label>
                <label className="flex flex-col sm:flex-row items-start sm:items-center p-3 border rounded-xl cursor-pointer hover:border-primary transition-all">
                  <div className="flex items-center w-full sm:w-auto">
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">Cash on Delivery</p>
                    </div>
                  </div>
                </label>
                <label className="flex flex-col sm:flex-row items-start sm:items-center p-3 border rounded-xl cursor-pointer hover:border-primary transition-all">
                  <div className="flex items-center w-full sm:w-auto">
                    <input type="radio" name="payment" value="MPESA" checked={paymentMethod === 'MPESA'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">M-PESA</p>
                      <p className="text-xs sm:text-sm text-gray-500">Mobile Money</p>
                    </div>
                  </div>
                </label>
                <label className="flex flex-col sm:flex-row items-start sm:items-center p-3 border rounded-xl cursor-pointer hover:border-primary transition-all">
                  <div className="flex items-center w-full sm:w-auto">
                    <input type="radio" name="payment" value="ECOCASH" checked={paymentMethod === 'ECOCASH'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">EcoCash</p>
                      <p className="text-xs sm:text-sm text-gray-500">Mobile Money</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-96 order-2 lg:order-none">
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 sticky top-24">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="max-h-60 overflow-y-auto mb-4 space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 pb-3 border-b">
                    <img 
                      src={getProductImage(item)} 
                      alt={item.name} 
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-xs sm:text-sm line-clamp-1">{item.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">Size: {item.selectedSize || 'N/A'} | Color: {item.selectedColor || 'N/A'}</p>
                    </div>
                    <span className="font-semibold text-primary text-xs sm:text-sm">LSL {((item.priceLSL || item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>LSL {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Shipping:</span>
                  <span>LSL {shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Tax (15%):</span>
                  <span>LSL {tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 font-bold flex justify-between">
                  <span className="text-sm sm:text-base">Total:</span>
                  <span className="text-primary text-lg sm:text-xl">LSL {total.toFixed(2)}</span>
                </div>
              </div>
              
              <button type="submit" form="checkout-form" disabled={loading} className="w-full bg-primary text-white py-2.5 sm:py-3 rounded-full font-semibold hover:bg-secondary transition disabled:opacity-50 text-sm sm:text-base">
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
              
              <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-4">By placing your order, you agree to our Terms and Conditions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;