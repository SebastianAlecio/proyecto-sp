import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import ProfileEditModal from '../components/ProfileEditModal';

const ProfileScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user, userStats, isGuest, isAuthenticated } = useAuth();
  const [showEditModal, setShowEditModal] = React.useState(false);

  const profileOptions = [
    {
      id: 1,
      title: 'Progreso de Aprendizaje',
      subtitle: 'Ve tu avance en las lecciones',
      icon: 'stats-chart',
      onPress: () => console.log('Progreso pressed'),
    },
    {
      id: 2,
      title: 'Configuración',
      subtitle: 'Personaliza tu experiencia',
      icon: 'settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      id: 3,
      title: 'Ayuda y Soporte',
      subtitle: 'Obtén ayuda cuando la necesites',
      icon: 'help-circle',
      onPress: () => console.log('Help pressed'),
    },
    {
      id: 4,
      title: 'Acerca de',
      subtitle: 'Información sobre la aplicación',
      icon: 'information-circle',
      onPress: () => console.log('About pressed'),
    },
  ];

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        <Text style={styles.headerSubtitle}>Gestiona tu cuenta y preferencias</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={40} color={theme.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.display_name || 'Usuario'}
            </Text>
            <Text style={styles.userEmail}>
              {isGuest ? 'Usuario Invitado' : 'Aprendiz de Lenguaje de Señas'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Icon name="pencil" size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.consecutiveDays}</Text>
            <Text style={styles.statLabel}>Racha Actual</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.maxStreak}</Text>
            <Text style={styles.statLabel}>Récord Personal</Text>
          </View>
        </View>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {profileOptions.map((option) => (
            <TouchableOpacity 
              key={option.id} 
              style={styles.optionItem}
              onPress={option.onPress}
            >
              <View style={styles.optionIcon}>
                <Icon name={option.icon} size={24} color={theme.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={theme.placeholder} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Profile Edit Modal */}
        <ProfileEditModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  userCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
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
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionsContainer: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
});

export default ProfileScreen;