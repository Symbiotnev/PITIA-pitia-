import React, { useState, useContext, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { User, Menu, ShoppingBag, Tag, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ThemeContext, AuthContext } from '../App';
import { db } from '../libs/firebase_config.mjs';
import Navbar from './Navbar';

const DashboardCard = ({ title, icon: Icon, link, isDarkMode }) => (
  <Link to={link}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${
        isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      } shadow-lg rounded-lg p-6 cursor-pointer transition-colors duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Click to manage
          </p>
        </div>
        <Icon className="h-8 w-8 text-orange-500" />
      </div>
    </motion.div>
  </Link>
);

const Dashboard = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'serviceProviders', user.uid));
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'} rounded-lg p-6 mb-6`}
          >
            <div className="flex items-center">
              <User className="h-12 w-12 text-orange-500 mr-4" />
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome back, {userData?.businessName}!
                </h1>
                <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {userData?.businessType.charAt(0).toUpperCase() + userData?.businessType.slice(1)} Dashboard
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Cards */}
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Update Menu"
              icon={Menu}
              link="/admin/menu"
              isDarkMode={isDarkMode}
            />
            <DashboardCard
              title="View Orders"
              icon={ShoppingBag}
              link="/admin/orders"
              isDarkMode={isDarkMode}
            />
            <DashboardCard
              title="Create Promos"
              icon={Tag}
              link="/admin/promos"
              isDarkMode={isDarkMode}
            />
            <DashboardCard
              title="Notifications"
              icon={Bell}
              link="/admin/notifications"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;