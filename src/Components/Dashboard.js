import React, { useState, useContext, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, Menu, ShoppingBag, Tag, Bell, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [locationStatus, setLocationStatus] = useState('idle');
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'serviceProviders', user.uid));
          const locationDoc = await getDoc(doc(db, 'service-provider-location', user.uid));
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
          
          if (locationDoc.exists()) {
            setLastLocationUpdate(locationDoc.data().timestamp);
            setLocationStatus(locationDoc.data().location ? 'success' : 'idle');
          } else {
            // If location hasn't been set before, show the popup
            setShowLocationPopup(true);
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

  const requestLocation = () => {
    setLocationStatus('requesting');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await setDoc(doc(db, 'service-provider-location', user.uid), {
              location: { latitude, longitude },
              timestamp: serverTimestamp(),
              userId: user.uid,
              accuracy: position.coords.accuracy,
              lastUpdated: new Date().toISOString()
            });

            setLocationStatus('success');
            setLastLocationUpdate(new Date());
            setShowLocationPopup(false);
          } catch (error) {
            console.error("Error updating location:", error);
            setLocationStatus('error');
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus('error');
          // Handle specific geolocation errors
          switch(error.code) {
            case error.PERMISSION_DENIED:
              alert("Please enable location services to use this feature.");
              break;
            case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              alert("Location request timed out.");
              break;
            default:
              alert("An unknown error occurred.");
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setLocationStatus('unsupported');
    }
  };

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'} rounded-lg p-6 mb-6`}
        >
          <div className="flex items-center justify-between">
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
            <button
              onClick={() => setShowLocationPopup(true)}
              className={`flex items-center px-4 py-2 rounded-md ${
                isDarkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'
              } text-white transition-colors duration-200`}
            >
              <MapPin className="mr-2" size={18} />
              {locationStatus === 'success' ? 'Update Location' : 'Share Location'}
            </button>
          </div>
        </motion.div>

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

      {/* Location Popup */}
      <AnimatePresence>
        {showLocationPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              } rounded-lg p-6 max-w-md w-full shadow-xl`}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Share Your Location</h2>
                <button
                  onClick={() => setShowLocationPopup(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="mb-4">
                We use your location to map our service providers and improve features like ETA calculations. This helps us provide better service to our customers.
              </p>
              <button
                onClick={requestLocation}
                className={`w-full py-2 px-4 rounded-md ${
                  isDarkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'
                } text-white transition-colors duration-200`}
              >
                {locationStatus === 'requesting' ? 'Updating...' : 'Share Location'}
              </button>
              {locationStatus === 'success' && lastLocationUpdate && (
                <p className="mt-2 text-sm text-green-500">
                  Location last updated: {new Date(lastLocationUpdate).toLocaleString()}
                </p>
              )}
              {locationStatus === 'error' && (
                <p className="mt-2 text-sm text-red-500">Failed to update location. Please try again.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;