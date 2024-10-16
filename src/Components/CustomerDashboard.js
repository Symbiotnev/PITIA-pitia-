import React, { useState, useContext, useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { User, ShoppingCart, FileText, Star, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeContext, AuthContext } from '../App';
import { db } from '../libs/firebase_config.mjs';
import Navbar from '../Components/Navbar';

// Import customer components
import MenuComponent from '../customer/MenuComponent';
import CartComponent from '../customer/CartComponent';
import OrdersComponent from '../customer/OrdersComponent';
import ReviewsComponent from '../customer/ReviewsComponent';

const CustomerDashboard = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'clients', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const isActive = (path) => location.pathname === `/customer${path}`;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg mb-6`}
        >
          <div className="flex items-center mb-4">
            <User className="h-12 w-12 text-orange-500 mr-4" />
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome back, {userData?.name}!
              </h1>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Explore our menu, place orders, and leave reviews
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-6">
          <nav className={`flex space-x-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-2 rounded-lg shadow-md`}>
            <Link
              to="/customer/menu"
              className={`flex items-center px-3 py-2 rounded-md ${isActive('/menu') ? 'bg-orange-500 text-white' : ''}`}
            >
              <Menu className="mr-2" size={18} />
              Menu
            </Link>
            <Link
              to="/customer/cart"
              className={`flex items-center px-3 py-2 rounded-md ${isActive('/cart') ? 'bg-orange-500 text-white' : ''}`}
            >
              <ShoppingCart className="mr-2" size={18} />
              Cart
            </Link>
            <Link
              to="/customer/orders"
              className={`flex items-center px-3 py-2 rounded-md ${isActive('/orders') ? 'bg-orange-500 text-white' : ''}`}
            >
              <FileText className="mr-2" size={18} />
              Orders
            </Link>
            <Link
              to="/customer/reviews"
              className={`flex items-center px-3 py-2 rounded-md ${isActive('/reviews') ? 'bg-orange-500 text-white' : ''}`}
            >
              <Star className="mr-2" size={18} />
              Reviews
            </Link>
          </nav>
        </div>

        {/* Content Area */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
          <Routes>
            <Route path="menu" element={<MenuComponent />} />
            <Route path="cart" element={<CartComponent />} />
            <Route path="orders" element={<OrdersComponent />} />
            <Route path="reviews" element={<ReviewsComponent />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;