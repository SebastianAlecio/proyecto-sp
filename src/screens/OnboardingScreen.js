import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const onboardingData = [
    {
      id: 1,
      icon: 'hand-left',
      title: 'Aprende Lenguaje de Señas',
      subtitle: 'Sumérgete en el mundo del lenguaje de señas con nuestras lecciones interactivas y fáciles de seguir.',
      backgroundColor: theme.primary + '10',
      iconColor: theme.primary,
    },
    {
      id: 2,
      icon: 'language',
      title: 'Traduce Texto a Señas',
      subtitle: 'Convierte instantáneamente palabras y frases en lenguaje de señas visual y aprende mientras traduces.',
      backgroundColor: '#FF6B6B20',
      iconColor: '#FF6B6B',
    },
    {
      id: 3,
      icon: 'camera',
      title: 'Practica en Tiempo Real',
      subtitle: 'Usa tu cámara para practicar señas y recibe retroalimentación instantánea sobre tu progreso.',
      backgroundColor: '#4ECDC420',
      iconColor: '#4ECDC4',
    },
    {
      id: 4,
      icon: 'trophy',
      title: 'Gana Logros',
      subtitle: 'Completa lecciones, mantén rachas diarias y desbloquea logros mientras dominas el lenguaje de señas.',
      backgroundColor: '#FFE66D20',
      iconColor: '#FFE66D',
    },
  ];

  const handleDone = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving onboarding:', error);
      navigation.navigate('Home');
    }
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: (nextIndex + 1) / onboardingData.length,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      handleDone();
    }
  };

  const handleSkip = () => {
    handleDone();
  };

  const onScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentIndex) {
      setCurrentIndex(slideIndex);
      
      // Barra animada 
      Animated.timing(progressAnim, {
        toValue: (slideIndex + 1) / onboardingData.length,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />
      
      {/* Header with Skip Button */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} de {onboardingData.length}
        </Text>
      </View>

      {/* Content ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingData.map((item, index) => (
          <View key={item.id} style={styles.slide}>
            <View style={styles.content}>
              {/* Icon Container */}
              <View style={[styles.iconContainer, { backgroundColor: item.backgroundColor }]}>
                <Icon name={item.icon} size={80} color={item.iconColor} />
              </View>

              {/* Text Content */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex ? theme.primary : theme.border,
                  width: index === currentIndex ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleNext}>
          <Text style={styles.actionButtonText}>
            {currentIndex === onboardingData.length - 1 ? 'Comenzar' : 'Siguiente'}
          </Text>
          <Icon 
            name={currentIndex === onboardingData.length - 1 ? 'checkmark' : 'chevron-forward'} 
            size={20} 
            color="#FFFFFF" 
            style={styles.actionButtonIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerSpacer: {
    width: 60,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  progressBackground: {
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    paddingTop: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    transition: 'all 0.3s ease',
  },
  actionButton: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  actionButtonIcon: {
    marginLeft: 4,
  },
});

export default OnboardingScreen;