import { useState, useEffect, useContext, createContext } from 'react';
import { userService } from '../lib/userService';

// Crear contexto de autenticación
const AuthContext = createContext();

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    consecutiveDays: 0,
    totalProgress: 0,
    completedItems: 0
  });

  // Inicializar usuario al cargar la app
  useEffect(() => {
    initializeUser();
  }, []);

  // Función para inicializar usuario
  const initializeUser = async () => {
    try {
      setIsLoading(true);
      const userProfile = await userService.initializeUser();
      setUser(userProfile);
      
      // Cargar estadísticas del usuario
      if (userProfile?.id) {
        await loadUserStats(userProfile.id);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar estadísticas del usuario
  const loadUserStats = async (userProfileId) => {
    try {
      const stats = await userService.getUserStats(userProfileId);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  // Marcar progreso en un elemento
  const markProgress = async (category, itemId, completed = true) => {
    if (!user?.id) return;

    try {
      await userService.markProgress(user.id, category, itemId, completed);
      // Recargar estadísticas después de marcar progreso
      await loadUserStats(user.id);
    } catch (error) {
      console.error('Error marking progress:', error);
    }
  };

  // Registrar usuario (migrar de guest)
  const registerUser = async (email, password) => {
    if (!user) return { success: false, error: 'No user to register' };

    try {
      const result = await userService.registerWithEmail(email, password, user);
      
      if (result.success) {
        // Actualizar usuario local
        await initializeUser();
      }
      
      return result;
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error: error.message };
    }
  };

  // Iniciar sesión
  const signIn = async (email, password) => {
    try {
      console.log('Attempting sign in for:', email);
      const result = await userService.signIn(email, password);
      
      if (result.success) {
        console.log('Sign in successful, reinitializing user...');
        // Reinicializar usuario después del login
        await initializeUser();
      }
      
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      const guestUser = await userService.signOut();
      setUser(guestUser);
      setUserStats({
        consecutiveDays: 0,
        totalProgress: 0,
        completedItems: 0
      });
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }
  };

  // Refrescar datos del usuario
  const refreshUser = async () => {
    if (user?.id) {
      await loadUserStats(user.id);
    }
  };

  const value = {
    // Estado
    user,
    userStats,
    isLoading,
    
    // Funciones
    markProgress,
    registerUser,
    signIn,
    signOut,
    refreshUser,
    
    // Helpers
    isGuest: user?.isGuest || false,
    isAuthenticated: user?.isAuthenticated || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};