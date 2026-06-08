import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    });
    
    if (result.success) {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-md">
        {/* Card with enhanced styling */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 border border-white/20">
          {/* Decorative gradient bar */}
          <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-[#FF1493] to-[#FF69B4] rounded-full mx-auto mb-5 sm:mb-6"></div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-center bg-gradient-to-r from-[#FF1493] to-[#6A1B9A] bg-clip-text text-transparent mb-1 sm:mb-2">
            Create Account
          </h1>
          <p className="text-center text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8">Join our exclusive community</p>
          
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Full Name</label>
              <input
                type="text"
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF1493] focus:ring-2 focus:ring-[#FF1493]/20 transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Email Address</label>
              <input
                type="email"
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF1493] focus:ring-2 focus:ring-[#FF1493]/20 transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                placeholder="hello@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF1493] focus:ring-2 focus:ring-[#FF1493]/20 transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                placeholder="+266 1234 5678"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Password</label>
              <input
                type="password"
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF1493] focus:ring-2 focus:ring-[#FF1493]/20 transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <p className="text-[10px] sm:text-xs text-gray-400 ml-2">Password must be at least 6 characters</p>
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Confirm Password</label>
              <input
                type="password"
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF1493] focus:ring-2 focus:ring-[#FF1493]/20 transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white font-semibold py-2.5 sm:py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-5 sm:mt-6 text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
          
          <div className="text-center mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-100">
            <p className="text-gray-600 text-xs sm:text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#FF1493] font-semibold hover:text-[#FF69B4] hover:underline transition-all duration-200">
                Sign in here
              </Link>
            </p>
          </div>
          
          <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 text-center">
            <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed px-2">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-[#FF1493] hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-[#FF1493] hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-[10px] sm:text-xs text-gray-400">
            🔒 Your information is secure • 100% encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;