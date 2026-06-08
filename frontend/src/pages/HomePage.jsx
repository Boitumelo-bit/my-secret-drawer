import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRightIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  ArrowPathIcon, 
  SparklesIcon, 
  HeartIcon, 
  StarIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  Squares2X2Icon,
  MapPinIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

// ==================== ANIMATION VARIANTS ====================
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const scaleOnHover = "transition-all duration-300 hover:scale-105 active:scale-95";

// ==================== COMPONENTS ====================

const CategoryCard = ({ category, index }) => {
  const CategoryIcon = category.icon;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-2xl cursor-pointer"
    >
      <img src={category.image} alt={category.name} className="w-full h-64 sm:h-72 md:h-80 object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 translate-y-6 group-hover:translate-y-0 transition-transform duration-400">
        <div className="flex items-center gap-2 mb-1">
          <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          <h3 className="text-xl sm:text-2xl font-playfair font-bold text-white">{category.name}</h3>
        </div>
        <Link to={category.link} className="inline-flex items-center text-white/90 text-xs sm:text-sm gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          Shop Now <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </motion.div>
  );
};

const ProductCard = ({ product }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="group"
  >
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
      <div className="relative overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-56 sm:h-64 md:h-72 object-cover group-hover:scale-110 transition-transform duration-700" />
        <button className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 z-10">
          <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        {product.isBestSeller && (
          <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-primary text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-md">Best Seller</span>
        )}
      </div>
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-playfair font-semibold text-darkPlum mb-2">{product.name}</h3>
        <div className="flex items-center mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-400 ml-2">({product.rating})</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-xl sm:text-2xl font-bold text-primary">LSL {product.price}</span>
          <Link to={`/product/${product.id}`} className="px-4 sm:px-5 py-2 sm:py-2.5 border-2 border-primary text-primary rounded-full text-xs sm:text-sm font-semibold hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 text-center">
            View Details
          </Link>
        </div>
      </div>
    </div>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div variants={fadeUp} className="group text-center">
    <div className="bg-white w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
      <Icon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary group-hover:text-secondary transition-colors" />
    </div>
    <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 text-darkPlum">{title}</h3>
    <p className="text-xs sm:text-sm text-gray-500">{description}</p>
  </motion.div>
);

const BannerSlider = ({ banners, title }) => {
  if (banners.length === 0) return null;
  return (
    <div className="mb-8 sm:mb-12">
      {title && <h2 className="text-xl sm:text-2xl md:text-3xl font-playfair font-bold text-darkPlum mb-4 sm:mb-6 text-center">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {banners.map((banner) => (
          <Link key={banner.id} to={banner.link || '#'} className="group overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-500 active:scale-[0.98]">
            <div className="overflow-hidden">
              <img src={banner.image} alt={banner.title} className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="p-4 sm:p-5">
              <h3 className="font-semibold text-base sm:text-lg mb-1">{banner.title}</h3>
              {banner.subtitle && <p className="text-xs sm:text-sm text-gray-500">{banner.subtitle}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <motion.div 
    variants={fadeUp}
    className="text-center mb-8 sm:mb-12"
  >
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-darkPlum mb-2 sm:mb-3">{title}</h2>
    {subtitle && <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto px-4">{subtitle}</p>}
  </motion.div>
);

// ==================== MAIN COMPONENT ====================

const HomePage = () => {
  const { user, isAuthenticated, isAdmin, isEmployee } = useAuth();
  const [heroBanners, setHeroBanners] = useState([]);
  const [categoryBanners, setCategoryBanners] = useState([]);
  const [sidebarBanners, setSidebarBanners] = useState([]);
  const [footerBanners, setFooterBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banners/active`);
      const data = await response.json();
      if (data.success) {
        setHeroBanners(data.banners.filter(b => b.position === 'home_hero'));
        setCategoryBanners(data.banners.filter(b => b.position === 'home_category'));
        setSidebarBanners(data.banners.filter(b => b.position === 'sidebar'));
        setFooterBanners(data.banners.filter(b => b.position === 'footer'));
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  const goToBanner = (index) => setCurrentBanner(index);
  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);

  const categories = [
    { name: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', link: '/products?category=dresses', icon: TagIcon },
    { name: 'Handbags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', link: '/products?category=handbags', icon: ShoppingBagIcon },
    { name: 'Shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', link: '/products?category=shoes', icon: TagIcon },
    { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500', link: '/products?category=beauty', icon: SparklesIcon },
  ];

  const features = [
    { icon: TruckIcon, title: 'Fast Delivery', description: 'Same-day delivery in Maseru' },
    { icon: ShieldCheckIcon, title: 'Secure Shopping', description: '100% secure checkout' },
    { icon: ArrowPathIcon, title: 'Easy Returns', description: '30-day return policy' },
    { icon: SparklesIcon, title: 'Premium Quality', description: 'Curated luxury items' },
  ];

  const featuredProducts = [
    { id: 1, name: 'Elegant Silk Dress', price: 1299, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', rating: 4.8, isBestSeller: true },
    { id: 2, name: 'Designer Handbag', price: 2499, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', rating: 4.9, isBestSeller: true },
    { id: 3, name: 'Luxury Skincare Set', price: 899, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500', rating: 4.8, isBestSeller: false },
  ];

  const quickLinks = isAuthenticated ? (
    isAdmin ? [
      { title: 'User Management', link: '/admin/users', icon: UserGroupIcon },
      { title: 'All Orders', link: '/admin/orders', icon: ShoppingBagIcon },
      { title: 'Analytics', link: '/admin/analytics', icon: ChartBarIcon },
      { title: 'Settings', link: '/admin/settings', icon: Cog6ToothIcon },
    ] : isEmployee ? [
      { title: 'Manage Orders', link: '/employee/orders', icon: ShoppingBagIcon },
      { title: 'Manage Products', link: '/employee/products', icon: TagIcon },
      { title: 'Inventory', link: '/employee/inventory', icon: Squares2X2Icon },
      { title: 'Customers', link: '/employee/customers', icon: UserGroupIcon },
    ] : [
      { title: 'My Orders', link: '/orders', icon: ClipboardDocumentListIcon },
      { title: 'My Wishlist', link: '/wishlist', icon: HeartIcon },
      { title: 'My Account', link: '/account', icon: UserCircleIcon },
      { title: 'Track Order', link: '/track-order', icon: MapPinIcon },
    ]
  ) : [];

  const hasHeroBanners = heroBanners.length > 0;
  const activeBanner = heroBanners[currentBanner];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-tertiary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <main>
        {/* HERO SECTION */}
        <section className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-primary via-secondary to-tertiary">
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20 w-full">
            <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
              {/* Left Content */}
              <motion.div 
                key={hasHeroBanners ? currentBanner : 'default'}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex-1 text-center lg:text-left px-4 sm:px-0"
              >
                <span className="inline-block px-4 sm:px-5 py-1 sm:py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                  New Collection {currentYear}
                </span>
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-bold text-white leading-tight mb-3 sm:mb-4">
                  {hasHeroBanners && activeBanner?.title ? activeBanner.title : 'Stylish Female'}
                  <br />
                  {hasHeroBanners && activeBanner?.subtitle ? activeBanner.subtitle : 'Clothes'}
                </h1>
                <p className="text-white/90 text-sm sm:text-base md:text-lg mb-5 sm:mb-6 max-w-md mx-auto lg:mx-0">
                  {hasHeroBanners && activeBanner?.description ? activeBanner.description : 'Made from Soft, Durable, US-grown Supima Cotton.'}
                </p>
                <Link to={hasHeroBanners && activeBanner?.link ? activeBanner.link : '/products'} className={`inline-flex items-center justify-center gap-2 bg-white text-primary px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full font-semibold shadow-lg hover:shadow-2xl ${scaleOnHover}`}>
                  Shop Now
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </motion.div>
              
              {/* Right Image - Circular */}
              <motion.div 
                key={hasHeroBanners ? `img-${currentBanner}` : 'default-img'}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex-1 flex justify-center"
              >
                <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] rounded-full overflow-hidden shadow-2xl">
                  {hasHeroBanners && activeBanner?.image ? (
                    <img 
                      src={activeBanner.image} 
                      alt={activeBanner.title || 'Fashion'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800';
                      }}
                    />
                  ) : (
                    <img 
                      src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800" 
                      alt="Fashion" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 rounded-full ring-4 ring-white/20" />
                </div>
              </motion.div>
            </div>
            
            {/* Banner Navigation Dots */}
            {heroBanners.length > 1 && (
              <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex justify-center gap-2">
                {heroBanners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToBanner(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentBanner ? 'bg-white w-6 sm:w-8' : 'bg-white/40 w-1.5'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Navigation Arrows - Hide on very small screens */}
            {heroBanners.length > 1 && (
              <>
                <button 
                  onClick={prevBanner} 
                  className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center hover:bg-white/20 transition-all duration-300 z-30"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={nextBanner} 
                  className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center hover:bg-white/20 transition-all duration-300 z-30"
                >
                  <ChevronRightIcon className="w-5 h-5 text-white" />
                </button>
              </>
            )}
          </div>
        </section>

        {/* QUICK LINKS SECTION */}
        {isAuthenticated && quickLinks.length > 0 && (
          <section className="py-6 sm:py-8 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                {quickLinks.map((link, idx) => (
                  <Link key={idx} to={link.link} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50/80 rounded-2xl hover:bg-gray-100 hover:shadow-md transition-all duration-300 active:scale-97 group">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <link.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <span className="font-medium text-darkPlum text-xs sm:text-sm">{link.title}</span>
                    </div>
                    <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* BANNERS SECTION */}
        <BannerSlider banners={categoryBanners} title="Special Offers" />

        {/* FEATURES SECTION */}
        <section className="py-12 sm:py-20 bg-gradient-to-b from-pink-50/50 to-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <SectionHeader title="Why Choose Us" subtitle="Experience the best in luxury shopping with our premium services" />
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
            >
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* SHOP BY CATEGORY */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20">
          <SectionHeader title="Shop by Category" subtitle="Explore our curated collections" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={index} category={category} index={index} />
            ))}
          </div>
        </div>

        {/* SIDEBAR BANNERS */}
        {sidebarBanners.length > 0 && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sidebarBanners.map((banner) => (
                <Link key={banner.id} to={banner.link || '#'} className="group overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 active:scale-98">
                  <img src={banner.image} alt={banner.title} className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition duration-500" />
                  <div className="p-4 sm:p-5">
                    <h3 className="font-semibold text-base sm:text-lg mb-1">{banner.title}</h3>
                    {banner.subtitle && <p className="text-xs sm:text-sm text-gray-500">{banner.subtitle}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FEATURED PRODUCTS */}
        {!isEmployee && (
          <section className="py-12 sm:py-20 bg-gradient-to-b from-white to-pink-50/30">
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
              <SectionHeader title="Featured Collection" subtitle="Our most loved pieces, curated just for you" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center mt-8 sm:mt-12">
                <Link to="/products" className={`inline-flex items-center gap-2 bg-primary text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full font-semibold shadow-md hover:shadow-xl ${scaleOnHover}`}>
                  <span>View All Products</span>
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* FOOTER BANNERS */}
        <BannerSlider banners={footerBanners} title="" />

        {/* ROLE-SPECIFIC SECTIONS */}
        {isEmployee && !isAdmin && (
          <section className="py-12 sm:py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 text-center">
              <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum mb-3">Management Hub</h2>
              <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto mb-6 sm:mb-8 px-4">Access your management tools from the dashboard.</p>
              <Link to="/employee/dashboard" className={`inline-flex items-center gap-2 bg-primary text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold hover:bg-secondary transition shadow-md hover:shadow-lg ${scaleOnHover}`}>
                Go to Dashboard
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {isAdmin && (
          <section className="py-12 sm:py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 text-center">
              <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum mb-3">Admin Control Center</h2>
              <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto mb-6 sm:mb-8 px-4">Full system control. Manage users, view analytics, and more.</p>
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center px-4">
                <Link to="/admin/users" className={`bg-primary text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-semibold hover:bg-secondary transition shadow-md hover:shadow-lg ${scaleOnHover}`}>Manage Users</Link>
                <Link to="/admin/analytics" className="border-2 border-primary text-primary px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-semibold hover:bg-primary hover:text-white transition-all duration-300 active:scale-95">View Analytics</Link>
                <Link to="/admin/settings" className="border border-gray-300 text-gray-600 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-semibold hover:border-primary hover:text-primary transition-all duration-300 active:scale-95">Settings</Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default HomePage;