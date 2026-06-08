import React from 'react';
import { useAuth } from '../context/AuthContext';
import CustomerDashboard from './dashboards/CustomerDashboard';
import EmployeeDashboard from './dashboards/EmployeeDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const DynamicDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'EMPLOYEE':
      return <EmployeeDashboard />;
    default:
      return <CustomerDashboard />;
  }
};

export default DynamicDashboard;