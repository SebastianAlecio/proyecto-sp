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
import { wordsAPI } from '../lib/supabase';
import ProfileEditModal from '../components/ProfileEditModal';

const { width } = Dimensions.get('window');

const LearnScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, userStats, refreshUser, isGuest, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' or 'dataset'
  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('register');

  // Definir las lecciones del abecedario
  const alphabetLessons = [
    {
      id: 'lesson_1',
      title: 'Lección 1',
      subtitle: 'A - B - C - D - E',
      letters: ['A', 'B', 'C', 'D', 'E'],
      isUnlocked: true,
      stars: 0,
      completed: false,
      requiredScore: 0
    },
    {
      id: 'lesson_2',
      title: 'Lección 2',
      subtitle: 'F - G - H - I - J',
      letters: ['F', 'G', 'H', 'I', 'J'],
      isUnlocked: false,
      stars: 0,
      completed: false,
      requiredScore: 70
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
      isUnlocked: true,
      stars: 0,
      completed: false,
      requiredScore: 0
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

  // Cargar datos cuando cambie el usuario o la pestaña
  useEffect(() => {
    if (activeTab === 'dataset') {
      loadDatasetCategories();
    } else if (user?.id) {
      loadLessonsProgress();
    }
  }, [user, activeTab]);

  // Recargar cuando regresemos de una lección
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user?.id && activeTab === 'lessons') {
        loadLessonsProgress();
        refreshUser();
      }
    });

    return unsubscribe;
  }, [navigation, user, activeTab]);

  const loadDatasetCategories = async () => {
    try {
      setIsLoading(true);
      const allCategories = await wordsAPI.getAllCategories();
      
      // Mapear categorías con información adicional
      const categoriesWithInfo = allCategories.map(category => {
        const categoryInfo = getCategoryInfo(category);
        return {
          id: category,
          name: categoryInfo.name,
          icon: categoryInfo.icon,
          color: categoryInfo.color,
          description: categoryInfo.description
        };
      });

      setCategories(categoriesWithInfo);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryInfo = (category) => {
    const categoryMap = {
      'adjetivos': {
        name: 'Adjetivos',
        icon: 'color-palette',
        color: '#FF6B6B',
        description: 'Palabras que describen características'
      },
      'verbos': {
        name: 'Verbos',
        icon: 'flash',
        color: '#4ECDC4',
        description: 'Palabras que expresan acciones'
      },
      'frases_emociones': {
        name: 'Frases y Emociones',
        icon: 'happy',
        color: '#45B7D1',
        description: 'Expresiones comunes y sentimientos'
      },
      'preguntas': {
        name: 'Preguntas',
        icon: 'help-circle',
        color: '#96CEB4',
        description: 'Palabras interrogativas'
      }
    };

    return categoryMap[category] || {
      name: category.charAt(0).toUpperCase() + category.slice(1),
      icon: 'library',
      color: '#A8A8A8',
      description: 'Categoría de palabras'
    };
  };

  const loadLessonsProgress = async () => {
    try {
      setIsLoading(true);
      
      const progress = await userService.getUserProgress(user.id);
      
      const updatedAlphabetLessons = alphabetLessons.map((lesson, index) => {
        const lessonProgress = progress.find(p => 
          p.category === 'lessons' && p.item_id === lesson.id
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
          const previousLessonId = alphabetLessons[index - 1].id;
          const previousProgress = progress.find(p => 
            p.category === 'lessons' && p.item_id === previousLessonId
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
      
      const updatedNumberLessons = numberLessons.map((lesson, index) => {
        const lessonProgress = progress.find(p => 
          p.category === 'lessons' && p.item_id === lesson.id
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
        
        let isUnlocked = false;
        
        if (index === 0) {
          isUnlocked = lesson.isUnlocked;
        } else {
          const previousLessonId = numberLessons[index - 1].id;
          const previousProgress = progress.find(p => 
            p.category === 'lessons' && p.item_id === previousLessonId
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
      
      const allLessons = [...updatedAlphabetLessons, ...updatedNumberLessons];
      setLessons(allLessons);
    } catch (error) {
      console.error('Error loading lessons progress:', error);
      const allLessons = [...alphabetLessons, ...numberLessons];
      setLessons(allLessons);
    } finally {
      setIsLoading(false);
    }
  };

  const startLesson = (lesson) => {
    if (!lesson.isUnlocked) return;
    
    navigation.navigate('StudyLesson', {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      letters: lesson.letters
    });
  };

  const getLockMessage = (lesson, index) => {
    const alphabetLessonsCount = alphabetLessons.length;
    
    if (index === 0) return '';
    
    if (index === alphabetLessonsCount) {
      return '';
    }
    
    const previousLesson = lessons[index - 1];
    if (!previousLesson.completed) {
      return `Completa ${previousLesson.title} para desbloquear`;
    } else if (previousLesson.stars < 2) {
      return `Necesitas al menos 70% en ${previousLesson.title}`;
    }
    return '';
  };

  const navigateToCategory = (categoryType) => {
    navigation.navigate('CategoryLessons', {
      categoryType,
      categoryName: categoryType === 'alphabet' ? 'Abecedario' : 'Números'
    });
  };

  const navigateToDatasetCategory = (category) => {
    navigation.navigate('DatasetCategory', {
      category: category.id,
      categoryName: category.name,
      categoryColor: category.color
    });
  };

  const navigateToWordCategory = (categoryType) => {
    navigation.navigate('WordCategoryLessons', {
      categoryType,
      categoryName: categoryType === 'adjetivos' ? 'Adjetivos' : categoryType
    });
  };

  const styles = createStyles(theme);

  // Si es usuario guest, mostrar pantalla de autenticación
  if (isGuest || !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Aprender</Text>
          <Text style={styles.headerSubtitle}>Domina el lenguaje de señas</Text>
        </View>

        <ScrollView 
          style={styles.authGateContainer}
          contentContainerStyle={styles.authGateScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authGateContent}>
            <View style={styles.authGateIcon}>
              <Icon name="school" size={80} color={theme.primary} />
            </View>

            <Text style={styles.authGateTitle}>
              ¡Desbloquea tu Aprendizaje! 🎓
            </Text>
            <Text style={styles.authGateMessage}>
              Crea una cuenta o inicia sesión para acceder a nuestras lecciones interactivas, 
              seguir tu progreso y ganar logros mientras dominas el lenguaje de señas.
            </Text>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Icon name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>Lecciones paso a paso</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>Seguimiento de progreso</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>Sistema de logros</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>Rachas diarias</Text>
              </View>
            </View>

            <View style={styles.authButtons}>
              <TouchableOpacity 
                style={styles.primaryAuthButton}
                onPress={() => {
                  setAuthModalMode('register');
                  setShowAuthModal(true);
                }}
              >
                <Text style={styles.primaryAuthButtonText}>Crear Cuenta</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryAuthButton}
                onPress={() => {
                  setAuthModalMode('login');
                  setShowAuthModal(true);
                }}
              >
                <Text style={styles.secondaryAuthButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <ProfileEditModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authModalMode}
        />
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

      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'lessons' && styles.tabButtonActive]}
          onPress={() => setActiveTab('lessons')}
        >
          <Icon 
            name="school" 
            size={20} 
            color={activeTab === 'lessons' ? '#FFFFFF' : theme.textSecondary} 
          />
          <Text style={[
            styles.tabButtonText, 
            activeTab === 'lessons' && styles.tabButtonTextActive
          ]}>
            Lecciones
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'dataset' && styles.tabButtonActive]}
          onPress={() => setActiveTab('dataset')}
        >
          <Icon 
            name="library" 
            size={20} 
            color={activeTab === 'dataset' ? '#FFFFFF' : theme.textSecondary} 
          />
          <Text style={[
            styles.tabButtonText, 
            activeTab === 'dataset' && styles.tabButtonTextActive
          ]}>
            Ver Dataset
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'lessons' ? (
        <>
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
            {/* Learning Categories */}
            <View style={styles.categoriesContainer}>
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => navigateToCategory('alphabet')}
              >
                <View style={[styles.categoryIcon, { backgroundColor: '#007AFF20' }]}>
                  <Text style={styles.categoryEmoji}>🔤</Text>
                </View>
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryTitle}>Abecedario</Text>
                  <Text style={styles.categorySubtitle}>
                    {lessons.slice(0, alphabetLessons.length).filter(l => l.completed).length}/{alphabetLessons.length} lecciones completadas
                  </Text>
                </View>
                <View style={styles.categoryArrow}>
                  <Icon name="chevron-forward" size={24} color={theme.textSecondary} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => navigateToCategory('numbers')}
              >
                <View style={[styles.categoryIcon, { backgroundColor: '#FF6B6B20' }]}>
                  <Text style={styles.categoryEmoji}>🔢</Text>
                </View>
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryTitle}>Números</Text>
                  <Text style={styles.categorySubtitle}>
                    {lessons.slice(alphabetLessons.length).filter(l => l.completed).length}/{numberLessons.length} lecciones completadas
                  </Text>
                </View>
                <View style={styles.categoryArrow}>
                  <Icon name="chevron-forward" size={24} color={theme.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Word Categories Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📚 Categorías de Palabras</Text>
              <Text style={styles.sectionSubtitle}>Aprende palabras completas con video</Text>
            </View>

            <View style={styles.categoriesContainer}>
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => navigateToWordCategory('adjetivos')}
              >
                <View style={[styles.categoryIcon, { backgroundColor: '#FF6B6B20' }]}>
                  <Text style={styles.categoryEmoji}>🎨</Text>
                </View>
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryTitle}>Adjetivos</Text>
                  <Text style={styles.categorySubtitle}>
                    6 lecciones • 53 palabras descriptivas
                  </Text>
                </View>
                <View style={styles.categoryArrow}>
                  <Icon name="chevron-forward" size={24} color={theme.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </>
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={styles.loadingText}>Cargando categorías...</Text>
            </View>
          ) : (
            <View style={styles.datasetContainer}>
              <Text style={styles.sectionTitle}>📚 Explora el Dataset</Text>
              <Text style={styles.sectionSubtitle}>
                Descubre todas las palabras y señas disponibles organizadas por categorías
              </Text>

              <View style={styles.datasetGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.datasetCard}
                    onPress={() => navigateToDatasetCategory(category)}
                  >
                    <View style={[styles.datasetIcon, { backgroundColor: category.color + '20' }]}>
                      <Icon name={category.icon} size={32} color={category.color} />
                    </View>
                    <Text style={styles.datasetTitle}>{category.name}</Text>
                    <Text style={styles.datasetDescription}>{category.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
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
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: theme.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginLeft: 8,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
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
  categoriesContainer: {
    gap: 16,
  },
  categoryCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  categoryArrow: {
    marginLeft: 12,
  },
  datasetContainer: {
    flex: 1,
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
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 24,
    marginTop: 32,
  },
  datasetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  datasetCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    width: (width - 64) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  datasetIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  datasetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  datasetDescription: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  // Auth Gate Styles (unchanged)
  authGateContainer: {
    flex: 1,
  },
  authGateScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  authGateContent: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  authGateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  authGateTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  authGateMessage: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsList: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  benefitText: {
    fontSize: 16,
    color: theme.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  authButtons: {
    alignSelf: 'stretch',
    gap: 12,
  },
  primaryAuthButton: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryAuthButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryAuthButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryAuthButtonText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LearnScreen;