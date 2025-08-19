import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const OnboardingScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const handleDone = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving onboarding:', error);
      navigation.navigate('Home');
    }
  };

  return (
    <Onboarding
      onDone={handleDone}
      onSkip={handleDone}
      showSkip={false}
      DotComponent={({ selected }) => (
        <View style={[
          styles.dot, 
          selected ? { backgroundColor: theme.primary } : { backgroundColor: '#ccc' }
        ]} />
      )}
      pages={[
        {
          backgroundColor: '#fff7f0',
          image: <Image source={require('../assets/images/onboarding/hands.png')} style={styles.image} />,
          title: <Text style={styles.title}>Aprenda el lenguaje de señas fácilmente</Text>,
          subtitle: <Text style={styles.subtitle}>Sumérgete en el mundo del lenguaje de señas con nuestras clases interactivas. Empieza tu aventura hoy mismo!</Text>,
          bottomBarColor: '#fff7f0',
          nextLabel: 'Get Started',
        },
        {
          backgroundColor: '#ffffff',
          image: <Image source={require('../assets/images/onboarding/poster.png')} style={styles.image} />,
          title: <Text style={styles.title}>Traducir texto a señales</Text>,
          subtitle: <Text style={styles.subtitle}>Convierte instantáneamente palabras y frases en lenguaje de señas.</Text>,
          bottomBarColor: '#ffffff',
          nextLabel: 'Continue',
        },
        {
          backgroundColor: '#fff7f0',
          image: <Image source={require('../assets/images/onboarding/camera.png')} style={styles.image} />,
          title: <Text style={styles.title}>Practica con tu cámara</Text>,
          subtitle: <Text style={styles.subtitle}>Practica en tiempo real lenguaje de señas con tu cámara.</Text>,
          bottomBarColor: '#fff7f0',
          nextLabel: 'Get Started',
        },
        {
          backgroundColor: '#ffffff',
          image: <Image source={require('../assets/images/onboarding/lessons.png')} style={styles.image} />,
          title: <Text style={styles.title}>Lecciones interactivas de lenguaje de señas</Text>,
          subtitle: <Text style={styles.subtitle}>ParticipA en lecciones divertidas, realiza un seguimiento de su progreso y gana recompensas,</Text>,
          bottomBarColor: '#ffffff',
          doneLabel: 'Start Learning',
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
});

export default OnboardingScreen;