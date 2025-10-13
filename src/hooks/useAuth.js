import { useState, useEffect, useContext, createContext } from "react";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { userService } from "../lib/userService";

// Crear contexto de autenticación
const AuthContext = createContext();

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    consecutiveDays: 0,
    maxStreak: 0,
    totalProgress: 0,
    completedItems: 0,
  });

  // Inicializar usuario al cargar la app
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Esperar un poco para que Supabase termine de cargar la sesión
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verificar si hay sesión activa
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          await initializeUser();
        }
      } catch (error) {
        console.error("Error checking initial session:", error);
        if (mounted) {
          await initializeUser();
        }
      }
    };

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "INITIAL_SESSION") {
        if (session?.user) {
          await initializeUser();
        }
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await initializeUser();
      } else if (event === "SIGNED_OUT") {
        await initializeUser();
      }
    });

    // Inicializar autenticación
    initializeAuth();

    // Cleanup subscription
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
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
      console.error("Error initializing user:", error);
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
      console.error("Error loading user stats:", error);
    }
  };

  // Marcar progreso en un elemento
  const markProgress = async (
    category,
    itemId,
    completed = true,
    score = null,
  ) => {
    if (!user?.id || user?.isFallback) {
      return;
    }

    try {
      await userService.markProgress(
        user.id,
        category,
        itemId,
        completed,
        score,
      );
      // Recargar estadísticas después de marcar progreso
      await loadUserStats(user.id);
    } catch (error) {
      console.error("Error marking progress:", error);
    }
  };

  // Registrar usuario (migrar de guest)
  const registerUser = async (email, password, updatedUser = null) => {
    try {
      const userToRegister = updatedUser || user;
      const result = await userService.registerWithEmail(
        email,
        password,
        userToRegister,
      );

      if (result.success) {
        // Actualizar usuario local
        await initializeUser();
      }

      return result;
    } catch (error) {
      console.error("Error registering user:", error);
      return { success: false, error: error.message };
    }
  };

  // Iniciar sesión
  const signIn = async (email, password) => {
    try {
      const result = await userService.signIn(email, password);

      if (result.success) {
        // Reinicializar usuario después del login
        await initializeUser();
      }

      return result;
    } catch (error) {
      console.error("Error signing in:", error);
      return { success: false, error: error.message };
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      const result = await userService.signOut();
      return result;
    } catch (error) {
      console.error("Error signing out:", error);
      return { success: false, error: error.message };
    }
  };

  // Refrescar datos del usuario
  const refreshUser = async () => {
    if (user?.id) {
      await loadUserStats(user.id);
    }
  };

  // Actualizar perfil del usuario
  const updateProfile = async (displayName) => {
    if (!user?.id) {
      return { success: false, error: "Usuario no encontrado" };
    }

    try {
      const result = await userService.updateProfile(user.id, {
        display_name: displayName,
      });
      if (result.success) {
        // Actualizar usuario local
        setUser((prev) => ({ ...prev, display_name: displayName }));
      }
      return result;
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }
  };

  // Manejar confirmación de email desde deep link
  const handleEmailConfirmation = async (token, type) => {
    try {
      if (type === "confirmed") {
        await initializeUser();
      } else {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type,
        });

        if (error) {
          console.error("Error verificando token:", error);
          Alert.alert(
            "Error de Confirmación",
            "No se pudo verificar tu cuenta. El enlace puede haber expirado.",
            [{ text: "OK" }],
          );
          return { success: false, error: error.message };
        }
        await initializeUser();
      }

      Alert.alert(
        "¡Cuenta Confirmada! 🎉",
        "Tu cuenta ha sido verificada exitosamente. Inicia sesión para usar todas las funciones de la app.",
        [{ text: "¡Genial!" }],
      );

      return { success: true };
    } catch (error) {
      console.error("Error en confirmación:", error);
      Alert.alert("Error", "Ocurrió un problema al confirmar tu cuenta.", [
        { text: "OK" },
      ]);
      return { success: false, error: error.message };
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
    updateProfile,
    handleEmailConfirmation,

    // Helpers
    isGuest: user?.isGuest || false,
    isAuthenticated: user?.isAuthenticated || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
