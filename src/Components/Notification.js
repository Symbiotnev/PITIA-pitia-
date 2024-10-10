import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Notification = ({ message, type, onClose }) => {
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  const darkBgColor = type === 'error' ? 'dark:bg-red-700' : 'dark:bg-green-700';

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 ${bgColor} ${darkBgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center`}
        >
          <span>{message}</span>
          <button
            onClick={onClose}
            className="ml-2 text-white hover:text-gray-200 focus:outline-none"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;