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
import { COLORS } from '../utils/constants';

const ProfileScreen = () => {
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
      onPress: () => console.log('Settings pressed'),
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
            <Icon name="person" size={40} color={COLORS.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Usuario</Text>
            <Text style={styles.userEmail}>Aprendiz de Lenguaje de Señas</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="pencil" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Palabras Aprendidas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Días Consecutivos</Text>
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
                <Icon name={option.icon} size={24} color={COLORS.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#C0C0C0" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F8F9FA',
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
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#FFFFFF',
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
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F8F9FA',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
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
    color: '#1A1A1A',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
});

export default ProfileScreen;