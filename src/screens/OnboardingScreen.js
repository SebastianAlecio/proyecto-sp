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
          title: <Text style={styles.title}>Learn Sign Language Easily</Text>,
          subtitle: <Text style={styles.subtitle}>Dive into the world of sign language with our fun and interactive lessons. Start your journey today!</Text>,
          bottomBarColor: '#fff7f0',
          nextLabel: 'Get Started',
        },
        {
          backgroundColor: '#ffffff',
          image: <Image source={require('../assets/images/onboarding/poster.png')} style={styles.image} />,
          title: <Text style={styles.title}>Translate Text to Signs</Text>,
          subtitle: <Text style={styles.subtitle}>Instantly convert words and phrases into sign language.</Text>,
          bottomBarColor: '#ffffff',
          nextLabel: 'Continue',
        },
        {
          backgroundColor: '#fff7f0',
          image: <Image source={require('../assets/images/onboarding/camera.png')} style={styles.image} />,
          title: <Text style={styles.title}>Practice with Your Camera</Text>,
          subtitle: <Text style={styles.subtitle}>Practice and get real-time feedback on your signs.</Text>,
          bottomBarColor: '#fff7f0',
          nextLabel: 'Get Started',
        },
        {
          backgroundColor: '#ffffff',
          image: <Image source={require('../assets/images/onboarding/lessons.png')} style={styles.image} />,
          title: <Text style={styles.title}>Interactive Sign Language Lessons</Text>,
          subtitle: <Text style={styles.subtitle}>Engage with fun lessons, track your progress, and earn rewards.</Text>,
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
  activeDot: {
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    backgroundColor: '#ccc', // Mantenemos gris para contraste en ambos temas
  },
});

export default OnboardingScreen;