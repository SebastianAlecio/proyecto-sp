import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { signLanguageAPI } from '../lib/supabase';

const { width } = Dimensions.get('window');

const LessonScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { markProgress } = useAuth();
  const { lessonId, lessonTitle, letters } = route.params;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    try {
      setIsLoading(true);
      
      // Obtener todas las letras de la base de datos
      const allLetters = await signLanguageAPI.getAllSigns();
      const lessonLetters = allLetters.filter(letter => 
        letters.includes(letter.character)
      );

      // Generar preguntas para cada letra de la lección
      const generatedQuestions = lessonLetters.map(correctLetter => {
        // Crear opciones incorrectas
        const wrongOptions = allLetters
          .filter(letter => letter.character !== correctLetter.character)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        // Combinar y mezclar opciones
        const allOptions = [correctLetter, ...wrongOptions]
          .sort(() => Math.random() - 0.5);

        return {
          id: correctLetter.id,
          question: `¿Qué letra es esta?`,
          image: correctLetter.image_url,
          correctAnswer: correctLetter.character,
          options: allOptions.map(option => ({
            id: option.id,
            text: option.character,
            isCorrect: option.character === correctLetter.character
          }))
        };
      });

      setQuestions(generatedQuestions);
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

    if (option.isCorrect) {
      setScore(prev => prev + 1);
      // Marcar progreso para esta letra
      markProgress('letters', option.text, true);
    }

    // Avanzar automáticamente después de 1.5 segundos
    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Lección completada
      handleLessonComplete();
    }
  };

  const handleLessonComplete = () => {
    const percentage = (score / questions.length) * 100;
    let stars = 0;
    
    if (percentage >= 90) stars = 3;
    else if (percentage >= 70) stars = 2;
    else if (percentage >= 50) stars = 1;

    // Marcar progreso de la lección
    markProgress('lessons', lessonId, true);

    Alert.alert(
      '🎉 ¡Lección Completada!',
      `Obtuviste ${score} de ${questions.length} respuestas correctas.\n⭐ ${stars} estrella${stars !== 1 ? 's' : ''}`,
      [
        {
          text: 'Continuar',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const currentQuestion = questions[currentQuestionIndex];

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
        
        {/* Sign Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentQuestion.image }}
            style={styles.signImage}
            resizeMode="contain"
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
    backgroundColor: theme.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  scoreContainer: {
    backgroundColor: theme.primary,
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
  imageContainer: {
    width: 200,
    height: 200,
    backgroundColor: theme.surface,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 3,
    borderColor: theme.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  signImage: {
    width: '90%',
    height: '90%',
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
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
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
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LessonScreen;