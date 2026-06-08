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

  // Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      console.log('Google result:', result);

      if (result.success) {
        let redirectPath = '/dashboard';

        if (result.user?.role === 'ADMIN') {
          redirectPath = '/admin/dashboard';
        } else if (result.user?.role === 'EMPLOYEE') {
          redirectPath = '/employee/dashboard';
        }

        toast.success(`Welcome, ${result.user?.name || result.user?.email}!`);
        navigate(redirectPath);
      } else {
        toast.error(result.message || 'Google sign in failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  // Facebook Login (UNCHANGED FUNCTION)
  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithFacebook();
      console.log('Facebook result:', result);

      if (result.success) {
        let redirectPath = '/dashboard';

        if (result.user?.role === 'ADMIN') {
          redirectPath = '/admin/dashboard';
        } else if (result.user?.role === 'EMPLOYEE') {
          redirectPath = '/employee/dashboard';
        }

        toast.success(`Welcome, ${result.user?.name || result.user?.email}!`);
        navigate(redirectPath);
      } else {
        toast.error(result.message || 'Facebook sign in failed');
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      toast.error('Facebook sign in failed');
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 border border-white/20">

          <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-[#FF1493] to-[#FF69B4] rounded-full mx-auto mb-5 sm:mb-6"></div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-center bg-gradient-to-r from-[#FF1493] to-[#6A1B9A] bg-clip-text text-transparent mb-1 sm:mb-2">
            Welcome Back
          </h1>

          <p className="text-center text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8">
            Sign in to your account
          </p>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF1493]"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-[#FF1493]"
                >
                  Forgot Password?
                </button>
              </div>

              <input
                type="password"
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white py-3 rounded-xl"
            >
              {loading ? 'Signing in...' : 'Sign In with Email'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="border-t"></div>
            <div className="text-center text-sm text-gray-400 bg-white px-3 -mt-3 w-fit mx-auto">
              OR
            </div>
          </div>

          {/* SOCIAL LOGIN BUTTONS */}

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 border rounded-xl mb-3"
          >
            Google
          </button>

          {/* 🔵 FACEBOOK BUTTON (ADDED) */}
          <button
            onClick={handleFacebookLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 border rounded-xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.88h-2.33v6.99A10 10 0 0 0 22 12z"/>
            </svg>
            Continue with Facebook
          </button>

          <div className="text-center mt-6">
            <Link to="/register" className="text-[#FF1493]">
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl">
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter email"
                className="border p-2 w-full"
              />

              <button type="submit" className="mt-3 bg-pink-500 text-white px-4 py-2 rounded">
                Send Reset Email
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;