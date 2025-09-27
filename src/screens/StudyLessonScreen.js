import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { signLanguageAPI } from '../lib/supabase';

const { width } = Dimensions.get('window');

const StudyLessonScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { lessonId, lessonTitle, letters } = route.params;
  const [lessonSigns, setLessonSigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadLessonSigns();
  }, []);

  const loadLessonSigns = async () => {
    try {
      setIsLoading(true);
      
      // Obtener las señas de la base de datos para las letras de esta lección
      const signs = await signLanguageAPI.getSignsByCharacters(letters);
      
      // Ordenar según el orden de las letras en la lección
      const orderedSigns = letters.map(letter => 
        signs.find(sign => sign.character === letter)
      ).filter(Boolean);
      
      setLessonSigns(orderedSigns);
    } catch (error) {
      console.error('Error loading lesson signs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNext = () => {
    if (currentIndex < lessonSigns.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToSign = (index) => {
    setCurrentIndex(index);
  };

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{lessonTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Cargando lección...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (lessonSigns.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{lessonTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudieron cargar las señas</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentSign = lessonSigns[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{lessonTitle}</Text>
          <Text style={styles.headerSubtitle}>Estudia las señas</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[
            styles.progressBar,
            { width: `${((currentIndex + 1) / lessonSigns.length) * 100}%` }
          ]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} de {lessonSigns.length}
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <TouchableOpacity 
            style={[styles.navButton, styles.navButtonLeft]}
            onPress={goToPrevious}
          >
            <Icon name="chevron-back" size={28} color={theme.text} />
          </TouchableOpacity>
        )}

        {currentIndex < lessonSigns.length - 1 && (
          <TouchableOpacity 
            style={[styles.navButton, styles.navButtonRight]}
            onPress={goToNext}
          >
            <Icon name="chevron-forward" size={28} color={theme.text} />
          </TouchableOpacity>
        )}

        {/* Sign Card */}
        <View style={styles.signCard}>
          <View style={styles.signImageContainer}>
            <Image
              source={{ uri: currentSign.image_url }}
              style={styles.signImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.signInfo}>
            <Text style={styles.signCharacter}>{currentSign.character}</Text>
            <Text style={styles.signType}>
              {currentSign.type === 'letter' ? 'Letra' : 
               currentSign.type === 'number' ? 'Número' : 'Especial'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* Dots Indicator */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dotsContainer}
        >
          {lessonSigns.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive
              ]}
              onPress={() => goToSign(index)}
            >
              <Text style={[
                styles.dotText,
                index === currentIndex && styles.dotTextActive
              ]}>
                {lessonSigns[index].character}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.quizButton}
            onPress={() => navigation.replace('Lesson', {
              lessonId,
              lessonTitle,
              letters
            })}
          >
            <Icon name="school" size={20} color="#FFFFFF" />
            <Text style={styles.quizButtonText}>Hacer Examen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonLeft: {
    left: 24,
  },
  navButtonRight: {
    right: 24,
  },
  signCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  signImageContainer: {
    width: 200,
    height: 200,
    backgroundColor: theme.background,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: theme.primary,
    overflow: 'hidden',
  },
  signImage: {
    width: '100%',
    height: '100%',
  },
  signInfo: {
    alignItems: 'center',
  },
  signCharacter: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: 8,
  },
  signType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bottomNav: {
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingBottom: 40,
    paddingTop: 20,
  },
  dotsContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.border,
  },
  dotActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  dotText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  dotTextActive: {
    color: '#FFFFFF',
  },
  actionButtonsContainer: {
    paddingHorizontal: 24,
  },
  quizButton: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quizButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});

export default StudyLessonScreen;