import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-pink-50 to-white border-t border-pink-100 mt-16 sm:mt-20">
      <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-16">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">

          {/* Brand */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              My Secret <span className="text-pink-500">Drawer</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto md:mx-0">
              Discover luxury fashion, beauty, and lifestyle products curated
              for the modern African woman.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-5 text-gray-900">
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
              <li>
                <Link to="/" className="hover:text-pink-500 transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-pink-500 transition-colors duration-300">
                  Shop
                </Link>
              </li>
            
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-5 text-gray-900">
              Contact Us
            </h3>
            <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base">
              <p className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-pink-500">📍</span> Maseru, Lesotho
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-pink-500">📞</span> +266 1234 5678
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-pink-500">✉️</span> hello@mysecretdrawer.com
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-pink-100 mt-8 sm:mt-12 pt-5 sm:pt-6 text-center">
          <p className="text-gray-500 text-[11px] sm:text-xs md:text-sm">
            © {currentYear} My Secret Drawer. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;