import React, { useState, useContext, useEffect } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, ShoppingCart, FileText, Star, Menu, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeContext, AuthContext } from '../App';
import { db } from '../libs/firebase_config.mjs';
import Navbar from '../Components/Navbar';

// Import customer components
import MenuComponent from '../customer/MenuComponent';
import CartComponent from '../customer/CartComponent';
import OrdersComponent from '../customer/OrdersComponent';
import ReviewsComponent from '../customer/ReviewsComponent';

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
            Click to view
          </p>
        </div>
        <Icon className="h-8 w-8 text-orange-500" />
      </div>
    </motion.div>
  </Link>
);

const CustomerDashboard = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState('idle');
  const navigate = useLocation(); // Changed from location to navigate for clarity
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'clients', user.uid));
          const locationDoc = await getDoc(doc(db, 'client-location', user.uid));
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
          
          if (locationDoc.exists()) {
            setLastLocationUpdate(locationDoc.data().timestamp);
            setLocationStatus(locationDoc.data().location ? 'success' : 'idle');
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
            // Store location in client-location collection
            await setDoc(doc(db, 'client-location', user.uid), {
              location: { latitude, longitude },
              timestamp: serverTimestamp(),
              userId: user.uid,
              accuracy: position.coords.accuracy,
              lastUpdated: new Date().toISOString()
            });

            setLocationStatus('success');
            setLastLocationUpdate(new Date());
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
          
          {/* Location Request Section */}
          <div className="mt-4">
            <button
              onClick={requestLocation}
              disabled={locationStatus === 'requesting'}
              className={`flex items-center px-4 py-2 rounded-md ${
                isDarkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'
              } text-white transition-colors duration-200 ${
                locationStatus === 'requesting' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <MapPin className="mr-2" size={18} />
              {locationStatus === 'idle' && "Share Your Location"}
              {locationStatus === 'requesting' && "Updating Location..."}
              {locationStatus === 'success' && "Update Location"}
              {locationStatus === 'error' && "Retry Sharing Location"}
              {locationStatus === 'unsupported' && "Location Not Supported"}
            </button>
            
            {locationStatus === 'success' && lastLocationUpdate && (
              <p className="mt-2 text-sm text-green-500">
                Location last updated: {new Date(lastLocationUpdate).toLocaleString()}
              </p>
            )}
            {locationStatus === 'error' && (
              <p className="mt-2 text-sm text-red-500">Failed to update location. Please try again.</p>
            )}
          </div>
        </motion.div>

        {/* Rest of the component remains the same */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <DashboardCard
            title="Menu"
            icon={Menu}
            link="/customer/menu"
            isDarkMode={isDarkMode}
          />
          <DashboardCard
            title="Cart"
            icon={ShoppingCart}
            link="/customer/cart"
            isDarkMode={isDarkMode}
          />
          <DashboardCard
            title="Orders"
            icon={FileText}
            link="/customer/orders"
            isDarkMode={isDarkMode}
          />
          <DashboardCard
            title="Reviews"
            icon={Star}
            link="/customer/reviews"
            isDarkMode={isDarkMode}
          />
        </div>

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