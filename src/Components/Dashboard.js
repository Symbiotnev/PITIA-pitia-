import React, { useState, useContext, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeContext, AuthContext } from '../App';
import { db } from '../libs/firebase_config.mjs';
import Navbar from './Navbar';

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
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'} rounded-lg p-6`}
          >
            <div className="flex items-center mb-4">
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

        {/* Dashboard Content Placeholder */}
        <div className="px-4 py-6 sm:px-0">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Your Dashboard Content
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              This is where your dashboard content will go. You can add various sections, statistics, and features specific to your business needs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;