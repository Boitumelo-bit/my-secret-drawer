import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle, signInWithFacebook, forgotPassword } from '../services/authService';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate(result.redirect);
    }
    setLoading(false);
  };

  // Google Login - FIXED: Use window.location for reliable redirect
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      console.log('Google result:', result);

      if (result.success && result.user) {
        toast.success(`Welcome, ${result.user.name || result.user.email}!`);
        
        // Determine redirect path
        let redirectPath = '/dashboard';
        if (result.user.role === 'ADMIN') {
          redirectPath = '/admin/dashboard';
        } else if (result.user.role === 'EMPLOYEE') {
          redirectPath = '/employee/dashboard';
        }
        
        // Use window.location for guaranteed redirect
        window.location.href = redirectPath;
      } else {
        // Don't show error if user cancelled the popup
        if (!result.cancelled) {
          toast.error(result.message || 'Google sign in failed');
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      if (error?.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Facebook Login - FIXED: Use window.location for reliable redirect
  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithFacebook();
      console.log('Facebook result:', result);

      if (result.success && result.user) {
        toast.success(`Welcome, ${result.user.name || result.user.email}!`);
        
        let redirectPath = '/dashboard';
        if (result.user.role === 'ADMIN') {
          redirectPath = '/admin/dashboard';
        } else if (result.user.role === 'EMPLOYEE') {
          redirectPath = '/employee/dashboard';
        }
        
        window.location.href = redirectPath;
      } else {
        if (!result.cancelled) {
          toast.error(result.message || 'Facebook sign in failed');
        }
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      if (error?.code !== 'auth/popup-closed-by-user') {
        toast.error('Facebook sign in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    const result = await forgotPassword(forgotPasswordEmail);
    if (result.success) {
      toast.success(result.message);
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-md">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 md:p-10 border border-white/20">
          
          {/* Decorative Bar */}
          <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-[#FF1493] to-[#FF69B4] rounded-full mx-auto mb-5 sm:mb-6"></div>

          {/* Header */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-center bg-gradient-to-r from-[#FF1493] to-[#6A1B9A] bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8">
            Sign in to your account
          </p>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF1493] focus:ring-2 focus:ring-[#FF1493]/20 transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                placeholder="hello@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-[#FF1493] hover:text-[#FF69B4] transition-colors duration-200"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF1493] focus:ring-2 focus:ring-[#FF1493]/20 transition-all duration-200 bg-gray-50/50 text-sm sm:text-base"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white font-semibold py-2.5 sm:py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In with Email'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-4 bg-white text-gray-400">OR</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 sm:space-y-4">
            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-sm sm:text-base font-medium text-gray-700 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Facebook Button */}
            <button
              onClick={handleFacebookLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 sm:py-3 bg-[#1877F2] text-white rounded-xl hover:bg-[#1664D9] transition-all duration-300 text-sm sm:text-base font-medium active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.88h-2.33v6.99A10 10 0 0 0 22 12z"/>
              </svg>
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-100">
            <p className="text-gray-600 text-xs sm:text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#FF1493] font-semibold hover:text-[#FF69B4] hover:underline transition-all duration-200">
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-[10px] sm:text-xs text-gray-400">
            🔒 Secure login • Protected by SSL encryption
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl sm:text-2xl font-bold text-darkPlum">Reset Password</h3>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF1493] focus:ring-2 focus:ring-[#FF1493]/20 transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  We'll send a password reset link to your email address.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
                <button type="button" onClick={() => setShowForgotPassword(false)} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300">
                  Cancel
                </button>
              </div>
            </form>
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

export default LoginPage;