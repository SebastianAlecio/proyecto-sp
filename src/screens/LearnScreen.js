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
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../lib/userService';

const { width } = Dimensions.get('window');

const LearnScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, userStats, refreshUser } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Definir las lecciones del abecedario
  const alphabetLessons = [
    {
      id: 'lesson_1',
      title: 'Lección 1',
      subtitle: 'A - B - C - D - E',
      letters: ['A', 'B', 'C', 'D', 'E'],
      isUnlocked: true, // Primera lección siempre desbloqueada
      stars: 0,
      completed: false,
      requiredScore: 0 // No requiere score previo
    },
    {
      id: 'lesson_2',
      title: 'Lección 2',
      subtitle: 'F - G - H - I - J',
      letters: ['F', 'G', 'H', 'I', 'J'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70 // Requiere 70% en lección anterior
    },
    {
      id: 'lesson_3',
      title: 'Lección 3',
      subtitle: 'K - L - M - N - Ñ',
      letters: ['K', 'L', 'M', 'N', 'Ñ'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70
    },
    {
      id: 'lesson_4',
      title: 'Lección 4',
      subtitle: 'O - P - Q - R - S',
      letters: ['O', 'P', 'Q', 'R', 'S'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70
    },
    {
      id: 'lesson_5',
      title: 'Lección 5',
      subtitle: 'T - U - V - W - X',
      letters: ['T', 'U', 'V', 'W', 'X'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70
    },
    {
      id: 'lesson_6',
      title: 'Lección 6',
      subtitle: 'Y - Z - RR - LL',
      letters: ['Y', 'Z', 'RR', 'LL'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70
    }
  ];

  // Definir las lecciones de números
  const numberLessons = [
    {
      id: 'number_lesson_1',
      title: 'Números 1',
      subtitle: '1 - 2 - 3 - 4 - 5',
      letters: ['1', '2', '3', '4', '5'],
      isUnlocked: false, // Se desbloquea al completar todas las lecciones del abecedario
      stars: 0,
      completed: false,
      requiredScore: 70
    },
    {
      id: 'number_lesson_2',
      title: 'Números 2',
      subtitle: '6 - 7 - 8 - 9 - 10',
      letters: ['6', '7', '8', '9', '10'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70
    }
  ];
  // Cargar progreso cuando cambie el usuario
  useEffect(() => {
    if (user?.id) {
      loadLessonsProgress();
    }
  }, [user]);

  // Recargar cuando regresemos de una lección
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user?.id) {
        loadLessonsProgress();
        refreshUser(); // Actualizar estadísticas
      }
    });

    return unsubscribe;
  }, [navigation, user]);

  const loadLessonsProgress = async () => {
    try {
      setIsLoading(true);
      
      // Obtener progreso del usuario
      const progress = await userService.getUserProgress(user.id);
      
      // Procesar progreso de lecciones
      const updatedAlphabetLessons = alphabetLessons.map((lesson, index) => {
        // Buscar progreso de esta lección
        const lessonProgress = progress.find(p => 
          p.category === 'lessons' && p.item_id === lesson.id
        );
        
        // Calcular estrellas basado en el score guardado
        let stars = 0;
        let completed = false;
        
        if (lessonProgress && lessonProgress.score !== undefined) {
          const percentage = lessonProgress.score;
          completed = lessonProgress.completed;
          
          if (percentage >= 90) stars = 3;
          else if (percentage >= 70) stars = 2;
          else if (percentage >= 50) stars = 1;
        }
        
        // Determinar si está desbloqueada
        let isUnlocked = lesson.isUnlocked; // Primera lección siempre desbloqueada
        
        if (index > 0) {
          // Para lecciones posteriores, verificar si la anterior está completada
          const previousLessonId = alphabetLessons[index - 1].id;
          const previousProgress = progress.find(p => 
            p.category === 'lessons' && p.item_id === previousLessonId
          );
          
          // Desbloquear si la lección anterior tiene al menos 70%
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
      
      // Procesar progreso de lecciones de números
      const updatedNumberLessons = numberLessons.map((lesson, index) => {
        // Buscar progreso de esta lección
        const lessonProgress = progress.find(p => 
          p.category === 'lessons' && p.item_id === lesson.id
        );
        
        // Calcular estrellas basado en el score guardado
        let stars = 0;
        let completed = false;
        
        if (lessonProgress && lessonProgress.score !== undefined) {
          const percentage = lessonProgress.score;
          completed = lessonProgress.completed;
          
          if (percentage >= 90) stars = 3;
          else if (percentage >= 70) stars = 2;
          else if (percentage >= 50) stars = 1;
        }
        
        // Determinar si está desbloqueada
        let isUnlocked = false;
        
        if (index === 0) {
          // Primera lección de números: se desbloquea al completar todas las lecciones del abecedario
          const allAlphabetCompleted = updatedAlphabetLessons.every(alphabetLesson => {
            const alphabetProgress = progress.find(p => 
              p.category === 'lessons' && p.item_id === alphabetLesson.id
            );
            return alphabetProgress && alphabetProgress.score >= 70;
          });
          isUnlocked = allAlphabetCompleted;
        } else {
          // Lecciones posteriores de números: verificar si la anterior está completada
          const previousLessonId = numberLessons[index - 1].id;
          const previousProgress = progress.find(p => 
            p.category === 'lessons' && p.item_id === previousLessonId
          );
          
          // Desbloquear si la lección anterior tiene al menos 70%
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
      setLessons([...updatedAlphabetLessons, ...updatedNumberLessons]);
    } catch (error) {
      console.error('Error loading lessons progress:', error);
      // En caso de error, usar lecciones por defecto
      setLessons([...alphabetLessons, ...numberLessons]);
    } finally {
      setIsLoading(false);
    }
  };

  const startLesson = (lesson) => {
    if (!lesson.isUnlocked) return;
    
    // Navegar a la pantalla de lección
    navigation.navigate('Lesson', {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      letters: lesson.letters
    });
  };

  const getLockMessage = (lesson, index) => {
    // Encontrar si es una lección del abecedario o de números
    const alphabetLessonsCount = alphabetLessons.length;
    
    if (index === 0) return ''; // Primera lección del abecedario no tiene mensaje
    
    if (index === alphabetLessonsCount) {
      // Primera lección de números
      return 'Completa todas las lecciones del abecedario para desbloquear';
    }
    
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
          <Text style={styles.headerTitle}>Aprender</Text>
          <Text style={styles.headerSubtitle}>Domina el lenguaje de señas</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Cargando tu progreso...</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Aprender</Text>
        <Text style={styles.headerSubtitle}>Domina el lenguaje de señas</Text>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Icon name="flame" size={20} color="#FF6B35" />
          <Text style={styles.statText}>{userStats.consecutiveDays}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="trophy" size={20} color="#FFD700" />
          <Text style={styles.statText}>{userStats.maxStreak}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="star" size={20} color={theme.primary} />
          <Text style={styles.statText}>
            {lessons.reduce((total, lesson) => total + lesson.stars, 0)}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔤 Abecedario</Text>
          <Text style={styles.sectionSubtitle}>Aprende las letras básicas del lenguaje de señas</Text>
        </View>

        {/* Lessons Grid */}
        <View style={styles.lessonsContainer}>
          {lessons.slice(0, alphabetLessons.length).map((lesson, index) => (
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
                  {lesson.subtitle}
                </Text>
                
                {/* Lock message */}
                {!lesson.isUnlocked && (
                  <Text style={styles.lockMessage}>
                    {getLockMessage(lesson, index)}
                  </Text>
                )}
              </View>

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

        {/* Numbers Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔢 Números</Text>
          <Text style={styles.sectionSubtitle}>Aprende los números del 1 al 10 en lenguaje de señas</Text>
        </View>

        {/* Numbers Lessons Grid */}
        <View style={styles.lessonsContainer}>
          {lessons.slice(alphabetLessons.length).map((lesson, index) => {
            const actualIndex = alphabetLessons.length + index;
            return (
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
                    {lesson.subtitle}
                  </Text>
                  
                  {/* Lock message */}
                  {!lesson.isUnlocked && (
                    <Text style={styles.lockMessage}>
                      {getLockMessage(lesson, actualIndex)}
                    </Text>
                  )}
                </View>

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
            );
          })}
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
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 24,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '400',
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  lessonsContainer: {
    marginBottom: 40,
  },
  lessonCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    backgroundColor: theme.primary,
    borderRadius: 2,
  },
  comingSoonSection: {
    marginTop: 20,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  comingSoonCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.placeholder,
    marginTop: 12,
    marginBottom: 4,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: theme.placeholder,
    textAlign: 'center',
  },
});

export default LearnScreen;