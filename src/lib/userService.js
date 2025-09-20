import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Generar ID único para usuarios guest
const generateGuestId = () => {
  return 'guest_' + Math.random().toString(36).substr(2, 9);
};

// Servicio de usuarios
export const userService = {
  // Inicializar usuario (guest o autenticado)
  async initializeUser() {
    try {
      console.log('Initializing user...');
      // Verificar si hay usuario autenticado
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      console.log('Current auth user:', user?.id);
      
      if (user) {
        // Usuario autenticado - buscar o crear perfil
        console.log('User is authenticated, getting profile...');
        return await this.getOrCreateAuthenticatedProfile(user);
      } else {
        // Usuario guest - buscar o crear guest
        console.log('No authenticated user, creating guest...');
        return await this.getOrCreateGuestProfile();
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      // Fallback a usuario guest
      return await this.getOrCreateGuestProfile();
    }
  },

  // Obtener o crear perfil de usuario autenticado
  async getOrCreateAuthenticatedProfile(authUser) {
    try {
      // Buscar perfil existente
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (profile) {
        return {
          ...profile,
          isGuest: false,
          isAuthenticated: true
        };
      }

      // Crear nuevo perfil
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          auth_user_id: authUser.id,
          email: authUser.email,
          display_name: authUser.user_metadata?.display_name || 'Usuario',
          is_guest: false
        })
        .select()
        .single();

      if (createError) throw createError;

      return {
        ...newProfile,
        isGuest: false,
        isAuthenticated: true
      };
    } catch (error) {
      console.error('Error with authenticated profile:', error);
      throw error;
    }
  },

  // Obtener o crear perfil guest
  async getOrCreateGuestProfile() {
    try {
      // Verificar si ya hay un guest_id guardado
      let guestId = await AsyncStorage.getItem('guest_id');
      
      if (guestId) {
        // Buscar perfil guest existente
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('guest_id', guestId)
          .single();

        if (!error && profile) {
          return {
            ...profile,
            isGuest: true,
            isAuthenticated: false
          };
        }
      }

      // Crear nuevo usuario guest
      guestId = generateGuestId();
      
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          guest_id: guestId,
          display_name: 'Usuario',
          is_guest: true
        })
        .select()
        .single();

      if (createError) throw createError;

      // Guardar guest_id en AsyncStorage
      await AsyncStorage.setItem('guest_id', guestId);

      return {
        ...newProfile,
        isGuest: true,
        isAuthenticated: false
      };
    } catch (error) {
      console.error('Error with guest profile:', error);
      throw error;
    }
  },

  // Obtener progreso del usuario
  async getUserProgress(userProfileId) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_profile_id', userProfileId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user progress:', error);
      return [];
    }
  },

  // Calcular estadísticas del usuario
  async getUserStats(userProfileId) {
    try {
      const progress = await this.getUserProgress(userProfileId);
      
      // Días consecutivos (simplificado por ahora)
      const streakData = await this.calculateConsecutiveDays(userProfileId);

      return {
        consecutiveDays: streakData.current,
        maxStreak: streakData.max,
        totalProgress: progress.length,
        completedItems: progress.filter(p => p.completed).length
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      return {
        consecutiveDays: 0,
        maxStreak: 0,
        totalProgress: 0,
        completedItems: 0
      };
    }
  },

  // Calcular días consecutivos (versión simple)
  async calculateConsecutiveDays(userProfileId) {
    try {
      // Obtener datos de racha del perfil del usuario
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('current_streak, max_streak, last_activity_date')
        .eq('id', userProfileId)
        .single();

      if (error || !profile) return { current: 0, max: 0 };

      return {
        current: profile.current_streak || 0,
        max: profile.max_streak || 0
      };
    } catch (error) {
      console.error('Error calculating consecutive days:', error);
      return { current: 0, max: 0 };
    }
  },

  // Marcar progreso en un elemento
  async markProgress(userProfileId, category, itemId, completed = true, score = null) {
    try {
      // Actualizar racha antes de marcar progreso
      await this.updateUserStreak(userProfileId);

      // Verificar si ya existe progreso para este elemento
      const { data: existing, error: selectError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_profile_id', userProfileId)
        .eq('category', category)
        .eq('item_id', itemId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      if (existing) {
        // Actualizar progreso existente
        const updateData = {
          completed,
          attempts: existing.attempts + 1,
          last_practiced: new Date().toISOString()
        };
        
        // Solo actualizar score si se proporciona y es mejor que el anterior
        if (score !== null && (existing.score === null || score > existing.score)) {
          updateData.score = score;
        }
        
        const { data, error } = await supabase
          .from('user_progress')
          .update(updateData)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Crear nuevo progreso
        const insertData = {
          user_profile_id: userProfileId,
          category,
          item_id: itemId,
          completed,
          attempts: 1,
          last_practiced: new Date().toISOString()
        };
        
        // Agregar score si se proporciona
        if (score !== null) {
          insertData.score = score;
        }
        
        const { data, error } = await supabase
          .from('user_progress')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error marking progress:', error);
      throw error;
    }
  },

  // Actualizar racha del usuario
  async updateUserStreak(userProfileId) {
    try {
      // Obtener perfil actual
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('current_streak, max_streak, last_activity_date')
        .eq('id', userProfileId)
        .single();

      if (profileError) throw profileError;

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const lastActivityDate = profile.last_activity_date;
      
      let newCurrentStreak = profile.current_streak || 0;
      let newMaxStreak = profile.max_streak || 0;

      if (!lastActivityDate) {
        // Primera vez - iniciar racha
        newCurrentStreak = 1;
      } else {
        const lastDate = new Date(lastActivityDate);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Mismo día - no cambiar racha
          return;
        } else if (diffDays === 1) {
          // Día consecutivo - aumentar racha
          newCurrentStreak = newCurrentStreak + 1;
        } else {
          // Perdió la racha - reiniciar
          newCurrentStreak = 1;
        }
      }

      // Actualizar récord si es necesario
      if (newCurrentStreak > newMaxStreak) {
        newMaxStreak = newCurrentStreak;
      }

      // Actualizar en la base de datos
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          current_streak: newCurrentStreak,
          max_streak: newMaxStreak,
          last_activity_date: today
        })
        .eq('id', userProfileId);

      if (updateError) throw updateError;

      console.log(`🔥 Streak updated: ${newCurrentStreak} days (max: ${newMaxStreak})`);
    } catch (error) {
      console.error('Error updating user streak:', error);
    }
  },

  // Registrar usuario con email (migrar de guest)
  async registerWithEmail(email, password, currentProfile) {
    try {
      console.log('Starting registration process...');
      console.log('Current profile:', currentProfile);
      
      // Crear cuenta en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://your-app-domain.com/auth/callback',
          data: {
            display_name: currentProfile?.display_name || 'Usuario'
          }
        }
      });

      if (authError) throw authError;
      
      console.log('Auth signup result:', authData);

      // Si hay sesión inmediatamente, el usuario fue confirmado automáticamente
      if (authData.session && authData.user) {
        console.log('User confirmed automatically, proceeding with migration...');
        
        try {
          // Solo migrar si tenemos un perfil guest válido
          if (currentProfile && currentProfile.is_guest) {
            console.log('Migrating guest profile to authenticated user...');
            await this.migrateGuestToAuth(currentProfile, authData.user, currentProfile.display_name);
          } else {
            console.log('Creating new authenticated profile...');
            await this.getOrCreateAuthenticatedProfile(authData.user);
          }
        } catch (migrationError) {
          console.error('Migration failed, creating new profile instead:', migrationError);
          await this.getOrCreateAuthenticatedProfile(authData.user);
        }
        
        return {
          success: true,
          user: authData.user,
          session: authData.session,
          needsEmailConfirmation: false,
          isLoggedIn: true
        };
      } else {
        // Usuario creado pero necesita confirmación de email
        console.log('User created, needs email confirmation');
        return {
          success: true,
          user: authData.user,
          needsEmailConfirmation: true,
          isLoggedIn: false,
          message: 'Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.'
        };
      }
    } catch (error) {
      console.error('Error registering user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Migrar datos de guest a usuario autenticado
  async migrateGuestToAuth(guestProfile, authUser, displayName) {
    try {
      console.log('Starting migration for profile:', guestProfile.id);
      console.log('Auth user:', authUser.id);
      console.log('Current profile data:', guestProfile);
      console.log('Display name to save:', displayName);
      
      console.log('Proceeding with migration (foreign key constraint removed)');
      
      // Actualizar perfil guest para convertirlo en usuario real
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          auth_user_id: authUser.id,
          email: authUser.email,
          is_guest: false,
          display_name: displayName || guestProfile.display_name || 'Usuario'
        })
        .eq('id', guestProfile.id)
        .select()
        .single();

      if (updateError) {
        console.error('Migration update error:', updateError);
        throw updateError;
      }
      
      console.log('Migration successful:', updatedProfile);

      // Limpiar guest_id del AsyncStorage
      await AsyncStorage.removeItem('guest_id');

      return updatedProfile;
    } catch (error) {
      console.error('Error migrating guest to auth:', error);
      throw error;
    }
  },

  // Iniciar sesión
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Error signing in:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Actualizar perfil del usuario
  async updateProfile(userProfileId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userProfileId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        profile: data
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Cerrar sesión
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Crear nuevo usuario guest
      return await this.getOrCreateGuestProfile();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
};