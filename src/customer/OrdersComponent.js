import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ShoppingBag, Calendar, Clock, Check, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ThemeContext, AuthContext } from '../App';
import Navbar from '../Components/Navbar';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../libs/firebase_config.mjs';
import { calculateETA, createBounds } from './eta';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const OrdersComponent = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [serviceProviders, setServiceProviders] = useState({});
  const [clientLocations, setClientLocations] = useState({});
  const [showETAPopup, setShowETAPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [etaDetails, setETADetails] = useState(null);
  const [transportMode, setTransportMode] = useState('foot');

  // Fetch service providers data
  const fetchServiceProviders = async (providerIds) => {
    try {
      const providers = {};
      for (const id of providerIds) {
        if (!id) continue;
        
        const providerDocRef = doc(db, 'serviceProviders', id);
        const providerSnapshot = await getDoc(providerDocRef);
        if (providerSnapshot.exists()) {
          providers[id] = {
            businessName: providerSnapshot.data().businessName
          };
        }
        
        const locationDocRef = doc(db, 'service-provider-location', id);
        const locationSnapshot = await getDoc(locationDocRef);
        if (locationSnapshot.exists()) {
          const locationData = locationSnapshot.data().location;
          providers[id].location = {
            lat: locationData.latitude,
            lng: locationData.longitude
          };
        }
      }
      setServiceProviders(providers);
    } catch (error) {
      console.error("Error fetching service providers:", error);
    }
  };

  // Fetch client locations
  const fetchClientLocations = async (clientIds) => {
    try {
      const locations = {};
      for (const id of clientIds) {
        if (!id) continue;
        const locationDocRef = doc(db, 'client-location', id);
        const locationSnapshot = await getDoc(locationDocRef);
        if (locationSnapshot.exists()) {
          const locationData = locationSnapshot.data().location;
          locations[id] = {
            lat: locationData.latitude,
            lng: locationData.longitude
          };
        }
      }
      setClientLocations(locations);
    } catch (error) {
      console.error("Error fetching client locations:", error);
    }
  };

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
      
      const providerIds = new Set();
      const clientIds = new Set();
      fetchedOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (item.serviceProviderId) {
              providerIds.add(item.serviceProviderId);
            }
          });
        }
        clientIds.add(order.userId);
      });

      await fetchServiceProviders([...providerIds]);
      await fetchClientLocations([...clientIds]);
      
      fetchedOrders.sort((a, b) => {
        if (a.status === 'placed' && b.status !== 'placed') return -1;
        if (a.status !== 'placed' && b.status === 'placed') return 1;
        return b.createdAt - a.createdAt;
      });

      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Mark order as delivered
  const markAsDelivered = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'delivered'
      });
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Show ETA popup
  const showETA = async (order) => {
    setSelectedOrder(order);
    setShowETAPopup(true);
    await calculateETAForOrder(order);
  };

  // Calculate ETA for order
  const calculateETAForOrder = async (order) => {
    const clientLocation = clientLocations[order.userId];
    const providerLocation = order.items?.[0]?.serviceProviderId ? 
      serviceProviders[order.items[0].serviceProviderId]?.location : null;

    if (clientLocation && providerLocation) {
      const result = await calculateETA(providerLocation, clientLocation, transportMode);
      setETADetails(result);
    }
  };

  useEffect(() => {
    if (selectedOrder) {
      calculateETAForOrder(selectedOrder);
    }
  }, [transportMode]);

  // Filter orders based on status
  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return order.status === 'placed';
    if (filterStatus === 'delivered') return order.status === 'delivered';
    return true;
  });

  // ETA Popup Component
  const ETAPopup = () => {
    if (!showETAPopup || !selectedOrder || !etaDetails) return null;

    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
        <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} p-6 rounded-lg shadow-lg max-w-md w-full`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Estimated Time of Arrival</h3>
            <button onClick={() => setShowETAPopup(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          <p className="mb-4">Your delivery will be here in about <span className="font-bold text-orange-500">{etaDetails.duration} minutes</span>.</p>
          <p className="mb-4">Distance: <span className="font-bold">{etaDetails.distance} km</span></p>
          <div className="mb-4">
            <label className="block mb-2">Transport Mode:</label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              <option value="foot">On Foot</option>
              <option value="car">By Car</option>
              <option value="bike">By Bike</option>
            </select>
          </div>
          <MapContainer
            bounds={createBounds(clientLocations[selectedOrder.userId], serviceProviders[selectedOrder.items[0].serviceProviderId].location)}
            style={{ height: '200px', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[clientLocations[selectedOrder.userId].lat, clientLocations[selectedOrder.userId].lng]}>
              <Popup>Delivery Location</Popup>
            </Marker>
            <Marker position={[serviceProviders[selectedOrder.items[0].serviceProviderId].location.lat, serviceProviders[selectedOrder.items[0].serviceProviderId].location.lng]}>
              <Popup>Service Provider Location</Popup>
            </Marker>
            <Polyline
              positions={etaDetails.coordinates}
              color="#ff8c00"
              weight={4}
            />
          </MapContainer>
        </div>
      </div>
    );
  };

  // Order Card Component
  const OrderCard = ({ order }) => {
    const isExpanded = expandedOrder === order.id;
    const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

    const itemsByProvider = order.items?.reduce((acc, item) => {
      const providerId = item.serviceProviderId || 'unknown';
      if (!acc[providerId]) {
        acc[providerId] = [];
      }
      acc[providerId].push(item);
      return acc;
    }, {}) || {};

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-md mb-4`}
      >
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleOrderExpansion(order.id)}>
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${
              order.status === 'delivered' ? 'bg-green-500' : 
              order.status === 'placed' ? 'bg-yellow-500' : 
              'bg-gray-500'
            }`}>
              <ShoppingBag size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">
              KES {order.total?.toFixed(2) || '0.00'}
            </span>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-4"
            >
              {Object.entries(itemsByProvider).map(([providerId, items]) => (
                <div key={providerId} className="border-b last:border-b-0 pb-4">
                  <h4 className="font-medium mb-2 text-orange-500">
                    {serviceProviders[providerId]?.businessName || 'Unknown Provider'}
                  </h4>
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center mb-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Quantity: {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium">
                        KES {(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              <div className="flex justify-between items-center mt-4 pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {order.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {order.createdAt.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-sm">
                <strong>Status:</strong> 
                <span className={`ml-2 ${
                  order.status === 'delivered' ? 'text-green-500' :
                  order.status === 'placed' ? 'text-yellow-500' :
                  'text-gray-500'
                }`}>
                  {order.status === 'placed' ? 'Pending' : order.status}
                </span>
              </div>

              <div className="mt-2 text-sm">
                <strong>Payment Status:</strong> 
                <span className={`ml-2 ${
                  order.paymentStatus === 'completed' ? 'text-green-500' :
                  order.paymentStatus === 'pending' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>

              {order.status === 'placed' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showETA(order);
                    }}
                    className="mt-4 flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <MapPin size={16} />
                    <span>Show ETA</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsDelivered(order.id);
                    }}
                    className="mt-4 flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                  >
                    <Check size={16} />
                    <span>Mark as Delivered</span>
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Main render
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-2">
            {['all', 'pending', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filterStatus === status
                    ? 'bg-orange-500 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet."
                : `No ${filterStatus} orders found.`}
            </p>
            <button
              onClick={() => navigate('/customer/menu')}
              className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </AnimatePresence>
        )}
      </main>

      <ETAPopup />
    </div>
  );
};

export default OrdersComponent;