import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Stack = createStackNavigator();

const AppNavigator = ({ initialRouteName }) => {
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* Agregaremos más routes después, ej. Profile */}
    </Stack.Navigator>
  );
};

export default AppNavigator;