import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './libs/firebase_config.mjs';
import { doc, getDoc } from 'firebase/firestore';
import LandingPage from './Components/LandingPage';
import ClientAuth from './Components/ClientAuth';
import ServiceProviderAuth from './Components/ServiceProviderAuth';
import Dashboard from './Components/Dashboard';
import CustomerDashboard from './Components/CustomerDashboard';
import { getStoredTheme, toggleStoredTheme } from './utils/localStorageUtil';

// Import new admin components
import Menu from './admin/Menu';
import Promos from './admin/Promos';
import Notifications from './admin/Notifications';
import Orders from './admin/Orders';

export const AuthContext = React.createContext();
export const ThemeContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(getStoredTheme() === 'dark');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if this is a new registration
        const isNewRegistration = sessionStorage.getItem('isNewRegistration');
        if (isNewRegistration) {
          // Clear the flag
          sessionStorage.removeItem('isNewRegistration');
          // Sign out the user
          await signOut(auth);
          setUser(null);
          setUserType(null);
        } else {
          setUser(firebaseUser);
          // Determine user type
          const userDoc = await getDoc(doc(db, 'clients', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserType('client');
          } else {
            setUserType('serviceProvider');
          }
        }
      } else {
        setUser(null);
        setUserType(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newTheme = toggleStoredTheme();
    setIsDarkMode(newTheme === 'dark');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, userType }}>
      <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
        <Router>
          <div className={`App ${isDarkMode ? 'dark' : ''}`}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/client-auth"
                element={user ? <Navigate to="/dashboard" replace /> : <ClientAuth />}
              />
              <Route
                path="/provider-auth"
                element={user ? <Navigate to="/dashboard" replace /> : <ServiceProviderAuth />}
              />
              <Route
                path="/dashboard"
                element={
                  user ? (
                    userType === 'client' ? <CustomerDashboard /> : <Dashboard />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              {/* New routes for admin components */}
              <Route
                path="/admin/menu"
                element={
                  user && userType === 'serviceProvider' ? (
                    <Menu />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/admin/promos"
                element={
                  user && userType === 'serviceProvider' ? (
                    <Promos />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  user && userType === 'serviceProvider' ? (
                    <Notifications />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/admin/orders"
                element={
                  user && userType === 'serviceProvider' ? (
                    <Orders />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;