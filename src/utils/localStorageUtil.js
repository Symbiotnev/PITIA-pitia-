// localStorageUtil.js

const THEME_KEY = 'pitia_theme';

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