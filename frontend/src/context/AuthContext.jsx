import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) fetchUser();
    else setLoading(false);
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setUser(data.user);
      else logout();
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

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

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.success('Logged out');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error(data.message || 'Update failed');
        return false;
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user, 
      loading, 
      token, 
      login, 
      register, 
      logout, 
      updateProfile,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      isEmployee: user?.role === 'EMPLOYEE',
      isCustomer: user?.role === 'CUSTOMER'
    }}>
      {children}
    </AuthContext.Provider>
  );
};