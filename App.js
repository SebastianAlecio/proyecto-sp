import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider, useAuth } from "./src/hooks/useAuth";
import AppNavigator from "./src/navigation/AppNavigator";

const AppContent = ({ isOnboardingCompleted }) => {
  const { handleEmailConfirmation } = useAuth();

  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (url.includes("confirmed=true")) {
        console.log("Email confirmado, mostrando mensaje...");
        await handleEmailConfirmation(null, "confirmed");
      }
    };

    // Manejar URL inicial (cuando la app se abre desde el link)
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    // Escuchar deep links cuando la app ya está abierta
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    getInitialURL();

    return () => subscription?.remove();
  }, [handleEmailConfirmation]);

  return (
    <NavigationContainer>
      <AppNavigator
        initialRouteName={isOnboardingCompleted ? "Home" : "Onboarding"}
      />
    </NavigationContainer>
  );
};

const App = () => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Descomenta la linea de abajo para poder ver las onoboarding screens
        // await AsyncStorage.removeItem('onboardingCompleted');

        const value = await AsyncStorage.getItem("onboardingCompleted");
        setIsOnboardingCompleted(value === "true");
      } catch (error) {
        console.error("Error checking onboarding:", error);
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
      <AuthProvider>
        <AppContent isOnboardingCompleted={isOnboardingCompleted} />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
