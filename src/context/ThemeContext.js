import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const lightTheme = {
  primary: '#007AFF',
  secondary: '#6c757d',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#F0F0F0',
  placeholder: '#A0A0A0',
  shadow: '#000',
  tabBarBackground: '#FFFFFF',
  tabBarInactive: '#8E8E93',
  inputBackground: '#FFFFFF',
  cardBackground: '#FFFFFF',
  emptyStateIcon: '#E0E0E0',
  clearButton: '#A0A0A0',
  scrollHintBackground: 'rgba(255, 255, 255, 0.95)',
};

export const darkTheme = {
  primary: '#0A84FF',
  secondary: '#8E8E93',
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  placeholder: '#8E8E93',
  shadow: '#000',
  tabBarBackground: '#1C1C1E',
  tabBarInactive: '#8E8E93',
  inputBackground: '#2C2C2E',
  cardBackground: '#2C2C2E',
  emptyStateIcon: '#48484A',
  clearButton: '#8E8E93',
  scrollHintBackground: 'rgba(28, 28, 30, 0.95)',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(newTheme));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDarkMode, 
      toggleTheme, 
      isLoading 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};