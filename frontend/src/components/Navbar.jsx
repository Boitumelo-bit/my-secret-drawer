import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  UserCircleIcon, 
  MagnifyingGlassIcon, 
  Bars3Icon, 
  XMarkIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ShieldCheckIcon,
  PhotoIcon,
  TagIcon,
  StarIcon,
  CreditCardIcon,
  TruckIcon,
  DocumentTextIcon,
  CubeIcon,
  ShoppingBagIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isEmployee, isCustomer } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (isAdmin) return '/admin/dashboard';
    if (isEmployee) return '/employee/dashboard';
    return '/dashboard';
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return <span className="ml-2 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-0.5 rounded-full font-medium shadow-sm">Admin</span>;
    }
    if (isEmployee) {
      return <span className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-0.5 rounded-full font-medium shadow-sm">Staff</span>;
    }
    return null;
  };

  // ============ CUSTOMER NAVIGATION ============
  const getCustomerNavLinks = () => {
    if (!isCustomer) return [];
    return [
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/products' },
    ];
  };

  // ============ EMPLOYEE NAVIGATION ============
  const getEmployeeNavLinks = () => {
    if (!isEmployee) return [];
    return [
      { name: 'Home', path: '/' },
      { name: 'Analytics', path: '/employee/analytics' },
      { name: 'Banners', path: '/employee/banners' },
    ];
  };

  // Employee Dropdown
  const getEmployeeDropdownItems = () => {
    if (!isEmployee) return [];
    return [
      { name: 'Employee Dashboard', path: '/employee/dashboard', icon: ChartBarIcon, group: 1 },
      { name: 'Orders', path: '/employee/orders', icon: ShoppingBagIcon, badge: 5, group: 1 },
      { name: 'Products', path: '/employee/products', icon: CubeIcon, group: 1 },
      { name: 'Inventory', path: '/employee/inventory', icon: CubeIcon, group: 1 },
      { name: 'Customers', path: '/employee/customers', icon: UserIcon, group: 1 },
      { divider: true, group: 1 },
      { name: 'Approve Reviews', path: '/employee/reviews', icon: StarIcon, group: 2 },
      { name: 'Create Sales', path: '/employee/sales', icon: TagIcon, group: 2 },
      { divider: true, group: 2 },
      { name: 'Process Refunds', path: '/employee/refunds', icon: ArrowPathIcon, group: 3 },
      { divider: true, group: 3 },
      { name: 'Sign Out', path: '#', icon: ArrowPathIcon, isLogout: true, group: 4 },
    ];
  };

  // ============ ADMIN NAVIGATION ============
  const getAdminNavLinks = () => {
    if (!isAdmin) return [];
    return [
      { name: 'Analytics', path: '/admin/analytics' },
      { name: 'Settings', path: '/admin/settings' },
    ];
  };

  // Admin Dropdown
  const getAdminDropdownItems = () => {
    if (!isAdmin) return [];
    return [
      { name: 'Admin Dashboard', path: '/admin/dashboard', icon: ChartBarIcon, group: 1 },
      { name: 'Manage Users', path: '/admin/users', icon: UserIcon, group: 1 },
      { name: 'All Orders', path: '/admin/orders', icon: ShoppingBagIcon, badge: 4, group: 1 },
      { name: 'Manage Products', path: '/admin/products', icon: CubeIcon, group: 1 },
      { divider: true, group: 1 },
      { name: 'Payment Gateways', path: '/admin/payments', icon: CreditCardIcon, group: 2 },
      { name: 'Delivery Settings', path: '/admin/delivery', icon: TruckIcon, group: 2 },
      { divider: true, group: 2 },
      { name: 'Audit Logs', path: '/admin/audit', icon: DocumentTextIcon, group: 3 },
      { divider: true, group: 3 },
      { name: 'Sign Out', path: '#', icon: ArrowPathIcon, isLogout: true, group: 4 },
    ];
  };

  // ============ PUBLIC NAVIGATION FOR NON-AUTHENTICATED USERS ============
  const getPublicNavLinks = () => {
    return [
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/products' },
    ];
  };

  const getNavLinks = () => {
    if (isAdmin) return getAdminNavLinks();
    if (isEmployee) return getEmployeeNavLinks();
    if (isCustomer) return getCustomerNavLinks();
    return getPublicNavLinks();
  };

  const getDropdownItems = () => {
    if (isAdmin) return getAdminDropdownItems();
    if (isEmployee) return getEmployeeDropdownItems();
    return [
      { name: 'My Dashboard', path: '/dashboard', icon: ChartBarIcon },
      { name: 'My Orders', path: '/orders', icon: ClipboardDocumentListIcon },
      { name: 'My Wishlist', path: '/wishlist', icon: HeartIcon, badge: wishlistCount },
      { name: 'Profile & Addresses', path: '/account', icon: UserIcon },
      { divider: true },
      { name: 'Sign Out', path: '#', icon: ArrowPathIcon, isLogout: true },
    ];
  };

  const navLinks = getNavLinks();
  const dropdownItems = getDropdownItems();
  const showCart = isCustomer;

  const isActive = (path) => location.pathname === path;

  const getDropdownName = () => {
    if (isAdmin) return 'Admin Menu';
    if (isEmployee) return 'Staff Menu';
    return user?.name?.split(' ')[0] || 'Account';
  };

  const getDropdownIcon = () => {
    if (isAdmin) return <ShieldCheckIcon className="w-5 h-5" />;
    return <UserCircleIcon className="w-5 h-5" />;
  };

  const cartAriaLabel = `Cart${cartCount > 0 ? ` with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}` : ''}`;

  const groupedDropdownItems = (items) => {
    const groups = [];
    let currentGroup = [];
    
    for (const item of items) {
      if (item.divider) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
          currentGroup = [];
        }
        groups.push({ isDivider: true });
      } else {
        currentGroup.push(item);
      }
    }
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    return groups;
  };

  const adminDropdownGroups = isAdmin ? groupedDropdownItems(dropdownItems) : null;

  // Mobile menu items (includes Wishlist)
  const mobileMenuItems = [
    ...navLinks,
    { divider: true },
    { name: 'Dashboard', path: getDashboardLink(), icon: ChartBarIcon },
    { name: 'My Orders', path: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'My Wishlist', path: '/wishlist', icon: HeartIcon, badge: wishlistCount },
    { name: 'Profile', path: '/account', icon: UserIcon },
    { divider: true },
    { name: 'Notifications', path: '#', icon: 'bell', isNotification: true },
    { divider: true },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/98 backdrop-blur-md shadow-md py-2' : 'bg-white/90 backdrop-blur-sm py-3'
      }`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <Link to="/" className="group shrink-0 active:scale-95 transition-transform duration-200">
              <div className="flex items-baseline">
                <span className="text-lg md:text-2xl font-playfair font-bold bg-gradient-to-r from-[#FF1493] via-[#FF69B4] to-[#FF1493] bg-clip-text text-transparent">
                  My Secret
                </span>
                <div className="flex items-center ml-1">
                  <span className="text-lg md:text-2xl font-playfair font-bold text-[#6A1B9A]">
                    Drawer
                  </span>
                  <div className="hidden md:block w-1.5 h-1.5 bg-gradient-to-r from-[#FF1493] to-[#FF69B4] rounded-full ml-2 opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {!isAuthenticated && (
                <>
                  <Link to="/" className={`relative text-[#1A1A1A] hover:text-[#FF1493] transition-all duration-300 font-medium py-2 ${isActive('/') ? 'text-[#FF1493]' : ''}`}>
                    Home
                  </Link>
                  <Link to="/products" className={`relative text-[#1A1A1A] hover:text-[#FF1493] transition-all duration-300 font-medium py-2 ${isActive('/products') ? 'text-[#FF1493]' : ''}`}>
                    Shop
                  </Link>
                </>
              )}
              
              {isCustomer && (
                <>
                  <Link to="/" className={`relative text-[#1A1A1A] hover:text-[#FF1493] transition-all duration-300 font-medium py-2 ${isActive('/') ? 'text-[#FF1493]' : ''}`}>
                    Home
                  </Link>
                  <Link to="/products" className={`relative text-[#1A1A1A] hover:text-[#FF1493] transition-all duration-300 font-medium py-2 ${isActive('/products') ? 'text-[#FF1493]' : ''}`}>
                    Shop
                  </Link>
                </>
              )}
              
              {isEmployee && (
                <>
                  <Link to="/employee/analytics" className={`relative text-[#1A1A1A] hover:text-[#FF1493] transition-all duration-300 font-medium py-2 ${isActive('/employee/analytics') ? 'text-[#FF1493]' : ''}`}>
                    Analytics
                  </Link>
                  <Link to="/employee/banners" className={`relative text-[#1A1A1A] hover:text-[#FF1493] transition-all duration-300 font-medium py-2 ${isActive('/employee/banners') ? 'text-[#FF1493]' : ''}`}>
                    Banners
                  </Link>
                </>
              )}
              
              {isAdmin && (
                <>
                  <Link to="/admin/analytics" className={`relative text-[#1A1A1A] hover:text-[#FF1493] transition-all duration-300 font-medium py-2 ${isActive('/admin/analytics') ? 'text-[#FF1493]' : ''}`}>
                    Analytics
                  </Link>
                  <Link to="/admin/settings" className={`relative text-[#1A1A1A] hover:text-[#FF1493] transition-all duration-300 font-medium py-2 ${isActive('/admin/settings') ? 'text-[#FF1493]' : ''}`}>
                    Settings
                  </Link>
                </>
              )}
            </div>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-1 md:gap-2">
              <NotificationBell />
              
              <button className="text-[#1A1A1A] hover:text-[#FF1493] transition-all duration-200 p-2 rounded-full hover:bg-pink-50 active:scale-95">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
              
              {/* Cart - Only for Customers */}
              {showCart && (
                <button 
                  onClick={() => setIsCartDrawerOpen(true)}
                  className="relative text-[#1A1A1A] hover:text-[#FF1493] transition-all duration-200 p-2 rounded-full hover:bg-pink-50 active:scale-95"
                  aria-label={cartAriaLabel}
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              )}
              
              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-1 text-[#1A1A1A] hover:text-[#FF1493] transition-all duration-200 p-1.5 rounded-full hover:bg-pink-50 active:scale-95">
                    {getDropdownIcon()}
                    <span className="text-sm font-medium hidden lg:inline ml-1">
                      {getDropdownName()}
                      {getRoleBadge()}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 hidden lg:block text-gray-400 group-hover:text-[#FF1493] transition-all duration-200" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100 overflow-hidden">
                    <div className="py-2 max-h-96 overflow-y-auto">
                      {isAdmin ? (
                        adminDropdownGroups.map((group, groupIdx) => (
                          <div key={groupIdx}>
                            {group.isDivider ? (
                              <div className="border-t border-gray-100 my-2 mx-3"></div>
                            ) : (
                              group.map((item) => (
                                item.isLogout ? (
                                  <button
                                    key={item.name}
                                    onClick={logout}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                                  >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                  </button>
                                ) : (
                                  <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-pink-50 transition-all duration-200 ${isActive(item.path) ? 'bg-pink-50 text-[#FF1493] border-l-3 border-[#FF1493]' : 'text-gray-700'}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <item.icon className="w-5 h-5 text-gray-400 group-hover:text-[#FF1493] transition-colors" />
                                      <span className="font-medium">{item.name}</span>
                                    </div>
                                    {item.badge && (
                                      <span className="bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center shadow-sm">
                                        {item.badge}
                                      </span>
                                    )}
                                  </Link>
                                )
                              ))
                            )}
                          </div>
                        ))
                      ) : isEmployee ? (
                        dropdownItems.map((item) => (
                          item.isLogout ? (
                            <button
                              key={item.name}
                              onClick={logout}
                              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                            >
                              <item.icon className="w-5 h-5" />
                              <span>{item.name}</span>
                            </button>
                          ) : item.divider ? (
                            <div key={`divider-${item.name}`} className="border-t border-gray-100 my-2 mx-3"></div>
                          ) : (
                            <Link
                              key={item.name}
                              to={item.path}
                              className={`flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-pink-50 transition-all duration-200 ${isActive(item.path) ? 'bg-pink-50 text-[#FF1493] border-l-3 border-[#FF1493]' : 'text-gray-700'}`}
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5 text-gray-400" />
                                <span className="font-medium">{item.name}</span>
                              </div>
                              {item.badge && (
                                <span className="bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-sm">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          )
                        ))
                      ) : (
                        // CUSTOMER DROPDOWN - Includes Wishlist
                        dropdownItems.map((item) => (
                          item.isLogout ? (
                            <button
                              key={item.name}
                              onClick={logout}
                              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                            >
                              <item.icon className="w-5 h-5" />
                              <span>Sign Out</span>
                            </button>
                          ) : item.divider ? (
                            <div key={`divider-${item.name}`} className="border-t border-gray-100 my-2 mx-3"></div>
                          ) : (
                            <Link
                              key={item.name}
                              to={item.path}
                              className={`flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-pink-50 transition-all duration-200 ${isActive(item.path) ? 'bg-pink-50 text-[#FF1493] border-l-3 border-[#FF1493]' : 'text-gray-700'}`}
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5 text-gray-400" />
                                <span className="font-medium">{item.name}</span>
                              </div>
                              {item.badge > 0 && (
                                <span className="bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center shadow-sm">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          )
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Icons - Only Logo, Cart, and 3-dots Menu */}
            <div className="flex md:hidden items-center gap-2">
              {/* Cart - Only for Customers */}
              {showCart && (
                <button 
                  onClick={() => setIsCartDrawerOpen(true)}
                  className="relative text-[#1A1A1A] p-2 rounded-full active:scale-95"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              
              {/* Mobile Menu Button (3-dots) */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="text-[#1A1A1A] p-2 rounded-xl hover:bg-pink-50 transition-all duration-200 active:scale-95"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Drawer - Contains all options */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-6 border-t border-gray-100 pt-4 animate-slide-down max-h-[80vh] overflow-y-auto">
              {/* Search Bar */}
              <div className="relative mb-4 px-2">
                <MagnifyingGlassIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF1493]/20"
                />
              </div>
              
              {/* Navigation Links */}
              <div className="flex flex-col space-y-1">
                {navLinks.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-[#1A1A1A] hover:text-[#FF1493] py-3 px-4 rounded-xl hover:bg-pink-50 transition-all duration-200"
                  >
                    {item.name === 'Home' && <HomeIcon className="w-5 h-5" />}
                    {item.name === 'Shop' && <ShoppingBagIcon className="w-5 h-5" />}
                    {item.name === 'Analytics' && <ChartBarIcon className="w-5 h-5" />}
                    {item.name === 'Banners' && <PhotoIcon className="w-5 h-5" />}
                    {item.name === 'Settings' && <Cog6ToothIcon className="w-5 h-5" />}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                
                <div className="border-t border-gray-100 my-3"></div>
                
                {isAuthenticated ? (
                  <>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-[#1A1A1A] hover:text-[#FF1493] py-3 px-4 rounded-xl hover:bg-pink-50 transition-all duration-200"
                    >
                      <ChartBarIcon className="w-5 h-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-[#1A1A1A] hover:text-[#FF1493] py-3 px-4 rounded-xl hover:bg-pink-50 transition-all duration-200"
                    >
                      <ClipboardDocumentListIcon className="w-5 h-5" />
                      <span className="font-medium">My Orders</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-[#1A1A1A] hover:text-[#FF1493] py-3 px-4 rounded-xl hover:bg-pink-50 transition-all duration-200"
                    >
                      <HeartIcon className="w-5 h-5" />
                      <span className="font-medium">My Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="ml-auto bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white text-xs font-bold rounded-full px-2 py-0.5">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-[#1A1A1A] hover:text-[#FF1493] py-3 px-4 rounded-xl hover:bg-pink-50 transition-all duration-200"
                    >
                      <UserIcon className="w-5 h-5" />
                      <span className="font-medium">Profile & Addresses</span>
                    </Link>
                    
                    <div className="border-t border-gray-100 my-3"></div>
                    
                    {/* Notifications in mobile menu */}
                    <div className="flex items-center justify-between py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span>🔔</span>
                        <span className="font-medium">Notifications</span>
                      </div>
                      <NotificationBell />
                    </div>
                    
                    <div className="border-t border-gray-100 my-3"></div>
                    
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-3 text-red-600 hover:bg-red-50 py-3 px-4 rounded-xl transition-all duration-200 font-medium"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-[#1A1A1A] hover:text-[#FF1493] py-3 px-4 rounded-xl hover:bg-pink-50 transition-all duration-200"
                    >
                      <UserCircleIcon className="w-5 h-5" />
                      <span className="font-medium">Sign In</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-[#1A1A1A] hover:text-[#FF1493] py-3 px-4 rounded-xl hover:bg-pink-50 transition-all duration-200"
                    >
                      <UserPlusIcon className="w-5 h-5" />
                      <span className="font-medium">Create Account</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Cart Drawer */}
      {isCartDrawerOpen && showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto animate-slide-in-right shadow-2xl">
            <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <h2 className="text-2xl font-playfair font-bold bg-gradient-to-r from-[#FF1493] to-[#FF69B4] bg-clip-text text-transparent">
                My Cart ({cartCount} items)
              </h2>
              <button 
                onClick={() => setIsCartDrawerOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 active:scale-90"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {cartCount > 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading your cart...</p>
                  <Link 
                    to="/cart" 
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="block w-full bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white text-center py-3 rounded-xl mt-6 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 font-semibold"
                  >
                    View Full Cart
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCartIcon className="w-20 h-20 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <Link 
                    to="/products" 
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="block w-full bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white text-center py-3 rounded-xl mt-6 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 font-semibold"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slide-down {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-slide-down {
          animation: slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;