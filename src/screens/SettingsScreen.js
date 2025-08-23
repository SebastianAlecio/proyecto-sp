import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const settingsOptions = [
    {
      id: 1,
      title: 'Modo Oscuro',
      subtitle: 'Cambia la apariencia de la aplicación',
      icon: isDarkMode ? 'moon' : 'sunny',
      type: 'switch',
      value: isDarkMode,
      onPress: toggleTheme,
    },
    {
      id: 2,
      title: 'Notificaciones',
      subtitle: 'Gestiona tus notificaciones',
      icon: 'notifications',
      type: 'arrow',
      onPress: () => console.log('Notifications pressed'),
    },
    {
      id: 3,
      title: 'Privacidad',
      subtitle: 'Controla tu información personal',
      icon: 'shield-checkmark',
      type: 'arrow',
      onPress: () => console.log('Privacy pressed'),
    },
  ];

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Settings Options */}
        <View style={styles.optionsContainer}>
          {settingsOptions.map((option) => (
            <TouchableOpacity 
              key={option.id} 
              style={[
                styles.optionItem,
                option.id === settingsOptions.length && styles.lastOptionItem
              ]}
              onPress={option.onPress}
              disabled={option.type === 'switch'}
            >
              <View style={styles.optionIcon}>
                <Icon name={option.icon} size={22} color={theme.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              {option.type === 'switch' ? (
                <Switch
                  value={option.value}
                  onValueChange={option.onPress}
                  trackColor={{ 
                    false: theme.border, 
                    true: theme.primary + '40' 
                  }}
                  thumbColor={option.value ? theme.primary : theme.placeholder}
                  ios_backgroundColor={theme.border}
                />
              ) : (
                <Icon name="chevron-forward" size={20} color={theme.placeholder} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Información de la App</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Versión</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={[styles.infoItem, styles.lastInfoItem]}>
              <Text style={styles.infoLabel}>Desarrollado por</Text>
              <View style={styles.developersContainer}>
                <Text style={styles.infoValue}>Alessandro Alecio</Text>
                <Text style={styles.infoValue}>Aldo Reyes</Text>
              </View>
            </View>
          </View>
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
    paddingBottom: 24,
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  optionsContainer: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: theme.shadow,
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
  lastOptionItem: {
    borderBottomWidth: 0,
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
  infoSection: {
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  lastInfoItem: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'right',
  },
  developersContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

export default SettingsScreen;