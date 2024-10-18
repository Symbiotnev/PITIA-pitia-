// Constants
const THEME_KEY = 'pitia_theme';
const CART_KEY = 'pitia_cart';

// Theme management functions
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

// Promo calculation functions
const calculateDiscountedPrice = (price, promoValue) => {
  if (!promoValue) return price;
  const percentageValue = parseFloat(promoValue.replace('%', ''));
  const discountAmount = (parseFloat(price) * percentageValue) / 100;
  return (parseFloat(price) - discountAmount).toFixed(2);
};

const isPromoValid = (promo) => {
  if (!promo) return false;
  const now = new Date();
  return new Date(promo.endDate) >= now;
};

const updateItemPrice = (item) => {
  if (!item.promoApplied || !isPromoValid(item.promoApplied)) {
    return {
      ...item,
      finalPrice: item.originalPrice,
      promoApplied: null
    };
  }
  return {
    ...item,
    finalPrice: calculateDiscountedPrice(item.originalPrice, item.promoApplied.value)
  };
};

// Cart management functions
export const getStoredCart = () => {
  try {
    const storedCart = localStorage.getItem(CART_KEY);
    const cart = storedCart ? JSON.parse(storedCart) : [];
    // Update prices and remove expired promos
    const updatedCart = cart.map(updateItemPrice);
    // Only save if there were changes
    if (JSON.stringify(cart) !== JSON.stringify(updatedCart)) {
      setStoredCart(updatedCart);
    }
    return updatedCart;
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
  const existingItemIndex = currentCart.findIndex(cartItem => 
    cartItem.id === item.id && 
    cartItem.serviceProviderId === item.serviceProviderId
  );

  const itemToAdd = updateItemPrice(item);

  if (existingItemIndex !== -1) {
    // Update existing item
    currentCart[existingItemIndex] = {
      ...currentCart[existingItemIndex],
      quantity: currentCart[existingItemIndex].quantity + 1,
      finalPrice: itemToAdd.finalPrice,
      promoApplied: itemToAdd.promoApplied
    };
  } else {
    // Add new item
    currentCart.push({ ...itemToAdd, quantity: 1 });
  }

  setStoredCart(currentCart);
  return currentCart;
};

export const updateCartItemQuantity = (itemId, serviceProviderId, quantity) => {
  const currentCart = getStoredCart();
  const updatedCart = currentCart.map(item => {
    if (item.id === itemId && item.serviceProviderId === serviceProviderId) {
      return { ...item, quantity: Math.max(0, quantity) };
    }
    return item;
  }).filter(item => item.quantity > 0);

  setStoredCart(updatedCart);
  return updatedCart;
};

export const removeFromCart = (itemId, serviceProviderId) => {
  const currentCart = getStoredCart();
  const updatedCart = currentCart.filter(item => 
    !(item.id === itemId && item.serviceProviderId === serviceProviderId)
  );
  setStoredCart(updatedCart);
  return updatedCart;
};

export const calculateCartTotal = (cart = getStoredCart()) => {
  return cart.reduce((total, item) => {
    const itemTotal = parseFloat(item.finalPrice) * item.quantity;
    return total + itemTotal;
  }, 0).toFixed(2);
};

export const clearCart = () => {
  setStoredCart([]);
  return [];
};