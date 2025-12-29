import React from 'react';
import { Link } from 'react-router-dom';

const Sitemap: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sitemap</h1>
          <p className="text-lg text-gray-600">
            Find all the pages and sections of our website
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Main Pages */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Main Pages</h2>
            <ul className="space-y-2">
              <li><Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link></li>
              <li><Link to="/products" className="text-blue-600 hover:text-blue-800">Products</Link></li>
              <li><Link to="/about" className="text-blue-600 hover:text-blue-800">About</Link></li>
              <li><Link to="/contact" className="text-blue-600 hover:text-blue-800">Contact</Link></li>
              <li><Link to="/gallery" className="text-blue-600 hover:text-blue-800">Gallery</Link></li>
            </ul>
          </div>

          {/* User Pages */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Pages</h2>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-blue-600 hover:text-blue-800">Login</Link></li>
              <li><Link to="/signup" className="text-blue-600 hover:text-blue-800">Sign Up</Link></li>
              <li><Link to="/profile" className="text-blue-600 hover:text-blue-800">Profile</Link></li>
              <li><Link to="/orders" className="text-blue-600 hover:text-blue-800">Orders</Link></li>
              <li><Link to="/wishlist" className="text-blue-600 hover:text-blue-800">Wishlist</Link></li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Legal</h2>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-blue-600 hover:text-blue-800">Terms of Service</Link></li>
              <li><Link to="/return-policy" className="text-blue-600 hover:text-blue-800">Return Policy</Link></li>
              <li><Link to="/shipping-info" className="text-blue-600 hover:text-blue-800">Shipping Info</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
      