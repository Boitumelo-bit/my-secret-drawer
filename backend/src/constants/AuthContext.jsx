import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { logoutUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token && !user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Existing Email/Password Login
  const login = async (email, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success(`Welcome back, ${data.user.name}!`);
        return { success: true, redirect: data.redirect };
      }
      toast.error(data.message);
      return { success: false };
    } catch (error) {
      toast.error('Login failed');
      return { success: false };
    }
  };

  // Social Login Handler (for Google/Facebook)
  const socialLogin = async (userData) => {
    try {
      const { user: firebaseUser, token: authToken, redirect } = userData;
      
      setUser(firebaseUser);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(firebaseUser));
      toast.success(`Welcome, ${firebaseUser.name || firebaseUser.email}!`);
      return { success: true, redirect };
    } catch (error) {
      console.error('Social login error:', error);
      toast.error('Social login failed');
      return { success: false };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Account created!');
        return { success: true };
      }
      toast.error(data.message);
      return { success: false };
    } catch (error) {
      toast.error('Registration failed');
      return { success: false };
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    await logoutUser();
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{
      user, loading, token, login, socialLogin, register, logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      isEmployee: user?.role === 'EMPLOYEE',
      isCustomer: user?.role === 'CUSTOMER'
    }}>
      {children}
    </AuthContext.Provider>
  );
};