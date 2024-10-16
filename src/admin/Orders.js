import React, { useState, useContext } from 'react';
import { ShoppingBag, ArrowUp, ArrowDown, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { ThemeContext } from '../App';
import Navbar from '../Components/Navbar';

// Dummy data for orders (unchanged)
const dummyOrders = [
  { id: 1, customerName: 'John Doe', items: ['Burger', 'Fries'], total: 15.99, status: 'pending', date: '2024-10-13' },
  { id: 2, customerName: 'Jane Smith', items: ['Pizza', 'Coke'], total: 20.50, status: 'cleared', date: '2024-10-13' },
  { id: 3, customerName: 'Bob Johnson', items: ['Salad', 'Water'], total: 8.75, status: 'pending', date: '2024-10-12' },
  { id: 4, customerName: 'Alice Brown', items: ['Steak', 'Wine'], total: 45.00, status: 'cleared', date: '2024-10-12' },
  { id: 5, customerName: 'Charlie Davis', items: ['Sushi', 'Green Tea'], total: 30.25, status: 'pending', date: '2024-10-11' },
];

// StatCard component (unchanged)
const StatCard = ({ title, value, icon: Icon, change, isDarkMode }) => (
  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        <p className={`mt-2 text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        {change !== undefined && (
          <p className={`mt-2 flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
            {Math.abs(change)}%
          </p>
        )}
      </div>
      <div className={`rounded-full p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-orange-100'}`}>
        <Icon className="h-6 w-6 text-orange-500" />
      </div>
    </div>
  </div>
);

const OrdersPage = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [orders, setOrders] = useState(dummyOrders);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0).toFixed(2);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Orders</h1>
          
          {/* Stats Section */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Orders" value={totalOrders} icon={ShoppingBag} change={5} isDarkMode={isDarkMode} />
            <StatCard title="Total Revenue" value={`$${totalRevenue}`} icon={DollarSign} change={-2} isDarkMode={isDarkMode} />
            <StatCard title="Pending Orders" value={pendingOrders} icon={Clock} isDarkMode={isDarkMode} />
          </div>

          {/* Updated Orders Table */}
          <div className={`mt-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden sm:rounded-lg`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200`}>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className={`px-3 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{order.id}</td>
                    <td className={`px-3 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.customerName}</td>
                    <td className={`px-3 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      <div className="max-w-xs truncate">{order.items.join(', ')}</div>
                    </td>
                    <td className={`px-3 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${order.total.toFixed(2)}</td>
                    <td className={`px-3 py-4 whitespace-nowrap text-sm`}>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'pending' 
                          ? isDarkMode ? 'bg-yellow-800 text-yellow-100' : 'bg-yellow-100 text-yellow-800'
                          : isDarkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleStatusChange(order.id, order.status === 'pending' ? 'cleared' : 'pending')}
                        className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md ${
                          order.status === 'pending'
                            ? 'text-green-700 bg-green-100 hover:bg-green-200'
                            : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                        }`}
                      >
                        {order.status === 'pending' ? (
                          <><CheckCircle className="h-4 w-4 mr-1" /> Clear</>
                        ) : (
                          <><AlertCircle className="h-4 w-4 mr-1" /> Pending</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;