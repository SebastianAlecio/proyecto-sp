import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const ProfileEditModal = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { user, isGuest, registerUser, signIn, signOut, updateProfile } = useAuth();
  
  const [mode, setMode] = useState('edit'); // 'edit', 'register', 'login'
  const [formData, setFormData] = useState({
    displayName: user?.display_name || '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      setFormData({
        displayName: user?.display_name || '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
      setMode(isGuest ? 'register' : 'edit');
    }
  }, [visible, user, isGuest]);

  const validateForm = () => {
    const newErrors = {};

    if (mode === 'register' || mode === 'login') {
      if (!formData.email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }

      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (mode === 'register' && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    // Solo validar displayName en modo edit o register
    if ((mode === 'edit' || mode === 'register') && !formData.displayName.trim()) {
      newErrors.displayName = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'register') {
        // Actualizar el nombre en el perfil guest antes del registro
        if (user && user.isGuest) {
          const updatedUser = { ...user, display_name: formData.displayName };
          const result = await registerUser(formData.email, formData.password, updatedUser);
          
          if (result.success) {
            if (result.isLoggedIn) {
              // Usuario logueado automáticamente
              Alert.alert(
                '¡Bienvenido!',
                'Tu cuenta ha sido creada e iniciaste sesión automáticamente.',
                [{ text: 'OK', onPress: onClose }]
              );
            } else if (result.needsEmailConfirmation) {
              // Necesita confirmación de email
              Alert.alert(
                '📧 ¡Revisa tu email!',
                result.message || 'Te hemos enviado un email de confirmación. Haz clic en el enlace para activar tu cuenta y luego podrás iniciar sesión.',
                [{ 
                  text: 'OK', 
                  onPress: () => {
                    setMode('login');
                    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                  }
                }]
              );
            }
          } else {
            Alert.alert('Error', result.error || 'No se pudo crear la cuenta');
          }
        } else {
          const result = await registerUser(formData.email, formData.password);
          
          if (result.success) {
            if (result.isLoggedIn) {
              Alert.alert(
                '¡Bienvenido!',
                'Tu cuenta ha sido creada e iniciaste sesión automáticamente.',
                [{ text: 'OK', onPress: onClose }]
              );
            } else if (result.needsEmailConfirmation) {
              Alert.alert(
                '📧 ¡Revisa tu email!',
                result.message || 'Te hemos enviado un email de confirmación. Haz clic en el enlace para activar tu cuenta y luego podrás iniciar sesión.',
                [{ 
                  text: 'OK', 
                  onPress: () => {
                    setMode('login');
                    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                  }
                }]
              );
            }
          } else {
            Alert.alert('Error', result.error || 'No se pudo crear la cuenta');
          }
        }
      } else if (mode === 'login') {
        const result = await signIn(formData.email, formData.password);
        if (result.success) {
          Alert.alert('¡Bienvenido!', 'Has iniciado sesión correctamente', [
            { text: 'OK', onPress: onClose }
          ]);
        } else {
          console.log('Login error details:', result.error);
          Alert.alert(
            'Error de inicio de sesión', 
            result.error || 'Credenciales incorrectas. Si acabas de registrarte, asegúrate de haber confirmado tu email.'
          );
        }
      } else {
        // Edit mode - actualizar nombre
        const result = await updateProfile(formData.displayName);
        if (result.success) {
          Alert.alert('¡Perfil actualizado!', 'Tu nombre ha sido actualizado correctamente', [
            { text: 'OK', onPress: onClose }
          ]);
        } else {
          Alert.alert('Error', result.error || 'No se pudo actualizar el perfil');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Algo salió mal. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              console.log('Starting logout process...');
              const result = await signOut();
              console.log('Logout result:', result);
              
              if (result.success) {
                console.log('Logout successful, closing modal...');
                setIsLoading(false);
                onClose();
                
                // Mostrar mensaje después de cerrar modal
                setTimeout(() => {
                  Alert.alert('¡Hasta luego!', 'Has cerrado sesión correctamente');
                }, 300);
              } else {
                console.log('Logout failed:', result.error);
                setIsLoading(false);
                Alert.alert('Error', result.error || 'No se pudo cerrar sesión');
              }
            } catch (error) {
              console.error('Logout error:', error);
              setIsLoading(false);
              Alert.alert('Error', 'Hubo un problema al cerrar sesión');
            }
          }
        }
      ]
    );
  };
  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === 'register' ? 'Crear Cuenta' : 
             mode === 'login' ? 'Iniciar Sesión' : 'Editar Perfil'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Mode Switcher for guests */}
          {isGuest && (
            <View style={styles.modeSwitcher}>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'register' && styles.modeButtonActive]}
                onPress={() => switchMode('register')}
              >
                <Text style={[styles.modeButtonText, mode === 'register' && styles.modeButtonTextActive]}>
                  Crear Cuenta
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
                onPress={() => switchMode('login')}
              >
                <Text style={[styles.modeButtonText, mode === 'login' && styles.modeButtonTextActive]}>
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Display Name - Solo mostrar en modo edit o register */}
            {(mode === 'edit' || mode === 'register') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput
                  style={[styles.input, errors.displayName && styles.inputError]}
                  value={formData.displayName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
                  placeholder="Tu nombre"
                  placeholderTextColor={theme.placeholder}
                />
                {errors.displayName && (
                  <Text style={styles.errorText}>{errors.displayName}</Text>
                )}
              </View>
            )}

            {/* Email (for register/login) */}
            {(mode === 'register' || mode === 'login') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder="tu@email.com"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>
            )}

            {/* Password (for register/login) */}
            {(mode === 'register' || mode === 'login') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  value={formData.password}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={theme.placeholder}
                  secureTextEntry
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>
            )}

            {/* Confirm Password (for register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={theme.placeholder}
                  secureTextEntry
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>
            )}
          </View>

          {/* Info Text */}
          {isGuest && (
            <View style={styles.infoContainer}>
              <Icon name="information-circle" size={20} color={theme.primary} />
              <Text style={styles.infoText}>
                {mode === 'register' 
                  ? 'Al crear una cuenta, tu progreso se guardará permanentemente'
                  : 'Inicia sesión para recuperar tu progreso guardado'
                }
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'register' ? 'Crear Cuenta' : 
                 mode === 'login' ? 'Iniciar Sesión' : 'Guardar Cambios'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Logout Button - Solo mostrar si está autenticado */}
          {!isGuest && mode === 'edit' && (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={isLoading}
            >
              <Icon name="log-out-outline" size={20} color="#FF6B6B" />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 4,
    marginTop: 24,
    marginBottom: 32,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: theme.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  form: {
    marginTop: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.inputBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.text,
    borderWidth: 2,
    borderColor: theme.border,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: theme.placeholder,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 12,
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileEditModal;