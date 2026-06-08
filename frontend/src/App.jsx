import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider } from './context/OrderContext';
import ProtectedRoute from './components/ProtectedRoute';
import DynamicDashboard from './components/DynamicDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WishlistPage from './pages/WishlistPage';
import OrdersPage from './pages/OrdersPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AccountPage from './pages/AccountPage';
import EmployeeOrdersPage from './pages/employee/EmployeeOrdersPage';
import EmployeeProductsPage from './pages/employee/EmployeeProductsPage';
import EmployeeInventoryPage from './pages/employee/EmployeeInventoryPage';
import EmployeeCustomersPage from './pages/employee/EmployeeCustomersPage';
import EmployeeSalesPage from './pages/employee/EmployeeSalesPage';
import EmployeeBannersPage from './pages/employee/EmployeeBannersPage';
import EmployeeRefundsPage from './pages/employee/EmployeeRefundsPage';
import EmployeeReviewsPage from './pages/employee/EmployeeReviewsPage';
import EmployeeAnalyticsPage from './pages/employee/EmployeeAnalyticsPage';
import AdminUsersPage from './components/admin/AdminUsersPage';
import AdminOrdersPage from './components/admin/AdminOrdersPage';
import AdminProductsPage from './components/admin/AdminProductsPage';
import AdminAuditLogsPage from './components/admin/AdminAuditLogsPage';
import AdminAnalyticsPage from './components/admin/AdminAnalyticsPage';
import AdminSettingsPage from './components/admin/AdminSettingsPage';

const EmployeePlaceholder = ({ title }) => (
  <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
    <div className="container mx-auto px-3 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum mb-6 sm:mb-8">{title}</h1>
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <p className="text-gray-600 text-sm sm:text-base">This page is under construction.</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              <Router>
                <div className="min-h-screen flex flex-col overflow-x-hidden">
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/track-order/:orderNumber" element={<OrderTrackingPage />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/dashboard" element={
                        <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                          <DynamicDashboard />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/employee/dashboard" element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                          <DynamicDashboard />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/employee/orders" element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                          <EmployeeOrdersPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/employee/products" element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                          <EmployeeProductsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/employee/inventory" element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                          <EmployeeInventoryPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/employee/customers" element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                          <EmployeeCustomersPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/employee/sales" element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                          <EmployeeSalesPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/employee/banners" element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                          <EmployeeBannersPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/employee/refunds" element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                          <EmployeeRefundsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/employee/reviews" element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                          <EmployeeReviewsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/employee/analytics" element={
                        <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
                          <EmployeeAnalyticsPage />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/admin/dashboard" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <DynamicDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/users" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminUsersPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/orders" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminOrdersPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/products" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminProductsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/analytics" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminAnalyticsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/settings" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminSettingsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/payments" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <EmployeePlaceholder title="Payment Gateways" />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/delivery" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <EmployeePlaceholder title="Delivery Settings" />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin/audit" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminAuditLogsPage />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </main>
                  <Footer />
                  <Toaster position="top-center" />
                </div>
              </Router>
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;