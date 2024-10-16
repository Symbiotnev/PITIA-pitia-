import React, { useState, useContext, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tag, Trash2, Edit2, Gift} from 'lucide-react';
import { ThemeContext, AuthContext } from '../App';
import { db } from '../libs/firebase_config.mjs';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import Navbar from '../Components/Navbar';
import Notification from '../Components/Notification';

const PromoPage = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [promos, setPromos] = useState([]);
  const [newPromo, setNewPromo] = useState({
    itemId: '',
    type: 'discount',
    value: '',
    startDate: '',
    endDate: '',
    description: '',
    isHolidayThemed: false,
    holidayTheme: ''
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'upcoming', 'expired'

  const fetchMenuItems = useCallback(async () => {
    if (user) {
      try {
        const itemsRef = collection(db, 'menuItems');
        const q = query(itemsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMenuItems(fetchedItems);
      } catch (error) {
        setNotification({ message: 'Error fetching menu items', type: 'error' });
      }
    }
  }, [user]);

  const fetchPromos = useCallback(async () => {
    if (user) {
      try {
        const promosRef = collection(db, 'promos');
        const q = query(promosRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedPromos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPromos(fetchedPromos);
      } catch (error) {
        setNotification({ message: 'Error fetching promos', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    const initializePage = async () => {
      await fetchMenuItems();
      await fetchPromos();
    };

    initializePage();
  }, [fetchMenuItems, fetchPromos]);

  const addPromo = async () => {
    if (newPromo.itemId && newPromo.type && newPromo.value && newPromo.startDate && newPromo.endDate && user) {
      try {
        await addDoc(collection(db, 'promos'), {
          ...newPromo,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });

        setNewPromo({
          itemId: '',
          type: 'discount',
          value: '',
          startDate: '',
          endDate: '',
          description: '',
          isHolidayThemed: false,
          holidayTheme: ''
        });
        await fetchPromos();
        setNotification({ message: 'Promo added successfully', type: 'success' });
      } catch (error) {
        setNotification({ message: 'Error adding promo', type: 'error' });
      }
    }
  };

  const removePromo = async (promoId) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'promos', promoId));
        await fetchPromos();
        setNotification({ message: 'Promo removed successfully', type: 'success' });
      } catch (error) {
        setNotification({ message: 'Error removing promo', type: 'error' });
      }
    }
  };

  const editPromo = async (promoId, updatedFields) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'promos', promoId), updatedFields);
        await fetchPromos();
        setNotification({ message: 'Promo updated successfully', type: 'success' });
      } catch (error) {
        setNotification({ message: 'Error updating promo', type: 'error' });
      }
    }
  };

  const getPromoStatus = (promo) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    return 'active';
  };

  const filteredPromos = promos.filter(promo => {
    if (filter === 'all') return true;
    return getPromoStatus(promo) === filter;
  });

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
        
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'} rounded-lg p-6 mb-6`}
          >
            <div className="flex items-center">
              <Tag className="h-12 w-12 text-orange-500 mr-4" />
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Manage Your Promos
                </h1>
                <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Create and manage promotions for your menu items here.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Promo Management Section */}
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Add New Promo */}
             <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4">Add New Promo</h2>
              <div className="space-y-4">
                <select
                  value={newPromo.itemId}
                  onChange={(e) => setNewPromo({...newPromo, itemId: e.target.value})}
                  className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                >
                  <option value="">Select a menu item</option>
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <select
                  value={newPromo.type}
                  onChange={(e) => setNewPromo({...newPromo, type: e.target.value})}
                  className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                >
                  <option value="discount">Discount</option>
                  <option value="bogo">Buy One Get One Free</option>
                  <option value="bundle">Bundle Deal</option>
                </select>
                <input
                  type="text"
                  value={newPromo.value}
                  onChange={(e) => setNewPromo({...newPromo, value: e.target.value})}
                  placeholder="Promo value (e.g., 20% or 2 for 1)"
                  className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                />
                <input
                  type="date"
                  value={newPromo.startDate}
                  onChange={(e) => setNewPromo({...newPromo, startDate: e.target.value})}
                  className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                />
                <input
                  type="date"
                  value={newPromo.endDate}
                  onChange={(e) => setNewPromo({...newPromo, endDate: e.target.value})}
                  className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                />
                <textarea
                  value={newPromo.description}
                  onChange={(e) => setNewPromo({...newPromo, description: e.target.value})}
                  placeholder="Promo description"
                  className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newPromo.isHolidayThemed}
                    onChange={(e) => setNewPromo({...newPromo, isHolidayThemed: e.target.checked})}
                    className="mr-2"
                  />
                  <label>Holiday Themed</label>
                </div>
                {newPromo.isHolidayThemed && (
                  <input
                    type="text"
                    value={newPromo.holidayTheme}
                    onChange={(e) => setNewPromo({...newPromo, holidayTheme: e.target.value})}
                    placeholder="Holiday theme (e.g., Christmas, Easter)"
                    className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                  />
                )}
                <button
                  onClick={addPromo}
                  className="w-full bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600"
                >
                  Add Promo
                </button>
              </div>
            </div>

            {/* Current Promos */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4">Current Promos</h2>
              <div className="mb-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                >
                  <option value="all">All Promos</option>
                  <option value="active">Active Promos</option>
                  <option value="upcoming">Upcoming Promos</option>
                  <option value="expired">Expired Promos</option>
                </select>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPromos.map((promo) => (
                    <motion.div
                      key={promo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 shadow flex justify-between items-center`}
                    >
                      <div>
                        <h3 className="font-semibold">{menuItems.find(item => item.id === promo.itemId)?.name}</h3>
                        <p>{promo.type === 'discount' ? `${promo.value} off` : promo.value}</p>
                        <p className="text-sm text-gray-500">{`${promo.startDate} to ${promo.endDate}`}</p>
                        {promo.isHolidayThemed && (
                          <p className="text-sm text-orange-500">{promo.holidayTheme}</p>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          getPromoStatus(promo) === 'active' ? 'bg-green-500 text-white' :
                          getPromoStatus(promo) === 'upcoming' ? 'bg-blue-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {getPromoStatus(promo)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editPromo(promo.id, {
                            value: prompt('New promo value:', promo.value) || promo.value
                          })}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => removePromo(promo.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {filteredPromos.length === 0 && (
                    <p className="text-center text-gray-500 italic">No promos found for the selected filter.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Holiday Themed Promos */}
          <div className={`mt-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
            <h2 className="text-xl font-semibold mb-4">Holiday Themed Promos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promos.filter(promo => promo.isHolidayThemed).map((promo) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 shadow`}
                >
                  <div className="flex items-center mb-2">
                    <Gift className="h-6 w-6 text-orange-500 mr-2" />
                    <h3 className="font-semibold">{promo.holidayTheme}</h3>
                  </div>
                  <p>{menuItems.find(item => item.id === promo.itemId)?.name}</p>
                  <p>{promo.type === 'discount' ? `${promo.value} off` : promo.value}</p>
                  <p className="text-sm text-gray-500">{`${promo.startDate} to ${promo.endDate}`}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    getPromoStatus(promo) === 'active' ? 'bg-green-500 text-white' :
                    getPromoStatus(promo) === 'upcoming' ? 'bg-blue-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {getPromoStatus(promo)}
                  </span>
                </motion.div>
              ))}
              {promos.filter(promo => promo.isHolidayThemed).length === 0 && (
                <p className="col-span-3 text-center text-gray-500 italic">No holiday themed promos yet. Create one to get started!</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PromoPage;