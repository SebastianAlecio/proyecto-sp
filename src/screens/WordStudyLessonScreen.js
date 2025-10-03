import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { wordsAPI } from '../lib/supabase';

const { width } = Dimensions.get('window');

const WordStudyLessonScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  
  // Validar que route.params existe
  if (!route.params) {
    console.error('No route params provided to WordStudyLessonScreen');
    navigation.goBack();
    return null;
  }
  
  const { lessonId, lessonTitle, words, categoryType = 'adjetivos' } = route.params;
  const [lessonWords, setLessonWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Validar parámetros requeridos
  if (!words || !lessonId || !lessonTitle) {
    console.error('Missing required params:', { lessonId, lessonTitle, words, categoryType });
    navigation.goBack();
    return null;
  }

  useEffect(() => {
    loadLessonWords();
  }, []);

  // Crear video player para la palabra actual
  const currentWord = lessonWords[currentIndex];
  const videoPlayer = useVideoPlayer(
    currentWord?.video_url || '', 
    player => {
      if (currentWord?.video_url) {
        player.loop = true;
        player.play();
      }
    }
  );

  const loadLessonWords = async () => {
    try {
      setIsLoading(true);
      
      // Verificar que tenemos palabras
      if (!words || words.length === 0) {
        console.error('No words provided to lesson');
        return;
      }
      
      // Obtener las palabras de la base de datos
      const wordPromises = words.map(word => wordsAPI.getWordVideo(word));
      const wordData = await Promise.all(wordPromises);
      
      setLessonWords(wordData);
    } catch (error) {
      console.error('Error loading lesson words:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNext = () => {
    if (currentIndex < lessonWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToWord = (index) => {
    setCurrentIndex(index);
  };

  const styles = createStyles(theme, categoryType);

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
          <ActivityIndicator size="large" color={categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1'} />
          <Text style={styles.loadingText}>Cargando palabras...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (lessonWords.length === 0) {
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
          <Text style={styles.errorText}>No se pudieron cargar las palabras</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerSubtitle}>Estudia las palabras</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[
            styles.progressBar,
            { width: `${((currentIndex + 1) / lessonWords.length) * 100}%` }
          ]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} de {lessonWords.length}
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

        {currentIndex < lessonWords.length - 1 && (
          <TouchableOpacity 
            style={[styles.navButton, styles.navButtonRight]}
            onPress={goToNext}
          >
            <Icon name="chevron-forward" size={28} color={theme.text} />
          </TouchableOpacity>
        )}

        {/* Word Card */}
        <View style={styles.wordCard}>
          <View style={styles.videoContainer}>
            <VideoView
              style={styles.video}
              player={videoPlayer}
              fullscreenOptions={{ enabled: true }}
              allowsPictureInPicture
            />
          </View>
          
          <View style={styles.wordInfo}>
            <Text style={styles.wordTitle}>{currentWord.word}</Text>
            <Text style={styles.wordCategory}>{currentWord.category}</Text>
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
          {lessonWords.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive
              ]}
              onPress={() => goToWord(index)}
            >
              <Text style={[
                styles.dotText,
                index === currentIndex && styles.dotTextActive
              ]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.quizButton}
            onPress={() => navigation.replace('WordLesson', {
              lessonId,
              lessonTitle,
              words,
              categoryType: categoryType
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

const createStyles = (theme, categoryType) => StyleSheet.create({
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
    backgroundColor: categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1',
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
  wordCard: {
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
  videoContainer: {
    width: 250,
    height: 200,
    backgroundColor: theme.background,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  wordInfo: {
    alignItems: 'center',
  },
  wordTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  wordCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  wordDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
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
    backgroundColor: categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1',
    borderColor: categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1',
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
    backgroundColor: categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1',
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

export default WordStudyLessonScreen;