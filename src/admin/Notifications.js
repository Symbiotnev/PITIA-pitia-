import React, { useState, useContext } from 'react';
import { ThemeContext } from '../App';
import { Bell, CheckCircle, Circle, ArrowRight, MessageCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';

const dummyNotifications = [
  { id: 1, title: 'New Order Received', message: 'You have a new order from John Doe.', timestamp: '2024-10-13T10:30:00', isRead: false, canReply: true },
  { id: 2, title: 'Promotion Approved', message: 'Your recent promotion has been approved and is now live.', timestamp: '2024-10-12T15:45:00', isRead: true, canReply: false },
  { id: 3, title: 'Customer Feedback', message: 'A customer has left a new review for your service.', timestamp: '2024-10-11T09:15:00', isRead: false, canReply: true },
  { id: 4, title: 'System Update', message: 'Our platform will undergo maintenance on October 15th.', timestamp: '2024-10-10T18:00:00', isRead: true, canReply: false },
];

const NotificationCard = ({ notification, onToggleRead, onReply, onDelete }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [isReplying, setIsReplying] = useState(false);
  const [reply, setReply] = useState('');

  const handleReply = () => {
    onReply(notification.id, reply);
    setIsReplying(false);
    setReply('');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-md p-4 mb-4`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-grow pr-4">
          {notification.isRead ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-orange-500 mr-2 mt-1 flex-shrink-0" />
          )}
          <div className="flex-grow">
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {notification.title}
            </h3>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {notification.message}
            </p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Date(notification.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <button
            onClick={() => onToggleRead(notification.id)}
            className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Mark as {notification.isRead ? 'unread' : 'read'}
          </button>
          {notification.isRead && (
            <button
              onClick={() => onDelete(notification.id)}
              className="text-sm text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {notification.canReply && (
        <div className="mt-4">
          {isReplying ? (
            <div className="mt-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className={`w-full p-2 rounded-md ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}
                rows="3"
                placeholder="Type your reply..."
              ></textarea>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => setIsReplying(false)}
                  className={`mr-2 px-3 py-1 rounded-md ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  className="px-3 py-1 bg-orange-500 text-white rounded-md"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsReplying(true)}
              className="flex items-center text-sm text-orange-500 hover:text-orange-600"
            >
              <MessageCircle className="h-4 w-4 mr-1" /> Reply
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

const NotificationsPage = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggleRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: !notif.isRead } : notif
    ));
  };

  const handleReply = (id, replyMessage) => {
    console.log(`Reply to notification ${id}: ${replyMessage}`);
    // Here you would typically send the reply to a backend API
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-orange-50'} rounded-lg p-4 sm:p-6 mb-6`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <Bell className="h-8 w-8 text-orange-500 mr-4" />
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h1>
            </div>
            <Link
              to="/admin/dashboard"
              className="flex items-center text-sm text-orange-500 hover:text-orange-600"
            >
              Back to Dashboard <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </motion.div>

        <AnimatePresence>
          {notifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onToggleRead={handleToggleRead}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default NotificationsPage;