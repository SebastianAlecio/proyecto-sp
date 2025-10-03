import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { wordsAPI } from '../lib/supabase';

const { width } = Dimensions.get('window');

const WordLessonScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { markProgress } = useAuth();
  const { lessonId, lessonTitle, words, categoryType } = route.params || {};

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [lessonResults, setLessonResults] = useState(null);

  // Validar parámetros
  useEffect(() => {
    if (!route.params || !words || !lessonId) {
      console.error('Missing required params:', route.params);
      navigation.goBack();
      return;
    }
  }, []);

  // Video player para la pregunta actual
  const currentQuestion = questions[currentQuestionIndex];
  const videoPlayer = useVideoPlayer(
    currentQuestion?.video_url || '', 
    player => {
      if (currentQuestion?.video_url) {
        player.loop = true;
        player.play();
      }
    }
  );

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    try {
      setIsLoading(true);
      
      // Obtener todas las palabras de la categoría para opciones incorrectas
      const allCategoryWords = await wordsAPI.getWordsByCategory(categoryType);
      
      // Obtener las palabras específicas de esta lección
      const lessonWordPromises = words.map(word => wordsAPI.getWordVideo(word));
      const lessonWords = await Promise.all(lessonWordPromises);

      // Generar preguntas para cada palabra de la lección
      const generatedQuestions = lessonWords.map(correctWord => {
        // Crear opciones incorrectas de la misma categoría
        const wrongOptions = allCategoryWords
          .filter(word => word.word !== correctWord.word)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        // Combinar y mezclar opciones
        const allOptions = [correctWord, ...wrongOptions]
          .sort(() => Math.random() - 0.5);

        return {
          id: correctWord.id,
          question: `¿Qué palabra es esta?`,
          video_url: correctWord.video_url,
          correctAnswer: correctWord.word,
          options: allOptions.map(option => ({
            id: option.id,
            text: option.word,
            isCorrect: option.word === correctWord.word
          }))
        };
      });

      // Randomizar el orden de las preguntas
      const randomizedQuestions = generatedQuestions.sort(() => Math.random() - 0.5);

      setQuestions(randomizedQuestions);
    } catch (error) {
      console.error('Error generating questions:', error);
      Alert.alert('Error', 'No se pudieron cargar las preguntas');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (option) => {
    if (showResult) return;
    
    setSelectedAnswer(option);
    setShowResult(true);

    let newScore = score;
    if (option.isCorrect) {
      newScore = score + 1;
      setScore(newScore);
      // Marcar progreso para la palabra correcta
      markProgress('word_lessons', currentQuestion.correctAnswer, true);
    }

    // Avanzar automáticamente después de 1.5 segundos
    setTimeout(() => {
      handleNextQuestion(newScore);
    }, 1500);
  };

  const handleNextQuestion = (currentScore = score) => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Lección completada
      handleLessonComplete(currentScore);
    }
  };

  const handleLessonComplete = (finalScore = score) => {
    const percentage = (finalScore / questions.length) * 100;
    let stars = 0;
    let message = '';
    let emoji = '';
    
    if (percentage >= 90) {
      stars = 3;
      message = '¡Increíble! ¡Eres un maestro!';
      emoji = '🏆';
    } else if (percentage >= 70) {
      stars = 2;
      message = '¡Muy bien! ¡Sigue así!';
      emoji = '⭐';
    } else if (percentage >= 50) {
      stars = 1;
      message = '¡Buen trabajo! ¡Puedes mejorar!';
      emoji = '👍';
    } else {
      stars = 0;
      message = '¡No te rindas! ¡Inténtalo de nuevo!';
      emoji = '💪';
    }

    // Marcar progreso de la lección con el porcentaje obtenido
    markProgress('word_lessons', lessonId, true, percentage);

    // Mostrar modal de resultados
    setLessonResults({
      score: finalScore,
      total: questions.length,
      percentage,
      stars,
      message,
      emoji
    });
    setShowCompletionModal(true);
  };

  const handleContinue = () => {
    setShowCompletionModal(false);
    navigation.goBack();
  };

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparando lección...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error al cargar la lección</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{lessonTitle}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View style={[
                styles.progressBar,
                { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
              ]} />
            </View>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1} de {questions.length}
            </Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}/{questions.length}</Text>
        </View>
      </View>

      {/* Question Content */}
      <View style={styles.content}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        
        {/* Video */}
        <View style={styles.videoContainer}>
          <VideoView
            style={styles.video}
            player={videoPlayer}
            fullscreenOptions={{ enabled: false }}
            allowsPictureInPicture={false}
          />
        </View>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedAnswer?.id === option.id && (
                  option.isCorrect ? styles.optionCorrect : styles.optionIncorrect
                ),
                showResult && option.isCorrect && styles.optionCorrect
              ]}
              onPress={() => handleAnswerSelect(option)}
              disabled={showResult}
            >
              <Text style={[
                styles.optionText,
                selectedAnswer?.id === option.id && styles.optionTextSelected,
                showResult && option.isCorrect && styles.optionTextCorrect
              ]}>
                {option.text}
              </Text>
              
              {showResult && selectedAnswer?.id === option.id && (
                <Icon 
                  name={option.isCorrect ? "checkmark-circle" : "close-circle"} 
                  size={24} 
                  color="#FFFFFF" 
                />
              )}
              
              {showResult && option.isCorrect && selectedAnswer?.id !== option.id && (
                <Icon name="checkmark-circle" size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Result Feedback */}
        {showResult && (
          <View style={styles.feedbackContainer}>
            <Text style={[
              styles.feedbackText,
              selectedAnswer?.isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect
            ]}>
              {selectedAnswer?.isCorrect ? '¡Correcto! 🎉' : `Incorrecto. La respuesta es: ${currentQuestion.correctAnswer}`}
            </Text>
          </View>
        )}
      </View>

      {/* Lesson Completion Modal */}
      <Modal
        visible={showCompletionModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleContinue}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalEmoji}>{lessonResults?.emoji}</Text>
              <Text style={styles.modalTitle}>¡Lección Completada!</Text>
              <Text style={styles.modalMessage}>{lessonResults?.message}</Text>
            </View>

            {/* Score */}
            <View style={styles.scoreSection}>
              <Text style={styles.scoreTitle}>Tu Puntuación</Text>
              <Text style={styles.scoreBig}>
                {lessonResults?.score}/{lessonResults?.total}
              </Text>
              <Text style={styles.scorePercentage}>
                {Math.round(lessonResults?.percentage || 0)}% Correcto
              </Text>
            </View>

            {/* Stars */}
            <View style={styles.starsSection}>
              <Text style={styles.starsTitle}>Estrellas Obtenidas</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3].map((star) => (
                  <Icon
                    key={star}
                    name={lessonResults?.stars >= star ? "star" : "star-outline"}
                    size={32}
                    color={lessonResults?.stars >= star ? "#FFD700" : theme.placeholder}
                    style={styles.starIcon}
                  />
                ))}
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continuar</Text>
              <Icon name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBackground: {
    width: 200,
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
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
  },
  scoreContainer: {
    backgroundColor: categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  videoContainer: {
    width: 250,
    height: 200,
    backgroundColor: theme.surface,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 3,
    borderColor: categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  optionsContainer: {
    width: '100%',
    maxWidth: 400,
  },
  optionButton: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCorrect: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionIncorrect: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  optionTextCorrect: {
    color: '#FFFFFF',
  },
  feedbackContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  feedbackCorrect: {
    color: '#4CAF50',
  },
  feedbackIncorrect: {
    color: '#F44336',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme.textSecondary,
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
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: theme.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  scoreBig: {
    fontSize: 48,
    fontWeight: '700',
    color: categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1',
    marginBottom: 4,
  },
  scorePercentage: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  starsSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  starsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginHorizontal: 4,
  },
  continueButton: {
    backgroundColor: categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default WordLessonScreen;