import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import OnboardingScreen from '../screens/OnboardingScreen';
import TranslateScreen from '../screens/TranslateScreen';
import TranslationResultsScreen from '../screens/TranslationResultsScreen';
import LearnScreen from '../screens/LearnScreen';
import LessonScreen from '../screens/LessonScreen';
import StudyLessonScreen from '../screens/StudyLessonScreen';
import CategoryLessonsScreen from '../screens/CategoryLessonsScreen';
import DatasetCategoryScreen from '../screens/DatasetCategoryScreen';
import WordCategoryLessonsScreen from '../screens/WordCategoryLessonsScreen';
import WordStudyLessonScreen from '../screens/WordStudyLessonScreen';
import WordLessonScreen from '../screens/WordLessonScreen';
import CameraScreen from '../screens/CameraScreen';
import ModelSelectionScreen from '../screens/ModelSelectionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Translate') {
            iconName = focused ? 'language' : 'language-outline';
          } else if (route.name === 'Learn') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBarBackground,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Translate" 
        component={TranslateScreen}
        options={{
          tabBarLabel: 'Traducir',
        }}
      />
      <Tab.Screen 
        name="Learn" 
        component={LearnScreen}
        options={{
          tabBarLabel: 'Aprender',
        }}
      />
      <Tab.Screen
        name="Camera"
        component={ModelSelectionScreen}
        options={{
          tabBarLabel: 'Cámara',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = ({ initialRouteName }) => {
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Home" component={MainTabNavigator} />
      <Stack.Screen name="TranslationResults" component={TranslationResultsScreen} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
      <Stack.Screen name="StudyLesson" component={StudyLessonScreen} />
      <Stack.Screen name="CategoryLessons" component={CategoryLessonsScreen} />
      <Stack.Screen name="DatasetCategory" component={DatasetCategoryScreen} />
      <Stack.Screen name="WordCategoryLessons" component={WordCategoryLessonsScreen} />
      <Stack.Screen name="WordStudyLesson" component={WordStudyLessonScreen} />
      <Stack.Screen name="WordLesson" component={WordLessonScreen} />
      <Stack.Screen name="ModelSelection" component={ModelSelectionScreen} />
      <Stack.Screen name="CameraScreen" component={CameraScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;