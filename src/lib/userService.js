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
      // Verificar si hay usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Usuario autenticado - buscar o crear perfil
        return await this.getOrCreateAuthenticatedProfile(user);
      } else {
        // Usuario guest - buscar o crear guest
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
      const consecutiveDays = await this.calculateConsecutiveDays(userProfileId);

      return {
        consecutiveDays,
        totalProgress: progress.length,
        completedItems: progress.filter(p => p.completed).length
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      return {
        consecutiveDays: 0,
        totalProgress: 0,
        completedItems: 0
      };
    }
  },

  // Calcular días consecutivos (versión simple)
  async calculateConsecutiveDays(userProfileId) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('last_practiced')
        .eq('user_profile_id', userProfileId)
        .order('last_practiced', { ascending: false })
        .limit(30); // Últimos 30 días

      if (error || !data || data.length === 0) return 0;

      // Lógica simple: contar días únicos en los últimos 7 días
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentDays = new Set();
      data.forEach(item => {
        const practiceDate = new Date(item.last_practiced);
        if (practiceDate >= sevenDaysAgo) {
          const dayKey = practiceDate.toDateString();
          recentDays.add(dayKey);
        }
      });

      return recentDays.size;
    } catch (error) {
      console.error('Error calculating consecutive days:', error);
      return 0;
    }
  },

  // Marcar progreso en un elemento
  async markProgress(userProfileId, category, itemId, completed = true) {
    try {
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
        const { data, error } = await supabase
          .from('user_progress')
          .update({
            completed,
            attempts: existing.attempts + 1,
            last_practiced: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Crear nuevo progreso
        const { data, error } = await supabase
          .from('user_progress')
          .insert({
            user_profile_id: userProfileId,
            category,
            item_id: itemId,
            completed,
            attempts: 1,
            last_practiced: new Date().toISOString()
          })
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
          emailRedirectTo: undefined,
          data: {
            display_name: currentProfile?.display_name || 'Usuario'
          }
        }
      });

      if (authError) throw authError;
      
      console.log('Auth signup result:', authData);

      // Verificar que el usuario se creó correctamente
      if (!authData.user || !authData.user.id) {
        throw new Error('No se pudo crear el usuario en el sistema de autenticación');
      }

      // Esperar un momento para que Supabase procese el usuario
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar que el usuario existe en auth.users antes de continuar
      const { data: authUser, error: checkError } = await supabase.auth.getUser();
      console.log('Auth user check:', authUser, checkError);

      if (authData.user) {
        try {
          // Solo migrar si tenemos un perfil guest válido
          if (currentProfile && currentProfile.is_guest) {
            console.log('Migrating guest profile to authenticated user...');
            await this.migrateGuestToAuth(currentProfile, authData.user, currentProfile.display_name);
          } else {
            console.log('Creating new authenticated profile...');
            // Crear nuevo perfil autenticado directamente
            await this.getOrCreateAuthenticatedProfile(authData.user);
          }
        } catch (migrationError) {
          console.error('Migration failed, creating new profile instead:', migrationError);
          // Si la migración falla, crear un nuevo perfil
          await this.getOrCreateAuthenticatedProfile(authData.user);
        }
        
        return {
          success: true,
          user: authData.user,
          needsEmailConfirmation: !authData.session,
          isLoggedIn: !!authData.session
        };
      }

      throw new Error('No se pudo crear la cuenta');
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