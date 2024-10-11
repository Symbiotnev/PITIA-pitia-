import React, { useState, useContext, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Plus, Trash2, Edit2 } from 'lucide-react';
import { ThemeContext, AuthContext } from '../App';
import { db, storage } from '../libs/firebase_config.mjs';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Navbar from '../Components/Navbar';
import Notification from '../Components/Notification';

const MenuPage = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState('');
  const [itemsBySection, setItemsBySection] = useState({});
  const [newItem, setNewItem] = useState({ 
    name: '', 
    price: '', 
    currency: 'USD', 
    image: null 
  });
  const [selectedSection, setSelectedSection] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(true);

  const fetchSections = useCallback(async () => {
    if (user) {
      try {
        const sectionsRef = collection(db, 'menuSections');
        const q = query(sectionsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedSections = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSections(fetchedSections);
        return fetchedSections;
      } catch (error) {
        setNotification({ message: 'Error fetching sections', type: 'error' });
      }
    }
  }, [user]);

  const fetchItemsBySection = useCallback(async (sections) => {
    if (user && sections.length > 0) {
      try {
        const itemsRef = collection(db, 'menuItems');
        const q = query(itemsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const itemsBySectionMap = sections.reduce((acc, section) => {
          acc[section.id] = items.filter(item => item.sectionId === section.id);
          return acc;
        }, {});

        setItemsBySection(itemsBySectionMap);
      } catch (error) {
        setNotification({ message: 'Error fetching items', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    const initializePage = async () => {
      const fetchedSections = await fetchSections();
      if (fetchedSections) {
        await fetchItemsBySection(fetchedSections);
      }
    };

    initializePage();
  }, [fetchSections, fetchItemsBySection]);

  const addSection = async () => {
    if (newSection.trim() !== '' && user) {
      try {
        await addDoc(collection(db, 'menuSections'), {
          name: newSection,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
        setNewSection('');
        const newSectionsList = await fetchSections();
        await fetchItemsBySection(newSectionsList);
        setNotification({ message: 'Section added successfully', type: 'success' });
      } catch (error) {
        setNotification({ message: 'Error adding section', type: 'error' });
      }
    }
  };
  
  const removeSection = async (sectionId) => {
    if (user) {
      try {
        // First, delete all items in this section
        const itemsToDelete = itemsBySection[sectionId] || [];
        for (const item of itemsToDelete) {
          if (item.imageUrl) {
            const imageRef = ref(storage, item.imageUrl);
            await deleteObject(imageRef);
          }
          await deleteDoc(doc(db, 'menuItems', item.id));
        }
        
        // Then delete the section
        await deleteDoc(doc(db, 'menuSections', sectionId));
        
        const newSectionsList = await fetchSections();
        await fetchItemsBySection(newSectionsList);
        setNotification({ message: 'Section and its items removed successfully', type: 'success' });
      } catch (error) {
        setNotification({ message: 'Error removing section', type: 'error' });
      }
    }
  };

  const addItem = async () => {
    if (newItem.name && newItem.price && selectedSection && newItem.image && user) {
      try {
        const imageRef = ref(storage, `menuItems/${user.uid}/${Date.now()}_${newItem.image.name}`);
        await uploadBytes(imageRef, newItem.image);
        const imageUrl = await getDownloadURL(imageRef);

        await addDoc(collection(db, 'menuItems'), {
          name: newItem.name,
          price: newItem.price,
          currency: newItem.currency,
          imageUrl,
          sectionId: selectedSection,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });

        setNewItem({ name: '', price: '', currency: 'USD', image: null });
        setSelectedSection('');
        await fetchItemsBySection(sections);
        setNotification({ message: 'Item added successfully', type: 'success' });
      } catch (error) {
        setNotification({ message: 'Error adding item', type: 'error' });
      }
    }
  };

  const removeItem = async (itemId, imageUrl, sectionId) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'menuItems', itemId));
        if (imageUrl) {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        }
        await fetchItemsBySection(sections);
        setNotification({ message: 'Item removed successfully', type: 'success' });
      } catch (error) {
        setNotification({ message: 'Error removing item', type: 'error' });
      }
    }
  };

  const editItem = async (itemId, sectionId, updatedFields) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'menuItems', itemId), updatedFields);
        await fetchItemsBySection(sections);
        setNotification({ message: 'Item updated successfully', type: 'success' });
      } catch (error) {
        setNotification({ message: 'Error updating item', type: 'error' });
      }
    }
  };

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
              <User className="h-12 w-12 text-orange-500 mr-4" />
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome to Your Menu Page!
                </h1>
                <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Manage your menu sections and items here.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Menu Management Section */}
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sections Management */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4">Menu Sections</h2>
              <div className="flex mb-4">
                <input
                  type="text"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  placeholder="New section name"
                  className={`flex-grow p-2 rounded-l-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                />
                <button
                  onClick={addSection}
                  className="bg-orange-500 text-white p-2 rounded-r-md hover:bg-orange-600"
                >
                  <Plus size={24} />
                </button>
              </div>
              <ul>
                {sections.map((section) => (
                  <li key={section.id} className="flex justify-between items-center mb-2">
                    <span>{section.name}</span>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Items Management */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4">Add Menu Item</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="Item name"
                  className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                />
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    placeholder="Price"
                    className={`flex-grow p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                  />
                  <select
                    value={newItem.currency}
                    onChange={(e) => setNewItem({...newItem, currency: e.target.value})}
                    className={`p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                  >
                    <option value="USD">USD</option>
                    <option value="KSH">KSH</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                >
                  <option value="">Select a section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
                <input
                  type="file"
                  onChange={(e) => setNewItem({...newItem, image: e.target.files[0]})}
                  className={`w-full p-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                />
                {newItem.image && (
                  <img
                    src={URL.createObjectURL(newItem.image)}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md"
                  />
                )}
                <button
                  onClick={addItem}
                  className="w-full bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Current Menu Display */}
          <div className={`mt-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
            <h2 className="text-xl font-semibold mb-4">Current Menu</h2>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {sections.map((section) => (
                  <div key={section.id} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">{section.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {itemsBySection[section.id]?.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 shadow`}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-48 object-cover rounded-md mb-2"
                            loading="lazy"
                          />
                          <h4 className="text-lg font-semibold">{item.name}</h4>
                          <p>{`${item.price} ${item.currency}`}</p>
                          <div className="flex justify-end mt-2 space-x-2">
                            <button
                              onClick={() => editItem(item.id, section.id, {
                                name: prompt('New name:', item.name) || item.name
                              })}
                              className="text-blue-500 hover:text-blue-600"
                            >
                              <Edit2 size={20} />
                            </button>
                            <button
                              onClick={() => removeItem(item.id, item.imageUrl, section.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {(!itemsBySection[section.id] || itemsBySection[section.id].length === 0) && (
                      <p className="text-gray-500 italic">No items in this section yet.</p>
                    )}
                  </div>
                ))}
                {sections.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No menu sections yet. Add a section to get started!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MenuPage;