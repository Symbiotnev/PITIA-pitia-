import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { db, storage } from '../libs/firebase_config';
import { ThemeContext } from '../App';
import Navbar from '../Components/Navbar';
import { getStoredCart, addToStoredCart } from '../utils/localStorageUtil';

const CustomerMenuPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuSections, setMenuSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [menuItems, setMenuItems] = useState({});
  const [promos, setPromos] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchServiceProviders = async () => {
      try {
        const providersSnapshot = await getDocs(collection(db, 'serviceProviders'));
        const providersData = providersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServiceProviders(providersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching service providers:', error);
        setLoading(false);
      }
    };

    fetchServiceProviders();
    setCart(getStoredCart());
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchProviderData();
    }
  }, [selectedProvider]);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMenuSections(),
        fetchMenuItems(),
        fetchPromos()
      ]);
    } catch (error) {
      console.error('Error fetching provider data:', error);
    }
    setLoading(false);
  };

  const fetchMenuSections = async () => {
    try {
      const sectionsSnapshot = await getDocs(
        query(collection(db, 'menuSections'), 
        where('userId', '==', selectedProvider.id))
      );
      const sectionsData = sectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuSections(sectionsData);
    } catch (error) {
      console.error('Error fetching menu sections:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const itemsSnapshot = await getDocs(
        query(collection(db, 'menuItems'), 
        where('userId', '==', selectedProvider.id))
      );
      const itemsData = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const itemsBySectionId = itemsData.reduce((acc, item) => {
        if (!acc[item.sectionId]) acc[item.sectionId] = [];
        acc[item.sectionId].push(item);
        return acc;
      }, {});
      setMenuItems(itemsBySectionId);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchPromos = async () => {
    try {
      const promosSnapshot = await getDocs(
        query(collection(db, 'promos'), 
        where('userId', '==', selectedProvider.id))
      );
      const promosData = promosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPromos(promosData);
    } catch (error) {
      console.error('Error fetching promos:', error);
    }
  };

  const calculatePromoPrice = (originalPrice, promoValue) => {
    const percentageValue = parseFloat(promoValue.replace('%', ''));
    const discountAmount = (parseFloat(originalPrice) * percentageValue) / 100;
    return (parseFloat(originalPrice) - discountAmount).toFixed(2);
  };

  const getPromoForItem = (itemId) => {
    const now = new Date();
    return promos.find(promo => 
      promo.itemId === itemId && 
      new Date(promo.startDate) <= now && 
      new Date(promo.endDate) >= now &&
      promo.type === 'discount'
    );
  };

  const addToCart = (item, promo = null) => {
    const activePromo = promo || getPromoForItem(item.id);
    
    const itemToAdd = {
      ...item,
      serviceProviderId: selectedProvider.id,
      serviceProviderName: selectedProvider.businessName,
      originalPrice: item.price,
      finalPrice: activePromo ? calculatePromoPrice(item.price, activePromo.value) : item.price,
      promoApplied: activePromo ? {
        id: activePromo.id,
        value: activePromo.value,
        description: activePromo.description,
        endDate: activePromo.endDate
      } : null
    };

    const updatedCart = addToStoredCart(itemToAdd);
    setCart(updatedCart);
    showNotification(`${item.name} added to cart${activePromo ? ' with ' + activePromo.value + ' discount' : ''}`);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const CategoryButton = ({ category, onClick, isActive }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full ${
        isActive
          ? 'bg-orange-500 text-white'
          : isDarkMode
          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      } transition-colors`}
    >
      {category}
    </button>
  );

  const MenuItemCard = ({ item }) => {
    const [imageUrl, setImageUrl] = useState('');
    const activePromo = getPromoForItem(item.id);
    const finalPrice = activePromo ? calculatePromoPrice(item.price, activePromo.value) : item.price;

    useEffect(() => {
      const fetchImageUrl = async () => {
        if (item.imageUrl) {
          try {
            const url = await getDownloadURL(ref(storage, item.imageUrl));
            setImageUrl(url);
          } catch (error) {
            console.error('Error fetching image URL:', error);
          }
        }
      };
      fetchImageUrl();
    }, [item.imageUrl]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-md relative`}
      >
        {activePromo && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {activePromo.value} OFF
          </div>
        )}
        <div className="w-full h-32 bg-gray-300 rounded-md mb-4 overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No image
            </div>
          )}
        </div>
        <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            {activePromo ? (
              <>
                <span className="line-through text-gray-500 text-sm">KES {item.price}</span>
                <span className="text-green-500 font-bold">KES {finalPrice}</span>
              </>
            ) : (
              <span className="font-bold">KES {item.price}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(item, activePromo)}
            className="bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition-colors text-sm"
          >
            Add
          </button>
        </div>
        {activePromo && (
          <div className="mt-2 bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">
            {activePromo.description}
          </div>
        )}
      </motion.div>
    );
  };

  const ComingSoon = ({ businessType }) => (
    <div className="flex flex-col items-center justify-center h-64">
      <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
      <p className="text-center text-gray-600 dark:text-gray-300">
        We're currently working on our menu. Check back soon for delicious {businessType === 'restaurant' ? 'dishes' : 'drinks'}!
      </p>
    </div>
  );

  const FloatingCartButton = () => (
    <motion.div
      className="fixed bottom-8 right-8 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
    >
      <button 
        className="bg-orange-500 text-white rounded-full p-4 shadow-lg relative"
        onClick={() => navigate('/customer/cart')}
      >
        <ShoppingCart size={24} />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {cart.reduce((total, item) => total + item.quantity, 0)}
          </span>
        )}
      </button>
    </motion.div>
  );

  const Notification = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg"
    >
      {message}
    </motion.div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-center space-x-4">
          <CategoryButton
            category="Restaurants"
            onClick={() => {
              setSelectedCategory('restaurant');
              setSelectedProvider(null);
              setSelectedSection(null);
            }}
            isActive={selectedCategory === 'restaurant'}
          />
          <CategoryButton
            category="Wines & Spirits"
            onClick={() => {
              setSelectedCategory('Wines&Spirits-shop');
              setSelectedProvider(null);
              setSelectedSection(null);
            }}
            isActive={selectedCategory === 'Wines&Spirits-shop'}
          />
        </div>

        {selectedCategory && (
          <div className="mb-6">
            <label htmlFor="serviceProvider" className="block text-sm font-medium mb-2">
              Select a {selectedCategory === 'restaurant' ? 'Restaurant' : 'Wines & Spirits Shop'}
            </label>
            <select
              id="serviceProvider"
              value={selectedProvider?.id || ''}
              onChange={(e) => setSelectedProvider(serviceProviders.find(sp => sp.id === e.target.value))}
              className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
            >
              <option value="">Select a provider</option>
              {serviceProviders
                .filter(provider => provider.businessType === selectedCategory)
                .map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.businessName}
                  </option>
                ))}
            </select>
          </div>
        )}

        {selectedProvider && (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">
              {selectedProvider.businessName || 'Our Menu'}
            </h1>

            {menuSections.length > 0 && (
              <div className="mb-6">
                <label htmlFor="menuSection" className="block text-sm font-medium mb-2">
                  Select a Menu Section
                </label>
                <select
                  id="menuSection"
                  value={selectedSection?.id || ''}
                  onChange={(e) => setSelectedSection(menuSections.find(section => section.id === e.target.value))}
                  className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                >
                  <option value="">All Sections</option>
                  {menuSections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : menuSections.length === 0 || Object.keys(menuItems).length === 0 ? (
              <ComingSoon businessType={selectedProvider.businessType} />
            ) : (
              (selectedSection ? [selectedSection] : menuSections).map(section => (
                <div key={section.id} className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">{section.name}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {menuItems[section.id]?.map(item => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </main>
      <FloatingCartButton />
      <AnimatePresence>
        {notification && <Notification message={notification} />}
      </AnimatePresence>
    </div>
  );
};

export default CustomerMenuPage