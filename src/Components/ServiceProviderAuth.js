import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Sun, Moon, User, Utensils } from 'lucide-react';
import { db, auth } from '../libs/firebase_config.mjs';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ThemeContext, AuthContext } from '../App';
import Notification from './Notification';
import { useNavigate } from 'react-router-dom';

export function ServiceProviderAuth() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { setUser } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    businessType: '',
  });

  useEffect(() => {
    const registeredEmail = sessionStorage.getItem('registeredEmail');
    if (registeredEmail && isLogin) {
      setFormData(prevData => ({
        ...prevData,
        email: registeredEmail
      }));
      sessionStorage.removeItem('registeredEmail');
    }
  }, [isLogin]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setNotification({ message: '', type: '' });
    setFormData({
      email: '',
      password: '',
      businessName: '',
      businessType: '',
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        setUser(userCredential.user);
        showNotification('Logged in successfully!', 'success');
        navigate('/dashboard');
      } else {
        // Handle registration
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Save additional user data
        await setDoc(doc(db, 'serviceProviders', userCredential.user.uid), {
          businessName: formData.businessName,
          businessType: formData.businessType,
          email: formData.email,
        });
        
        // Store registration email temporarily
        sessionStorage.setItem('registeredEmail', formData.email);
        
        // Clear form and switch to login mode
        setFormData({
          ...formData,
          password: '',
        });
        setIsLogin(true);
        showNotification('Registration successful! Please log in with your credentials.', 'success');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'dark bg-gray-900' : 'bg-orange-50'}`}>
      <div className={`max-w-md w-full space-y-8 p-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-orange-500" />
            <span className="ml-2 text-xl font-bold text-orange-500">PITIA</span>
          </div>
          <button 
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200"
          >
            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
        </div>
        
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {isLogin ? 'Service Provider Sign In' : 'Register as Service Provider'}
        </h2>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="business-name" className="sr-only">Business Name</label>
                  <input
                    id="business-name"
                    name="businessName"
                    type="text"
                    required
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                      isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 text-gray-900'
                    } placeholder-gray-500 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                    placeholder="Business Name"
                    value={formData.businessName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="business-type" className="sr-only">Business Type</label>
                  <select
                    id="business-type"
                    name="businessType"
                    required
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                      isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 text-gray-900'
                    } placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                    value={formData.businessType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Business Type</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="shop">Shop</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 text-gray-900'
                } placeholder-gray-500 ${isLogin ? 'rounded-t-md' : ''} focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 text-gray-900'
                } placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isLogin ? 
                  <User className="h-5 w-5 text-orange-500 group-hover:text-orange-400" aria-hidden="true" /> : 
                  <Utensils className="h-5 w-5 text-orange-500 group-hover:text-orange-400" aria-hidden="true" />
                }
              </span>
              {isLogin ? 'Sign in' : 'Register'}
            </motion.button>
          </div>
        </form>
        
        <div className="text-center">
          <button 
            onClick={toggleMode} 
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            {isLogin ? 'Need to register? Sign up' : 'Already registered? Sign in'}
          </button>
        </div>
      </div>
      
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />
    </div>
  );
}

export default ServiceProviderAuth;