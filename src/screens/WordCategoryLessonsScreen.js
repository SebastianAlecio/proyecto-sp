import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../lib/userService';

const WordCategoryLessonsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { user, userStats, refreshUser } = useAuth();
  const { categoryType, categoryName } = route.params;
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Definir las lecciones de adjetivos
  const adjetivosLessons = [
    {
      id: 'adjetivos_lesson_1',
      title: 'Adjetivos 1',
      subtitle: 'Básicos y Comunes',
      words: ['bonito', 'bueno', 'malo', 'grande', 'pequeño', 'nuevo', 'viejo', 'fácil', 'difícil', 'importante'],
      isUnlocked: true,
      stars: 0,
      completed: false,
      requiredScore: 0
    },
    {
      id: 'adjetivos_lesson_2',
      title: 'Adjetivos 2',
      subtitle: 'Personalidad',
      words: ['inteligente', 'tonto', 'mentiroso', 'responsable', 'sabio', 'necio', 'curioso', 'chismoso', 'listo', 'ocupado'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70
    },
    {
      id: 'adjetivos_lesson_3',
      title: 'Adjetivos 3',
      subtitle: 'Apariencia Física',
      words: ['guapo', 'feo', 'gordo', 'delgado', 'joven', 'adulto', 'maduro', 'desnudo', 'limpio', 'sucio'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70
    },
    {
      id: 'adjetivos_lesson_4',
      title: 'Adjetivos 4',
      subtitle: 'Estados y Condiciones',
      words: ['mojado', 'seco', 'frío', 'duro', 'muerto', 'vivo', 'preocupado', 'divertido', 'especial', 'necesario'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70
    },
    {
      id: 'adjetivos_lesson_5',
      title: 'Adjetivos 5',
      subtitle: 'Cualidades y Características',
      words: ['correcto', 'perfecto', 'claro', 'oscuro', 'rápido', 'lento', 'rico', 'pobre', 'peligroso', 'raro'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70
    },
    {
      id: 'adjetivos_lesson_6',
      title: 'Adjetivos 6',
      subtitle: 'Finales',
      words: ['ridículo', 'haragán', 'cuidado'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70
    }
  ];

  // Definir las lecciones de frases y emociones
  const frasesEmocionesLessons = [
    {
      id: 'frases_lesson_1',
      title: 'Frases 1',
      subtitle: 'Saludos y Cortesía',
      words: ['hola', 'adiós', 'buenos días', 'buenas tardes', 'buenas noches', 'gracias', 'de nada', 'por favor', 'disculpa', 'permiso'],
      isUnlocked: true,
      stars: 0,
      completed: false,
      requiredScore: 0
    },
    {
      id: 'frases_lesson_2',
      title: 'Frases 2',
      subtitle: 'Presentación y Expresiones',
      words: ['mi nombre', 'mi apodo es', 'mucho gusto', 'bienvenido', 'cómo estás', 'me gusta', 'ok', 'tal vez', 'sí'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70
    },
    {
      id: 'frases_lesson_3',
      title: 'Frases 3',
      subtitle: 'Frases Especiales',
      words: ['feliz cumpleaños', 'buen provecho', 'dios te bendiga', 'aplausos', 'me equivoqué', 'no sé', 'no importa', 'entendiste', 'no'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70
    }
  ];

  useEffect(() => {
    loadLessonsProgress();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadLessonsProgress();
      refreshUser();
    });

    return unsubscribe;
  }, [navigation]);

  const loadLessonsProgress = async () => {
    try {
      setIsLoading(true);
      
      const progress = await userService.getUserProgress(user.id);
      const baseLessons = categoryType === 'adjetivos' ? adjetivosLessons : frasesEmocionesLessons;
      
      const updatedLessons = baseLessons.map((lesson, index) => {
        const lessonProgress = progress.find(p => 
          p.category === 'word_lessons' && p.item_id === lesson.id
        );
        
        let stars = 0;
        let completed = false;
        
        if (lessonProgress && lessonProgress.score !== undefined) {
          const percentage = lessonProgress.score;
          completed = lessonProgress.completed;
          
          if (percentage >= 90) stars = 3;
          else if (percentage >= 70) stars = 2;
          else if (percentage >= 50) stars = 1;
        }
        
        let isUnlocked = lesson.isUnlocked;
        
        if (index > 0) {
          const previousLessonId = baseLessons[index - 1].id;
          const previousProgress = progress.find(p => 
            p.category === 'word_lessons' && p.item_id === previousLessonId
          );
          
          isUnlocked = previousProgress && 
                      previousProgress.score >= lesson.requiredScore;
        }
        
        return {
          ...lesson,
          isUnlocked,
          stars,
          completed
        };
      });
      
      setLessons(updatedLessons);
    } catch (error) {
      console.error('Error loading lessons progress:', error);
      setLessons(categoryType === 'adjetivos' ? adjetivosLessons : frasesEmocionesLessons);
    } finally {
      setIsLoading(false);
    }
  };

  const startLesson = (lesson) => {
    if (!lesson.isUnlocked) return;
    
    navigation.navigate('WordLesson', {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      words: lesson.words,
      categoryType: categoryType
    });
  };

  const getLockMessage = (lesson, index) => {
    if (index === 0) return '';
    
    const previousLesson = lessons[index - 1];
    if (!previousLesson.completed) {
      return `Completa ${previousLesson.title} para desbloquear`;
    } else if (previousLesson.stars < 2) {
      return `Necesitas al menos 70% en ${previousLesson.title}`;
    }
    return '';
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
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Cargando lecciones...</Text>
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
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <Text style={styles.headerSubtitle}>
            {categoryType === 'adjetivos' ? '🎨 Palabras que describen características' : '💬 Expresiones comunes y saludos'}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Icon name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.statText}>
            {lessons.filter(l => l.completed).length}/{lessons.length}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="star" size={20} color="#FFD700" />
          <Text style={styles.statText}>
            {lessons.reduce((total, lesson) => total + lesson.stars, 0)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="trophy" size={20} color="#FF6B6B" />
          <Text style={styles.statText}>
            {Math.round((lessons.filter(l => l.completed).length / lessons.length) * 100)}%
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Lessons */}
        <View style={styles.lessonsContainer}>
          {lessons.map((lesson, index) => (
            <TouchableOpacity
              key={lesson.id}
              style={[
                styles.lessonCard,
                !lesson.isUnlocked && styles.lessonCardLocked,
                lesson.completed && styles.lessonCardCompleted
              ]}
              onPress={() => startLesson(lesson)}
              disabled={!lesson.isUnlocked}
              activeOpacity={lesson.isUnlocked ? 0.7 : 1}
            >
              {/* Lock Icon for locked lessons */}
              {!lesson.isUnlocked && (
                <View style={styles.lockIcon}>
                  <Icon name="lock-closed" size={24} color={theme.placeholder} />
                </View>
              )}

              {/* Completed Icon */}
              {lesson.completed && (
                <View style={styles.completedIcon}>
                  <Icon name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
              )}
              
              {/* Lesson Content */}
              <View style={styles.lessonContent}>
                <Text style={[
                  styles.lessonTitle,
                  !lesson.isUnlocked && styles.lessonTitleLocked
                ]}>
                  {lesson.title}
                </Text>
                <Text style={[
                  styles.lessonSubtitle,
                  !lesson.isUnlocked && styles.lessonSubtitleLocked
                ]}>
                  {lesson.subtitle} • {lesson.words.length} palabras
                </Text>
                
                {/* Lock message */}
                {!lesson.isUnlocked && (
                  <Text style={styles.lockMessage}>
                    {getLockMessage(lesson, index)}
                  </Text>
                )}
              </View>

              {/* Action Buttons - Solo mostrar si está desbloqueada */}
              {lesson.isUnlocked && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.studyButton}
                    onPress={() => navigation.navigate('WordStudyLesson', {
                      lessonId: lesson.id,
                      lessonTitle: lesson.title,
                      words: lesson.words,
                      categoryType: categoryType
                    })}
                  >
                    <Icon name="eye" size={16} color={categoryType === 'adjetivos' ? '#FF6B6B' : '#45B7D1'} />
                    <Text style={styles.studyButtonText}>Ver Palabras</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.quizButton}
                    onPress={() => navigation.navigate('WordLesson', {
                      lessonId: lesson.id,
                      lessonTitle: lesson.title,
                      words: lesson.words,
                      categoryType: categoryType
                    })}
                  >
                    <Icon name="school" size={16} color="#FFFFFF" />
                    <Text style={styles.quizButtonText}>Hacer Examen</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Stars */}
              <View style={styles.starsContainer}>
                {[1, 2, 3].map((star) => (
                  <Icon
                    key={star}
                    name={lesson.stars >= star ? "star" : "star-outline"}
                    size={16}
                    color={lesson.stars >= star ? "#FFD700" : theme.placeholder}
                  />
                ))}
              </View>

              {/* Progress Indicator */}
              {lesson.isUnlocked && (
                <View style={styles.progressIndicator}>
                  <View style={[
                    styles.progressBar,
                    { width: `${lesson.completed ? 100 : 0}%` }
                  ]} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '400',
  },
  headerSpacer: {
    width: 40,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  lessonsContainer: {
    gap: 16,
  },
  lessonCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  lessonCardLocked: {
    backgroundColor: theme.background,
    opacity: 0.6,
  },
  lessonCardCompleted: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  lockIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  completedIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  lessonContent: {
    marginBottom: 12,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  lessonTitleLocked: {
    color: theme.placeholder,
  },
  lessonSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '400',
  },
  lessonSubtitleLocked: {
    color: theme.placeholder,
  },
  lockMessage: {
    fontSize: 12,
    color: theme.placeholder,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  studyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#45B7D1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  studyButtonText: {
    color: '#45B7D1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  quizButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45B7D1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#45B7D1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  quizButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  progressIndicator: {
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#45B7D1',
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default WordCategoryLessonsScreen;