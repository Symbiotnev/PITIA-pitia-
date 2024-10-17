// localStorageUtil.js

const THEME_KEY = 'pitia_theme';
const CART_KEY = 'pitia_cart';

export const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return 'light'; // Default to light theme if there's an error
  }
};

export const setStoredTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Error setting theme in localStorage:', error);
  }
};

export const toggleStoredTheme = () => {
  const currentTheme = getStoredTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setStoredTheme(newTheme);
  return newTheme;
};

// New functions for cart management
export const getStoredCart = () => {
  try {
    const storedCart = localStorage.getItem(CART_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error('Error getting cart from localStorage:', error);
    return [];
  }
};

export const setStoredCart = (cart) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error setting cart in localStorage:', error);
  }
};

export const addToStoredCart = (item) => {
  const currentCart = getStoredCart();
  const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === item.id);

  if (existingItemIndex !== -1) {
    currentCart[existingItemIndex].quantity += 1;
  } else {
    currentCart.push({ ...item, quantity: 1 });
  }

  setStoredCart(currentCart);
  return currentCart;
};