import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Descomenta la linea de abajo para poder ver las onoboarding screens o reinicia el local storage
        // await AsyncStorage.removeItem('onboardingCompleted');
        
        const value = await AsyncStorage.getItem('onboardingCompleted');
        setIsOnboardingCompleted(value === 'true');
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setIsOnboardingCompleted(false);
      }
    };
    checkOnboarding();
  }, []);

  if (isOnboardingCompleted === null) {
    return null;
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator initialRouteName={isOnboardingCompleted ? 'Home' : 'Onboarding'} />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;