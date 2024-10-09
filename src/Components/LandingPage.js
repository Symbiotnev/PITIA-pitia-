import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingBag, Utensils, Wine, Sun, Moon } from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      {/* Navbar */}
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <ShoppingBag className="h-8 w-8 text-orange-500" />
              <span className="ml-2 text-xl font-bold text-orange-500">PITIA</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => scrollToSection(heroRef)} className="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200">Home</button>
              <button onClick={() => scrollToSection(featuresRef)} className="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200">Features</button>
              <button onClick={() => scrollToSection(ctaRef)} className="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200">Take Action</button>
              <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200">
                {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
            </div>
            <div className="md:hidden flex items-center space-x-4">
              <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-orange-500">
                {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
              <button onClick={toggleMenu} className="text-gray-600 dark:text-gray-300 hover:text-orange-500 focus:outline-none">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button onClick={() => scrollToSection(heroRef)} className="block w-full text-left px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200">Home</button>
              <button onClick={() => scrollToSection(featuresRef)} className="block w-full text-left px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200">Features</button>
              <button onClick={() => scrollToSection(ctaRef)} className="block w-full text-left px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200">Take Action</button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'} py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:w-1/2"
            >
              <h1 className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-5xl md:text-6xl`}>
                <span className="block">Delicious local food</span>
                <span className="block text-orange-500">delivered to you</span>
              </h1>
              <p className={`mt-3 max-w-md mx-auto text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} sm:text-xl md:mt-5 md:max-w-3xl`}>
                Discover the best local cuisines and drinks from your favorite restaurants and shops, delivered right to your doorstep.
              </p>
              <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <button onClick={() => scrollToSection(ctaRef)} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 md:py-4 md:text-lg md:px-10 transition-colors duration-200">
                    Get started
                  </button>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-10 lg:mt-0 lg:w-1/2"
            >
              <img className="w-full rounded-lg shadow-xl" src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" alt="Delicious food spread" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
              Why choose PITIA?
            </h2>
            <p className={`mt-4 max-w-2xl mx-auto text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              We bring the best of local cuisine right to your doorstep.
            </p>
          </div>
          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Utensils className="h-6 w-6 text-white" />,
                  title: "Local Restaurants",
                  description: "Enjoy a wide variety of cuisines from your favorite local restaurants.",
                  image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=300&q=80"
                },
                {
                  icon: <Wine className="h-6 w-6 text-white" />,
                  title: "Drinks & Spirits",
                  description: "Order your favorite drinks from local wine and spirit shops.",
                  image: "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=300&q=80"
                },
                {
                  icon: <ShoppingBag className="h-6 w-6 text-white" />,
                  title: "Fast Delivery",
                  description: "Get your orders delivered quickly and efficiently to your doorstep.",
                  image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=300&q=80"
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="pt-6"
                >
                  <div className={`flow-root ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg px-6 pb-8`}>
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-orange-500 rounded-md shadow-lg">
                          {feature.icon}
                        </span>
                      </div>
                      <img src={feature.image} alt={feature.title} className="mt-4 w-full h-48 object-cover rounded-lg" />
                      <h3 className={`mt-8 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>{feature.title}</h3>
                      <p className={`mt-5 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section ref={ctaRef} className="bg-orange-500">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-orange-100">Join PITIA today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-orange-600 bg-white hover:bg-orange-50 transition-colors duration-200">
                Sign up as a customer
              </button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors duration-200">
                Register as a provider
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <button className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2024 PITIA, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;