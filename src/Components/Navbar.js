import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { Menu, X, ShoppingBag, Sun, Moon, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeContext, AuthContext } from '../App';
import { auth } from '../libs/firebase_config.mjs';

const Navbar = ({ isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { setUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <ShoppingBag className="h-8 w-8 text-orange-500" />
            <span className="ml-2 text-xl font-bold text-orange-500">PITIA</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200">
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200"
            >
              <LogOut className="h-6 w-6 mr-2" />
              Logout
            </button>
          </div>
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-orange-500">
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-orange-500">
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
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500"
            >
              <LogOut className="h-6 w-6 mr-2" />
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;