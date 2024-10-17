import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext, AuthContext } from '../App';
import Navbar from '../Components/Navbar';
import { getStoredCart, setStoredCart } from '../utils/localStorageUtil';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../libs/firebase_config.mjs';

const CartComponent = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  const fetchUserData = useCallback(async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'clients', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  }, [user]);

  const calculateTotal = useCallback(() => {
    const sum = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  }, [cart]);

  useEffect(() => {
    fetchCart();
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  const fetchCart = () => {
    const storedCart = getStoredCart();
    setCart(storedCart);
    setLoading(false);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );

    setCart(updatedCart);
    setStoredCart(updatedCart);
  };

  const removeItem = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    setStoredCart(updatedCart);
  };

  const CartItem = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-4 shadow-md mb-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={item.imageUrl || '/placeholder-image.jpg'}
            alt={item.name}
            className="w-16 h-16 rounded-md object-cover"
          />
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              KES {item.price}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="p-1 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-1 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        
        {userData && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-md mb-6`}>
            <h2 className="text-lg font-semibold mb-2">Account Information</h2>
            <p>Name: {userData.name}</p>
            <p>Email: {userData.email}</p>
          </div>
        )}
        
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-4">Add some items to get started!</p>
            <button
              onClick={() => navigate('/customer/menu')}
              className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <AnimatePresence>
                {cart.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </div>

            <div className={`${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-lg p-6 shadow-md`}>
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Subtotal:</span>
                <span>KES {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Delivery Fee:</span>
                <span>KES 20.00</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">KES {(total + 20).toFixed(2)}</span>
                </div>
                <button
                  className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 transition-colors"
                  onClick={() => navigate('/customer/checkout')}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CartComponent;